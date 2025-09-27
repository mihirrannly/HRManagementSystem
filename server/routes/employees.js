const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Department = require('../models/Department');
const { authenticate, authorize, canAccessEmployee } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/employees';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// @route   GET /api/employees
// @desc    Get all employees with filtering, sorting, and pagination
// @access  Private (HR, Admin, Manager)
router.get('/', [
  authenticate,
  authorize(['admin', 'hr', 'manager']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('department').optional().isMongoId(),
  query('isActive').optional().isBoolean(),
  query('search').optional().isLength({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    let filter = {};
    
    if (req.query.department) {
      filter['employmentInfo.department'] = req.query.department;
    }
    
    if (req.query.isActive !== undefined) {
      filter['employmentInfo.isActive'] = req.query.isActive === 'true';
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { 'personalInfo.firstName': searchRegex },
        { 'personalInfo.lastName': searchRegex },
        { employeeId: searchRegex },
        { 'employmentInfo.designation': searchRegex }
      ];
    }

    // If user is a manager, only show their team
    if (req.user.role === 'manager') {
      const managerEmployee = await Employee.findOne({ user: req.user._id });
      if (managerEmployee) {
        filter['employmentInfo.reportingManager'] = managerEmployee._id;
      }
    }

    const employees = await Employee.find(filter)
      .populate('employmentInfo.department', 'name code')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('user', 'email role isActive')
      .select('employeeId personalInfo contactInfo employmentInfo salaryInfo additionalInfo user createdAt updatedAt')
      .sort({ 'personalInfo.firstName': 1 })
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(filter);

    res.json({
      employees,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/:id
// @desc    Get employee by ID
// @access  Private
router.get('/:id', [authenticate, canAccessEmployee], async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('employmentInfo.department', 'name code description')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('user', 'email role isActive lastLogin');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private (HR, Admin)
router.post('/', [
  authenticate,
  authorize(['admin', 'hr']),
  body('user.email').isEmail().normalizeEmail(),
  body('user.password').isLength({ min: 6 }),
  body('personalInfo.firstName').notEmpty().trim(),
  body('personalInfo.lastName').notEmpty().trim(),
  body('employmentInfo.department').isMongoId(),
  body('employmentInfo.designation').notEmpty().trim(),
  body('employmentInfo.dateOfJoining').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user: userData, employeeId, ...employeeData } = req.body;

    // Check if user email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Verify department exists
    const department = await Department.findById(employeeData.employmentInfo.department);
    if (!department) {
      return res.status(400).json({ message: 'Department not found' });
    }

    // Create user first
    const newUser = new User({
      email: userData.email,
      password: userData.password,
      role: userData.role || 'employee'
    });
    await newUser.save();

    // Create employee (don't include employeeId - let model generate it)
    const employee = new Employee({
      ...employeeData,
      user: newUser._id
    });

    await employee.save();

    // Populate and return the created employee
    const populatedEmployee = await Employee.findById(employee._id)
      .populate('employmentInfo.department', 'name code')
      .populate('user', 'email role isActive');

    res.status(201).json({
      message: 'Employee created successfully',
      employee: populatedEmployee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private (HR, Admin, or self for limited fields)
router.put('/:id', [authenticate], async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check permissions
    const canEdit = ['admin', 'hr'].includes(req.user.role) || 
                   employee.user.toString() === req.user._id.toString();
    
    if (!canEdit) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If employee is updating their own record, limit fields they can update
    let allowedFields = req.body;
    if (employee.user.toString() === req.user._id.toString() && req.user.role === 'employee') {
      allowedFields = {
        'contactInfo.personalEmail': req.body.contactInfo?.personalEmail,
        'contactInfo.phone': req.body.contactInfo?.phone,
        'contactInfo.address': req.body.contactInfo?.address,
        'contactInfo.emergencyContact': req.body.contactInfo?.emergencyContact,
        'skills': req.body.skills,
        'certifications': req.body.certifications
      };
    }

    // Store original values for audit log
    const originalData = employee.toObject();

    // Update employee
    Object.keys(allowedFields).forEach(key => {
      if (key.includes('.')) {
        // Handle nested fields
        const keys = key.split('.');
        let current = employee;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = allowedFields[key];
      } else {
        employee[key] = allowedFields[key];
      }
    });

    // Add audit log entry
    employee.auditLog.push({
      action: 'update',
      field: 'employee_data',
      oldValue: originalData,
      newValue: employee.toObject(),
      modifiedBy: req.user._id
    });

    await employee.save();

    const updatedEmployee = await Employee.findById(employee._id)
      .populate('employmentInfo.department', 'name code')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('user', 'email role isActive');

    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/employees/all
// @desc    Delete all employees (admin only)
// @access  Private (Admin only)
router.delete('/all', [
  authenticate,
  authorize(['admin', 'hr'])
], async (req, res) => {
  try {
    console.log('Delete all employees request started');
    
    // Get all employees with populated user data
    const employees = await Employee.find({}).populate('user');
    console.log(`Found ${employees.length} employees to delete`);
    
    if (employees.length === 0) {
      return res.json({ message: 'No employees found to delete', deletedCount: 0 });
    }

    // Get all user IDs associated with employees (excluding admins)
    const userIds = employees
      .map(emp => emp.user)
      .filter(user => user && user.role !== 'admin')
      .map(user => user._id);
    
    console.log(`Found ${userIds.length} non-admin user accounts to delete`);

    // Delete all employees first
    const employeeDeleteResult = await Employee.deleteMany({});
    console.log(`Deleted ${employeeDeleteResult.deletedCount} employees`);
    
    // Delete associated user accounts (only non-admin users)
    let userDeleteResult = { deletedCount: 0 };
    if (userIds.length > 0) {
      userDeleteResult = await User.deleteMany({ 
        _id: { $in: userIds }
      });
      console.log(`Deleted ${userDeleteResult.deletedCount} user accounts`);
    }

    const responseMessage = `Successfully deleted ${employeeDeleteResult.deletedCount} employees and ${userDeleteResult.deletedCount} user accounts`;
    console.log(responseMessage);

    res.json({ 
      message: responseMessage,
      deletedEmployees: employeeDeleteResult.deletedCount,
      deletedUsers: userDeleteResult.deletedCount
    });
  } catch (error) {
    console.error('Delete all employees error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error while deleting employees',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee (soft delete)
// @access  Private (Admin, HR)
router.delete('/:id', [
  authenticate,
  authorize(['admin', 'hr'])
], async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Soft delete - mark as inactive
    employee.employmentInfo.isActive = false;
    employee.employmentInfo.terminationDate = new Date();
    employee.employmentInfo.terminationReason = req.body.reason || 'Terminated by admin';

    // Also deactivate user account
    await User.findByIdAndUpdate(employee.user, { isActive: false });

    // Add audit log
    employee.auditLog.push({
      action: 'deactivate',
      field: 'employee_status',
      oldValue: true,
      newValue: false,
      modifiedBy: req.user._id
    });

    await employee.save();

    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/employees/:id/upload
// @desc    Upload employee document
// @access  Private
router.post('/:id/upload', [
  authenticate,
  canAccessEmployee,
  upload.single('document')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const document = {
      type: req.body.type || 'other',
      name: req.body.name || req.file.originalname,
      filePath: req.file.path,
      expiryDate: req.body.expiryDate || null
    };

    employee.documents.push(document);
    await employee.save();

    res.json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/org-chart
// @desc    Get organization chart
// @access  Private (HR, Admin, Manager)
router.get('/reports/org-chart', [
  authenticate,
  authorize(['admin', 'hr', 'manager'])
], async (req, res) => {
  try {
    const employees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('employmentInfo.department', 'name code')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .select('employeeId personalInfo employmentInfo.designation employmentInfo.department employmentInfo.reportingManager');

    // Build hierarchical structure
    const buildOrgChart = (employees, managerId = null) => {
      return employees
        .filter(emp => {
          const reportingManagerId = emp.employmentInfo.reportingManager?._id?.toString();
          return reportingManagerId === managerId?.toString();
        })
        .map(emp => ({
          ...emp.toObject(),
          subordinates: buildOrgChart(employees, emp._id)
        }));
    };

    const orgChart = buildOrgChart(employees);

    res.json(orgChart);
  } catch (error) {
    console.error('Get org chart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

