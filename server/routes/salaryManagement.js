const express = require('express');
const router = express.Router();
const SalaryDetails = require('../models/SalaryDetails');
const Employee = require('../models/Employee');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const csv = require('csv-parser');
const { createReadStream } = require('fs');

// Configure multer for CSV uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/salary-imports';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'salary-import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET all salary records with filters and pagination
router.get('/', [authenticate, authorize(['admin', 'hr', 'finance'])], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      month,
      year,
      status,
      employeeId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    // Search by employee ID or name
    if (search) {
      const employees = await Employee.find({
        $or: [
          { employeeId: { $regex: search, $options: 'i' } },
          { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      query.employee = { $in: employees.map(e => e._id) };
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (month) {
      query.month = parseInt(month);
    }

    if (year) {
      query.year = parseInt(year);
    }

    if (status) {
      query.paymentStatus = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [salaryRecords, total] = await Promise.all([
      SalaryDetails.find(query)
        .populate('employee', 'employeeId personalInfo employmentInfo')
        .populate('createdBy', 'email')
        .populate('updatedBy', 'email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      SalaryDetails.countDocuments(query)
    ]);

    res.json({
      salaryRecords,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching salary records:', error);
    res.status(500).json({ 
      message: 'Failed to fetch salary records', 
      error: error.message 
    });
  }
});

// GET single salary record by ID
router.get('/:id', [authenticate, authorize(['admin', 'hr', 'finance'])], async (req, res) => {
  try {
    const salaryRecord = await SalaryDetails.findById(req.params.id)
      .populate('employee', 'employeeId personalInfo employmentInfo contactInfo salaryInfo')
      .populate('createdBy', 'email')
      .populate('updatedBy', 'email');

    if (!salaryRecord) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.json(salaryRecord);
  } catch (error) {
    console.error('Error fetching salary record:', error);
    res.status(500).json({ 
      message: 'Failed to fetch salary record', 
      error: error.message 
    });
  }
});

// GET salary records for a specific employee
router.get('/employee/:employeeId', [authenticate], async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year, limit = 12 } = req.query;

    let query = { employeeId };
    if (year) {
      query.year = parseInt(year);
    }

    const salaryRecords = await SalaryDetails.find(query)
      .sort({ year: -1, month: -1 })
      .limit(parseInt(limit))
      .populate('employee', 'employeeId personalInfo');

    res.json({ salaryRecords });
  } catch (error) {
    console.error('Error fetching employee salary records:', error);
    res.status(500).json({ 
      message: 'Failed to fetch salary records', 
      error: error.message 
    });
  }
});

// POST create single salary record
router.post('/', [authenticate, authorize(['admin', 'hr', 'finance'])], async (req, res) => {
  try {
    const salaryData = { ...req.body };
    salaryData.createdBy = req.user._id;
    salaryData.updatedBy = req.user._id;

    // Verify employee exists
    const employee = await Employee.findOne({ 
      $or: [
        { _id: salaryData.employee },
        { employeeId: salaryData.employeeId }
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    salaryData.employee = employee._id;
    salaryData.employeeId = employee.employeeId;

    // Copy bank details from employee if not provided
    if (!salaryData.bankDetails || !salaryData.bankDetails.accountNumber) {
      salaryData.bankDetails = employee.salaryInfo?.bankDetails || {};
    }

    const salaryRecord = new SalaryDetails(salaryData);
    await salaryRecord.save();

    const populatedRecord = await SalaryDetails.findById(salaryRecord._id)
      .populate('employee', 'employeeId personalInfo employmentInfo');

    res.status(201).json({
      message: 'Salary record created successfully',
      salaryRecord: populatedRecord
    });
  } catch (error) {
    console.error('Error creating salary record:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Salary record already exists for this employee and period' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create salary record', 
      error: error.message 
    });
  }
});

// PUT update salary record
router.put('/:id', [authenticate, authorize(['admin', 'hr', 'finance'])], async (req, res) => {
  try {
    const updates = { ...req.body };
    updates.updatedBy = req.user._id;

    const salaryRecord = await SalaryDetails.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('employee', 'employeeId personalInfo employmentInfo');

    if (!salaryRecord) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.json({
      message: 'Salary record updated successfully',
      salaryRecord
    });
  } catch (error) {
    console.error('Error updating salary record:', error);
    res.status(500).json({ 
      message: 'Failed to update salary record', 
      error: error.message 
    });
  }
});

// DELETE salary record
router.delete('/:id', [authenticate, authorize(['admin', 'finance'])], async (req, res) => {
  try {
    const salaryRecord = await SalaryDetails.findByIdAndDelete(req.params.id);

    if (!salaryRecord) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.json({ message: 'Salary record deleted successfully' });
  } catch (error) {
    console.error('Error deleting salary record:', error);
    res.status(500).json({ 
      message: 'Failed to delete salary record', 
      error: error.message 
    });
  }
});

// POST bulk create/update salary records from processed data (frontend parsing)
router.post('/import/processed', [authenticate, authorize(['admin', 'hr', 'finance'])], async (req, res) => {
  try {
    const { records } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'No records provided for import' });
    }

    console.log(`📄 Processing ${records.length} salary records...`);

    const results = [];
    const errors = [];
    const importBatchId = `batch-${Date.now()}`;

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // +2 because row 1 is header

      try {
        // Find employee by employee ID
        const employee = await Employee.findOne({ employeeId: record.employeeId });

        if (!employee) {
          errors.push({
            row: rowNumber,
            employeeId: record.employeeId,
            error: 'Employee not found'
          });
          continue;
        }

        // Prepare salary data with ALL CSV fields
        const salaryData = {
          employee: employee._id,
          employeeId: employee.employeeId,
          month: parseInt(record.month),
          year: parseInt(record.year),
          
          // Employee Details from CSV
          employeeName: record.employeeName,
          dateOfJoining: record.dateOfJoining ? new Date(record.dateOfJoining) : undefined,
          remunerationType: record.remunerationType,
          employmentStatus: record.employmentStatus,
          workerType: record.workerType,
          jobTitle: record.jobTitle,
          department: record.department,
          subDepartment: record.subDepartment,
          location: record.location,
          businessUnit: record.businessUnit,
          costCenter: record.costCenter,
          
          // Salary Components from CSV
          totalCTC: record.totalCTC,
          totalBonusAmount: record.totalBonusAmount,
          totalPerkAmount: record.totalPerkAmount,
          regularSalary: record.regularSalary,
          grossSalaryA: record.grossSalaryA,
          total: record.total,
          revisionEffectiveFrom: record.revisionEffectiveFrom ? new Date(record.revisionEffectiveFrom) : undefined,
          lastUpdatedOn: record.lastUpdatedOn ? new Date(record.lastUpdatedOn) : undefined,
          
          // Earnings & Deductions
          earnings: record.earnings,
          deductions: record.deductions,
          attendance: record.attendance,
          
          // Payment Info
          paymentStatus: record.paymentStatus || 'pending',
          paymentDate: record.paymentDate ? new Date(record.paymentDate) : undefined,
          paymentMode: record.paymentMode || 'bank-transfer',
          paymentReference: record.paymentReference,
          remarks: record.remarks,
          
          // Meta
          createdBy: req.user._id,
          updatedBy: req.user._id,
          importedFrom: 'csv',
          importBatchId
        };

        // Copy bank details from employee
        salaryData.bankDetails = employee.salaryInfo?.bankDetails || {};

        // Check if record already exists
        const existingRecord = await SalaryDetails.findOne({
          employee: employee._id,
          month: salaryData.month,
          year: salaryData.year
        });

        let savedRecord;
        if (existingRecord) {
          // Update existing record
          Object.assign(existingRecord, salaryData);
          savedRecord = await existingRecord.save();
          results.push({
            row: rowNumber,
            employeeId: employee.employeeId,
            action: 'updated',
            salaryPeriod: `${salaryData.month}/${salaryData.year}`
          });
        } else {
          // Create new record
          const newRecord = new SalaryDetails(salaryData);
          savedRecord = await newRecord.save();
          results.push({
            row: rowNumber,
            employeeId: employee.employeeId,
            action: 'created',
            salaryPeriod: `${salaryData.month}/${salaryData.year}`
          });
        }
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        errors.push({
          row: rowNumber,
          employeeId: record.employeeId,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Import completed',
      summary: {
        total: records.length,
        successful: results.length,
        failed: errors.length,
        importBatchId
      },
      results,
      errors
    });
  } catch (error) {
    console.error('Error importing processed records:', error);
    res.status(500).json({ 
      message: 'Failed to import records', 
      error: error.message 
    });
  }
});

// POST bulk create/update salary records from CSV (legacy file upload method)
router.post('/import/csv', [authenticate, authorize(['admin', 'hr', 'finance']), upload.single('csvFile')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const results = [];
    const errors = [];
    const importBatchId = `batch-${Date.now()}`;

    // Read and parse CSV
    const records = [];
    
    await new Promise((resolve, reject) => {
      createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => records.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📄 Processing ${records.length} records from CSV...`);

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // +2 because CSV rows start at 2 (1 is header)

      try {
        // Find employee by employee ID
        const employee = await Employee.findOne({ employeeId: row.employeeId || row.EmployeeID || row.employee_id });

        if (!employee) {
          errors.push({
            row: rowNumber,
            employeeId: row.employeeId || row.EmployeeID || row.employee_id,
            error: 'Employee not found'
          });
          continue;
        }

        // Parse salary data from CSV
        const salaryData = {
          employee: employee._id,
          employeeId: employee.employeeId,
          month: parseInt(row.month || row.Month),
          year: parseInt(row.year || row.Year),
          
          earnings: {
            basicSalary: parseFloat(row.basicSalary || row.basic_salary || row.Basic || 0),
            hra: parseFloat(row.hra || row.HRA || 0),
            conveyanceAllowance: parseFloat(row.conveyanceAllowance || row.conveyance_allowance || row.Conveyance || 0),
            medicalAllowance: parseFloat(row.medicalAllowance || row.medical_allowance || row.Medical || 0),
            specialAllowance: parseFloat(row.specialAllowance || row.special_allowance || row.Special || 0),
            performanceBonus: parseFloat(row.performanceBonus || row.performance_bonus || row.Bonus || 0),
            overtimePay: parseFloat(row.overtimePay || row.overtime_pay || row.Overtime || 0),
            otherAllowances: parseFloat(row.otherAllowances || row.other_allowances || row.Others || 0)
          },
          
          deductions: {
            providentFund: parseFloat(row.providentFund || row.pf || row.PF || 0),
            employeeStateInsurance: parseFloat(row.esi || row.ESI || 0),
            professionalTax: parseFloat(row.professionalTax || row.professional_tax || row.PT || 0),
            incomeTax: parseFloat(row.incomeTax || row.income_tax || row.TDS || 0),
            loanRepayment: parseFloat(row.loanRepayment || row.loan_repayment || row.Loan || 0),
            advanceDeduction: parseFloat(row.advanceDeduction || row.advance_deduction || row.Advance || 0),
            lossOfPayDays: parseFloat(row.lossOfPayDays || row.lop_days || row.LOP_Days || 0),
            lopAmount: parseFloat(row.lopAmount || row.lop_amount || row.LOP_Amount || 0),
            otherDeductions: parseFloat(row.otherDeductions || row.other_deductions || 0)
          },
          
          attendance: {
            totalWorkingDays: parseInt(row.totalWorkingDays || row.total_working_days || row.Working_Days || 0),
            daysPresent: parseInt(row.daysPresent || row.days_present || row.Present_Days || 0),
            daysAbsent: parseInt(row.daysAbsent || row.days_absent || row.Absent_Days || 0),
            paidLeaves: parseInt(row.paidLeaves || row.paid_leaves || row.Paid_Leaves || 0),
            unpaidLeaves: parseInt(row.unpaidLeaves || row.unpaid_leaves || row.Unpaid_Leaves || 0)
          },
          
          paymentStatus: row.paymentStatus || row.payment_status || row.Status || 'pending',
          paymentDate: row.paymentDate || row.payment_date ? new Date(row.paymentDate || row.payment_date) : undefined,
          paymentMode: row.paymentMode || row.payment_mode || 'bank-transfer',
          paymentReference: row.paymentReference || row.payment_reference || row.Reference,
          remarks: row.remarks || row.Remarks,
          
          createdBy: req.user._id,
          updatedBy: req.user._id,
          importedFrom: 'csv',
          importBatchId
        };

        // Copy bank details from employee
        salaryData.bankDetails = employee.salaryInfo?.bankDetails || {};

        // Check if record already exists
        const existingRecord = await SalaryDetails.findOne({
          employee: employee._id,
          month: salaryData.month,
          year: salaryData.year
        });

        let savedRecord;
        if (existingRecord) {
          // Update existing record
          Object.assign(existingRecord, salaryData);
          savedRecord = await existingRecord.save();
          results.push({
            row: rowNumber,
            employeeId: employee.employeeId,
            action: 'updated',
            salaryPeriod: `${salaryData.month}/${salaryData.year}`
          });
        } else {
          // Create new record
          const newRecord = new SalaryDetails(salaryData);
          savedRecord = await newRecord.save();
          results.push({
            row: rowNumber,
            employeeId: employee.employeeId,
            action: 'created',
            salaryPeriod: `${salaryData.month}/${salaryData.year}`
          });
        }
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        errors.push({
          row: rowNumber,
          employeeId: row.employeeId || row.EmployeeID || row.employee_id,
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.error('Error deleting uploaded file:', unlinkError);
    }

    res.json({
      message: 'CSV import completed',
      summary: {
        total: records.length,
        successful: results.length,
        failed: errors.length,
        importBatchId
      },
      results,
      errors
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      message: 'Failed to import CSV', 
      error: error.message 
    });
  }
});

// GET salary statistics
router.get('/stats/overview', [authenticate, authorize(['admin', 'hr', 'finance'])], async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const [
      totalRecords,
      pendingPayments,
      paidPayments,
      totalPayable,
      totalPaid
    ] = await Promise.all([
      SalaryDetails.countDocuments(query),
      SalaryDetails.countDocuments({ ...query, paymentStatus: 'pending' }),
      SalaryDetails.countDocuments({ ...query, paymentStatus: 'paid' }),
      SalaryDetails.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$netSalary' } } }
      ]),
      SalaryDetails.aggregate([
        { $match: { ...query, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$netSalary' } } }
      ])
    ]);

    res.json({
      totalRecords,
      pendingPayments,
      paidPayments,
      totalPayable: totalPayable[0]?.total || 0,
      totalPaid: totalPaid[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching salary statistics:', error);
    res.status(500).json({ 
      message: 'Failed to fetch statistics', 
      error: error.message 
    });
  }
});

module.exports = router;

