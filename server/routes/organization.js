const express = require('express');
const { query, body, validationResult } = require('express-validator');
const moment = require('moment');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/organization/analytics
// @desc    Get organization analytics (Admin only)
// @access  Private (Admin only)
router.get('/analytics', [
  authenticate,
  authorize(['admin', 'hr'])
], async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = moment().startOf('month').toDate();
    const startOfYear = moment().startOf('year').toDate();
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();

    // Total Employees
    const totalEmployees = await Employee.countDocuments({ 'employmentInfo.isActive': true });
    
    // Total Employees (including inactive)
    const allEmployees = await Employee.countDocuments({});

    // New Employees Added (This Month)
    const newEmployeesThisMonth = await Employee.countDocuments({
      'employmentInfo.dateOfJoining': { $gte: startOfMonth },
      'employmentInfo.isActive': true
    });

    // New Employees Added (This Year)
    const newEmployeesThisYear = await Employee.countDocuments({
      'employmentInfo.dateOfJoining': { $gte: startOfYear },
      'employmentInfo.isActive': true
    });

    // Exited Employees (This Month)
    const exitedEmployeesThisMonth = await Employee.countDocuments({
      'employmentInfo.terminationDate': { $gte: startOfMonth },
      'employmentInfo.isActive': false
    });

    // Exited Employees (This Year)
    const exitedEmployeesThisYear = await Employee.countDocuments({
      'employmentInfo.terminationDate': { $gte: startOfYear },
      'employmentInfo.isActive': false
    });

    // Employees in Probation
    const employeesInProbation = await Employee.countDocuments({
      'employmentInfo.isActive': true,
      'employmentInfo.probationEndDate': { $gte: currentDate },
      'employmentInfo.confirmationDate': { $exists: false }
    });

    // Recent Data Changes (Last 30 days)
    const recentDataChanges = await Employee.countDocuments({
      'updatedAt': { $gte: thirtyDaysAgo }
    });

    // Department-wise breakdown
    const departmentBreakdown = await Employee.aggregate([
      {
        $match: { 'employmentInfo.isActive': true }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'employmentInfo.department',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $group: {
          _id: '$department._id',
          departmentName: { $first: '$department.name' },
          departmentCode: { $first: '$department.code' },
          totalEmployees: { $sum: 1 },
          probationEmployees: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$employmentInfo.probationEndDate', currentDate] },
                    { $not: { $ifNull: ['$employmentInfo.confirmationDate', false] } }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { totalEmployees: -1 }
      }
    ]);

    // Employment Type breakdown
    const employmentTypeBreakdown = await Employee.aggregate([
      {
        $match: { 'employmentInfo.isActive': true }
      },
      {
        $group: {
          _id: '$employmentInfo.employeeType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Work Location breakdown
    const workLocationBreakdown = await Employee.aggregate([
      {
        $match: { 'employmentInfo.isActive': true }
      },
      {
        $group: {
          _id: '$employmentInfo.workLocation',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly joining trends (Last 12 months)
    const joiningTrends = await Employee.aggregate([
      {
        $match: {
          'employmentInfo.dateOfJoining': {
            $gte: moment().subtract(12, 'months').startOf('month').toDate()
          },
          'employmentInfo.isActive': true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$employmentInfo.dateOfJoining' },
            month: { $month: '$employmentInfo.dateOfJoining' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      summary: {
        totalEmployees,
        allEmployees,
        newEmployeesThisMonth,
        newEmployeesThisYear,
        exitedEmployeesThisMonth,
        exitedEmployeesThisYear,
        employeesInProbation,
        recentDataChanges
      },
      breakdowns: {
        departments: departmentBreakdown,
        employmentTypes: employmentTypeBreakdown,
        workLocations: workLocationBreakdown
      },
      trends: {
        joiningTrends
      }
    });

  } catch (error) {
    console.error('Get organization analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/organization/employees
// @desc    Get detailed employee list with all fields (Admin only)
// @access  Private (Admin only)
router.get('/employees', [
  authenticate,
  authorize(['admin', 'hr']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 500 }),
  query('department').optional().custom((value) => {
    if (value && value.trim() !== '') {
      return /^[0-9a-fA-F]{24}$/.test(value);
    }
    return true;
  }),
  query('status').optional().isIn(['active', 'inactive', 'all', '']),
  query('search').optional(),
  query('exportFormat').optional().isIn(['json', 'csv'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};

    if (req.query.department && req.query.department.trim() !== '') {
      filter['employmentInfo.department'] = req.query.department.trim();
    }

    if (req.query.status && req.query.status.trim() !== '') {
      if (req.query.status === 'active') {
        filter['employmentInfo.isActive'] = true;
      } else if (req.query.status === 'inactive') {
        filter['employmentInfo.isActive'] = false;
      }
      // 'all' means no filter on status
    } else {
      // Default to active employees if no status specified
      filter['employmentInfo.isActive'] = true;
    }

    if (req.query.search && req.query.search.trim() !== '') {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { 'personalInfo.firstName': searchRegex },
        { 'personalInfo.lastName': searchRegex },
        { employeeId: searchRegex },
        { 'employmentInfo.designation': searchRegex }
      ];
    }

    // Get employees with all detailed information
    const employees = await Employee.find(filter)
      .populate('employmentInfo.department', 'name code')
      .populate('user', 'email')
      .sort({ employeeId: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Employee.countDocuments(filter);

    // Transform data for organization view
    const transformedEmployees = employees.map(emp => {
      const salary = emp.salaryInfo?.currentSalary || {};
      const currentDate = new Date();
      const joiningDate = emp.employmentInfo?.dateOfJoining;
      const probationEndDate = emp.employmentInfo?.probationEndDate;
      const confirmationDate = emp.employmentInfo?.confirmationDate;

      // Calculate employment status
      let employmentStatus = 'Confirmed';
      if (probationEndDate && probationEndDate > currentDate && !confirmationDate) {
        employmentStatus = 'Probation';
      } else if (!emp.employmentInfo?.isActive) {
        employmentStatus = 'Terminated';
      }

      // Calculate basic salary components
      const basic = salary.basic || 0;
      const hra = salary.hra || basic * 0.4; // 40% of basic if not specified
      const conveyanceAllowance = 2400; // Standard conveyance allowance
      const specialAllowance = salary.allowances || 0;
      const gross = basic + hra + conveyanceAllowance + specialAllowance;

      // PF calculations (12% of basic)
      const pfEmployee = basic * 0.12;
      const pfEmployer = basic * 0.12;

      // Health Insurance (standard amount)
      const healthInsurance = 5000;

      return {
        employeeNumber: emp.employeeId,
        employeeName: `${emp.personalInfo?.firstName || ''} ${emp.personalInfo?.lastName || ''}`.trim(),
        dateOfJoining: joiningDate ? moment(joiningDate).format('DD/MM/YYYY') : '',
        remunerationType: 'Monthly', // Default to monthly
        employmentStatus,
        workerType: emp.employmentInfo?.employeeType || 'full-time',
        jobTitle: emp.employmentInfo?.designation || '',
        department: emp.employmentInfo?.department?.name || '',
        subDepartment: '', // To be implemented if needed
        location: emp.employmentInfo?.workLocation || 'office',
        businessUnit: emp.employmentInfo?.department?.name || '',
        costCenter: emp.employmentInfo?.department?.code || '',
        revisionEffectiveFrom: emp.updatedAt ? moment(emp.updatedAt).format('DD/MM/YYYY') : '',
        lastUpdatedOn: emp.updatedAt ? moment(emp.updatedAt).format('DD/MM/YYYY HH:mm') : '',
        totalCTC: salary.ctc || 0,
        totalBonusAmount: 0, // To be implemented
        totalPerkAmount: 0, // To be implemented
        pfOtherCharges: 0,
        regularSalary: gross,
        basic,
        hra,
        conveyanceAllowance,
        specialAllowance,
        grossA: gross,
        total: gross,
        pfEmployee,
        pfEmployer,
        healthInsurance,
        // Additional fields for internal use
        email: emp.user?.email || '',
        phone: emp.contactInfo?.phone || '',
        isActive: emp.employmentInfo?.isActive || false,
        probationEndDate: probationEndDate ? moment(probationEndDate).format('DD/MM/YYYY') : '',
        confirmationDate: confirmationDate ? moment(confirmationDate).format('DD/MM/YYYY') : ''
      };
    });

    // Handle CSV export
    if (req.query.exportFormat === 'csv') {
      const csvHeaders = [
        'Employee Number', 'Employee Name', 'Date of Joining', 'Remuneration Type',
        'Employment Status', 'Worker Type', 'Job Title', 'Department', 'Sub Department',
        'Location', 'Business Unit', 'Cost Center', 'Revision Effective From',
        'Last Updated On', 'Total CTC', 'Total Bonus Amount', 'Total Perk Amount',
        'PF - Other Charges', 'Regular Salary', 'Basic', 'HRA', 'Conveyance Allowance',
        'Special Allowance', 'Gross(A)', 'Total', 'PF Employee', 'PF - Employer', 'Health Insurance'
      ];

      const csvRows = transformedEmployees.map(emp => [
        emp.employeeNumber, emp.employeeName, emp.dateOfJoining, emp.remunerationType,
        emp.employmentStatus, emp.workerType, emp.jobTitle, emp.department, emp.subDepartment,
        emp.location, emp.businessUnit, emp.costCenter, emp.revisionEffectiveFrom,
        emp.lastUpdatedOn, emp.totalCTC, emp.totalBonusAmount, emp.totalPerkAmount,
        emp.pfOtherCharges, emp.regularSalary, emp.basic, emp.hra, emp.conveyanceAllowance,
        emp.specialAllowance, emp.grossA, emp.total, emp.pfEmployee, emp.pfEmployer, emp.healthInsurance
      ]);

      const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=organization-data-${moment().format('YYYY-MM-DD')}.csv`);
      return res.send(csvContent);
    }

    res.json({
      employees: employees,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      total
    });

  } catch (error) {
    console.error('Get organization employees error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/organization/departments
// @desc    Get departments with employee counts (Admin only)
// @access  Private (Admin only)
router.get('/departments', [
  authenticate,
  authorize(['admin', 'hr'])
], async (req, res) => {
  try {
    const departments = await Department.aggregate([
      {
        $lookup: {
          from: 'employees',
          let: { deptId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$employmentInfo.department', '$$deptId'] },
                    { $eq: ['$employmentInfo.isActive', true] }
                  ]
                }
              }
            }
          ],
          as: 'employees'
        }
      },
      {
        $addFields: {
          employeeCount: { $size: '$employees' }
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          description: 1,
          employeeCount: 1,
          isActive: 1,
          head: 1,
          budget: 1
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/organization/recent-changes
// @desc    Get recent changes in employee data (Admin only)
// @access  Private (Admin only)
router.get('/recent-changes', [
  authenticate,
  authorize(['admin', 'hr']),
  query('days').optional().isInt({ min: 1, max: 90 })
], async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = moment().subtract(days, 'days').toDate();

    const recentChanges = await Employee.find({
      updatedAt: { $gte: startDate }
    })
    .populate('employmentInfo.department', 'name')
    .select('employeeId personalInfo.firstName personalInfo.lastName employmentInfo.designation employmentInfo.department updatedAt auditLog')
    .sort({ updatedAt: -1 })
    .limit(100);

    const changes = recentChanges.map(emp => ({
      employeeId: emp.employeeId,
      employeeName: `${emp.personalInfo?.firstName || ''} ${emp.personalInfo?.lastName || ''}`.trim(),
      designation: emp.employmentInfo?.designation || '',
      department: emp.employmentInfo?.department?.name || '',
      lastUpdated: moment(emp.updatedAt).format('DD/MM/YYYY HH:mm'),
      changesCount: emp.auditLog?.length || 0
    }));

    res.json(changes);
  } catch (error) {
    console.error('Get recent changes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/organization/import
// @desc    Bulk import employees from CSV/Excel data (Admin only)
// @access  Private (Admin only)
router.post('/import', [
  authenticate,
  authorize(['admin', 'hr']),
  body('employees').isArray({ min: 1 }).withMessage('Employees array is required'),
  body('mode').isIn(['create', 'update', 'upsert']).withMessage('Mode must be create, update, or upsert')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employees, mode = 'create' } = req.body;
    const results = {
      total: employees.length,
      success: 0,
      failed: 0,
      errors: [],
      created: [],
      updated: [],
      skipped: []
    };

    // Get all departments for mapping
    const departments = await Department.find({}).lean();
    const departmentMap = {};
    departments.forEach(dept => {
      departmentMap[dept.name.toLowerCase()] = dept._id;
      departmentMap[dept.code.toLowerCase()] = dept._id;
    });

    for (let i = 0; i < employees.length; i++) {
      const empData = employees[i];
      const rowNumber = i + 1;

      try {
        // Validate required fields
        if (!empData.employeeName || !empData.email) {
          results.errors.push({
            row: rowNumber,
            error: 'Employee name and email are required',
            data: empData
          });
          results.failed++;
          continue;
        }

        // Parse name
        const nameParts = empData.employeeName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        // Find or create department
        let departmentId = null;
        if (empData.department) {
          const deptKey = empData.department.toLowerCase();
          departmentId = departmentMap[deptKey];
          
          if (!departmentId) {
            // Create new department if it doesn't exist
            const newDept = new Department({
              name: empData.department,
              code: empData.department.substring(0, 3).toUpperCase(),
              description: `Auto-created from import`
            });
            await newDept.save();
            departmentId = newDept._id;
            departmentMap[deptKey] = departmentId;
          }
        }

        // Check if employee exists
        let existingEmployee = null;
        const csvEmployeeId = empData.employee_number || empData.employeeNumber || empData.employeeId;
        if (csvEmployeeId) {
          existingEmployee = await Employee.findOne({ employeeId: csvEmployeeId });
        }
        if (!existingEmployee && empData.email) {
          const existingUser = await User.findOne({ email: empData.email.toLowerCase() });
          if (existingUser) {
            existingEmployee = await Employee.findOne({ user: existingUser._id });
          }
        }

        // Handle different modes
        if (existingEmployee) {
          if (mode === 'create') {
            results.errors.push({
              row: rowNumber,
              error: 'Employee already exists',
              data: empData
            });
            results.failed++;
            continue;
          } else if (mode === 'update' || mode === 'upsert') {
            // Update existing employee
            await updateEmployeeFromImport(existingEmployee, empData, departmentId);
            results.updated.push(existingEmployee.employeeId);
            results.success++;
          }
        } else {
          if (mode === 'update') {
            results.errors.push({
              row: rowNumber,
              error: 'Employee not found for update',
              data: empData
            });
            results.failed++;
            continue;
          } else if (mode === 'create' || mode === 'upsert') {
            // Create new employee
            const newEmployee = await createEmployeeFromImport(empData, firstName, lastName, departmentId, req.user._id);
            results.created.push(newEmployee.employeeId);
            results.success++;
          }
        }

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        results.errors.push({
          row: rowNumber,
          error: error.message,
          data: empData
        });
        results.failed++;
      }
    }

    res.json({
      message: `Import completed. ${results.success} successful, ${results.failed} failed.`,
      results
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ message: 'Server error during import' });
  }
});

// Helper function to create employee from import data
async function createEmployeeFromImport(empData, firstName, lastName, departmentId, createdBy) {
  // Create user first
  const user = new User({
    email: empData.email.toLowerCase(),
    password: 'TempPass123!', // Temporary password - should be changed on first login
    role: 'employee'
  });
  await user.save();

  // Parse salary data
  const basicSalary = parseFloat(empData.basic) || 0;
  const hra = parseFloat(empData.hra) || basicSalary * 0.4;
  const allowances = parseFloat(empData.specialAllowance) || 0;
  const grossSalary = basicSalary + hra + allowances;
  const ctc = parseFloat(empData.totalCTC) || grossSalary * 12;

  // Create employee
  const employee = new Employee({
    // Use employeeId from CSV data if available, otherwise let model generate it
    employeeId: empData.employee_number || empData.employeeNumber || empData.employeeId || undefined,
    attendanceNumber: empData.attendanceNumber || undefined,
    user: user._id,
    personalInfo: {
      firstName,
      lastName,
      dateOfBirth: empData.dateOfBirth ? new Date(empData.dateOfBirth) : undefined,
      gender: empData.gender ? empData.gender.toLowerCase() : undefined,
      nationality: 'Indian'
    },
    contactInfo: {
      personalEmail: empData.personalEmail || empData.email,
      phone: empData.phone || '',
      address: {
        city: empData.location || '',
        country: 'India'
      }
    },
    employmentInfo: {
      department: departmentId,
      designation: empData.jobTitle || 'Employee',
      employeeType: empData.workerType || 'full-time',
      workLocation: empData.location || 'office',
      dateOfJoining: empData.dateOfJoining ? new Date(empData.dateOfJoining) : new Date(),
      isActive: empData.employmentStatus !== 'Terminated'
    },
    salaryInfo: {
      currentSalary: {
        basic: basicSalary,
        hra,
        allowances,
        grossSalary,
        ctc
      }
    },
    additionalInfo: {
      taxInfo: {
        panNumber: empData.panNumber || undefined,
        aadharNumber: empData.aadhaarNumber || undefined,
        pfNumber: empData.pfNumber || undefined,
        uanNumber: empData.uanNumber || undefined
      }
    }
  });

  await employee.save();
  return employee;
}

// Helper function to update employee from import data
async function updateEmployeeFromImport(employee, empData, departmentId) {
  // Update attendance number if provided
  if (empData.attendanceNumber !== undefined) {
    employee.attendanceNumber = empData.attendanceNumber || null;
  }

  // Update personal info
  if (empData.employeeName) {
    const nameParts = empData.employeeName.trim().split(' ');
    employee.personalInfo.firstName = nameParts[0];
    employee.personalInfo.lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  }

  // Update employment info
  if (departmentId) employee.employmentInfo.department = departmentId;
  if (empData.jobTitle) employee.employmentInfo.designation = empData.jobTitle;
  if (empData.workerType) employee.employmentInfo.employeeType = empData.workerType;
  if (empData.location) employee.employmentInfo.workLocation = empData.location;
  if (empData.employmentStatus) {
    employee.employmentInfo.isActive = empData.employmentStatus !== 'Terminated';
  }

  // Update salary info
  if (empData.basic || empData.hra || empData.totalCTC) {
    const basicSalary = parseFloat(empData.basic) || employee.salaryInfo.currentSalary.basic || 0;
    const hra = parseFloat(empData.hra) || employee.salaryInfo.currentSalary.hra || 0;
    const allowances = parseFloat(empData.specialAllowance) || employee.salaryInfo.currentSalary.allowances || 0;
    const ctc = parseFloat(empData.totalCTC) || employee.salaryInfo.currentSalary.ctc || 0;

    employee.salaryInfo.currentSalary = {
      basic: basicSalary,
      hra,
      allowances,
      grossSalary: basicSalary + hra + allowances,
      ctc
    };
  }

  // Update tax info
  if (empData.panNumber || empData.aadhaarNumber || empData.pfNumber || empData.uanNumber) {
    if (!employee.additionalInfo) {
      employee.additionalInfo = {};
    }
    if (!employee.additionalInfo.taxInfo) {
      employee.additionalInfo.taxInfo = {};
    }
    
    if (empData.panNumber !== undefined) employee.additionalInfo.taxInfo.panNumber = empData.panNumber;
    if (empData.aadhaarNumber !== undefined) employee.additionalInfo.taxInfo.aadharNumber = empData.aadhaarNumber;
    if (empData.pfNumber !== undefined) employee.additionalInfo.taxInfo.pfNumber = empData.pfNumber;
    if (empData.uanNumber !== undefined) employee.additionalInfo.taxInfo.uanNumber = empData.uanNumber;
  }

  await employee.save();
  return employee;
}

// @route   GET /api/organization/import-template
// @desc    Download CSV template for bulk import (Admin only)
// @access  Private (Admin only)
router.get('/import-template', [
  authenticate,
  authorize(['admin', 'hr'])
], (req, res) => {
  const template = [
    'employeeNumber,employeeName,email,dateOfJoining,employmentStatus,workerType,jobTitle,department,location,totalCTC,basic,hra,specialAllowance,phone,personalEmail,gender,dateOfBirth'
  ];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=employee-import-template.csv');
  res.send(template.join('\n'));
});

// @route   POST /api/organization/import-master-data
// @desc    Import comprehensive employee master data from CSV
// @access  Private (Admin only)
router.post('/import-master-data', [
  authenticate,
  authorize(['admin', 'hr']),
  body('employees').isArray().withMessage('Employees data must be an array'),
  body('headers').isArray().withMessage('Headers must be an array'),
  body('mode').isIn(['comprehensive', 'update', 'create']).withMessage('Invalid import mode')
], async (req, res) => {
  console.log('🚀 IMPORT-MASTER-DATA ENDPOINT CALLED');
  console.log('📊 Headers received:', req.body.headers);
  console.log('👥 Number of employees:', req.body.employees?.length);
  if (req.body.employees?.length > 0) {
    console.log('🔍 First employee data:', JSON.stringify(req.body.employees[0], null, 2));
  }
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { employees, headers, mode = 'comprehensive' } = req.body;
    const results = {
      total: employees.length,
      success: 0,
      failed: 0,
      updated: 0,
      created: 0,
      skipped: 0,
      errors: [],
      newFields: [],
      newDepartments: []
    };

    // Process each employee record
    for (let i = 0; i < employees.length; i++) {
      const empData = employees[i];
      
        // Debug: Log the first record's fields
        if (i === 0) {
          console.log('First employee record fields:', Object.keys(empData));
          console.log('First employee data sample:', empData);
          console.log('Looking for employee ID in these fields:', Object.keys(empData).filter(key => 
            key.toLowerCase().includes('id') || 
            key.toLowerCase().includes('code') || 
            key.toLowerCase().includes('number') ||
            key.toLowerCase().includes('codr')
          ));
        }
      
      try {
        // Helper function for case-insensitive field access
        const getField = (obj, ...keys) => {
          for (const key of keys) {
            // Try exact match first
            if (obj[key] !== undefined) return obj[key];
            // Try case-insensitive match
            const objKeys = Object.keys(obj);
            const matchingKey = objKeys.find(k => k.toLowerCase() === key.toLowerCase());
            if (matchingKey && obj[matchingKey] !== undefined) return obj[matchingKey];
          }
          return undefined;
        };

        // Extract basic info using converted field names (lowercase with underscores)
        const fullName = empData['full_name'];
        const displayName = empData['display_name'];
        const firstName = displayName ? displayName.split(' ')[0] : 'Unknown';
        const lastName = displayName ? displayName.split(' ').slice(1).join(' ') || 'N/A' : 'N/A';
        
        const email = empData['work_email'];
        // Don't extract employeeId from CSV - always let Employee model generate CODR format

        if (!email) {
          results.errors.push(`Row ${i + 1}: Email is required`);
          results.failed++;
          continue;
        }

        // Check if employee exists
        let existingUser = await User.findOne({ email });
        let existingEmployee = null;
        
        if (existingUser) {
          existingEmployee = await Employee.findOne({ user: existingUser._id });
        }

        // Handle department - Use EXACT CSV value without any modifications
        let departmentId = null;
        const departmentName = empData['department'] || 'General';
        
        // Use exact department name for code generation (no algorithmic mapping)
        const departmentCode = departmentName.toUpperCase().replace(/\s+/g, '_').substring(0, 10);
        
        console.log(`📋 Processing department for ${empData['full_name']}: "${departmentName}" (from CSV)`);
        
        // Check for existing department by EXACT name match (case insensitive) or code
        let department = await Department.findOne({ 
          $or: [
            { name: { $regex: new RegExp(`^${departmentName}$`, 'i') } }, // Exact match only
            { code: departmentCode }
          ]
        });
        
        if (!department) {
          // Make sure the code is unique by adding a suffix if needed
          let uniqueCode = departmentCode;
          let codeExists = await Department.findOne({ code: uniqueCode });
          let counter = 1;
          
          while (codeExists) {
            uniqueCode = `${departmentCode}_${counter}`;
            codeExists = await Department.findOne({ code: uniqueCode });
            counter++;
          }
          
          department = new Department({
            name: departmentName, // Using EXACT CSV value
            code: uniqueCode,
            description: `Auto-created from CSV import: ${departmentName}`,
            head: null,
            createdBy: req.user.id
          });
          await department.save();
          console.log(`✅ Created new department from CSV: "${departmentName}" with code: ${uniqueCode}`);
          results.newDepartments.push(departmentName);
        }
        departmentId = department._id;

        // Helper function to normalize enum values
        const normalizeGender = (gender) => {
          if (!gender) return 'prefer-not-to-say';
          const g = gender.toLowerCase();
          if (g === 'male' || g === 'm') return 'male';
          if (g === 'female' || g === 'f') return 'female';
          if (g === 'other') return 'other';
          return 'prefer-not-to-say';
        };

        const normalizeMaritalStatus = (status) => {
          if (!status) return 'single';
          const s = status.toLowerCase();
          if (s === 'married' || s === 'marriage') return 'married';
          if (s === 'single' || s === 'unmarried') return 'single';
          if (s === 'divorced') return 'divorced';
          if (s === 'widowed') return 'widowed';
          return 'single';
        };

        const parseDate = (dateString) => {
          if (!dateString || dateString === '##########' || dateString.trim() === '') {
            return new Date(); // Default to current date
          }
          
          // Handle various date formats
          try {
            // Try parsing DD-MMM-YYYY format (01-Mar-2022)
            if (dateString.includes('-') && dateString.length <= 12) {
              const date = new Date(dateString);
              if (!isNaN(date.getTime())) {
                return date;
              }
            }
            
            // Try parsing other formats
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
              return date;
            }
            
            // If all fails, return current date
            return new Date();
          } catch (error) {
            console.log(`Date parsing failed for: ${dateString}, using current date`);
            return new Date();
          }
        };

        // Prepare employee data matching the schema
        const csvEmployeeId = empData['employee_number'] || empData['employee_id'] || empData['employeeId'] || empData['employeeNumber'] || undefined;
        
        const employeePayload = {
          // Use employeeId from CSV if available, otherwise let model generate CODR format
          employeeId: csvEmployeeId,
          attendanceNumber: empData['attendance_number'] || empData.employmentInfo?.attendanceNumber || empData.additionalInfo?.['Attendance Number'] || undefined,
          // user: will be set after user creation
          personalInfo: {
            firstName,
            lastName,
            dateOfBirth: parseDate(empData['date_of_birth']),
            gender: normalizeGender(empData['gender']),
            maritalStatus: normalizeMaritalStatus(empData['marital_status']),
            nationality: empData['nationality'] || 'Not Specified'
          },
          
          contactInfo: {
            personalEmail: empData['personal_email'] || email,
            phone: empData['mobile_phone'] || empData['work_phone'] || '',
            address: {
              street: empData['current_address_line_1'] || empData['permanent_address_line_1'] || '',
              city: '',
              state: '',
              zipCode: '',
              country: empData['location_country'] || 'India'
            },
            emergencyContact: {
              name: empData['father_name'] || empData['spouse_name'] || '',
              phone: '',
              relationship: empData['father_name'] ? 'father' : empData['spouse_name'] ? 'spouse' : 'family'
            }
          },
          
          // Employment Information (matching schema exactly)
          employmentInfo: {
            department: departmentId, // Required ObjectId
            designation: empData['job_title'] || empData['secondary_job_title'] || 'Employee', // Required
            employeeType: empData['worker_type'] === 'Permanent' ? 'full-time' : empData['time_type'] === 'FullTime' ? 'full-time' : 'full-time', // Default enum value
            workLocation: 'office', // Always use default enum value instead of CSV location
            dateOfJoining: parseDate(empData['date_joined']), // Required
            workShift: 'day', // Default enum value
            isActive: (empData['employment_status'] || 'Working').toLowerCase() === 'working',
            reportingManager: null // Will be set in second pass after all employees are created
          },

          // Salary Information
          salaryInfo: {
            currentSalary: {
              basic: 0,
              hra: 0,
              allowances: 0,
              grossSalary: 0,
              ctc: 0
            },
            currency: 'INR',
            payFrequency: 'monthly'
          },

          // Additional Information (Dynamic fields from CSV)
          additionalInfo: {
            taxInfo: {
              panNumber: empData['pan_number'] || empData.personalInfo?.panNumber || empData.additionalInfo?.['PAN Number'] || undefined,
              aadharNumber: empData['aadhaar_number'] || empData.personalInfo?.aadhaarNumber || empData.additionalInfo?.['Aadhaar Number'] || undefined,
              pfNumber: empData['pf_number'] || empData.employmentInfo?.pfNumber || empData.additionalInfo?.['PF Number'] || undefined,
              uanNumber: empData['uan_number'] || empData.employmentInfo?.uanNumber || empData.additionalInfo?.['UAN Number'] || undefined
            }
          }
        };

        console.log('DEBUG: Initial payload salary structure:', JSON.stringify(employeePayload.salaryInfo, null, 2));

        // Add any additional fields from CSV that don't match standard fields
        const standardFields = [
          'first_name', 'last_name', 'email', 'phone', 'department', 'position', 
          'salary', 'hire_date', 'status', 'manager', 'location', 'employee_id',
          'date_of_birth', 'gender', 'address', 'emergency_contact', 'emergency_phone',
          'skills', 'education', 'experience_years', 'nationality', 'marital_status',
          'attendance_number', 'pan_number', 'aadhaar_number', 'pf_number', 'uan_number'
        ];

        Object.keys(empData).forEach(key => {
          if (!standardFields.includes(key) && empData[key]) {
            // Don't override salary structure
            if (key.toLowerCase().includes('salary') || key.toLowerCase().includes('ctc')) {
              console.log(`Skipping salary field: ${key} = ${empData[key]}`);
              return;
            }
            employeePayload.additionalInfo[key] = empData[key];
            if (!results.newFields.includes(key)) {
              results.newFields.push(key);
            }
          }
        });

        // Ensure address fields are preserved in additionalInfo
        const addressFields = ['Current Address Line 1', 'Permanent Address Line 1', 'Current Address', 'Permanent Address'];
        addressFields.forEach(field => {
          if (empData[field]) {
            employeePayload.additionalInfo[field] = empData[field];
          }
        });

        // Add skills, education, experience if present
        if (empData.skills) {
          employeePayload.additionalInfo.skills = empData.skills.split(',').map(s => s.trim());
        }
        if (empData.education) {
          employeePayload.additionalInfo.education = empData.education;
        }
        if (empData.experience_years) {
          employeePayload.additionalInfo.experienceYears = parseInt(empData.experience_years) || 0;
        }

        console.log('DEBUG: Final payload before processing:', JSON.stringify(employeePayload.salaryInfo, null, 2));
        
        if (existingUser && existingEmployee && mode !== 'create') {
          // Update existing employee (don't overwrite user field)
          console.log('PATH 1: Updating existing employee');
          console.log('Update payload salary:', JSON.stringify(employeePayload.salaryInfo, null, 2));
          const updatePayload = { ...employeePayload };
          delete updatePayload.user; // Keep existing user reference
          delete updatePayload.employeeId; // Don't update employee ID
          const updatedEmployee = await Employee.findByIdAndUpdate(existingEmployee._id, updatePayload, { new: true });
          
          // Update user info
          await User.findByIdAndUpdate(existingUser._id, {
            firstName,
            lastName,
            email,
            phone: getField(empData, 'Mobile Phone', 'Work Phone', 'Phone', 'phone', 'mobile', 'contact', 'Phone Number') || existingUser.phone
          });

          results.updated++;
          results.success++;
        } else if (existingUser && !existingEmployee) {
          // User exists but no employee record - create employee only
          console.log('PATH 2: Creating employee for existing user');
          console.log('Employee payload salary:', JSON.stringify(employeePayload.salaryInfo, null, 2));
          employeePayload.user = existingUser._id;
          const newEmployee = new Employee(employeePayload);
          await newEmployee.save();

          // Update user info
          await User.findByIdAndUpdate(existingUser._id, {
            firstName,
            lastName,
            phone: getField(empData, 'Mobile Phone', 'Work Phone', 'Phone', 'phone', 'mobile', 'contact', 'Phone Number') || existingUser.phone
          });

          results.created++;
          results.success++;
        } else if (!existingUser && mode !== 'update') {
          // Create new user and employee
          const userData = {
            firstName,
            lastName,
            email,
            phone: getField(empData, 'Mobile Phone', 'Work Phone', 'Phone', 'phone', 'mobile', 'contact', 'Phone Number') || '',
            role: 'employee',
            password: 'TempPassword123!', // Temporary password
            isActive: true
          };

          const newUser = new User(userData);
          await newUser.save();

          employeePayload.user = newUser._id;
          console.log('PATH 3: Creating new user and employee');
          console.log('New employee payload salary:', JSON.stringify(employeePayload.salaryInfo, null, 2));
          const newEmployee = new Employee(employeePayload);
          await newEmployee.save();

          results.created++;
          results.success++;
        } else {
          results.skipped++;
        }

      } catch (error) {
        console.error(`Error processing employee ${i + 1}:`, error);
        results.errors.push(`Row ${i + 1}: ${error.message}`);
        results.failed++;
      }
    }

    // Second pass: Process reporting manager relationships
    console.log('Processing reporting manager relationships...');
    let reportingManagersProcessed = 0;
    
    for (let i = 0; i < employees.length; i++) {
      const empData = employees[i];
      
      try {
        // Helper function for case-insensitive field access
        const getField = (obj, ...keys) => {
          for (const key of keys) {
            // Try exact match first
            if (obj[key] !== undefined) return obj[key];
            // Try case-insensitive match
            const objKeys = Object.keys(obj);
            const matchingKey = objKeys.find(k => k.toLowerCase() === key.toLowerCase());
            if (matchingKey && obj[matchingKey] !== undefined) return obj[matchingKey];
          }
          return undefined;
        };

        const email = getField(empData, 'email', 'Email', 'work_email', 'Work Email', 'workEmail', 'Email Address');
        const reportingManagerInfo = empData['reporting_to'];
        const reportingManagerId = empData['reporting_manager_employee_number'];
        
        // Priority: Use Employee Number first, then fall back to name
        const reportingManagerEmployeeId = getField(empData, 
          'Reporting Manager Employee Number', 
          'reporting_manager_employee_number',
          'reportingManagerEmpNo',
          'manager_employee_id',
          'manager_id',
          'reportingManagerEmployeeId'
        );
        const reportingManagerName = getField(empData,
          'Reporting To',
          'reporting_to', 
          'reportingManagerName',
          'manager_name',
          'reporting_manager',
          'reportingManagerName'
        );
        
        // Debug: Log the first few records to see what fields are available
        if (i < 3) {
          console.log(`Debug Row ${i + 1}:`, {
            email,
            reportingManagerEmployeeId,
            reportingManagerName,
            availableFields: Object.keys(empData).filter(k => k.toLowerCase().includes('report') || k.toLowerCase().includes('manager')),
            reportingToValue: empData['Reporting To'],
            reportingManagerEmpNoValue: empData['Reporting Manager Employee Number'],
            departmentValue: empData['Department'] || empData.department
          });
        }
        
        if (!email || (!reportingManagerEmployeeId && !reportingManagerName)) {
          continue;
        }

        // Find the current employee
        const currentUser = await User.findOne({ email });
        if (!currentUser) continue;
        
        const currentEmployee = await Employee.findOne({ user: currentUser._id });
        if (!currentEmployee) continue;

        // Find reporting manager - PRIORITY: Employee ID first, then name
        let reportingManager = null;

        // 1. Try to find by Employee ID first (MOST RELIABLE)
        if (reportingManagerEmployeeId && reportingManagerEmployeeId.trim()) {
          reportingManager = await Employee.findOne({ 
            employeeId: reportingManagerEmployeeId.trim() 
          });
          
          if (reportingManager) {
            console.log(`✅ Found manager by Employee ID: ${reportingManagerEmployeeId} -> ${reportingManager.personalInfo.firstName} ${reportingManager.personalInfo.lastName}`);
          }
        }

        // 2. If not found by Employee ID, try by name (FALLBACK ONLY)
        if (!reportingManager && reportingManagerName && reportingManagerName.trim()) {
          const nameParts = reportingManagerName.trim().split(' ');
          if (nameParts.length >= 2) {
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            
            reportingManager = await Employee.findOne({
              'personalInfo.firstName': new RegExp(firstName, 'i'),
              'personalInfo.lastName': new RegExp(lastName, 'i')
            });
            
            if (reportingManager) {
              console.log(`⚠️  Found manager by NAME (fallback): ${reportingManagerName} -> ${reportingManager.personalInfo.firstName} ${reportingManager.personalInfo.lastName} (ID: ${reportingManager.employeeId})`);
            }
          } else {
            // Try single name match
            reportingManager = await Employee.findOne({
              $or: [
                { 'personalInfo.firstName': new RegExp(reportingManagerName, 'i') },
                { 'personalInfo.lastName': new RegExp(reportingManagerName, 'i') }
              ]
            });
            
            if (reportingManager) {
              console.log(`⚠️  Found manager by SINGLE NAME (fallback): ${reportingManagerName} -> ${reportingManager.personalInfo.firstName} ${reportingManager.personalInfo.lastName} (ID: ${reportingManager.employeeId})`);
            }
          }
        }

        // 3. If still not found, try to find by email (LAST RESORT)
        if (!reportingManager && reportingManagerName && reportingManagerName.includes('@')) {
          const managerUser = await User.findOne({ email: reportingManagerName });
          if (managerUser) {
            reportingManager = await Employee.findOne({ user: managerUser._id });
            if (reportingManager) {
              console.log(`⚠️  Found manager by EMAIL (last resort): ${reportingManagerName} -> ${reportingManager.personalInfo.firstName} ${reportingManager.personalInfo.lastName} (ID: ${reportingManager.employeeId})`);
            }
          }
        }

        // Update the employee's reporting manager if found
        if (reportingManager && reportingManager._id.toString() !== currentEmployee._id.toString()) {
          await Employee.findByIdAndUpdate(currentEmployee._id, {
            'employmentInfo.reportingManager': reportingManager._id
          });
          reportingManagersProcessed++;
          console.log(`✅ Set reporting manager: ${currentEmployee.personalInfo.firstName} ${currentEmployee.personalInfo.lastName} -> ${reportingManager.personalInfo.firstName} ${reportingManager.personalInfo.lastName} (Manager ID: ${reportingManager.employeeId})`);
        } else if (!reportingManager && (reportingManagerEmployeeId || reportingManagerName)) {
          console.log(`❌ Could not find manager for ${currentEmployee.personalInfo.firstName} ${currentEmployee.personalInfo.lastName} - Looking for ID: "${reportingManagerEmployeeId}" or Name: "${reportingManagerName}"`);
        }

      } catch (error) {
        console.error(`Error processing reporting manager for row ${i + 1}:`, error);
      }
    }

    console.log(`Processed ${reportingManagersProcessed} reporting manager relationships`);
    results.reportingManagersProcessed = reportingManagersProcessed;

    res.json({
      success: true,
      message: `Import completed. ${results.success} employees processed successfully. ${reportingManagersProcessed} reporting relationships established.`,
      results
    });

  } catch (error) {
    console.error('Master data import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import master data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/organization/employees
// @desc    Create a new employee (Admin only)
// @access  Private (Admin only)
router.post('/employees', [
  authenticate,
  authorize(['admin', 'hr']),
  body('personalInfo.firstName').notEmpty().withMessage('First name is required'),
  body('personalInfo.lastName').notEmpty().withMessage('Last name is required'),
  body('user.email').isEmail().withMessage('Valid email is required'),
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('employmentInfo.designation').notEmpty().withMessage('Designation is required'),
  body('employmentInfo.department').notEmpty().withMessage('Department is required'),
  body('employmentInfo.dateOfJoining').notEmpty().withMessage('Date of joining is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const {
      personalInfo,
      contactInfo,
      employmentInfo,
      employeeId,
      user: userData
    } = req.body;

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Find or create department
    let department = await Department.findOne({ name: employmentInfo.department });
    if (!department) {
      // Generate unique department code
      let departmentCode = employmentInfo.department.substring(0, 3).toUpperCase();
      let counter = 1;
      while (await Department.findOne({ code: departmentCode })) {
        departmentCode = `${employmentInfo.department.substring(0, 3).toUpperCase()}${counter}`;
        counter++;
      }

      department = new Department({
        name: employmentInfo.department,
        code: departmentCode,
        description: `${employmentInfo.department} Department`
      });
      await department.save();
    }

    // Create user account
    const newUser = new User({
      email: userData.email,
      role: userData.role || 'employee',
      isActive: true
    });
    await newUser.save();

    // Create employee record
    const newEmployee = new Employee({
      // Don't set employeeId - let Employee model generate it automatically
      personalInfo: {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        dateOfBirth: personalInfo.dateOfBirth || null,
        gender: personalInfo.gender || null,
        maritalStatus: personalInfo.maritalStatus || null
      },
      contactInfo: {
        phone: contactInfo?.phone || null,
        personalEmail: contactInfo?.personalEmail || null
      },
      employmentInfo: {
        designation: employmentInfo.designation,
        department: department._id,
        dateOfJoining: new Date(employmentInfo.dateOfJoining),
        employmentStatus: employmentInfo.employmentStatus || 'active',
        employeeType: employmentInfo.employeeType || 'permanent',
        workLocation: employmentInfo.workLocation || null,
        reportingManager: employmentInfo.reportingManager || null,
        isActive: true
      },
      user: newUser._id
    });

    await newEmployee.save();

    // Populate the response
    const populatedEmployee = await Employee.findById(newEmployee._id)
      .populate('employmentInfo.department', 'name code')
      .populate('user', 'email role');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee: populatedEmployee
    });

  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});


// Simple in-memory cache for hierarchy data
let hierarchyCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000 // 5 minutes cache
};

// @route   GET /api/organization/hierarchy
// @desc    Get organization hierarchy tree (Admin, HR, Manager)
// @access  Private (Admin, HR, Manager)
router.get('/hierarchy', [
  authenticate,
  authorize(['admin', 'hr', 'manager'])
], async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (hierarchyCache.data && hierarchyCache.timestamp && (now - hierarchyCache.timestamp < hierarchyCache.ttl)) {
      console.log('Returning cached hierarchy data');
      return res.json(hierarchyCache.data);
    }

    console.log('Fetching organization hierarchy from database...');
    
    // Get all active employees with their reporting relationships
    const employees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('employmentInfo.department', 'name code')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId employmentInfo.designation')
      .populate('user', 'email')
      .select('employeeId personalInfo employmentInfo user')
      .sort({ 'employmentInfo.dateOfJoining': 1 });

    console.log(`Found ${employees.length} active employees`);

    // If no employees found, return empty hierarchy
    if (employees.length === 0) {
      return res.json({
        success: true,
        hierarchy: [],
        stats: {
          totalEmployees: 0,
          totalManagers: 0,
          maxDepth: 0,
          departmentCount: 0
        },
        totalEmployees: 0
      });
    }

    // Build hierarchy tree
    const employeeMap = new Map();
    const rootEmployees = [];

    console.log('Building hierarchy tree...');

    // First pass: Create employee nodes
    employees.forEach((employee, index) => {
      try {
        const employeeNode = {
          id: employee._id.toString(),
          employeeId: employee.employeeId,
          name: `${employee.personalInfo?.firstName || 'Unknown'} ${employee.personalInfo?.lastName || 'User'}`,
          designation: employee.employmentInfo?.designation || 'N/A',
          department: employee.employmentInfo?.department?.name || 'N/A',
          email: employee.user?.email || 'N/A',
          reportingManagerId: employee.employmentInfo?.reportingManager?._id?.toString() || null,
          reportingManagerName: employee.employmentInfo?.reportingManager ? 
            `${employee.employmentInfo.reportingManager.personalInfo?.firstName || 'Unknown'} ${employee.employmentInfo.reportingManager.personalInfo?.lastName || 'Manager'}` : null,
          children: [],
          level: 0
        };
        
        employeeMap.set(employee._id.toString(), employeeNode);
      } catch (nodeError) {
        console.error(`Error creating node for employee ${index}:`, nodeError);
        console.error('Employee data:', JSON.stringify(employee, null, 2));
      }
    });

    console.log(`Created ${employeeMap.size} employee nodes`);

    // Second pass: Build parent-child relationships
    employeeMap.forEach(employee => {
      if (employee.reportingManagerId && employeeMap.has(employee.reportingManagerId)) {
        const manager = employeeMap.get(employee.reportingManagerId);
        manager.children.push(employee);
        employee.level = manager.level + 1;
      } else {
        // This is a root employee (CEO, Director, etc.)
        rootEmployees.push(employee);
      }
    });

    // Sort children by designation hierarchy
    const designationOrder = {
      'ceo': 1, 'chief executive officer': 1,
      'cto': 2, 'chief technology officer': 2,
      'coo': 3, 'chief operating officer': 3,
      'cfo': 4, 'chief financial officer': 4,
      'director': 5, 'vice president': 6, 'vp': 6,
      'senior manager': 7, 'manager': 8,
      'team lead': 9, 'team leader': 9, 'lead': 9,
      'senior': 10, 'junior': 11,
      'intern': 12, 'trainee': 12
    };

    const sortByDesignation = (a, b) => {
      // Priority names for top-level positions
      const priorityNames = ['mihir', 'vishnu', 'shobhit'];
      const aNameLower = a.name.toLowerCase();
      const bNameLower = b.name.toLowerCase();
      
      // Check if either name contains priority names
      const aPriority = priorityNames.findIndex(name => aNameLower.includes(name));
      const bPriority = priorityNames.findIndex(name => bNameLower.includes(name));
      
      // If both have priority, sort by priority index
      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority;
      }
      
      // If only one has priority, prioritize it
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      
      // Otherwise, sort by designation hierarchy
      const aOrder = designationOrder[a.designation.toLowerCase()] || 15;
      const bOrder = designationOrder[b.designation.toLowerCase()] || 15;
      if (aOrder !== bOrder) return aOrder - bOrder;
      
      // Finally, sort alphabetically by name
      return a.name.localeCompare(b.name);
    };

    // Recursively sort all children
    const sortHierarchy = (nodes) => {
      nodes.sort(sortByDesignation);
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortHierarchy(node.children);
        }
      });
    };

    sortHierarchy(rootEmployees);

    // Calculate statistics
    const levels = Array.from(employeeMap.values()).map(emp => emp.level);
    const stats = {
      totalEmployees: employees.length,
      totalManagers: employees.filter(emp => 
        employeeMap.get(emp._id.toString()).children.length > 0
      ).length,
      maxDepth: levels.length > 0 ? Math.max(...levels) + 1 : 0,
      departmentCount: [...new Set(employees.map(emp => emp.employmentInfo.department?.name).filter(Boolean))].length
    };

    const responseData = {
      success: true,
      hierarchy: rootEmployees,
      stats,
      totalEmployees: employees.length
    };

    // Update cache
    hierarchyCache.data = responseData;
    hierarchyCache.timestamp = Date.now();

    res.json(responseData);

  } catch (error) {
    console.error('Error fetching organization hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization hierarchy',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/organization/hierarchy-test
// @desc    Test hierarchy endpoint without authentication 
// @access  Public (for testing)
router.get('/hierarchy-test', async (req, res) => {
  try {
    console.log('Fetching organization hierarchy from database (test endpoint)...');
    
    // Get all active employees with their reporting relationships
    const employees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('employmentInfo.department', 'name code')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId employmentInfo.designation')
      .populate('user', 'email')
      .select('employeeId personalInfo employmentInfo user')
      .sort({ 'employmentInfo.dateOfJoining': 1 });

    console.log(`Found ${employees.length} active employees`);

    // If no employees found, return empty hierarchy
    if (employees.length === 0) {
      return res.json({
        success: true,
        hierarchy: [],
        stats: {
          totalEmployees: 0,
          totalManagers: 0,
          maxDepth: 0,
          departmentCount: 0
        },
        totalEmployees: 0
      });
    }

    // Build hierarchy tree
    const employeeMap = new Map();
    const rootEmployees = [];

    console.log('Building hierarchy tree...');

    // First pass: Create employee nodes
    employees.forEach((employee, index) => {
      try {
        const employeeNode = {
          id: employee._id.toString(),
          employeeId: employee.employeeId,
          name: `${employee.personalInfo?.firstName || 'Unknown'} ${employee.personalInfo?.lastName || 'User'}`,
          designation: employee.employmentInfo?.designation || 'N/A',
          department: employee.employmentInfo?.department?.name || 'N/A',
          email: employee.user?.email || 'N/A',
          reportingManagerId: employee.employmentInfo?.reportingManager?._id?.toString() || null,
          reportingManagerName: employee.employmentInfo?.reportingManager ? 
            `${employee.employmentInfo.reportingManager.personalInfo?.firstName || 'Unknown'} ${employee.employmentInfo.reportingManager.personalInfo?.lastName || 'Manager'}` : null,
          children: [],
          level: 0
        };
        
        employeeMap.set(employee._id.toString(), employeeNode);
      } catch (nodeError) {
        console.error(`Error creating node for employee ${index}:`, nodeError);
      }
    });

    console.log(`Created ${employeeMap.size} employee nodes`);

    // Second pass: Build parent-child relationships
    employeeMap.forEach(employee => {
      if (employee.reportingManagerId && employeeMap.has(employee.reportingManagerId)) {
        const manager = employeeMap.get(employee.reportingManagerId);
        manager.children.push(employee);
        employee.level = manager.level + 1;
      } else {
        // This is a root employee (CEO, Director, etc.)
        rootEmployees.push(employee);
      }
    });

    // Sort children by designation hierarchy
    const designationOrder = {
      'ceo': 1, 'chief executive officer': 1,
      'cto': 2, 'chief technology officer': 2,
      'coo': 3, 'chief operating officer': 3,
      'cfo': 4, 'chief financial officer': 4,
      'director': 5, 'vice president': 6, 'vp': 6,
      'senior manager': 7, 'manager': 8,
      'team lead': 9, 'team leader': 9, 'lead': 9,
      'senior': 10, 'junior': 11,
      'intern': 12, 'trainee': 12
    };

    const sortByDesignation = (a, b) => {
      // Priority names for top-level positions
      const priorityNames = ['mihir', 'vishnu', 'shobhit'];
      const aNameLower = a.name.toLowerCase();
      const bNameLower = b.name.toLowerCase();
      
      // Check if either name contains priority names
      const aPriority = priorityNames.findIndex(name => aNameLower.includes(name));
      const bPriority = priorityNames.findIndex(name => bNameLower.includes(name));
      
      // If both have priority, sort by priority index
      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority;
      }
      
      // If only one has priority, prioritize it
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      
      // Otherwise, sort by designation hierarchy
      const aOrder = designationOrder[a.designation.toLowerCase()] || 15;
      const bOrder = designationOrder[b.designation.toLowerCase()] || 15;
      if (aOrder !== bOrder) return aOrder - bOrder;
      
      // Finally, sort alphabetically by name
      return a.name.localeCompare(b.name);
    };

    // Recursively sort all children
    const sortHierarchy = (nodes) => {
      nodes.sort(sortByDesignation);
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortHierarchy(node.children);
        }
      });
    };

    sortHierarchy(rootEmployees);

    // Calculate statistics
    const levels = Array.from(employeeMap.values()).map(emp => emp.level);
    const stats = {
      totalEmployees: employees.length,
      totalManagers: employees.filter(emp => 
        employeeMap.get(emp._id.toString()).children.length > 0
      ).length,
      maxDepth: levels.length > 0 ? Math.max(...levels) + 1 : 0,
      departmentCount: [...new Set(employees.map(emp => emp.employmentInfo.department?.name).filter(Boolean))].length
    };

    const responseData = {
      success: true,
      hierarchy: rootEmployees,
      stats,
      totalEmployees: employees.length
    };

    res.json(responseData);

  } catch (error) {
    console.error('Error fetching organization hierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization hierarchy',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/organization/debug-reporting-managers
// @desc    Debug endpoint to check reporting manager relationships
// @access  Public (for debugging)
router.get('/debug-reporting-managers', async (req, res) => {
  try {
    const employees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('user', 'email')
      .select('employeeId personalInfo employmentInfo.reportingManager user')
      .limit(20);

    const debugData = employees.map(emp => ({
      employeeId: emp.employeeId,
      name: `${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}`,
      email: emp.user?.email,
      hasReportingManager: !!emp.employmentInfo?.reportingManager,
      reportingManagerId: emp.employmentInfo?.reportingManager?.employeeId || null,
      reportingManagerName: emp.employmentInfo?.reportingManager ? 
        `${emp.employmentInfo.reportingManager.personalInfo?.firstName} ${emp.employmentInfo.reportingManager.personalInfo?.lastName}` : null,
      rawReportingManager: emp.employmentInfo?.reportingManager
    }));

    res.json({
      success: true,
      totalEmployees: employees.length,
      employeesWithManagers: debugData.filter(emp => emp.hasReportingManager).length,
      employeesWithoutManagers: debugData.filter(emp => !emp.hasReportingManager).length,
      debugData
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug endpoint failed',
      error: error.message
    });
  }
});

// @route   POST /api/organization/reset-reporting-managers
// @desc    Reset all reporting manager relationships
// @access  Public (for debugging)
router.post('/reset-reporting-managers', async (req, res) => {
  try {
    console.log('Resetting all reporting manager relationships...');
    
    const result = await Employee.updateMany(
      { 'employmentInfo.isActive': true },
      { $unset: { 'employmentInfo.reportingManager': 1 } }
    );

    res.json({
      success: true,
      message: `Reset ${result.modifiedCount} reporting relationships`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Reset reporting managers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset reporting managers',
      error: error.message
    });
  }
});

// @route   POST /api/organization/fix-reporting-managers-from-csv
// @desc    Fix reporting manager relationships based on CSV data
// @access  Public (for debugging)
router.post('/fix-reporting-managers-from-csv', async (req, res) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData || !Array.isArray(csvData)) {
      return res.status(400).json({
        success: false,
        message: 'CSV data is required as an array'
      });
    }

    console.log('Starting CSV-based reporting manager fix...');
    console.log(`Processing ${csvData.length} CSV records`);

    // Get all employees
    const allEmployees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('user', 'email')
      .select('employeeId personalInfo user employmentInfo');

    console.log(`Found ${allEmployees.length} active employees in database`);

    // Create lookup maps
    const employeeByEmail = new Map();
    const employeeByName = new Map();
    const employeeByFirstName = new Map();

    allEmployees.forEach(emp => {
      const fullName = `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`.toLowerCase().trim();
      const firstName = emp.personalInfo.firstName.toLowerCase().trim();
      
      if (emp.user?.email) {
        employeeByEmail.set(emp.user.email.toLowerCase(), emp);
      }
      employeeByName.set(fullName, emp);
      employeeByFirstName.set(firstName, emp);
    });

    let relationshipsFixed = 0;
    const errors = [];

    // Process each CSV record
    for (let i = 0; i < csvData.length; i++) {
      const record = csvData[i];
      
      try {
        // Helper function for case-insensitive field access
        const getField = (obj, ...keys) => {
          for (const key of keys) {
            if (obj[key] !== undefined && obj[key] !== null && obj[key].toString().trim() !== '') {
              return obj[key].toString().trim();
            }
            const objKeys = Object.keys(obj);
            const matchingKey = objKeys.find(k => k.toLowerCase() === key.toLowerCase());
            if (matchingKey && obj[matchingKey] !== undefined && obj[matchingKey] !== null && obj[matchingKey].toString().trim() !== '') {
              return obj[matchingKey].toString().trim();
            }
          }
          return null;
        };

        // Get employee info
        const email = getField(record, 'email', 'work email', 'Email', 'Work Email');
        const fullName = getField(record, 'name', 'full name', 'Full Name', 'employee name', 'Employee Name');
        const managerName = getField(record, 'manager', 'reporting manager', 'Manager', 'Reporting Manager', 'manager name', 'Manager Name');

        if (!email && !fullName) {
          continue;
        }

        if (!managerName || managerName.toLowerCase() === 'ceo' || managerName.toLowerCase() === 'none') {
          continue;
        }

        // Find the employee
        let employee = null;
        if (email) {
          employee = employeeByEmail.get(email.toLowerCase());
        }
        if (!employee && fullName) {
          employee = employeeByName.get(fullName.toLowerCase());
        }

        if (!employee) {
          errors.push(`Row ${i + 1}: Employee not found - ${email || fullName}`);
          continue;
        }

        // Find the manager
        let manager = null;
        const managerNameLower = managerName.toLowerCase().trim();
        
        // Try full name match first
        manager = employeeByName.get(managerNameLower);
        
        // Try first name match if full name doesn't work
        if (!manager) {
          const managerFirstName = managerName.split(' ')[0].toLowerCase();
          manager = employeeByFirstName.get(managerFirstName);
        }

        // Try partial name matching
        if (!manager) {
          for (const [name, emp] of employeeByName.entries()) {
            if (name.includes(managerNameLower) || managerNameLower.includes(name)) {
              manager = emp;
              break;
            }
          }
        }

        if (!manager) {
          errors.push(`Row ${i + 1}: Manager not found - ${managerName} for employee ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`);
          continue;
        }

        // Don't let someone report to themselves
        if (manager._id.toString() === employee._id.toString()) {
          continue;
        }

        // Update the reporting relationship
        await Employee.findByIdAndUpdate(employee._id, {
          'employmentInfo.reportingManager': manager._id
        });

        relationshipsFixed++;
        console.log(`✅ Set ${employee.personalInfo.firstName} ${employee.personalInfo.lastName} to report to ${manager.personalInfo.firstName} ${manager.personalInfo.lastName}`);

      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Processed ${csvData.length} records. Fixed ${relationshipsFixed} reporting relationships.`,
      relationshipsFixed,
      totalRecords: csvData.length,
      errors: errors.slice(0, 10) // Limit errors to first 10
    });

  } catch (error) {
    console.error('CSV-based fix error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix reporting managers from CSV',
      error: error.message
    });
  }
});

// @route   GET /api/organization/debug-departments
// @desc    Debug endpoint to check department assignments
// @access  Public (for debugging)
router.get('/debug-departments', async (req, res) => {
  try {
    const employees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('employmentInfo.department', 'name code')
      .populate('user', 'email')
      .select('employeeId personalInfo employmentInfo user')
      .sort('personalInfo.firstName');

    const departmentData = employees.map(emp => ({
      name: `${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}`,
      email: emp.user?.email,
      employeeId: emp.employeeId,
      designation: emp.employmentInfo?.designation,
      department: emp.employmentInfo?.department?.name,
      departmentCode: emp.employmentInfo?.department?.code
    }));

    // Group by department for analysis
    const departmentGroups = {};
    departmentData.forEach(emp => {
      const dept = emp.department || 'No Department';
      if (!departmentGroups[dept]) {
        departmentGroups[dept] = [];
      }
      departmentGroups[dept].push(emp);
    });

    res.json({
      success: true,
      totalEmployees: employees.length,
      departments: Object.keys(departmentGroups).length,
      departmentGroups,
      allEmployees: departmentData
    });

  } catch (error) {
    console.error('Debug departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to debug departments',
      error: error.message
    });
  }
});

// @route   POST /api/organization/fix-departments
// @desc    Fix department assignments based on designation patterns
// @access  Public (for debugging)
router.post('/fix-departments', async (req, res) => {
  try {
    console.log('Starting department assignment fix...');
    
    const employees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('employmentInfo.department', 'name code')
      .select('employeeId personalInfo employmentInfo');

    // Define department mapping based on common designation patterns
    const departmentMapping = {
      // IT Department
      'IT': ['developer', 'engineer', 'programmer', 'software', 'technical', 'system', 'database', 'devops', 'qa', 'testing', 'tech', 'full stack', 'backend', 'frontend', 'mobile'],
      
      // Sales Department  
      'Sales': ['sales', 'business development', 'account manager', 'sales executive', 'sales representative', 'sales manager'],
      
      // Marketing Department
      'Marketing': ['marketing', 'digital marketing', 'content', 'seo', 'social media', 'brand', 'advertising', 'campaign'],
      
      // HR Department
      'HR': ['human resources', 'hr', 'recruitment', 'talent', 'people', 'employee relations'],
      
      // Operations Department
      'Operations': ['operations', 'project manager', 'program manager', 'coordinator', 'analyst', 'associate'],
      
      // Finance Department
      'Finance': ['finance', 'accounting', 'financial', 'accounts', 'treasury', 'audit'],
      
      // Management/Executive
      'Management': ['ceo', 'cto', 'cfo', 'coo', 'director', 'vice president', 'vp', 'head', 'chief', 'manager', 'lead', 'senior manager'],
      
      // Customer Service
      'Customer Service': ['customer service', 'support', 'customer success', 'client relations', 'helpdesk']
    };

    // Get or create departments
    const departments = {};
    for (const deptName of Object.keys(departmentMapping)) {
      let dept = await Department.findOne({ name: deptName });
      if (!dept) {
        // Generate unique code
        let code = deptName.toUpperCase().replace(/\s+/g, '_');
        let counter = 1;
        while (await Department.findOne({ code })) {
          code = `${deptName.toUpperCase().replace(/\s+/g, '_')}_${counter}`;
          counter++;
        }
        
        dept = new Department({
          name: deptName,
          code,
          description: `${deptName} Department`
        });
        await dept.save();
        console.log(`Created new department: ${deptName} with code: ${code}`);
      }
      departments[deptName] = dept;
    }

    let fixedCount = 0;
    const changes = [];

    // Process each employee
    for (const employee of employees) {
      const designation = (employee.employmentInfo?.designation || '').toLowerCase();
      const currentDept = employee.employmentInfo?.department?.name;
      
      let suggestedDept = null;
      
      // Find matching department based on designation (with priority order)
      // First check for specific role types (more specific matches first)
      const specificMatches = [
        ['Customer Service', ['customer success', 'customer service', 'support', 'client relations', 'helpdesk']],
        ['IT', ['developer', 'engineer', 'programmer', 'software', 'technical', 'system', 'database', 'devops', 'qa', 'testing', 'tech', 'full stack', 'backend', 'frontend', 'mobile']],
        ['Sales', ['sales', 'business development', 'account manager', 'sales executive', 'sales representative']],
        ['Marketing', ['marketing', 'digital marketing', 'content', 'seo', 'social media', 'brand', 'advertising', 'campaign']],
        ['HR', ['human resources', 'hr', 'recruitment', 'talent', 'people', 'employee relations']],
        ['Finance', ['finance', 'accounting', 'financial', 'accounts', 'treasury', 'audit']],
        ['Operations', ['operations', 'project manager', 'program manager', 'coordinator', 'analyst', 'associate']]
      ];
      
      // Check specific matches first
      for (const [deptName, keywords] of specificMatches) {
        if (keywords.some(keyword => designation.includes(keyword))) {
          suggestedDept = deptName;
          break;
        }
      }
      
      // Only check Management if no specific match found
      if (!suggestedDept) {
        const managementKeywords = ['ceo', 'cto', 'cfo', 'coo', 'director', 'vice president', 'vp', 'head', 'chief'];
        if (managementKeywords.some(keyword => designation.includes(keyword))) {
          suggestedDept = 'Management';
        }
        // Only use 'manager' or 'lead' for Management if it's not part of a specific role
        else if ((designation.includes('manager') || designation.includes('lead')) && 
                 !designation.includes('customer') && 
                 !designation.includes('project') && 
                 !designation.includes('program') && 
                 !designation.includes('account') && 
                 !designation.includes('sales')) {
          suggestedDept = 'Management';
        }
      }

      // Special cases for specific people mentioned
      const fullName = `${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`.toLowerCase();
      if (fullName.includes('vikas verma') && designation.includes('engineer')) {
        suggestedDept = 'IT';
      }
      // Shruti Mishra should be in Customer Service based on Customer Success Manager role
      if (fullName.includes('shruti mishra') && designation.includes('customer success')) {
        suggestedDept = 'Customer Service';
      }

      // If we found a better department match, update it
      if (suggestedDept && suggestedDept !== currentDept) {
        const newDepartment = departments[suggestedDept];
        
        await Employee.findByIdAndUpdate(employee._id, {
          'employmentInfo.department': newDepartment._id
        });

        changes.push({
          employee: `${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`,
          designation: employee.employmentInfo?.designation,
          oldDepartment: currentDept,
          newDepartment: suggestedDept
        });

        fixedCount++;
        console.log(`✅ Fixed ${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}: ${currentDept} → ${suggestedDept} (${employee.employmentInfo?.designation})`);
      }
    }

    res.json({
      success: true,
      message: `Fixed ${fixedCount} department assignments`,
      totalEmployees: employees.length,
      fixedCount,
      changes: changes.slice(0, 20) // Limit to first 20 changes for readability
    });

  } catch (error) {
    console.error('Fix departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix departments',
      error: error.message
    });
  }
});

// @route   POST /api/organization/fix-specific-employee
// @desc    Fix department for a specific employee
// @access  Public (for debugging)
router.post('/fix-specific-employee', async (req, res) => {
  try {
    const { employeeName, newDepartment } = req.body;
    
    if (!employeeName || !newDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Employee name and new department are required'
      });
    }

    console.log(`Fixing department for ${employeeName} to ${newDepartment}...`);

    // Find the employee
    const employee = await Employee.findOne({
      $or: [
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ['$personalInfo.firstName', ' ', '$personalInfo.lastName'] },
              regex: employeeName,
              options: 'i'
            }
          }
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee "${employeeName}" not found`
      });
    }

    // Find or create the department
    let department = await Department.findOne({ name: newDepartment });
    if (!department) {
      let code = newDepartment.toUpperCase().replace(/\s+/g, '_');
      let counter = 1;
      while (await Department.findOne({ code })) {
        code = `${newDepartment.toUpperCase().replace(/\s+/g, '_')}_${counter}`;
        counter++;
      }
      
      department = new Department({
        name: newDepartment,
        code,
        description: `${newDepartment} Department`
      });
      await department.save();
      console.log(`Created new department: ${newDepartment} with code: ${code}`);
    }

    // Update the employee's department
    const oldDepartment = await Employee.findById(employee._id).populate('employmentInfo.department', 'name');
    await Employee.findByIdAndUpdate(employee._id, {
      'employmentInfo.department': department._id
    });

    console.log(`✅ Fixed ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}: ${oldDepartment.employmentInfo.department?.name} → ${newDepartment}`);

    res.json({
      success: true,
      message: `Updated ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}'s department to ${newDepartment}`,
      employee: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
      oldDepartment: oldDepartment.employmentInfo.department?.name,
      newDepartment: newDepartment
    });

  } catch (error) {
    console.error('Fix specific employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix employee department',
      error: error.message
    });
  }
});

// @route   POST /api/organization/restore-csv-departments
// @desc    Restore department assignments from original CSV data
// @access  Public (for debugging)
router.post('/restore-csv-departments', async (req, res) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData || !Array.isArray(csvData)) {
      return res.status(400).json({
        success: false,
        message: 'CSV data is required as an array'
      });
    }

    console.log('Restoring department assignments from CSV data...');
    console.log(`Processing ${csvData.length} CSV records`);

    // Get all employees
    const allEmployees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('user', 'email')
      .populate('employmentInfo.department', 'name')
      .select('employeeId personalInfo user employmentInfo');

    console.log(`Found ${allEmployees.length} active employees in database`);

    // Create lookup maps
    const employeeByEmail = new Map();
    const employeeByName = new Map();

    allEmployees.forEach(emp => {
      const fullName = `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`.toLowerCase().trim();
      
      if (emp.user?.email) {
        employeeByEmail.set(emp.user.email.toLowerCase(), emp);
      }
      employeeByName.set(fullName, emp);
    });

    let departmentsFixed = 0;
    const changes = [];
    const errors = [];

    // Process each CSV record
    for (let i = 0; i < csvData.length; i++) {
      const record = csvData[i];
      
      try {
        // Helper function for case-insensitive field access
        const getField = (obj, ...keys) => {
          for (const key of keys) {
            if (obj[key] !== undefined && obj[key] !== null && obj[key].toString().trim() !== '') {
              return obj[key].toString().trim();
            }
            const objKeys = Object.keys(obj);
            const matchingKey = objKeys.find(k => k.toLowerCase() === key.toLowerCase());
            if (matchingKey && obj[matchingKey] !== undefined && obj[matchingKey] !== null && obj[matchingKey].toString().trim() !== '') {
              return obj[matchingKey].toString().trim();
            }
          }
          return null;
        };

        // Get employee info from CSV
        const email = getField(record, 'email', 'work email', 'Email', 'Work Email');
        const fullName = getField(record, 'name', 'full name', 'Full Name', 'employee name', 'Employee Name');
        const csvDepartment = getField(record, 'department', 'Department', 'dept', 'Department Name');

        if (!csvDepartment) {
          continue; // Skip if no department in CSV
        }

        // Find the employee
        let employee = null;
        if (email) {
          employee = employeeByEmail.get(email.toLowerCase());
        }
        if (!employee && fullName) {
          employee = employeeByName.get(fullName.toLowerCase());
        }

        if (!employee) {
          errors.push(`Row ${i + 1}: Employee not found - ${email || fullName}`);
          continue;
        }

        // Check if department needs to be updated
        const currentDepartment = employee.employmentInfo?.department?.name;
        if (currentDepartment === csvDepartment) {
          continue; // Already correct
        }

        // Find or create the department from CSV
        let department = await Department.findOne({ 
          name: new RegExp(`^${csvDepartment}$`, 'i') 
        });
        
        if (!department) {
          // Create department exactly as specified in CSV
          let code = csvDepartment.toUpperCase().replace(/\s+/g, '_');
          let counter = 1;
          while (await Department.findOne({ code })) {
            code = `${csvDepartment.toUpperCase().replace(/\s+/g, '_')}_${counter}`;
            counter++;
          }
          
          department = new Department({
            name: csvDepartment,
            code,
            description: `${csvDepartment} Department`
          });
          await department.save();
          console.log(`Created department from CSV: ${csvDepartment}`);
        }

        // Update the employee's department
        await Employee.findByIdAndUpdate(employee._id, {
          'employmentInfo.department': department._id
        });

        changes.push({
          employee: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
          oldDepartment: currentDepartment,
          newDepartment: csvDepartment,
          source: 'CSV'
        });

        departmentsFixed++;
        console.log(`✅ Restored ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}: ${currentDepartment} → ${csvDepartment} (from CSV)`);

      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Restored ${departmentsFixed} department assignments from CSV data`,
      departmentsFixed,
      totalRecords: csvData.length,
      changes: changes.slice(0, 20), // Limit to first 20 changes
      errors: errors.slice(0, 10) // Limit errors to first 10
    });

  } catch (error) {
    console.error('Restore CSV departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore departments from CSV',
      error: error.message
    });
  }
});

// @route   POST /api/organization/bulk-fix-departments
// @desc    Fix ALL department assignments from CSV data in one go
// @access  Public (for debugging)
router.post('/bulk-fix-departments', async (req, res) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData || !Array.isArray(csvData)) {
      return res.status(400).json({
        success: false,
        message: 'CSV data is required as an array'
      });
    }

    console.log('Starting bulk department fix from CSV...');
    console.log(`Processing ${csvData.length} CSV records`);

    // Get all employees
    const allEmployees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('user', 'email')
      .populate('employmentInfo.department', 'name')
      .select('employeeId personalInfo user employmentInfo');

    console.log(`Found ${allEmployees.length} active employees in database`);

    // Create lookup maps
    const employeeByEmail = new Map();
    const employeeByName = new Map();

    allEmployees.forEach(emp => {
      const fullName = `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`.toLowerCase().trim();
      
      if (emp.user?.email) {
        employeeByEmail.set(emp.user.email.toLowerCase(), emp);
      }
      employeeByName.set(fullName, emp);
    });

    let departmentsFixed = 0;
    const changes = [];
    const errors = [];

    // Process each CSV record
    for (let i = 0; i < csvData.length; i++) {
      const record = csvData[i];
      
      try {
        // Direct field access (no case-insensitive helper for now)
        const email = record['Work Email'] || record['Email'] || record.email;
        const fullName = record['Full Name'] || record['Display Name'] || record.name;
        const csvDepartment = record['Department'] || record.department;

        if (!csvDepartment) {
          continue; // Skip if no department in CSV
        }

        // Find the employee
        let employee = null;
        if (email) {
          employee = employeeByEmail.get(email.toLowerCase());
        }
        if (!employee && fullName) {
          employee = employeeByName.get(fullName.toLowerCase());
        }

        if (!employee) {
          errors.push(`Row ${i + 1}: Employee not found - ${email || fullName}`);
          continue;
        }

        // Check if department needs to be updated
        const currentDepartment = employee.employmentInfo?.department?.name;
        if (currentDepartment === csvDepartment) {
          continue; // Already correct
        }

        // Find or create the department from CSV
        let department = await Department.findOne({ 
          name: new RegExp(`^${csvDepartment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') 
        });
        
        if (!department) {
          // Create department exactly as specified in CSV
          let code = csvDepartment.toUpperCase().replace(/\s+/g, '_');
          let counter = 1;
          while (await Department.findOne({ code })) {
            code = `${csvDepartment.toUpperCase().replace(/\s+/g, '_')}_${counter}`;
            counter++;
          }
          
          department = new Department({
            name: csvDepartment,
            code,
            description: `${csvDepartment} Department`
          });
          await department.save();
          console.log(`Created department from CSV: ${csvDepartment}`);
        }

        // Update the employee's department
        await Employee.findByIdAndUpdate(employee._id, {
          'employmentInfo.department': department._id
        });

        changes.push({
          employee: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
          oldDepartment: currentDepartment,
          newDepartment: csvDepartment,
          source: 'CSV'
        });

        departmentsFixed++;
        console.log(`✅ Fixed ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}: ${currentDepartment} → ${csvDepartment} (from CSV)`);

      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Bulk fixed ${departmentsFixed} department assignments from CSV data`,
      departmentsFixed,
      totalRecords: csvData.length,
      changes: changes.slice(0, 50), // Show more changes
      errors: errors.slice(0, 10)
    });

  } catch (error) {
    console.error('Bulk fix departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk fix departments from CSV',
      error: error.message
    });
  }
});

// @route   DELETE /api/organization/clear-all-data
// @desc    Delete ALL employee and department data for fresh import
// @access  Public (for debugging)
router.delete('/clear-all-data', async (req, res) => {
  try {
    console.log('🗑️ Starting complete data cleanup...');
    
    // Delete all employees
    const employeeResult = await Employee.deleteMany({});
    console.log(`✅ Deleted ${employeeResult.deletedCount} employees`);
    
    // Delete all users (except admin users)
    const userResult = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`✅ Deleted ${userResult.deletedCount} users`);
    
    // Delete all departments
    const departmentResult = await Department.deleteMany({});
    console.log(`✅ Deleted ${departmentResult.deletedCount} departments`);
    
    console.log('🎯 Data cleanup completed successfully!');
    
    res.json({
      success: true,
      message: 'All data cleared successfully. Ready for fresh import.',
      deleted: {
        employees: employeeResult.deletedCount,
        users: userResult.deletedCount,
        departments: departmentResult.deletedCount
      }
    });

  } catch (error) {
    console.error('❌ Clear data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear data',
      error: error.message
    });
  }
});

// @route   POST /api/organization/reset-to-clean-state
// @desc    Reset database to clean state and create basic admin user
// @access  Public (for debugging)
router.post('/reset-to-clean-state', async (req, res) => {
  try {
    console.log('🔄 Resetting to clean state...');
    
    // Clear all data first
    await Employee.deleteMany({});
    await User.deleteMany({});
    await Department.deleteMany({});
    
    // Create a basic admin user for testing
    const adminUser = new User({
      email: 'admin@rannkly.com',
      password: 'admin123', // This will be hashed by the User model pre-save hook
      role: 'admin',
      isActive: true
    });
    await adminUser.save();
    
    console.log('✅ Created admin user: admin@rannkly.com / admin123');
    console.log('🎯 Database reset completed! Ready for CSV import.');
    
    res.json({
      success: true,
      message: 'Database reset to clean state. Admin user created.',
      adminCredentials: {
        email: 'admin@rannkly.com',
        password: 'admin123',
        note: 'Please change this password after login'
      }
    });

  } catch (error) {
    console.error('❌ Reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset database',
      error: error.message
    });
  }
});

// Remove test employees
router.delete('/remove-test-employees', async (req, res) => {
  try {
    console.log('🗑️ Removing test employees...');
    
    // Find and delete employees with "Test" in their name or designation
    const testEmployees = await Employee.find({
      $or: [
        { 'personalInfo.firstName': { $regex: /test/i } },
        { 'personalInfo.lastName': { $regex: /test/i } },
        { 'employmentInfo.designation': { $regex: /test/i } },
        { 'employeeId': { $regex: /test/i } }
      ]
    }).populate('user');
    
    console.log(`Found ${testEmployees.length} test employees to remove`);
    
    // Delete associated users first
    const userIds = testEmployees.map(emp => emp.user?._id).filter(Boolean);
    if (userIds.length > 0) {
      const userResult = await User.deleteMany({ _id: { $in: userIds } });
      console.log(`Deleted ${userResult.deletedCount} test users`);
    }
    
    // Delete the employees
    const employeeResult = await Employee.deleteMany({
      $or: [
        { 'personalInfo.firstName': { $regex: /test/i } },
        { 'personalInfo.lastName': { $regex: /test/i } },
        { 'employmentInfo.designation': { $regex: /test/i } },
        { 'employeeId': { $regex: /test/i } }
      ]
    });
    
    console.log(`Deleted ${employeeResult.deletedCount} test employees`);
    
    res.json({ 
      message: 'Test employees removed successfully',
      results: {
        employeesDeleted: employeeResult.deletedCount,
        usersDeleted: userIds.length,
        testEmployeesFound: testEmployees.map(emp => ({
          name: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
          designation: emp.employmentInfo?.designation,
          employeeId: emp.employeeId
        }))
      }
    });
  } catch (error) {
    console.error('Error removing test employees:', error);
    res.status(500).json({ message: 'Failed to remove test employees', error: error.message });
  }
});

module.exports = router;
