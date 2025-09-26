const express = require('express');
const { body, query, validationResult } = require('express-validator');
const moment = require('moment');
const { LeaveType, LeaveBalance, LeaveRequest, Holiday } = require('../models/Leave');
const Employee = require('../models/Employee');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/leave/types
// @desc    Get all leave types
// @access  Private
router.get('/types', authenticate, async (req, res) => {
  try {
    const leaveTypes = await LeaveType.find({ isActive: true }).sort({ name: 1 });
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
  body('leaveType').isMongoId(),
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

    // Check if leave type exists
    const leaveTypeDoc = await LeaveType.findById(leaveType);
    if (!leaveTypeDoc) {
      return res.status(404).json({ message: 'Leave type not found' });
    }

    // Calculate total days
    const totalDays = end.diff(start, 'days') + 1;

    // Check leave balance
    const currentYear = start.year();
    const balance = await LeaveBalance.findOne({
      employee: employee._id,
      leaveType: leaveType,
      year: currentYear
    });

    if (balance && balance.available < totalDays) {
      return res.status(400).json({ 
        message: `Insufficient leave balance. Available: ${balance.available}, Requested: ${totalDays}` 
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

    // Set up approval flow
    if (employee.employmentInfo.reportingManager) {
      leaveRequest.approvalFlow.push({
        approver: employee.employmentInfo.reportingManager._id,
        level: 1,
        status: 'pending'
      });
    }

    await leaveRequest.save();

    // Update pending balance
    if (balance) {
      balance.pending += totalDays;
      await balance.save();
    }

    const populatedRequest = await LeaveRequest.findById(leaveRequest._id)
      .populate('leaveType', 'name code color')
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
        // Show requests for team members
        const managerEmployee = await Employee.findOne({ user: req.user._id });
        if (managerEmployee) {
          const teamMembers = await Employee.find({
            'employmentInfo.reportingManager': managerEmployee._id
          }).select('_id');
          filter.employee = { $in: teamMembers.map(emp => emp._id) };
        }
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
      .populate('leaveType', 'name code color')
      .populate('approvalFlow.approver', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('finalApprover', 'personalInfo.firstName personalInfo.lastName employeeId')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LeaveRequest.countDocuments(filter);

    res.json({
      requests,
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
      .populate('employee', 'employmentInfo.reportingManager personalInfo.firstName personalInfo.lastName')
      .populate('leaveType');

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if user can approve this request
    const approverEmployee = await Employee.findOne({ user: req.user._id });
    if (!approverEmployee) {
      return res.status(404).json({ message: 'Approver employee profile not found' });
    }

    // Check permissions
    if (req.user.role === 'manager') {
      if (leaveRequest.employee.employmentInfo.reportingManager?.toString() !== approverEmployee._id.toString()) {
        return res.status(403).json({ message: 'Can only approve your team members requests' });
      }
    }

    // Find current approval level
    const currentApproval = leaveRequest.approvalFlow.find(
      approval => approval.level === leaveRequest.currentApprovalLevel
    );

    if (!currentApproval) {
      return res.status(400).json({ message: 'No pending approval found' });
    }

    // Update approval
    currentApproval.status = action === 'approve' ? 'approved' : 'rejected';
    currentApproval.comments = comments;
    currentApproval.actionDate = new Date();

    if (action === 'approve') {
      // Check if there are more approval levels
      const nextLevel = leaveRequest.currentApprovalLevel + 1;
      const nextApproval = leaveRequest.approvalFlow.find(approval => approval.level === nextLevel);

      if (nextApproval) {
        leaveRequest.currentApprovalLevel = nextLevel;
      } else {
        // Final approval
        leaveRequest.status = 'approved';
        leaveRequest.finalApprover = approverEmployee._id;
        leaveRequest.finalApprovalDate = new Date();

        // Update leave balance
        const balance = await LeaveBalance.findOne({
          employee: leaveRequest.employee._id,
          leaveType: leaveRequest.leaveType._id,
          year: new Date(leaveRequest.startDate).getFullYear()
        });

        if (balance) {
          balance.used += leaveRequest.totalDays;
          balance.pending -= leaveRequest.totalDays;
          await balance.save();
        }
      }
    } else {
      // Rejected
      leaveRequest.status = 'rejected';
      leaveRequest.rejectionReason = comments;

      // Return pending balance
      const balance = await LeaveBalance.findOne({
        employee: leaveRequest.employee._id,
        leaveType: leaveRequest.leaveType._id,
        year: new Date(leaveRequest.startDate).getFullYear()
      });

      if (balance) {
        balance.pending -= leaveRequest.totalDays;
        await balance.save();
      }
    }

    await leaveRequest.save();

    const updatedRequest = await LeaveRequest.findById(leaveRequest._id)
      .populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName')
      .populate('leaveType', 'name code color')
      .populate('approvalFlow.approver', 'personalInfo.firstName personalInfo.lastName employeeId')
      .populate('finalApprover', 'personalInfo.firstName personalInfo.lastName employeeId');

    res.json({
      message: `Leave request ${action}d successfully`,
      leaveRequest: updatedRequest
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

module.exports = router;

