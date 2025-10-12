const express = require('express');
const { body, query, validationResult } = require('express-validator');
const moment = require('moment');
const { LeaveType, LeaveBalance, LeaveRequest, Holiday } = require('../models/Leave');
const Employee = require('../models/Employee');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/leave/balance
// @desc    Get leave balance for current employee
// @access  Private (Employee)
router.get('/balance', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const currentYear = new Date().getFullYear();
    
    // Try to get real leave balance data
    let leaveBalance = await LeaveBalance.findOne({ 
      employee: employee._id, 
      year: currentYear 
    });

    // If no balance record exists, create one with default values
    if (!leaveBalance) {
      leaveBalance = new LeaveBalance({
        employee: employee._id,
        year: currentYear,
        casualLeave: { allocated: 12, used: 0, pending: 0, available: 12 },
        sickLeave: { allocated: 12, used: 0, pending: 0, available: 12 },
        specialLeave: { allocated: 3, used: 0, pending: 0, available: 3 }
      });
      await leaveBalance.save();
    }

    // Format response for frontend compatibility
    const formattedBalance = [
      {
        _id: 'casual',
        leaveType: { name: 'Casual Leave', code: 'CL', color: '#4CAF50' },
        allocated: leaveBalance.casualLeave.allocated,
        used: leaveBalance.casualLeave.used,
        pending: leaveBalance.casualLeave.pending,
        available: leaveBalance.casualLeave.available
      },
      {
        _id: 'sick',
        leaveType: { name: 'Sick Leave', code: 'SL', color: '#FF9800' },
        allocated: leaveBalance.sickLeave.allocated,
        used: leaveBalance.sickLeave.used,
        pending: leaveBalance.sickLeave.pending,
        available: leaveBalance.sickLeave.available
      },
      {
        _id: 'special',
        leaveType: { name: 'Special Leave', code: 'SPL', color: '#9C27B0' },
        allocated: leaveBalance.specialLeave.allocated,
        used: leaveBalance.specialLeave.used,
        pending: leaveBalance.specialLeave.pending,
        available: leaveBalance.specialLeave.available
      }
    ];

    res.json(formattedBalance);
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leave/my-summary
// @desc    Get leave summary for current employee
// @access  Private (Employee)
router.get('/my-summary', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // For now, return mock data since we don't have real leave records
    const currentYear = new Date().getFullYear();
    
    // Mock leave balance data
    const leaveBalance = {
      available: 18, // Total available leaves
      used: 6,      // Leaves used so far
      pending: 1,   // Pending leave requests
      remaining: 12 // Remaining leaves
    };

    res.json(leaveBalance);
  } catch (error) {
    console.error('Get leave summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leave/types
// @desc    Get all leave types
// @access  Private
router.get('/types', authenticate, async (req, res) => {
  try {
    // Return predefined leave types
    const leaveTypes = [
      {
        _id: 'casual',
        name: 'Casual Leave',
        code: 'CL',
        description: 'For personal reasons, planned activities',
        maxDaysPerYear: 12,
        color: '#4CAF50'
      },
      {
        _id: 'sick',
        name: 'Sick Leave',
        code: 'SL',
        description: 'For medical reasons and health issues',
        maxDaysPerYear: 12,
        color: '#FF9800'
      },
      {
        _id: 'marriage',
        name: 'Marriage Leave',
        code: 'ML',
        description: 'For own marriage (Special Leave)',
        maxDaysPerYear: 3,
        color: '#E91E63'
      },
      {
        _id: 'bereavement',
        name: 'Bereavement Leave',
        code: 'BL',
        description: 'For close family member bereavement (Special Leave)',
        maxDaysPerYear: 3,
        color: '#607D8B'
      }
    ];
    res.json(leaveTypes);
  } catch (error) {
    console.error('Get leave types error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leave/types
// @desc    Create new leave type
// @access  Private (HR, Admin)
router.post('/types', [
  authenticate,
  authorize(['admin', 'hr']),
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim(),
  body('maxDaysPerYear').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leaveType = new LeaveType(req.body);
    await leaveType.save();

    res.status(201).json({
      message: 'Leave type created successfully',
      leaveType
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Leave type with this name or code already exists' });
    } else {
      console.error('Create leave type error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// @route   GET /api/leave/balance
// @desc    Get leave balance for employee
// @access  Private
router.get('/balance', [
  authenticate,
  query('employeeId').optional().isMongoId(),
  query('year').optional().isInt({ min: 2020, max: 2030 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get employee ID
    let employeeId = req.query.employeeId;
    if (!employeeId) {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      employeeId = employee._id;
    }

    // Check permissions
    if (req.query.employeeId && !['admin', 'hr'].includes(req.user.role)) {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee || employee._id.toString() !== req.query.employeeId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const year = parseInt(req.query.year) || new Date().getFullYear();

    const balances = await LeaveBalance.find({
      employee: employeeId,
      year: year
    }).populate('leaveType', 'name code color');

    // If no balances exist, create default balances based on leave types
    if (balances.length === 0) {
      const leaveTypes = await LeaveType.find({ isActive: true });
      const employee = await Employee.findById(employeeId);
      
      if (employee) {
        const newBalances = [];
        for (const leaveType of leaveTypes) {
          const balance = new LeaveBalance({
            employee: employeeId,
            leaveType: leaveType._id,
            year: year,
            allocated: leaveType.maxDaysPerYear
          });
          await balance.save();
          newBalances.push(balance);
        }
        
        const populatedBalances = await LeaveBalance.find({
          employee: employeeId,
          year: year
        }).populate('leaveType', 'name code color');
        
        return res.json(populatedBalances);
      }
    }

    res.json(balances);
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leave/request
// @desc    Submit leave request
// @access  Private
router.post('/request', [
  authenticate,
  body('leaveType').isIn(['casual', 'sick', 'marriage', 'bereavement']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('reason').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employee = await Employee.findOne({ user: req.user._id })
      .populate('employmentInfo.reportingManager', 'personalInfo.firstName personalInfo.lastName');

    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const { leaveType, startDate, endDate, reason, isEmergency, contactDuringLeave, handoverNotes, handoverTo } = req.body;

    // Validate dates
    const start = moment(startDate);
    const end = moment(endDate);
    
    if (end.isBefore(start)) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    // Calculate total days
    const totalDays = end.diff(start, 'days') + 1;

    // Get or create leave balance for current year
    const currentYear = start.year();
    let balance = await LeaveBalance.findOne({
      employee: employee._id,
      year: currentYear
    });

    if (!balance) {
      balance = new LeaveBalance({
        employee: employee._id,
        year: currentYear
      });
      await balance.save();
    }

    // Validate leave limits and monthly restrictions
    const currentMonth = start.month() + 1; // moment months are 0-indexed
    const monthlyUsage = balance.monthlyUsage.find(m => m.month === currentMonth) || 
      { month: currentMonth, casualUsed: 0, sickUsed: 0, specialUsed: 0 };

    // Check balance availability
    let availableBalance = 0;
    let balanceType = '';
    
    if (leaveType === 'casual') {
      availableBalance = balance.casualLeave.available;
      balanceType = 'casual leave';
      
      // Check monthly limit (1 casual leave per month normally, max 4 in special cases)
      if (monthlyUsage.casualUsed + totalDays > (totalDays <= 4 ? 4 : 1)) {
        return res.status(400).json({ 
          message: `Monthly casual leave limit exceeded. You can take max 1 casual leave per month (or max 4 in special cases)` 
        });
      }
    } else if (leaveType === 'sick') {
      availableBalance = balance.sickLeave.available;
      balanceType = 'sick leave';
      
      // Check monthly limit (1 sick leave per month normally, max 4 in special cases)
      if (monthlyUsage.sickUsed + totalDays > (totalDays <= 4 ? 4 : 1)) {
        return res.status(400).json({ 
          message: `Monthly sick leave limit exceeded. You can take max 1 sick leave per month (or max 4 in special cases)` 
        });
      }
    } else if (leaveType === 'marriage' || leaveType === 'bereavement') {
      availableBalance = balance.specialLeave.available;
      balanceType = 'special leave';
      
      // Special leaves can be taken max 3 days per year
      if (totalDays > 3) {
        return res.status(400).json({ 
          message: `Special leave cannot exceed 3 days per request` 
        });
      }
    }

    if (availableBalance < totalDays) {
      return res.status(400).json({ 
        message: `Insufficient ${balanceType} balance. Available: ${availableBalance}, Requested: ${totalDays}` 
      });
    }

    // Create leave request
    const leaveRequest = new LeaveRequest({
      employee: employee._id,
      leaveType,
      startDate: start.toDate(),
      endDate: end.toDate(),
      totalDays,
      reason,
      isEmergency: isEmergency || false,
      contactDuringLeave,
      handoverNotes,
      handoverTo
    });

    // Set up approval flow based on new requirements
    const approvalFlow = [];
    
    // Get the user's email to check for special cases
    const userEmail = await Employee.findById(employee._id).populate('user', 'email');
    const applicantEmail = userEmail.user?.email;
    
    // Check if applicant is Mihir, Vishnu, or Shobhit (co-founders)
    const isCoFounder = ['mihir@rannkly.com', 'vishnu@rannkly.com', 'shobhit@rannkly.com'].includes(applicantEmail);
    
    // Check if applicant is HR
    const isHREmployee = userEmail.user?.role === 'hr';
    
    console.log(`🔍 Leave approval setup for ${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}:`, {
      email: applicantEmail,
      isCoFounder,
      isHREmployee,
      hasReportingManager: !!employee.employmentInfo.reportingManager
    });
    
    if (isCoFounder) {
      // Co-founders (Mihir, Vishnu, Shobhit) - HR approval only
      console.log('👑 Co-founder detected - HR approval only');
      
      // Find HR employees (exclude self if they are HR)
      const hrEmployees = await Employee.find({
        user: { $exists: true },
        _id: { $ne: employee._id } // Exclude the current employee
      }).populate('user', 'role').exec();
      
      const hrEmployee = hrEmployees.find(emp => emp.user && emp.user.role === 'hr');
      
      if (hrEmployee) {
        approvalFlow.push({
          approver: hrEmployee._id,
          approverType: 'hr',
          level: 1,
          status: 'pending'
        });
        console.log('✅ Added HR approver for co-founder leave request');
      } else {
        console.log('❌ Error: No HR employee found for co-founder leave approval');
      }
    } else if (isHREmployee) {
      // HR employees - Manager approval only (even if manager is admin)
      console.log('🏢 HR employee detected - Manager approval only');
      
      if (employee.employmentInfo.reportingManager) {
        approvalFlow.push({
          approver: employee.employmentInfo.reportingManager._id,
          approverType: 'manager',
          level: 1,
          status: 'pending'
        });
        console.log('✅ Added manager approver for HR employee leave request');
      } else {
        console.log('❌ Error: HR employee has no reporting manager assigned');
      }
    } else {
      // Regular employees - Dual approval (Manager + HR)
      console.log('👤 Regular employee detected - Dual approval (Manager + HR)');
      
      // Add reporting manager to approval flow
      if (employee.employmentInfo.reportingManager) {
        approvalFlow.push({
          approver: employee.employmentInfo.reportingManager._id,
          approverType: 'manager',
          level: 1,
          status: 'pending'
        });
        console.log('✅ Added manager approver for regular employee');
      } else {
        console.log('⚠️ Warning: Regular employee has no reporting manager assigned');
      }
      
      // Find HR employees to add to approval flow
      const hrEmployees = await Employee.find({
        user: { $exists: true },
        _id: { $ne: employee._id } // Exclude the current employee
      }).populate('user', 'role').exec();
      
      const hrEmployee = hrEmployees.find(emp => emp.user && emp.user.role === 'hr');
      
      if (hrEmployee) {
        approvalFlow.push({
          approver: hrEmployee._id,
          approverType: 'hr',
          level: 2,
          status: 'pending'
        });
        console.log('✅ Added HR approver for regular employee');
      } else {
        console.log('❌ Error: No HR employee found for regular employee leave approval');
      }
    }
    
    leaveRequest.approvalFlow = approvalFlow;

    await leaveRequest.save();

    // Update pending balance
    if (leaveType === 'casual') {
      balance.casualLeave.pending += totalDays;
    } else if (leaveType === 'sick') {
      balance.sickLeave.pending += totalDays;
    } else if (leaveType === 'marriage' || leaveType === 'bereavement') {
      balance.specialLeave.pending += totalDays;
    }

    await balance.save();

    const populatedRequest = await LeaveRequest.findById(leaveRequest._id)
      .populate('approvalFlow.approver', 'personalInfo.firstName personalInfo.lastName employeeId');

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leaveRequest: populatedRequest
    });
  } catch (error) {
    console.error('Submit leave request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leave/requests
// @desc    Get leave requests
// @access  Private
router.get('/requests', [
  authenticate,
  query('employeeId').optional().isMongoId(),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    console.log('🔍 GET /api/leave/requests called');
    console.log('👤 User:', req.user.email, '- Role:', req.user.role);
    console.log('📋 Query params:', req.query);
    
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
    } else {
      // Show requests based on role
      if (req.user.role === 'employee') {
        const employee = await Employee.findOne({ user: req.user._id });
        if (employee) {
          filter.employee = employee._id;
        }
      } else if (req.user.role === 'manager') {
        // Show requests for team members AND manager's own requests
        console.log('🔍 Manager role detected, finding team members...');
        const managerEmployee = await Employee.findOne({ user: req.user._id });
        console.log('👤 Manager employee:', managerEmployee ? `${managerEmployee.personalInfo?.firstName} ${managerEmployee.personalInfo?.lastName} (${managerEmployee.employeeId})` : 'Not found');
        
        if (managerEmployee) {
          const teamMembers = await Employee.find({
            'employmentInfo.reportingManager': managerEmployee._id
          }).select('_id employeeId personalInfo.firstName personalInfo.lastName');
          
          console.log(`👥 Found ${teamMembers.length} team members:`);
          teamMembers.forEach(member => {
            console.log(`   - ${member.personalInfo?.firstName} ${member.personalInfo?.lastName} (${member.employeeId})`);
          });
          
          // Include both team members AND the manager's own requests
          const employeeIds = [...teamMembers.map(emp => emp._id), managerEmployee._id];
          filter.employee = { $in: employeeIds };
          console.log(`📋 Manager filter includes ${employeeIds.length} employees (${teamMembers.length} team + 1 manager)`);
          console.log('🔍 Employee IDs in filter:', employeeIds.map(id => id.toString()));
        }
      } else if (req.user.role === 'hr' || req.user.role === 'admin') {
        // HR and Admins can see ALL leave requests
        // No filter applied - they see everything
        console.log(`📋 ${req.user.role.toUpperCase()} user viewing all leave requests`);
      }
    }

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      filter.$or = [
        {
          startDate: {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
          }
        },
        {
          endDate: {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
          }
        }
      ];
    }

    const requests = await LeaveRequest.find(filter)
      .populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName')
      .populate('approvalFlow.approver', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('finalApprover', 'personalInfo.firstName personalInfo.lastName employeeId')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(limit);

    // Filter out requests with null employees (orphaned records)
    const validRequests = requests.filter(request => {
      if (!request.employee) {
        console.log(`⚠️  Leave request with null employee: ${request._id} - ${request.status}`);
        return false;
      }
      return true;
    });

    // Add leave type information manually since it's now a string enum
    const requestsWithLeaveType = validRequests.map(request => {
      const requestObj = request.toObject();
      const leaveTypeMap = {
        casual: { name: 'Casual Leave', code: 'CL', color: '#4CAF50' },
        sick: { name: 'Sick Leave', code: 'SL', color: '#FF9800' },
        marriage: { name: 'Marriage Leave', code: 'ML', color: '#E91E63' },
        bereavement: { name: 'Bereavement Leave', code: 'BL', color: '#607D8B' }
      };
      requestObj.leaveType = leaveTypeMap[request.leaveType] || { name: request.leaveType, code: request.leaveType.toUpperCase(), color: '#9E9E9E' };
      return requestObj;
    });

    const total = await LeaveRequest.countDocuments(filter);

    console.log(`📊 Returning ${requestsWithLeaveType.length} requests out of ${total} total`);
    requestsWithLeaveType.forEach((req, index) => {
      console.log(`   ${index + 1}. ${req.employee.personalInfo?.firstName} ${req.employee.personalInfo?.lastName} - ${req.leaveType.name} - ${req.status}`);
      // Debug: Check approvalFlow in API response
      if (req.employee.personalInfo?.firstName === 'Vikas') {
        console.log('🔍 DEBUG: Vikas request approvalFlow in API response:');
        req.approvalFlow.forEach((approval, i) => {
          console.log(`     ${i + 1}. approverType: '${approval.approverType}', status: ${approval.status}`);
        });
      }
    });

    res.json({
      requests: requestsWithLeaveType,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leave/requests/:id/approve
// @desc    Approve/reject leave request
// @access  Private (Manager, HR, Admin)
router.put('/requests/:id/approve', [
  authenticate,
  authorize(['admin', 'hr', 'manager']),
  body('action').isIn(['approve', 'reject']),
  body('comments').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, comments } = req.body;

    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate({
        path: 'employee',
        populate: {
          path: 'employmentInfo.reportingManager',
          select: 'employeeId personalInfo.firstName personalInfo.lastName'
        }
      });

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if user can approve this request
    const approverEmployee = await Employee.findOne({ user: req.user._id });
    if (!approverEmployee) {
      return res.status(404).json({ message: 'Approver employee profile not found' });
    }

    // Find the approval record for this user
    let userApproval = null;
    let authorizationDetails = {
      userRole: req.user.role,
      userEmployeeId: approverEmployee.employeeId,
      userName: `${approverEmployee.personalInfo?.firstName} ${approverEmployee.personalInfo?.lastName}`,
      requestEmployee: `${leaveRequest.employee.personalInfo?.firstName} ${leaveRequest.employee.personalInfo?.lastName}`,
      reportingManager: leaveRequest.employee.employmentInfo.reportingManager?.toString(),
      approverEmployeeId: approverEmployee._id.toString(),
      approvalFlow: leaveRequest.approvalFlow.map(a => ({
        type: a.approverType,
        approver: a.approver.toString(),
        status: a.status
      }))
    };
    
    // Check authorization based on approval flow
    
    // Check if user is the SPECIFIC reporting manager (not just any manager)
    const isReportingManager = leaveRequest.employee.employmentInfo.reportingManager?._id?.toString() === approverEmployee._id.toString();
    
    // Allow both 'manager' role and 'admin' role users to approve as managers if they are the reporting manager
    if ((req.user.role === 'manager' || req.user.role === 'admin') && isReportingManager) {
      userApproval = leaveRequest.approvalFlow.find(
        approval => approval.approverType === 'manager' && approval.approver._id.toString() === approverEmployee._id.toString()
      );
      
      if (!userApproval) {
        console.log('🚫 Manager authorization failed:', {
          ...authorizationDetails,
          reason: 'Reporting manager not found in approval flow',
          isReportingManager: true
        });
      } else {
        console.log('✅ Manager authorization successful:', {
          ...authorizationDetails,
          reason: `${req.user.role} user is the reporting manager and can approve`,
          isReportingManager: true
        });
      }
    } else if ((req.user.role === 'manager' || req.user.role === 'admin') && !isReportingManager) {
      console.log('🚫 Manager authorization failed:', {
        ...authorizationDetails,
        reason: 'Not the reporting manager for this employee',
        isReportingManager: false,
        actualReportingManager: leaveRequest.employee.employmentInfo.reportingManager?._id?.toString()
      });
    }
    
    // Check if user is HR (only HR can approve, not admins)
    if (req.user.role === 'hr') {
      userApproval = leaveRequest.approvalFlow.find(
        approval => approval.approverType === 'hr' && approval.approver._id.toString() === approverEmployee._id.toString()
      );
      
      if (!userApproval) {
        console.log('🚫 HR authorization failed:', {
          ...authorizationDetails,
          reason: 'HR not found in approval flow for this request'
        });
      }
    } else if (req.user.role === 'admin') {
      // Admin users can approve if they are in the approval flow as managers (for their direct reports) or as admins (fallback)
      userApproval = leaveRequest.approvalFlow.find(
        approval => (approval.approverType === 'manager' || approval.approverType === 'admin') && 
                   approval.approver._id.toString() === approverEmployee._id.toString()
      );
      
      if (userApproval) {
        console.log('✅ Admin authorized to approve:', {
          ...authorizationDetails,
          reason: `Admin can approve as ${userApproval.approverType}`,
          approverType: userApproval.approverType
        });
      } else {
        // Admins can VIEW all requests but cannot APPROVE them unless specifically in approval flow
        console.log('🚫 Admin authorization failed:', {
          ...authorizationDetails,
          reason: 'Admin not found in approval flow as manager or admin. Admins can only approve when they are the reporting manager or specifically assigned.'
        });
      }
    }
    

    if (!userApproval) {
      let detailedMessage = `You are not authorized to approve this leave request. `;
      
      if (req.user.role === 'manager' || req.user.role === 'admin') {
        const isReportingManager = leaveRequest.employee.employmentInfo.reportingManager?._id?.toString() === approverEmployee._id.toString();
        if (!isReportingManager) {
          detailedMessage += `You are not the reporting manager for ${authorizationDetails.requestEmployee}. Only the direct reporting manager can approve this leave request. `;
        } else {
          detailedMessage += `You are not listed as the manager approver in the approval flow for this request. `;
        }
      } else if (req.user.role === 'hr') {
        detailedMessage += `You are not listed as the HR approver in the approval flow for this request. `;
      } else {
        detailedMessage += `Your role (${req.user.role}) does not have approval permissions. Only reporting managers and HR can approve leave requests. `;
      }
      
      detailedMessage += `Current approval flow: ${leaveRequest.approvalFlow.map(a => `${a.approverType} (${a.status})`).join(', ')}`;
      
      console.log('🚫 Authorization failed details:', authorizationDetails);
      
      return res.status(403).json({ 
        message: detailedMessage,
        details: {
          userRole: req.user.role,
          userName: authorizationDetails.userName,
          requestEmployee: authorizationDetails.requestEmployee,
          approvalFlow: authorizationDetails.approvalFlow,
          reason: 'Not authorized to approve this request'
        }
      });
    }

    if (userApproval.status !== 'pending') {
      return res.status(400).json({ message: 'You have already processed this leave request' });
    }

    // Update the specific approval
    userApproval.status = action === 'approve' ? 'approved' : 'rejected';
    userApproval.comments = comments;
    userApproval.actionDate = new Date();

    if (action === 'approve') {
      // Get all approvals in the flow
      const managerApproval = leaveRequest.approvalFlow.find(approval => approval.approverType === 'manager');
      const hrApproval = leaveRequest.approvalFlow.find(approval => approval.approverType === 'hr');
      
      const managerApproved = managerApproval && managerApproval.status === 'approved';
      const hrApproved = hrApproval && hrApproval.status === 'approved';
      
      // Determine if leave should be fully approved based on approval flow requirements
      let shouldBeFullyApproved = false;
      
      if (leaveRequest.approvalFlow.length === 1) {
        // Single approval required (co-founders or HR employees)
        const singleApproval = leaveRequest.approvalFlow[0];
        shouldBeFullyApproved = singleApproval.status === 'approved';
        console.log('📋 Single approval workflow:', {
          approverType: singleApproval.approverType,
          status: singleApproval.status,
          shouldBeFullyApproved
        });
      } else if (leaveRequest.approvalFlow.length === 2) {
        // Dual approval required (regular employees)
        shouldBeFullyApproved = managerApproved && hrApproved;
        console.log('📋 Dual approval workflow:', {
          managerApproved,
          hrApproved,
          shouldBeFullyApproved
        });
      }
      
      if (shouldBeFullyApproved) {
        // All required approvals completed - final approval
        leaveRequest.status = 'approved';
        leaveRequest.finalApprover = approverEmployee._id;
        leaveRequest.finalApprovalDate = new Date();

        console.log('✅ Leave request fully approved');

        // Update leave balance
        const balance = await LeaveBalance.findOne({
          employee: leaveRequest.employee._id,
          year: new Date(leaveRequest.startDate).getFullYear()
        });

        if (balance) {
          const requestMonth = new Date(leaveRequest.startDate).getMonth() + 1;
          
          // Update balance based on leave type
          if (leaveRequest.leaveType === 'casual') {
            balance.casualLeave.used += leaveRequest.totalDays;
            balance.casualLeave.pending -= leaveRequest.totalDays;
          } else if (leaveRequest.leaveType === 'sick') {
            balance.sickLeave.used += leaveRequest.totalDays;
            balance.sickLeave.pending -= leaveRequest.totalDays;
          } else if (leaveRequest.leaveType === 'marriage' || leaveRequest.leaveType === 'bereavement') {
            balance.specialLeave.used += leaveRequest.totalDays;
            balance.specialLeave.pending -= leaveRequest.totalDays;
          }

          // Update monthly usage
          let monthlyUsage = balance.monthlyUsage.find(m => m.month === requestMonth);
          if (!monthlyUsage) {
            monthlyUsage = { month: requestMonth, casualUsed: 0, sickUsed: 0, specialUsed: 0 };
            balance.monthlyUsage.push(monthlyUsage);
          }

          if (leaveRequest.leaveType === 'casual') {
            monthlyUsage.casualUsed += leaveRequest.totalDays;
          } else if (leaveRequest.leaveType === 'sick') {
            monthlyUsage.sickUsed += leaveRequest.totalDays;
          } else if (leaveRequest.leaveType === 'marriage' || leaveRequest.leaveType === 'bereavement') {
            monthlyUsage.specialUsed += leaveRequest.totalDays;
          }

          await balance.save();
        }
      } else if (leaveRequest.approvalFlow.length === 2 && (managerApproved || hrApproved)) {
        // Dual approval workflow - one has approved, waiting for the other
        leaveRequest.status = 'partially_approved';
        console.log('⏳ Leave request partially approved - waiting for second approval');
      }
      // If no approvals yet or single approval not complete, status remains 'pending'
    } else {
      // Rejected by either manager or HR
      leaveRequest.status = 'rejected';
      leaveRequest.rejectionReason = comments;

      // Return pending balance
      const balance = await LeaveBalance.findOne({
        employee: leaveRequest.employee._id,
        year: new Date(leaveRequest.startDate).getFullYear()
      });

      if (balance) {
        // Return pending balance based on leave type
        if (leaveRequest.leaveType === 'casual') {
          balance.casualLeave.pending -= leaveRequest.totalDays;
        } else if (leaveRequest.leaveType === 'sick') {
          balance.sickLeave.pending -= leaveRequest.totalDays;
        } else if (leaveRequest.leaveType === 'marriage' || leaveRequest.leaveType === 'bereavement') {
          balance.specialLeave.pending -= leaveRequest.totalDays;
        }
        await balance.save();
      }
    }

    await leaveRequest.save();

    const updatedRequest = await LeaveRequest.findById(leaveRequest._id)
      .populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName')
      .populate('approvalFlow.approver', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('finalApprover', 'personalInfo.firstName personalInfo.lastName employeeId');

    // Add leave type information manually
    const updatedRequestObj = updatedRequest.toObject();
    const leaveTypeMap = {
      casual: { name: 'Casual Leave', code: 'CL', color: '#4CAF50' },
      sick: { name: 'Sick Leave', code: 'SL', color: '#FF9800' },
      marriage: { name: 'Marriage Leave', code: 'ML', color: '#E91E63' },
      bereavement: { name: 'Bereavement Leave', code: 'BL', color: '#607D8B' }
    };
    updatedRequestObj.leaveType = leaveTypeMap[updatedRequest.leaveType] || { name: updatedRequest.leaveType, code: updatedRequest.leaveType.toUpperCase(), color: '#9E9E9E' };

    res.json({
      message: `Leave request ${action}d successfully`,
      leaveRequest: updatedRequestObj
    });
  } catch (error) {
    console.error('Approve leave request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leave/calendar
// @desc    Get leave calendar
// @access  Private
router.get('/calendar', [
  authenticate,
  query('year').optional().isInt({ min: 2020, max: 2030 }),
  query('month').optional().isInt({ min: 1, max: 12 })
], async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month);

    let dateFilter = {};
    if (month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter = {
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } },
          { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
        ]
      };
    } else {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      dateFilter = {
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } },
          { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
        ]
      };
    }

    // Get approved leave requests
    const leaveRequests = await LeaveRequest.find({
      ...dateFilter,
      status: 'approved'
    })
      .populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName')
      .populate('leaveType', 'name code color')
      .select('employee leaveType startDate endDate totalDays');

    // Get holidays
    const holidays = await Holiday.find({
      date: {
        $gte: month ? new Date(year, month - 1, 1) : new Date(year, 0, 1),
        $lte: month ? new Date(year, month, 0) : new Date(year, 11, 31)
      }
    });

    res.json({
      leaveRequests,
      holidays,
      year,
      month
    });
  } catch (error) {
    console.error('Get leave calendar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leave/holidays
// @desc    Get holidays
// @access  Private
router.get('/holidays', [
  authenticate,
  query('year').optional().isInt({ min: 2020, max: 2030 })
], async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const holidays = await Holiday.find({
      date: {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31)
      }
    }).sort({ date: 1 });

    res.json(holidays);
  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leave/holidays
// @desc    Add holiday
// @access  Private (HR, Admin)
router.post('/holidays', [
  authenticate,
  authorize(['admin', 'hr']),
  body('name').notEmpty().trim(),
  body('date').isISO8601(),
  body('type').isIn(['national', 'regional', 'optional', 'company'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const holiday = new Holiday(req.body);
    await holiday.save();

    res.status(201).json({
      message: 'Holiday added successfully',
      holiday
    });
  } catch (error) {
    console.error('Add holiday error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leave/my-summary
// @desc    Get current user's leave summary
// @access  Private (Employee)
router.get('/my-summary', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const currentYear = new Date().getFullYear();
    
    // Get or create leave balance for current year
    let leaveBalance = await LeaveBalance.findOne({ 
      employee: employee._id, 
      year: currentYear 
    });

    if (!leaveBalance) {
      leaveBalance = new LeaveBalance({
        employee: employee._id,
        year: currentYear
      });
      await leaveBalance.save();
    }

    // Get upcoming approved leaves
    const upcomingLeaves = await LeaveRequest.find({
      employee: employee._id,
      status: 'approved',
      startDate: { $gt: new Date() }
    }).sort({ startDate: 1 });

    const upcoming = upcomingLeaves.map(leave => ({
      type: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      totalDays: leave.totalDays,
      reason: leave.reason
    }));

    // Calculate totals
    const totalUsed = leaveBalance.casualLeave.used + leaveBalance.sickLeave.used + leaveBalance.specialLeave.used;
    const totalPending = leaveBalance.casualLeave.pending + leaveBalance.sickLeave.pending + leaveBalance.specialLeave.pending;
    const totalAvailable = leaveBalance.casualLeave.available + leaveBalance.sickLeave.available + leaveBalance.specialLeave.available;

    res.json({
      available: totalAvailable,
      used: totalUsed,
      pending: totalPending,
      upcoming,
      balance: {
        casualLeave: leaveBalance.casualLeave.available,
        sickLeave: leaveBalance.sickLeave.available,
        specialLeave: leaveBalance.specialLeave.available
      },
      detailed: {
        casual: leaveBalance.casualLeave,
        sick: leaveBalance.sickLeave,
        special: leaveBalance.specialLeave
      }
    });
  } catch (error) {
    console.error('Get leave summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leave/employee-balance/:employeeId
// @desc    Get leave balance for specific employee (for employee profile display)
// @access  Private
router.get('/employee-balance/:employeeId', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const currentYear = new Date().getFullYear();
    
    // Get or create leave balance for current year
    let leaveBalance = await LeaveBalance.findOne({ 
      employee: employeeId, 
      year: currentYear 
    });

    if (!leaveBalance) {
      leaveBalance = new LeaveBalance({
        employee: employeeId,
        year: currentYear
      });
      await leaveBalance.save();
    }

    res.json({
      casualLeave: leaveBalance.casualLeave,
      sickLeave: leaveBalance.sickLeave,
      specialLeave: leaveBalance.specialLeave
    });
  } catch (error) {
    console.error('Get employee leave balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leave/debug-user
// @desc    Debug current user information
// @access  Private
router.get('/debug-user', authenticate, async (req, res) => {
  try {
    const currentEmployee = await Employee.findOne({ user: req.user._id })
      .populate('user', 'email role isActive')
      .populate('employmentInfo.reportingManager', 'employeeId personalInfo.firstName personalInfo.lastName');

    const debugInfo = {
      currentUser: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive
      },
      currentEmployee: currentEmployee ? {
        id: currentEmployee._id,
        employeeId: currentEmployee.employeeId,
        name: `${currentEmployee.personalInfo?.firstName} ${currentEmployee.personalInfo?.lastName}`,
        designation: currentEmployee.employmentInfo?.designation,
        isActive: currentEmployee.employmentInfo?.isActive,
        reportingManager: currentEmployee.employmentInfo?.reportingManager ? {
          id: currentEmployee.employmentInfo.reportingManager._id,
          employeeId: currentEmployee.employmentInfo.reportingManager.employeeId,
          name: `${currentEmployee.employmentInfo.reportingManager.personalInfo?.firstName} ${currentEmployee.employmentInfo.reportingManager.personalInfo?.lastName}`
        } : null
      } : null,
      authorizationRules: {
        canViewAllRequests: req.user.role === 'hr' || req.user.role === 'admin',
        canApproveAsHR: req.user.role === 'hr',
        canApproveAsManager: req.user.role === 'manager',
        canApproveAsAdmin: false // Admins cannot approve
      }
    };

    res.json(debugInfo);
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/leave/debug-approval/:id
// @desc    Debug approval authorization for a specific leave request
// @access  Private
router.get('/debug-approval/:id', authenticate, async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName employmentInfo.reportingManager')
      .populate('approvalFlow.approver', 'employeeId personalInfo.firstName personalInfo.lastName user');

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const approverEmployee = await Employee.findOne({ user: req.user._id })
      .populate('user', 'role email');

    const debugInfo = {
      currentUser: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        employeeId: approverEmployee?.employeeId,
        employeeName: `${approverEmployee?.personalInfo?.firstName} ${approverEmployee?.personalInfo?.lastName}`,
        employeeObjectId: approverEmployee?._id?.toString()
      },
      leaveRequest: {
        id: leaveRequest._id,
        employee: {
          id: leaveRequest.employee._id,
          name: `${leaveRequest.employee.personalInfo?.firstName} ${leaveRequest.employee.personalInfo?.lastName}`,
          employeeId: leaveRequest.employee.employeeId,
          reportingManager: leaveRequest.employee.employmentInfo?.reportingManager?.toString()
        },
        status: leaveRequest.status,
        approvalFlow: leaveRequest.approvalFlow.map(approval => ({
          approverType: approval.approverType,
          approverId: approval.approver._id.toString(),
          approverName: `${approval.approver.personalInfo?.firstName} ${approval.approver.personalInfo?.lastName}`,
          approverEmployeeId: approval.approver.employeeId,
          status: approval.status,
          level: approval.level
        }))
      },
      authorization: {
        isReportingManager: leaveRequest.employee.employmentInfo?.reportingManager?.toString() === approverEmployee?._id?.toString(),
        hasManagerApproval: leaveRequest.approvalFlow.some(a => 
          a.approverType === 'manager' && a.approver._id.toString() === approverEmployee?._id?.toString()
        ),
        hasHRApproval: leaveRequest.approvalFlow.some(a => 
          a.approverType === 'hr' && a.approver._id.toString() === approverEmployee?._id?.toString()
        ),
        canApproveAsManager: req.user.role === 'manager' && 
          leaveRequest.employee.employmentInfo?.reportingManager?.toString() === approverEmployee?._id?.toString(),
        canApproveAsHR: (req.user.role === 'hr' || req.user.role === 'admin') &&
          leaveRequest.approvalFlow.some(a => 
            a.approverType === 'hr' && a.approver._id.toString() === approverEmployee?._id?.toString()
          )
      }
    };

    res.json(debugInfo);
  } catch (error) {
    console.error('Debug approval error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

