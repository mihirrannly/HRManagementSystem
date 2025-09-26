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
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

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
  authorize(['admin']),
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

        // Calculate salary components
        const basicSalary = employee.salaryInfo.currentSalary.basic || 0;
        const hra = employee.salaryInfo.currentSalary.hra || 0;
        const allowances = employee.salaryInfo.currentSalary.allowances || 0;

        // Prorate salary based on attendance
        const effectiveDays = presentDays + paidLeaveDays;
        const prorationFactor = effectiveDays / workingDays;

        const earnings = [
          { name: 'Basic Salary', amount: basicSalary * prorationFactor },
          { name: 'HRA', amount: hra * prorationFactor },
          { name: 'Allowances', amount: allowances * prorationFactor }
        ];

        // Calculate deductions
        const grossPay = earnings.reduce((total, earning) => total + earning.amount, 0);
        
        // PF calculation (12% of basic)
        const pfEmployee = basicSalary * 0.12 * prorationFactor;
        const pfEmployer = basicSalary * 0.12 * prorationFactor;

        // ESI calculation (0.75% of gross if gross <= 25000)
        const esiEmployee = grossPay <= 25000 ? grossPay * 0.0075 : 0;
        const esiEmployer = grossPay <= 25000 ? grossPay * 0.0325 : 0;

        // Tax calculation (simplified)
        const taxableIncome = grossPay;
        let taxDeducted = 0;
        if (taxableIncome > 250000 / 12) { // Basic exemption limit per month
          taxDeducted = (taxableIncome - 250000 / 12) * 0.05; // 5% tax
        }

        const deductions = [
          { name: 'PF Employee', amount: pfEmployee },
          { name: 'ESI Employee', amount: esiEmployee },
          { name: 'TDS', amount: taxDeducted }
        ];

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

module.exports = router;

