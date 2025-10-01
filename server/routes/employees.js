const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Department = require('../models/Department');
const { authenticate, authorize, canAccessEmployee, canAccessEmployeeWithFilter } = require('../middleware/auth');

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

    // Determine access level for filtering
    let accessLevel = 'self';
    if (['admin', 'hr'].includes(req.user.role)) {
      accessLevel = 'full';
    } else if (req.user.role === 'manager') {
      accessLevel = 'manager';
    }

    // Return employees with full data (no filtering)
    res.json({
      employees: employees,
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

// @route   GET /api/employees/me
// @desc    Get current user's employee data
// @access  Private (Employee)
router.get('/me', authenticate, async (req, res) => {
  try {
    console.log('🔍 /me endpoint hit, user ID:', req.user._id);
    
    const employee = await Employee.findOne({ user: req.user._id })
      .populate('employmentInfo.department', 'name code description')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('user', 'email role isActive lastLogin');

    console.log('📋 Employee found:', employee ? employee.employeeId : 'Not found');

    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get my employee data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// MOVED TO END OF FILE - This route must be last because /:id catches all routes

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

// @route   GET /api/employees/my-team
// @desc    Get team members for current user (if they are a manager or have special access)
// @access  Private
router.get('/my-team', authenticate, async (req, res) => {
  try {
    const currentEmployee = await Employee.findOne({ user: req.user._id });
    if (!currentEmployee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Find team members reporting to this employee
    // Also include special access for users like Prajwal regardless of role
    const teamMembers = await Employee.find({
      'employmentInfo.reportingManager': currentEmployee._id,
      'employmentInfo.isActive': true
    })
    .populate('user', 'email role')
    .populate('employmentInfo.department', 'name')
    .select('employeeId personalInfo employmentInfo createdAt user')
    .sort({ 'personalInfo.firstName': 1 });

    // Get leave balances for team members
    const teamMembersWithLeaves = await Promise.all(
      teamMembers.map(async (member) => {
        try {
          const currentYear = new Date().getFullYear();
          const leaveBalance = await require('../models/Leave').LeaveBalance.findOne({
            employee: member._id,
            year: currentYear
          });

          return {
            ...member.toObject(),
            leaveBalance: leaveBalance ? {
              casualLeave: leaveBalance.casualLeave,
              sickLeave: leaveBalance.sickLeave,
              specialLeave: leaveBalance.specialLeave
            } : null
          };
        } catch (error) {
          return {
            ...member.toObject(),
            leaveBalance: null
          };
        }
      })
    );

    // Return team members with full data (no filtering)
    res.json({
      teamMembers: teamMembersWithLeaves,
      totalTeamSize: teamMembers.length,
      manager: {
        employeeId: currentEmployee.employeeId,
        name: `${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`,
        designation: currentEmployee.employmentInfo?.designation
      }
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/reporting-structure
// @desc    Get reporting structure information for current user
// @access  Private
router.get('/reporting-structure', authenticate, async (req, res) => {
  console.log('🔍 Reporting structure endpoint hit!');
  try {
    const currentEmployee = await Employee.findOne({ user: req.user._id })
      .populate('employmentInfo.reportingManager', 'employeeId personalInfo employmentInfo.designation')
      .populate('employmentInfo.department', 'name');

    if (!currentEmployee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Get team members (if user is a manager)
    const teamMembers = await Employee.find({
      'employmentInfo.reportingManager': currentEmployee._id,
      'employmentInfo.isActive': true
    })
    .populate('user', 'email role')
    .select('employeeId personalInfo employmentInfo.designation')
    .sort({ 'personalInfo.firstName': 1 });

    // Get peers (employees with same reporting manager)
    const peers = currentEmployee.employmentInfo?.reportingManager ? 
      await Employee.find({
        'employmentInfo.reportingManager': currentEmployee.employmentInfo.reportingManager._id,
        'employmentInfo.isActive': true,
        '_id': { $ne: currentEmployee._id }
      })
      .select('employeeId personalInfo employmentInfo.designation')
      .sort({ 'personalInfo.firstName': 1 }) : [];

    res.json({
      currentEmployee: {
        employeeId: currentEmployee.employeeId,
        name: `${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`,
        designation: currentEmployee.employmentInfo?.designation,
        department: currentEmployee.employmentInfo?.department?.name,
        role: req.user.role
      },
      reportingManager: currentEmployee.employmentInfo?.reportingManager ? {
        employeeId: currentEmployee.employmentInfo.reportingManager.employeeId,
        name: `${currentEmployee.employmentInfo.reportingManager.personalInfo?.firstName} ${currentEmployee.employmentInfo.reportingManager.personalInfo?.lastName}`,
        designation: currentEmployee.employmentInfo.reportingManager.employmentInfo?.designation
      } : null,
      teamMembers: teamMembers.map(member => ({
        employeeId: member.employeeId,
        name: `${member.personalInfo?.firstName} ${member.personalInfo?.lastName}`,
        designation: member.employmentInfo?.designation,
        role: member.user?.role
      })),
      peers: peers.map(peer => ({
        employeeId: peer.employeeId,
        name: `${peer.personalInfo?.firstName} ${peer.personalInfo?.lastName}`,
        designation: peer.employmentInfo?.designation
      })),
      statistics: {
        totalTeamSize: teamMembers.length,
        totalPeers: peers.length,
        isManager: teamMembers.length > 0
      }
    });
  } catch (error) {
    console.error('Get reporting structure error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/team-dashboard/:employeeId
// @desc    Get team member dashboard data for reporting managers (filtered)
// @access  Private (Reporting Manager and special access users)
router.get('/team-dashboard/:employeeId', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const Employee = require('../models/Employee');
    const Attendance = require('../models/Attendance');
    const { LeaveRequest } = require('../models/Leave');
    
    const employee = await Employee.findById(employeeId)
      .populate('employmentInfo.department', 'name code description')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('user', 'email role isActive lastLogin');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check access permissions
    let accessLevel = 'self';
    
    console.log('🔍 Team Dashboard Access Check:', {
      currentUserEmail: req.user.email,
      currentUserRole: req.user.role,
      targetEmployeeId: employeeId,
      targetEmployeeName: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`
    });
    
    // Admin and HR can access all employee data without filtering
    if (['admin', 'hr'].includes(req.user.role)) {
      accessLevel = 'full';
      console.log('✅ Access granted: Admin/HR role');
    } else {
      // Check if current user is the employee's reporting manager
      const currentEmployee = await Employee.findOne({ user: req.user._id });
      
      console.log('🔍 Reporting manager check:', {
        hasCurrentEmployee: !!currentEmployee,
        currentEmployeeId: currentEmployee?._id,
        targetReportingManagerId: employee.employmentInfo.reportingManager?._id,
        isReportingManager: currentEmployee && employee.employmentInfo.reportingManager && 
          employee.employmentInfo.reportingManager._id.equals(currentEmployee._id)
      });
      
      if (currentEmployee && employee.employmentInfo.reportingManager && 
          employee.employmentInfo.reportingManager._id.equals(currentEmployee._id)) {
        accessLevel = 'manager';
        console.log('✅ Access granted: Reporting manager relationship');
      } else if (employee.user._id.equals(req.user._id)) {
        accessLevel = 'self';
        console.log('✅ Access granted: Self access');
      } else {
        // Special access for users like Prajwal
        const specialAccessEmails = ['prajwal@rannkly.com', 'prajwal.shinde@rannkly.com'];
        if (specialAccessEmails.includes(req.user.email.toLowerCase())) {
          // For Prajwal, allow access to any employee for now (can be restricted later)
          accessLevel = 'manager';
          console.log('✅ Access granted: Special access');
        } else {
          console.log('❌ Access denied: No valid relationship found');
          return res.status(403).json({ 
            message: 'Access denied to this employee data.',
            debug: {
              currentUserRole: req.user.role,
              currentUserEmail: req.user.email,
              targetEmployeeId: employeeId,
              hasCurrentEmployee: !!currentEmployee,
              currentEmployeeId: currentEmployee?._id,
              targetReportingManagerId: employee.employmentInfo.reportingManager?._id,
        isReportingManager: currentEmployee && employee.employmentInfo.reportingManager && 
          employee.employmentInfo.reportingManager._id.equals(currentEmployee._id),
        isSelf: employee.user._id.equals(req.user._id),
              hasSpecialAccess: specialAccessEmails.includes(req.user.email.toLowerCase())
            }
          });
        }
      }
    }
    
    console.log('📊 Final access level:', accessLevel);

    // Get attendance summary for the employee
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const attendanceSummary = {
      present: attendanceRecords.filter(record => record.status === 'present').length,
      absent: attendanceRecords.filter(record => record.status === 'absent').length,
      late: attendanceRecords.filter(record => record.status === 'late').length,
      totalWorkingDays: attendanceRecords.length
    };

    // Get leave summary
    const currentYear = new Date().getFullYear();
    const leaveRequests = await LeaveRequest.find({
      employee: employeeId,
      year: currentYear
    });

    const leaveSummary = {
      totalRequests: leaveRequests.length,
      approved: leaveRequests.filter(leave => leave.status === 'approved').length,
      pending: leaveRequests.filter(leave => leave.status === 'pending').length,
      rejected: leaveRequests.filter(leave => leave.status === 'rejected').length
    };

    // Return dashboard data with full employee information (no filtering)
    res.json({
      employee: employee,
      attendance: attendanceSummary,
      leaves: leaveSummary,
      accessLevel: accessLevel,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Get team dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/debug-team-dashboard-access/:employeeId
// @desc    Debug endpoint to check team dashboard access for a specific employee
// @access  Private (for debugging)
router.get('/debug-team-dashboard-access/:employeeId', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const currentUser = req.user;
    
    // Get current user's employee record
    const currentEmployee = await Employee.findOne({ user: currentUser._id });
    
    // Get target employee
    const targetEmployee = await Employee.findById(employeeId)
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId');
    
    if (!targetEmployee) {
      return res.status(404).json({ message: 'Target employee not found' });
    }
    
    // Check access permissions step by step
    let accessLevel = 'none';
    let accessReason = '';
    
    // Check admin/HR access
    if (['admin', 'hr'].includes(currentUser.role)) {
      accessLevel = 'full';
      accessReason = 'User has admin/hr role';
    } else if (currentEmployee && targetEmployee.employmentInfo.reportingManager?.toString() === currentEmployee._id.toString()) {
      accessLevel = 'manager';
      accessReason = 'User is the reporting manager of the target employee';
    } else if (targetEmployee.user.toString() === currentUser._id.toString()) {
      accessLevel = 'self';
      accessReason = 'User is accessing their own data';
    } else {
      // Check special access
      const specialAccessEmails = ['prajwal@rannkly.com', 'prajwal.shinde@rannkly.com'];
      if (specialAccessEmails.includes(currentUser.email.toLowerCase())) {
        accessLevel = 'manager';
        accessReason = 'User has special access via email whitelist';
      } else {
        accessReason = 'No access - user is not admin/hr, not the reporting manager, not accessing own data, and not in special access list';
      }
    }
    
    res.json({
      debug: {
        currentUser: {
          id: currentUser._id,
          email: currentUser.email,
          role: currentUser.role,
          isActive: currentUser.isActive
        },
        currentEmployee: currentEmployee ? {
          id: currentEmployee._id,
          employeeId: currentEmployee.employeeId,
          name: `${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`,
          designation: currentEmployee.employmentInfo?.designation
        } : null,
        targetEmployee: {
          id: targetEmployee._id,
          employeeId: targetEmployee.employeeId,
          name: `${targetEmployee.personalInfo?.firstName} ${targetEmployee.personalInfo?.lastName}`,
          designation: targetEmployee.employmentInfo?.designation,
          reportingManagerId: targetEmployee.employmentInfo?.reportingManager?._id,
          reportingManagerName: targetEmployee.employmentInfo?.reportingManager ? 
            `${targetEmployee.employmentInfo.reportingManager.personalInfo?.firstName} ${targetEmployee.employmentInfo.reportingManager.personalInfo?.lastName}` : null
        },
        accessCheck: {
          accessLevel,
          accessReason,
          hasAccess: accessLevel !== 'none',
          isAdminOrHR: ['admin', 'hr'].includes(currentUser.role),
          isReportingManager: currentEmployee && targetEmployee.employmentInfo.reportingManager?.toString() === currentEmployee._id.toString(),
          isSelf: targetEmployee.user.toString() === currentUser._id.toString(),
          hasSpecialAccess: ['prajwal@rannkly.com', 'prajwal.shinde@rannkly.com'].includes(currentUser.email.toLowerCase())
        }
      }
    });
  } catch (error) {
    console.error('Debug team dashboard access error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/employees/debug-manager-access
// @desc    Debug endpoint to check manager access and reporting relationships
// @access  Private (for debugging)
router.get('/debug-manager-access', authenticate, async (req, res) => {
  try {
    const currentUser = req.user;
    const currentEmployee = await Employee.findOne({ user: currentUser._id })
      .populate('employmentInfo.department', 'name')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!currentEmployee) {
      return res.status(404).json({ 
        message: 'Employee profile not found',
        user: {
          id: currentUser._id,
          email: currentUser.email,
          role: currentUser.role
        }
      });
    }

    // Find team members reporting to this employee
    const teamMembers = await Employee.find({
      'employmentInfo.reportingManager': currentEmployee._id,
      'employmentInfo.isActive': true
    })
    .populate('user', 'email role')
    .select('employeeId personalInfo employmentInfo.designation user');

    // Check if user has manager role
    const hasManagerRole = currentUser.role === 'manager';

    // Get all employees to check reporting structure
    const allEmployees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('user', 'email role')
      .select('employeeId personalInfo employmentInfo.designation employmentInfo.reportingManager user');

    res.json({
      debug: {
        currentUser: {
          id: currentUser._id,
          email: currentUser.email,
          role: currentUser.role,
          hasManagerRole
        },
        currentEmployee: {
          id: currentEmployee._id,
          employeeId: currentEmployee.employeeId,
          name: `${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`,
          designation: currentEmployee.employmentInfo?.designation,
          department: currentEmployee.employmentInfo?.department?.name,
          reportingManager: currentEmployee.employmentInfo?.reportingManager ? {
            id: currentEmployee.employmentInfo.reportingManager._id,
            name: `${currentEmployee.employmentInfo.reportingManager.personalInfo?.firstName} ${currentEmployee.employmentInfo.reportingManager.personalInfo?.lastName}`,
            employeeId: currentEmployee.employmentInfo.reportingManager.employeeId
          } : null
        },
        teamMembers: {
          count: teamMembers.length,
          members: teamMembers.map(member => ({
            id: member._id,
            employeeId: member.employeeId,
            name: `${member.personalInfo?.firstName} ${member.personalInfo?.lastName}`,
            designation: member.employmentInfo?.designation,
            userRole: member.user?.role,
            userEmail: member.user?.email
          }))
        },
        reportingStructure: {
          totalEmployees: allEmployees.length,
          employeesReportingToCurrentUser: teamMembers.length,
          employeesWithNoReportingManager: allEmployees.filter(emp => !emp.employmentInfo.reportingManager).length
        },
        recommendations: {
          needsManagerRole: !hasManagerRole ? 'User needs "manager" role in User model' : null,
          needsReportingRelationships: teamMembers.length === 0 ? 'No employees are set to report to this user. Check reporting manager assignments.' : null,
          checkEmployeeData: teamMembers.length === 0 ? 'Verify that employees have employmentInfo.reportingManager set to this user\'s employee ID' : null
        }
      }
    });
  } catch (error) {
    console.error('Debug manager access error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/employees/fix-manager-access
// @desc    Fix manager role and reporting relationships for a user
// @access  Private (Admin/HR only)
router.post('/fix-manager-access', [authenticate, authorize(['admin', 'hr'])], async (req, res) => {
  try {
    const { userEmail, setAsManager = true, reportingManagerEmployeeIds = [] } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }

    // Find the user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the employee record
    const employee = await Employee.findOne({ user: user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    const results = {
      user: {
        email: user.email,
        currentRole: user.role,
        employeeId: employee.employeeId
      },
      changes: []
    };

    // Update user role to manager if requested
    if (setAsManager && user.role !== 'manager') {
      await User.findByIdAndUpdate(user._id, { role: 'manager' });
      results.changes.push(`Updated user role from '${user.role}' to 'manager'`);
      results.user.newRole = 'manager';
    }

    // Set reporting relationships if provided
    if (reportingManagerEmployeeIds.length > 0) {
      let relationshipsSet = 0;
      
      for (const reportingManagerEmployeeId of reportingManagerEmployeeIds) {
        // Find the employee who should report to this manager
        const reportingEmployee = await Employee.findOne({ 
          employeeId: reportingManagerEmployeeId 
        });
        
        if (reportingEmployee) {
          // Set this employee to report to the manager
          await Employee.findByIdAndUpdate(reportingEmployee._id, {
            'employmentInfo.reportingManager': employee._id
          });
          relationshipsSet++;
          results.changes.push(`Set ${reportingEmployee.personalInfo?.firstName} ${reportingEmployee.personalInfo?.lastName} (${reportingEmployee.employeeId}) to report to ${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`);
        }
      }
      
      if (relationshipsSet === 0) {
        results.changes.push('No valid employee IDs found to set as direct reports');
      }
    }

    // Get updated team members count
    const teamMembers = await Employee.find({
      'employmentInfo.reportingManager': employee._id,
      'employmentInfo.isActive': true
    });

    results.teamMembers = {
      count: teamMembers.length,
      members: teamMembers.map(member => ({
        employeeId: member.employeeId,
        name: `${member.personalInfo?.firstName} ${member.personalInfo?.lastName}`,
        designation: member.employmentInfo?.designation
      }))
    };

    res.json({
      success: true,
      message: 'Manager access fixed successfully',
      results
    });

  } catch (error) {
    console.error('Fix manager access error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/employees/reportee-data
// @desc    Get reportee data for users like Prajwal (bypasses role restrictions)
// @access  Private
router.get('/reportee-data', authenticate, async (req, res) => {
  try {
    const currentUser = req.user;
    const currentEmployee = await Employee.findOne({ user: currentUser._id })
      .populate('employmentInfo.department', 'name')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!currentEmployee) {
      return res.status(404).json({ 
        message: 'Employee profile not found',
        user: {
          id: currentUser._id,
          email: currentUser.email,
          role: currentUser.role
        }
      });
    }

    // Find team members reporting to this employee
    const teamMembers = await Employee.find({
      'employmentInfo.reportingManager': currentEmployee._id,
      'employmentInfo.isActive': true
    })
    .populate('user', 'email role')
    .populate('employmentInfo.department', 'name')
    .select('employeeId personalInfo employmentInfo createdAt user')
    .sort({ 'personalInfo.firstName': 1 });

    // Get leave balances for team members
    const teamMembersWithLeaves = await Promise.all(
      teamMembers.map(async (member) => {
        try {
          const currentYear = new Date().getFullYear();
          const leaveBalance = await require('../models/Leave').LeaveBalance.findOne({
            employee: member._id,
            year: currentYear
          });

          return {
            ...member.toObject(),
            leaveBalance: leaveBalance ? {
              casualLeave: leaveBalance.casualLeave,
              sickLeave: leaveBalance.sickLeave,
              specialLeave: leaveBalance.specialLeave
            } : null
          };
        } catch (error) {
          return {
            ...member.toObject(),
            leaveBalance: null
          };
        }
      })
    );

    // Filter data for reportee view (hide sensitive information)
    const filteredTeamMembers = teamMembersWithLeaves.map(member => {
      const filtered = { ...member };
      
      // Hide sensitive salary information
      if (filtered.salaryInfo) {
        filtered.salaryInfo = {
          currentSalary: {
            basic: null,
            hra: null,
            allowances: null,
            grossSalary: null,
            ctc: null
          },
          bankDetails: null,
          taxInfo: null
        };
      }

      // Hide sensitive personal information
      if (filtered.personalInfo) {
        filtered.personalInfo = {
          firstName: filtered.personalInfo.firstName,
          lastName: filtered.personalInfo.lastName,
          dateOfBirth: null,
          gender: null,
          maritalStatus: null
        };
      }

      // Hide sensitive contact information
      if (filtered.contactInfo) {
        filtered.contactInfo = {
          email: filtered.contactInfo.email,
          personalEmail: null,
          phone: null,
          address: null,
          emergencyContact: null,
          alternatePhone: null
        };
      }

      // Remove address information
      if (filtered.addressInfo) {
        filtered.addressInfo = null;
      }

      // Remove employment history
      if (filtered.employmentHistory) {
        filtered.employmentHistory = null;
      }

      return filtered;
    });

    res.json({
      success: true,
      currentEmployee: {
        id: currentEmployee._id,
        employeeId: currentEmployee.employeeId,
        name: `${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`,
        designation: currentEmployee.employmentInfo?.designation,
        department: currentEmployee.employmentInfo?.department?.name,
        userRole: currentUser.role
      },
      teamMembers: filteredTeamMembers,
      totalTeamSize: teamMembers.length,
      accessLevel: 'reportee',
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Get reportee data error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Special endpoint for Prajwal to get all employees (for testing)
router.get('/all-employees', authenticate, async (req, res) => {
  try {
    const specialAccessEmails = ['prajwal@rannkly.com', 'prajwal.shinde@rannkly.com'];
    
    if (!specialAccessEmails.includes(req.user.email.toLowerCase())) {
      return res.status(403).json({ message: 'Access denied. This endpoint is for special users only.' });
    }

    const employees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('user', 'email role')
      .populate('employmentInfo.department', 'name')
      .populate('employmentInfo.reportingManager', 'employeeId personalInfo.firstName personalInfo.lastName')
      .select('employeeId personalInfo employmentInfo createdAt user')
      .sort({ 'personalInfo.firstName': 1 });

    // Return all employees with full data (no filtering)
    res.json({
      success: true,
      employees: employees,
      totalCount: employees.length,
      accessLevel: 'manager',
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug endpoint to check reporting relationships
router.get('/debug-reporting', authenticate, async (req, res) => {
  try {
    const currentEmployee = await Employee.findOne({ user: req.user._id });
    if (!currentEmployee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Find all employees and their reporting relationships
    const allEmployees = await Employee.find({ 'employmentInfo.isActive': true })
      .populate('employmentInfo.reportingManager', 'employeeId personalInfo.firstName personalInfo.lastName')
      .select('employeeId personalInfo employmentInfo.reportingManager')
      .sort({ 'personalInfo.firstName': 1 });

    // Find employees reporting to current user
    const directReports = await Employee.find({
      'employmentInfo.reportingManager': currentEmployee._id,
      'employmentInfo.isActive': true
    })
    .select('employeeId personalInfo employmentInfo.reportingManager');

    res.json({
      currentEmployee: {
        id: currentEmployee._id,
        employeeId: currentEmployee.employeeId,
        name: `${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`
      },
      directReports: directReports.map(emp => ({
        id: emp._id,
        employeeId: emp.employeeId,
        name: `${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}`
      })),
      allEmployees: allEmployees.map(emp => ({
        id: emp._id,
        employeeId: emp.employeeId,
        name: `${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}`,
        reportingManager: emp.employmentInfo?.reportingManager ? {
          id: emp.employmentInfo.reportingManager._id,
          employeeId: emp.employmentInfo.reportingManager.employeeId,
          name: `${emp.employmentInfo.reportingManager.personalInfo?.firstName} ${emp.employmentInfo.reportingManager.personalInfo?.lastName}`
        } : null
      }))
    });
  } catch (error) {
    console.error('Debug reporting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test routes removed - issue was with /:id route order

// @route   GET /api/employees/:id
// @desc    Get employee by ID with full data access
// @access  Private
// NOTE: This route MUST be last because /:id catches all routes
router.get('/:id', [authenticate, canAccessEmployee], async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('employmentInfo.department', 'name code description')
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('user', 'email role isActive lastLogin');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Return full employee data (no filtering)
    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

console.log('🔥 EMPLOYEES ROUTES LOADED - INCLUDING NEW ENDPOINTS!');
console.log('🔥 Available routes: /my-team, /debug-manager-access, /team-dashboard/:id, /all-employees, /debug-reporting');
module.exports = router;

