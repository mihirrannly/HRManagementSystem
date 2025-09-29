const express = require('express');
const { body, query, validationResult } = require('express-validator');
const moment = require('moment');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { LeaveRequest } = require('../models/Leave');
const { authenticate, authorize } = require('../middleware/auth');
const { checkPermissions, MODULES, ACTIONS } = require('../middleware/permissions');
const attendanceService = require('../services/attendanceService');

const router = express.Router();

// @route   GET /api/attendance/my-summary
// @desc    Get attendance summary for current employee
// @access  Private (Employee)
router.get('/my-summary', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // For now, return mock data since we don't have real attendance records
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Calculate working days in current month (excluding weekends)
    let totalWorkingDays = 0;
    let presentDays = 0;
    let lateDays = 0;
    
    for (let d = new Date(startOfMonth); d <= currentDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) { // Not weekend
        totalWorkingDays++;
        if (Math.random() > 0.1) { // 90% attendance
          presentDays++;
          if (Math.random() > 0.8) { // 20% late when present
            lateDays++;
          }
        }
      }
    }

    res.json({
      present: presentDays,
      absent: totalWorkingDays - presentDays,
      late: lateDays,
      totalWorkingDays,
      attendancePercentage: Math.round((presentDays / totalWorkingDays) * 100)
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance status for current employee
// @access  Private (Employee)
router.get('/today', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // For now, return mock data
    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    
    if (isWeekend) {
      return res.json({ message: 'Weekend - No attendance required' });
    }

    // Mock today's attendance
    const hasCheckedIn = Math.random() > 0.3; // 70% chance of checking in
    const hasCheckedOut = hasCheckedIn && Math.random() > 0.5; // 50% chance of checking out if checked in

    if (hasCheckedIn) {
      const checkInTime = new Date();
      checkInTime.setHours(9, Math.floor(Math.random() * 60), 0, 0);
      
      const response = {
        checkedIn: true,
        checkIn: checkInTime,
        checkedOut: hasCheckedOut
      };

      if (hasCheckedOut) {
        const checkOutTime = new Date();
        checkOutTime.setHours(17 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);
        response.checkOut = checkOutTime;
        response.totalHours = Math.round((checkOutTime - checkInTime) / (1000 * 60 * 60) * 10) / 10;
      }

      res.json(response);
    } else {
      res.json({ checkedIn: false, checkedOut: false });
    }
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance/mark
// @desc    Mark attendance (check-in/check-out)
// @access  Private (Employee)
router.post('/mark', authenticate, async (req, res) => {
  try {
    const { type } = req.body; // 'check-in' or 'check-out'
    
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // For now, just return success message
    const currentTime = new Date();
    
    res.json({
      message: `Successfully ${type.replace('-', 'ed ')} at ${currentTime.toLocaleTimeString()}`,
      type,
      time: currentTime,
      employee: employee.employeeId
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance
// @desc    Get attendance records for current user
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 30, startDate, endDate } = req.query;
    
    // Build query
    const query = { user: req.user.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // For now, return mock attendance data since we don't have real records
    const mockAttendanceRecords = [];
    const currentDate = new Date();
    
    // Generate mock data for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const isPresent = Math.random() > 0.1; // 90% attendance rate
      const isLate = isPresent && Math.random() > 0.8; // 20% late when present
      
      if (isPresent) {
        const checkInHour = isLate ? 9 + Math.floor(Math.random() * 2) : 9; // 9-11 AM if late, 9 AM if on time
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkOutHour = 17 + Math.floor(Math.random() * 3); // 5-8 PM
        const checkOutMinute = Math.floor(Math.random() * 60);
        
        const checkInTime = new Date(date);
        checkInTime.setHours(checkInHour, checkInMinute, 0, 0);
        
        const checkOutTime = new Date(date);
        checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);
        
        const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        const lateMinutes = isLate ? (checkInHour - 9) * 60 + checkInMinute : 0;
        
        mockAttendanceRecords.push({
          _id: `mock_${date.toISOString().split('T')[0]}`,
          date: date,
          checkIn: { time: checkInTime },
          checkOut: { time: checkOutTime },
          totalHours: totalHours,
          status: isLate ? 'late' : 'present',
          isLate: isLate,
          lateMinutes: lateMinutes
        });
      } else {
        mockAttendanceRecords.push({
          _id: `mock_${date.toISOString().split('T')[0]}`,
          date: date,
          checkIn: null,
          checkOut: null,
          totalHours: 0,
          status: 'absent',
          isLate: false,
          lateMinutes: 0
        });
      }
    }
    
    // Calculate stats
    const totalDays = mockAttendanceRecords.length;
    const presentDays = mockAttendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const absentDays = mockAttendanceRecords.filter(r => r.status === 'absent').length;
    const lateDays = mockAttendanceRecords.filter(r => r.status === 'late').length;
    const totalHours = mockAttendanceRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const averageHours = presentDays > 0 ? totalHours / presentDays : 0;
    
    const stats = {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      totalHours: Math.round(totalHours * 100) / 100,
      averageHours: Math.round(averageHours * 100) / 100
    };
    
    res.json({
      attendance: mockAttendanceRecords.reverse(), // Most recent first
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: 1,
        totalRecords: mockAttendanceRecords.length,
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/status
// @desc    Get attendance status for current user
// @access  Private
router.get('/status', authenticate, async (req, res) => {
  try {
    // For now, return mock attendance data
    // In a real system, this would come from an attendance tracking system
    
    const today = new Date();
    const currentTime = today.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    // Mock attendance status
    const attendanceStatus = {
      date: today.toISOString().split('T')[0],
      status: 'present', // present, absent, late, half-day
      checkIn: '09:15',
      checkOut: null, // null if not checked out yet
      workingHours: '0:00',
      location: 'Office',
      isLate: false,
      breakTime: '00:30',
      overtime: '00:00'
    };

    // If current time is after 6 PM, simulate check-out
    const currentHour = today.getHours();
    if (currentHour >= 18) {
      attendanceStatus.checkOut = '18:30';
      attendanceStatus.workingHours = '8:45';
    } else {
      // Calculate working hours so far
      const checkInTime = new Date(`${today.toDateString()} 09:15`);
      const diffMs = today - checkInTime;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      attendanceStatus.workingHours = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    res.json(attendanceStatus);

  } catch (error) {
    console.error('Error fetching attendance status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance/checkin
// @desc    Check in for attendance
// @access  Private
router.post('/checkin', authenticate, async (req, res) => {
  try {
    console.log('📥 Check-in request received:', req.body);

    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const { location, deviceInfo } = req.body;
    const today = moment().startOf('day').toDate();
    
    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (existingAttendance && existingAttendance.checkIn?.time) {
      return res.status(400).json({ 
        success: false,
        message: 'Already checked in today' 
      });
    }

    // Create or update attendance record
    const checkInTime = new Date();
    const attendanceData = {
      employee: employee._id,
      date: today,
      checkIn: {
        time: checkInTime,
        location: location || { latitude: 28.6139, longitude: 77.2090, address: 'Test Location' },
        method: 'web',
        deviceInfo: deviceInfo || { userAgent: req.headers['user-agent'] },
        ipAddress: req.ip || '127.0.0.1',
        isValidLocation: true
      },
      status: 'present'
    };

    let attendance;
    if (existingAttendance) {
      Object.assign(existingAttendance, attendanceData);
      attendance = await existingAttendance.save();
    } else {
      attendance = new Attendance(attendanceData);
      await attendance.save();
    }

    console.log('✅ Check-in successful for employee:', employee.employeeId);

    res.json({
      success: true,
      message: `Check-in successful at ${moment(checkInTime).format('HH:mm')}`,
      attendance: {
        checkIn: attendance.checkIn,
        status: attendance.status
      }
    });

  } catch (error) {
    console.error('❌ Error checking in:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to check in',
      details: error.stack
    });
  }
});

// @route   POST /api/attendance/checkout
// @desc    Check out for attendance
// @access  Private
router.post('/checkout', authenticate, async (req, res) => {
  try {
    console.log('📤 Check-out request received:', req.body);

    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const { location, deviceInfo, earlyLeaveReason } = req.body;
    const today = moment().startOf('day').toDate();
    
    // Find today's attendance record
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (!attendance || !attendance.checkIn?.time) {
      return res.status(400).json({ 
        success: false,
        message: 'Please check-in first before checking out' 
      });
    }

    if (attendance.checkOut?.time) {
      return res.status(400).json({ 
        success: false,
        message: 'Already checked out today' 
      });
    }

    // Update attendance record with checkout
    const checkOutTime = new Date();
    attendance.checkOut = {
      time: checkOutTime,
      location: location || { latitude: 28.6139, longitude: 77.2090, address: 'Test Location' },
      method: 'web',
      deviceInfo: deviceInfo || { userAgent: req.headers['user-agent'] },
      ipAddress: req.ip || '127.0.0.1',
      earlyLeaveReason: earlyLeaveReason || null,
      isValidLocation: true
    };

    // Calculate total hours
    const totalMs = checkOutTime - attendance.checkIn.time;
    attendance.totalHours = totalMs / (1000 * 60 * 60); // Convert to hours

    await attendance.save();

    console.log('✅ Check-out successful for employee:', employee.employeeId);

    res.json({
      success: true,
      message: `Check-out successful at ${moment(checkOutTime).format('HH:mm')}`,
      totalHours: attendance.totalHours,
      attendance: {
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        totalHours: attendance.totalHours
      }
    });

  } catch (error) {
    console.error('❌ Error checking out:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to check out',
      details: error.stack
    });
  }
});

// @route   POST /api/attendance/idle-session
// @desc    Record idle session
// @access  Private
router.post('/idle-session', [
  authenticate,
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('reason').optional().isString(),
  body('wasWarned').optional().isBoolean(),
  body('autoLogout').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const { startTime, endTime, reason, wasWarned, autoLogout } = req.body;

    const result = await attendanceService.recordIdleSession(
      employee._id,
      new Date(startTime),
      new Date(endTime),
      reason,
      wasWarned,
      autoLogout
    );

    res.json(result);

  } catch (error) {
    console.error('Error recording idle session:', error);
    res.status(400).json({ 
      success: false,
      message: error.message || 'Failed to record idle session' 
    });
  }
});

// @route   GET /api/attendance/today-status
// @desc    Get today's attendance status for current employee
// @access  Private
router.get('/today-status', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Simplified for testing - just check today's attendance record
    const today = moment().startOf('day').toDate();
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (!attendance) {
      return res.json({
        status: 'not-checked-in',
        message: 'Not checked in yet'
      });
    }

    res.json({
      status: attendance.status || 'present',
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      totalHours: attendance.totalHours,
      isLate: attendance.isLate,
      lateMinutes: attendance.lateMinutes,
      breaks: attendance.breaks,
      idleTime: attendance.idleTime
    });

  } catch (error) {
    console.error('Error fetching today status:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// @route   GET /api/attendance/summary
// @desc    Get attendance summary for date range
// @access  Private
router.get('/summary', [
  authenticate,
  checkPermissions(MODULES.ATTENDANCE, ACTIONS.READ),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('employeeId').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let employeeId = req.query.employeeId;
    
    // If no employeeId provided, use current user's employee record
    if (!employeeId) {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      employeeId = employee._id;
    } else {
      // Check permissions for viewing other employee's data
      if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const startDate = req.query.startDate || moment().startOf('month').toISOString();
    const endDate = req.query.endDate || moment().endOf('month').toISOString();

    // Simplified for testing - return basic structure
    const start = moment(startDate).startOf('day').toDate();
    const end = moment(endDate).endOf('day').toDate();

    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

    // Basic stats calculation
    const stats = {
      totalDays: 0,
      presentDays: attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length,
      absentDays: attendanceRecords.filter(r => r.status === 'absent').length,
      lateDays: attendanceRecords.filter(r => r.status === 'late').length,
      totalHours: attendanceRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0),
      averageHours: 0
    };

    stats.averageHours = stats.presentDays > 0 ? stats.totalHours / stats.presentDays : 0;

    res.json({
      records: attendanceRecords,
      stats
    });

  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/team-summary
// @desc    Get team attendance summary (for managers)
// @access  Private (Manager, HR, Admin)
router.get('/team-summary', [
  authenticate,
  authorize(['admin', 'hr', 'manager']),
  query('date').optional().isISO8601()
], async (req, res) => {
  try {
    const date = req.query.date ? moment(req.query.date).startOf('day').toDate() : moment().startOf('day').toDate();
    
    let employeeFilter = {};
    
    if (req.user.role === 'manager') {
      // Get manager's employee record
      const managerEmployee = await Employee.findOne({ user: req.user._id });
      if (!managerEmployee) {
        return res.status(404).json({ message: 'Manager employee profile not found' });
      }
      
      // Find team members
      const teamMembers = await Employee.find({
        'employmentInfo.reportingManager': managerEmployee._id,
        'employmentInfo.isActive': true
      }).select('_id personalInfo.firstName personalInfo.lastName employeeId');
      
      employeeFilter = { employee: { $in: teamMembers.map(emp => emp._id) } };
    }

    // Get attendance records for the date
    const attendanceRecords = await Attendance.find({
      ...employeeFilter,
      date: date
    }).populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName employmentInfo.department')
      .populate('leaveRequest', 'leaveType status');

    // Get all employees for the filter (to show who didn't check in)
    const allEmployees = await Employee.find(
      req.user.role === 'manager' 
        ? { 'employmentInfo.reportingManager': (await Employee.findOne({ user: req.user._id }))._id, 'employmentInfo.isActive': true }
        : { 'employmentInfo.isActive': true }
    ).select('_id personalInfo.firstName personalInfo.lastName employeeId');

    // Create summary
    const summary = {
      date: date,
      totalEmployees: allEmployees.length,
      present: 0,
      absent: 0,
      late: 0,
      onLeave: 0,
      weekend: attendanceService.isWeekendOrHoliday(date),
      employees: []
    };

    // Process each employee
    for (const employee of allEmployees) {
      const attendanceRecord = attendanceRecords.find(
        record => record.employee._id.toString() === employee._id.toString()
      );

      let status = 'absent';
      let checkInTime = null;
      let checkOutTime = null;
      let totalHours = 0;
      let isLate = false;
      let lateMinutes = 0;

      if (attendanceRecord) {
        status = attendanceRecord.status;
        checkInTime = attendanceRecord.checkIn?.time;
        checkOutTime = attendanceRecord.checkOut?.time;
        totalHours = attendanceRecord.totalHours || 0;
        isLate = attendanceRecord.isLate;
        lateMinutes = attendanceRecord.lateMinutes || 0;
      } else {
        // Check if employee is on leave
        const leaveRequest = await attendanceService.isEmployeeOnLeave(employee._id, date);
        if (leaveRequest) {
          status = 'on-leave';
        }
      }

      // Count for summary
      switch (status) {
        case 'present':
          summary.present++;
          break;
        case 'late':
          summary.present++;
          summary.late++;
          break;
        case 'absent':
          summary.absent++;
          break;
        case 'on-leave':
          summary.onLeave++;
          break;
      }

      summary.employees.push({
        employee: {
          _id: employee._id,
          employeeId: employee.employeeId,
          name: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`
        },
        status,
        checkInTime,
      checkOutTime,
        totalHours,
        isLate,
        lateMinutes
      });
    }

    res.json(summary);

  } catch (error) {
    console.error('Error fetching team summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/attendance/:id/manual-entry
// @desc    Manual attendance entry (for HR/Admin)
// @access  Private (HR, Admin)
router.put('/:id/manual-entry', [
  authenticate,
  authorize(['admin', 'hr']),
  body('checkInTime').optional().isISO8601(),
  body('checkOutTime').optional().isISO8601(),
  body('status').isIn(['present', 'absent', 'late', 'half-day']),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const { checkInTime, checkOutTime, status, notes } = req.body;

    // Update attendance record
    if (checkInTime) {
      attendance.checkIn = {
        ...attendance.checkIn,
        time: new Date(checkInTime)
      };
    }

    if (checkOutTime) {
      attendance.checkOut = {
        ...attendance.checkOut,
        time: new Date(checkOutTime)
      };
    }

    attendance.status = status;
    attendance.notes = notes;
    attendance.isManualEntry = true;
    attendance.createdBy = req.user._id;

    await attendance.save();

    res.json({
      message: 'Attendance record updated successfully',
      attendance
    });

  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/my-summary
// @desc    Get current user's attendance summary
// @access  Private (Employee)
router.get('/my-summary', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Get current month dates
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    // Fetch attendance records for current month
    const attendanceRecords = await Attendance.find({
      employee: employee._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Calculate statistics
    const totalWorkingDays = moment().daysInMonth() - 
      Array.from({length: moment().daysInMonth()}, (_, i) => i + 1)
        .filter(day => {
          const date = moment().date(day);
          return date.day() === 0 || date.day() === 6; // Sunday or Saturday
        }).length;

    const present = attendanceRecords.filter(record => record.status === 'present').length;
    const absent = attendanceRecords.filter(record => record.status === 'absent').length;
    const late = attendanceRecords.filter(record => record.status === 'late').length;

    res.json({
      present,
      absent,
      late,
      totalWorkingDays,
      monthlyCalendar: attendanceRecords.map(record => ({
        date: record.date,
        status: record.status,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        totalHours: record.totalHours
      }))
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;