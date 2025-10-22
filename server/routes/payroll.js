const express = require('express');
const { body, query, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { SalaryComponent, PayrollCycle, Payslip, SalaryRevision } = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { LeaveRequest } = require('../models/Leave');
const SalaryDetails = require('../models/SalaryDetails');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/payroll/employee-salaries
// @desc    Get all employee salary data for payroll processing
// @access  Private (HR, Admin)
router.get('/employee-salaries', [
  authenticate,
  authorize(['admin', 'hr', 'finance'])
], async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Get all active employees
    const employees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('employmentInfo.department', 'name')
      .select('employeeId personalInfo employmentInfo salaryInfo');

    const employeeSalaries = [];

    for (const employee of employees) {
      // Try to get salary data from SalaryDetails for the specified month/year
      let salaryData = null;
      if (month && year) {
        salaryData = await SalaryDetails.findOne({
          employee: employee._id,
          month: parseInt(month),
          year: parseInt(year)
        });
      }

      // Build salary information
      let salaryInfo = {
        employeeId: employee.employeeId,
        name: `${employee.personalInfo?.firstName || ''} ${employee.personalInfo?.lastName || ''}`.trim(),
        department: employee.employmentInfo?.department?.name || 'N/A',
        designation: employee.employmentInfo?.designation || 'N/A'
      };

      if (salaryData && salaryData.earnings) {
        // Use detailed salary data from CSV
        salaryInfo.basicSalary = salaryData.earnings.basicSalary || 0;
        salaryInfo.hra = salaryData.earnings.hra || 0;
        salaryInfo.conveyanceAllowance = salaryData.earnings.conveyanceAllowance || 0;
        salaryInfo.medicalAllowance = salaryData.earnings.medicalAllowance || 0;
        salaryInfo.specialAllowance = salaryData.earnings.specialAllowance || 0;
        salaryInfo.performanceBonus = salaryData.earnings.performanceBonus || 0;
        salaryInfo.overtimePay = salaryData.earnings.overtimePay || 0;
        salaryInfo.otherAllowances = salaryData.earnings.otherAllowances || 0;
        salaryInfo.grossSalary = salaryData.grossSalary || 0;
        
        // totalCTC from CSV is the ANNUAL CTC - this is the correct value
        salaryInfo.totalCTC = salaryData.totalCTC || 0;
        
        // Calculate net salary (gross - deductions)
        const totalDeductions = (salaryData.deductions?.providentFund || 0) +
                               (salaryData.deductions?.employeeStateInsurance || 0) +
                               (salaryData.deductions?.professionalTax || 0) +
                               (salaryData.deductions?.incomeTax || 0) +
                               (salaryData.deductions?.loanRepayment || 0) +
                               (salaryData.deductions?.lopAmount || 0) +
                               (salaryData.deductions?.otherDeductions || 0);
        salaryInfo.netSalary = Math.max(0, salaryInfo.grossSalary - totalDeductions);
        
        // Add deductions for display
        salaryInfo.deductions = salaryData.deductions || {};
        
        salaryInfo.dataSource = 'salary_details';
      } else {
        // No salary data available - return zero values to maintain synchronization
        salaryInfo.basicSalary = 0;
        salaryInfo.hra = 0;
        salaryInfo.conveyanceAllowance = 0;
        salaryInfo.medicalAllowance = 0;
        salaryInfo.specialAllowance = 0;
        salaryInfo.performanceBonus = 0;
        salaryInfo.overtimePay = 0;
        salaryInfo.otherAllowances = 0;
        salaryInfo.grossSalary = 0;
        salaryInfo.totalCTC = 0;
        salaryInfo.netSalary = 0;
        salaryInfo.deductions = {};
        
        salaryInfo.dataSource = 'no_data';
      }

      employeeSalaries.push(salaryInfo);
    }

    // Filter out employees with no salary data for complete synchronization
    const employeesWithSalaryData = employeeSalaries.filter(emp => emp.dataSource !== 'no_data');
    
    res.json({
      employeeSalaries: employeesWithSalaryData,
      totalEmployees: employeesWithSalaryData.length,
      month: month || new Date().getMonth() + 1,
      year: year || new Date().getFullYear(),
      synchronization: {
        totalEmployees: employeeSalaries.length,
        employeesWithSalaryData: employeesWithSalaryData.length,
        employeesWithoutSalaryData: employeeSalaries.length - employeesWithSalaryData.length
      }
    });

  } catch (error) {
    console.error('Error fetching employee salaries:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payroll/my-info
// @desc    Get payroll info for current employee
// @access  Private (Employee)
router.get('/my-info', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('employmentInfo.department', 'name code');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Return employee's salary information
    const payrollInfo = {
      currentSalary: employee.salaryInfo?.currentSalary?.grossSalary || 50000,
      ctc: employee.salaryInfo?.currentSalary?.ctc || 600000,
      lastPayment: new Date(),
      employeeId: employee.employeeId,
      department: employee.employmentInfo?.department?.name || 'N/A'
    };

    res.json(payrollInfo);
  } catch (error) {
    console.error('Get payroll info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payroll/components
// @desc    Get salary components
// @access  Private (HR, Admin)
router.get('/components', [
  authenticate,
  authorize(['admin', 'hr'])
], async (req, res) => {
  try {
    const components = await SalaryComponent.find({ isActive: true })
      .sort({ type: 1, category: 1, name: 1 });
    res.json(components);
  } catch (error) {
    console.error('Get salary components error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payroll/components
// @desc    Create salary component
// @access  Private (Admin)
router.post('/components', [
  authenticate,
  authorize(['admin', 'hr']),
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim(),
  body('type').isIn(['earning', 'deduction']),
  body('category').isIn(['basic', 'allowance', 'statutory', 'voluntary', 'tax'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const component = new SalaryComponent(req.body);
    await component.save();

    res.status(201).json({
      message: 'Salary component created successfully',
      component
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Component code already exists' });
    } else {
      console.error('Create salary component error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// @route   POST /api/payroll/salary-revision
// @desc    Create salary revision
// @access  Private (HR, Admin)
router.post('/salary-revision', [
  authenticate,
  authorize(['admin', 'hr']),
  body('employeeId').isMongoId(),
  body('effectiveDate').isISO8601(),
  body('revisionType').isIn(['increment', 'promotion', 'adjustment', 'joining']),
  body('newSalary.basic').isFloat({ min: 0 }),
  body('newSalary.grossSalary').isFloat({ min: 0 }),
  body('newSalary.ctc').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, effectiveDate, revisionType, newSalary, reason } = req.body;

    // Get employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Store previous salary
    const previousSalary = employee.salaryInfo.currentSalary;

    // Create salary revision record
    const revision = new SalaryRevision({
      employee: employeeId,
      effectiveDate: new Date(effectiveDate),
      revisionType,
      previousSalary,
      newSalary,
      reason,
      createdBy: req.user._id
    });

    // Calculate increment percentage if applicable
    if (previousSalary.ctc && previousSalary.ctc > 0) {
      revision.incrementPercentage = ((newSalary.ctc - previousSalary.ctc) / previousSalary.ctc) * 100;
    }

    await revision.save();

    // Update employee salary
    employee.salaryInfo.currentSalary = newSalary;
    await employee.save();

    const populatedRevision = await SalaryRevision.findById(revision._id)
      .populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName')
      .populate('createdBy', 'email');

    res.status(201).json({
      message: 'Salary revision created successfully',
      revision: populatedRevision
    });
  } catch (error) {
    console.error('Create salary revision error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payroll/cycles
// @desc    Create payroll cycle
// @access  Private (HR, Admin)
router.post('/cycles', [
  authenticate,
  authorize(['admin', 'hr']),
  body('name').notEmpty().trim(),
  body('month').isInt({ min: 1, max: 12 }),
  body('year').isInt({ min: 2020, max: 2030 }),
  body('payPeriodStart').isISO8601(),
  body('payPeriodEnd').isISO8601(),
  body('payDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, month, year, payPeriodStart, payPeriodEnd, payDate } = req.body;

    // Check if cycle already exists for this month/year
    const existingCycle = await PayrollCycle.findOne({ month, year });
    if (existingCycle) {
      return res.status(400).json({ message: 'Payroll cycle already exists for this period' });
    }

    const cycle = new PayrollCycle({
      name,
      month,
      year,
      payPeriodStart: new Date(payPeriodStart),
      payPeriodEnd: new Date(payPeriodEnd),
      payDate: new Date(payDate)
    });

    await cycle.save();

    res.status(201).json({
      message: 'Payroll cycle created successfully',
      cycle
    });
  } catch (error) {
    console.error('Create payroll cycle error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payroll/cycles/:id/process
// @desc    Process payroll for a cycle
// @access  Private (HR, Admin)
router.post('/cycles/:id/process', [
  authenticate,
  authorize(['admin', 'hr'])
], async (req, res) => {
  try {
    const cycle = await PayrollCycle.findById(req.params.id);
    if (!cycle) {
      return res.status(404).json({ message: 'Payroll cycle not found' });
    }

    if (cycle.status !== 'draft') {
      return res.status(400).json({ message: 'Payroll cycle is already processed' });
    }

    // Update cycle status
    cycle.status = 'processing';
    cycle.processedBy = req.user._id;
    cycle.processedAt = new Date();
    await cycle.save();

    // Get all active employees
    const employees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('employmentInfo.department', 'name');

    let totalGrossPay = 0;
    let totalDeductions = 0;
    let totalNetPay = 0;
    let processedCount = 0;

    // Process each employee
    for (const employee of employees) {
      try {
        // Get attendance data for the pay period
        const attendance = await Attendance.find({
          employee: employee._id,
          date: {
            $gte: cycle.payPeriodStart,
            $lte: cycle.payPeriodEnd
          }
        });

        // Calculate working days, present days, etc.
        const workingDays = moment(cycle.payPeriodEnd).diff(moment(cycle.payPeriodStart), 'days') + 1;
        const presentDays = attendance.filter(a => a.status === 'present').length;
        const absentDays = attendance.filter(a => a.status === 'absent').length;

        // Get leave data
        const leaveRequests = await LeaveRequest.find({
          employee: employee._id,
          status: 'approved',
          startDate: { $lte: cycle.payPeriodEnd },
          endDate: { $gte: cycle.payPeriodStart }
        }).populate('leaveType');

        const paidLeaveDays = leaveRequests.reduce((total, leave) => {
          // Calculate overlapping days with pay period
          const leaveStart = moment.max(moment(leave.startDate), moment(cycle.payPeriodStart));
          const leaveEnd = moment.min(moment(leave.endDate), moment(cycle.payPeriodEnd));
          const overlapDays = leaveEnd.diff(leaveStart, 'days') + 1;
          
          // Assuming all leaves are paid for now (can be enhanced)
          return total + Math.max(0, overlapDays);
        }, 0);

        // Get salary data from SalaryDetails for the current month/year
        let salaryData = null;
        try {
          salaryData = await SalaryDetails.findOne({
            employee: employee._id,
            month: cycle.month,
            year: cycle.year
          });
        } catch (error) {
          console.log(`No salary data found for employee ${employee.employeeId} for ${cycle.month}/${cycle.year}`);
        }

        // Fallback to employee's current salary if no salary details found
        let basicSalary, hra, allowances, grossSalary;
        
        if (salaryData && salaryData.earnings) {
          // Use detailed salary data from SalaryDetails
          basicSalary = salaryData.earnings.basicSalary || 0;
          hra = salaryData.earnings.hra || 0;
          allowances = (salaryData.earnings.conveyanceAllowance || 0) + 
                      (salaryData.earnings.medicalAllowance || 0) + 
                      (salaryData.earnings.specialAllowance || 0) + 
                      (salaryData.earnings.performanceBonus || 0) + 
                      (salaryData.earnings.overtimePay || 0) + 
                      (salaryData.earnings.otherAllowances || 0);
          grossSalary = salaryData.grossSalary || (basicSalary + hra + allowances);
        } else {
          // Fallback to employee's current salary
          basicSalary = employee.salaryInfo?.currentSalary?.basic || 0;
          hra = employee.salaryInfo?.currentSalary?.hra || 0;
          allowances = employee.salaryInfo?.currentSalary?.allowances || 0;
          grossSalary = employee.salaryInfo?.currentSalary?.grossSalary || (basicSalary + hra + allowances);
        }

        // Prorate salary based on attendance
        const effectiveDays = presentDays + paidLeaveDays;
        const prorationFactor = effectiveDays / workingDays;

        // Build detailed earnings array
        const earnings = [];
        
        if (salaryData && salaryData.earnings) {
          // Use detailed salary components from SalaryDetails
          if (basicSalary > 0) earnings.push({ name: 'Basic Salary', amount: basicSalary * prorationFactor });
          if (hra > 0) earnings.push({ name: 'HRA', amount: hra * prorationFactor });
          if (salaryData.earnings.conveyanceAllowance > 0) earnings.push({ name: 'Conveyance Allowance', amount: salaryData.earnings.conveyanceAllowance * prorationFactor });
          if (salaryData.earnings.medicalAllowance > 0) earnings.push({ name: 'Medical Allowance', amount: salaryData.earnings.medicalAllowance * prorationFactor });
          if (salaryData.earnings.specialAllowance > 0) earnings.push({ name: 'Special Allowance', amount: salaryData.earnings.specialAllowance * prorationFactor });
          if (salaryData.earnings.performanceBonus > 0) earnings.push({ name: 'Performance Bonus', amount: salaryData.earnings.performanceBonus * prorationFactor });
          if (salaryData.earnings.overtimePay > 0) earnings.push({ name: 'Overtime Pay', amount: salaryData.earnings.overtimePay * prorationFactor });
          if (salaryData.earnings.otherAllowances > 0) earnings.push({ name: 'Other Allowances', amount: salaryData.earnings.otherAllowances * prorationFactor });
        } else {
          // Fallback to basic salary structure
          if (basicSalary > 0) earnings.push({ name: 'Basic Salary', amount: basicSalary * prorationFactor });
          if (hra > 0) earnings.push({ name: 'HRA', amount: hra * prorationFactor });
          if (allowances > 0) earnings.push({ name: 'Allowances', amount: allowances * prorationFactor });
        }

        // Calculate deductions
        const grossPay = earnings.reduce((total, earning) => total + earning.amount, 0);
        
        // Calculate deductions - use detailed data if available
        let deductions = [];
        
        if (salaryData && salaryData.deductions) {
          // Use detailed deductions from SalaryDetails
          if (salaryData.deductions.providentFund > 0) deductions.push({ name: 'Provident Fund', amount: salaryData.deductions.providentFund * prorationFactor });
          if (salaryData.deductions.employeeStateInsurance > 0) deductions.push({ name: 'ESI Employee', amount: salaryData.deductions.employeeStateInsurance * prorationFactor });
          if (salaryData.deductions.professionalTax > 0) deductions.push({ name: 'Professional Tax', amount: salaryData.deductions.professionalTax * prorationFactor });
          if (salaryData.deductions.incomeTax > 0) deductions.push({ name: 'Income Tax', amount: salaryData.deductions.incomeTax * prorationFactor });
          if (salaryData.deductions.loanRepayment > 0) deductions.push({ name: 'Loan Repayment', amount: salaryData.deductions.loanRepayment * prorationFactor });
          if (salaryData.deductions.advanceDeduction > 0) deductions.push({ name: 'Advance Deduction', amount: salaryData.deductions.advanceDeduction * prorationFactor });
          if (salaryData.deductions.lopAmount > 0) deductions.push({ name: 'Loss of Pay', amount: salaryData.deductions.lopAmount * prorationFactor });
          if (salaryData.deductions.otherDeductions > 0) deductions.push({ name: 'Other Deductions', amount: salaryData.deductions.otherDeductions * prorationFactor });
        } else {
          // Fallback to standard calculations
          const pfEmployee = basicSalary * 0.12 * prorationFactor;
          const pfEmployer = basicSalary * 0.12 * prorationFactor;
          const esiEmployee = grossPay <= 25000 ? grossPay * 0.0075 : 0;
          const esiEmployer = grossPay <= 25000 ? grossPay * 0.0325 : 0;
          
          // Tax calculation (simplified)
          const taxableIncome = grossPay;
          let taxDeducted = 0;
          if (taxableIncome > 250000 / 12) { // Basic exemption limit per month
            taxDeducted = (taxableIncome - 250000 / 12) * 0.05; // 5% tax
          }

          deductions = [
            { name: 'PF Employee', amount: pfEmployee },
            { name: 'ESI Employee', amount: esiEmployee },
            { name: 'TDS', amount: taxDeducted }
          ];
        }

        const totalDeduction = deductions.reduce((total, deduction) => total + deduction.amount, 0);
        const netPay = grossPay - totalDeduction;

        // Create payslip
        const payslip = new Payslip({
          employee: employee._id,
          payrollCycle: cycle._id,
          month: cycle.month,
          year: cycle.year,
          payPeriodStart: cycle.payPeriodStart,
          payPeriodEnd: cycle.payPeriodEnd,
          workingDays,
          presentDays,
          absentDays,
          paidLeaveDays,
          earnings,
          deductions,
          grossPay,
          totalDeductions: totalDeduction,
          netPay,
          taxableIncome,
          taxDeducted,
          pfEmployee,
          pfEmployer,
          esiEmployee,
          esiEmployer,
          status: 'generated'
        });

        await payslip.save();

        totalGrossPay += grossPay;
        totalDeductions += totalDeduction;
        totalNetPay += netPay;
        processedCount++;

      } catch (employeeError) {
        console.error(`Error processing payroll for employee ${employee.employeeId}:`, employeeError);
      }
    }

    // Update cycle totals
    cycle.totalEmployees = processedCount;
    cycle.totalGrossPay = totalGrossPay;
    cycle.totalDeductions = totalDeductions;
    cycle.totalNetPay = totalNetPay;
    cycle.status = 'completed';
    await cycle.save();

    res.json({
      message: 'Payroll processed successfully',
      cycle,
      processedEmployees: processedCount
    });
  } catch (error) {
    console.error('Process payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payroll/payslips
// @desc    Get payslips
// @access  Private
router.get('/payslips', [
  authenticate,
  query('employeeId').optional().isMongoId(),
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2020, max: 2030 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    // Employee filter
    if (req.query.employeeId) {
      if (!['admin', 'hr'].includes(req.user.role)) {
        const employee = await Employee.findOne({ user: req.user._id });
        if (!employee || employee._id.toString() !== req.query.employeeId) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
      filter.employee = req.query.employeeId;
    } else if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (employee) {
        filter.employee = employee._id;
      }
    }

    // Date filters
    if (req.query.month) {
      filter.month = parseInt(req.query.month);
    }
    if (req.query.year) {
      filter.year = parseInt(req.query.year);
    }

    const payslips = await Payslip.find(filter)
      .populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName employmentInfo.department')
      .populate('payrollCycle', 'name payDate')
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payslip.countDocuments(filter);

    res.json({
      payslips,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get payslips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payroll/payslips/:id/pdf
// @desc    Generate and download payslip PDF
// @access  Private
router.get('/payslips/:id/pdf', authenticate, async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate('employee', 'employeeId personalInfo employmentInfo.department employmentInfo.designation salaryInfo.bankDetails')
      .populate('payrollCycle', 'name payDate');

    if (!payslip) {
      return res.status(404).json({ message: 'Payslip not found' });
    }

    // Check permissions
    if (!['admin', 'hr'].includes(req.user.role)) {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee || payslip.employee._id.toString() !== employee._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${payslip.employee.employeeId}-${payslip.month}-${payslip.year}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('PAYSLIP', { align: 'center' });
    doc.moveDown();

    // Company info (you can customize this)
    doc.fontSize(12).text('Rannkly HR Management', { align: 'center' });
    doc.text('Employee Payslip', { align: 'center' });
    doc.moveDown();

    // Employee details
    doc.text(`Employee ID: ${payslip.employee.employeeId}`);
    doc.text(`Name: ${payslip.employee.personalInfo.firstName} ${payslip.employee.personalInfo.lastName}`);
    doc.text(`Designation: ${payslip.employee.employmentInfo.designation}`);
    doc.text(`Department: ${payslip.employee.employmentInfo.department?.name || 'N/A'}`);
    doc.text(`Pay Period: ${moment(payslip.payPeriodStart).format('DD/MM/YYYY')} - ${moment(payslip.payPeriodEnd).format('DD/MM/YYYY')}`);
    doc.text(`Pay Date: ${moment(payslip.payrollCycle.payDate).format('DD/MM/YYYY')}`);
    doc.moveDown();

    // Earnings table
    doc.text('EARNINGS', { underline: true });
    doc.moveDown(0.5);
    
    let yPosition = doc.y;
    payslip.earnings.forEach(earning => {
      doc.text(earning.name, 50, yPosition);
      doc.text(earning.amount.toFixed(2), 400, yPosition, { align: 'right' });
      yPosition += 20;
    });
    
    doc.text('Gross Pay', 50, yPosition, { underline: true });
    doc.text(payslip.grossPay.toFixed(2), 400, yPosition, { align: 'right', underline: true });
    doc.moveDown();

    // Deductions table
    yPosition = doc.y + 20;
    doc.text('DEDUCTIONS', 50, yPosition, { underline: true });
    yPosition += 30;
    
    payslip.deductions.forEach(deduction => {
      doc.text(deduction.name, 50, yPosition);
      doc.text(deduction.amount.toFixed(2), 400, yPosition, { align: 'right' });
      yPosition += 20;
    });
    
    doc.text('Total Deductions', 50, yPosition, { underline: true });
    doc.text(payslip.totalDeductions.toFixed(2), 400, yPosition, { align: 'right', underline: true });
    doc.moveDown();

    // Net pay
    yPosition = doc.y + 20;
    doc.fontSize(14).text('NET PAY', 50, yPosition, { underline: true });
    doc.text(payslip.netPay.toFixed(2), 400, yPosition, { align: 'right', underline: true });

    doc.end();
  } catch (error) {
    console.error('Generate payslip PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payroll/my-info
// @desc    Get current user's payroll information
// @access  Private (Employee)
router.get('/my-info', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('employmentInfo.department', 'name');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Get payroll records for this employee
    const currentYear = new Date().getFullYear();
    const payrollRecords = await Payroll.find({
      employee: employee._id,
      payPeriod: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      }
    }).sort({ payPeriod: -1 });

    // Get current salary from employee record or latest payroll
    const currentSalary = employee.salaryInfo?.currentSalary?.grossSalary || 
                         (payrollRecords.length > 0 ? payrollRecords[0].grossSalary : 50000);

    // Calculate YTD earnings
    const ytdEarnings = payrollRecords.reduce((total, record) => total + (record.netSalary || 0), 0);
    const ytdDeductions = payrollRecords.reduce((total, record) => total + (record.deductions?.total || 0), 0);

    // Get latest payslip
    const latestPayroll = payrollRecords.length > 0 ? payrollRecords[0] : null;

    // Salary breakdown (standard Indian salary structure)
    const salaryBreakup = {
      basic: Math.round(currentSalary * 0.5),
      hra: Math.round(currentSalary * 0.2),
      specialAllowance: Math.round(currentSalary * 0.15),
      otherAllowances: Math.round(currentSalary * 0.15),
      grossSalary: currentSalary,
      deductions: {
        pf: Math.round(currentSalary * 0.12),
        tds: Math.round(currentSalary * 0.1),
        total: Math.round(currentSalary * 0.22)
      },
      netSalary: Math.round(currentSalary * 0.78)
    };

    res.json({
      currentSalary,
      salaryBreakup,
      ytdEarnings,
      ytdDeductions,
      lastPayment: latestPayroll ? {
        date: latestPayroll.payPeriod,
        amount: latestPayroll.netSalary,
        payrollId: latestPayroll._id
      } : null,
      tdsStatus: {
        totalDeducted: ytdDeductions,
        currentQuarter: Math.round(currentSalary * 0.1 * 3), // 3 months
        financialYear: currentYear
      },
      payslips: payrollRecords.map(record => ({
        id: record._id,
        month: record.payPeriod,
        grossSalary: record.grossSalary,
        netSalary: record.netSalary,
        status: record.status || 'paid'
      }))
    });
  } catch (error) {
    console.error('Get payroll info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

