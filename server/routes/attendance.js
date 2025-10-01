const express = require('express');
const { body, query, validationResult } = require('express-validator');
const moment = require('moment-timezone');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { LeaveRequest } = require('../models/Leave');
const { authenticate, authorize } = require('../middleware/auth');
const { checkPermissions, MODULES, ACTIONS } = require('../middleware/permissions');
const attendanceService = require('../services/attendanceService');

// Office configuration
const OFFICE_CONFIG = {
  timezone: 'Asia/Kolkata', // Indian Standard Time
  allowedIPs: [
    '127.0.0.1', // localhost for development
    '::1', // localhost IPv6
    '192.168.1.0/24', // Office local network (adjust as needed)
    '10.0.0.0/8', // Private network range
    '172.16.0.0/12' // Private network range
  ],
  workingHours: {
    start: '09:00',
    end: '18:00'
  }
};

// Helper function to check if IP is in office network
const isOfficeIP = (clientIP) => {
  console.log('🔍 Checking IP:', clientIP);
  
  // For development, allow localhost
  if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === '::ffff:127.0.0.1') {
    console.log('✅ Localhost access allowed');
    return true;
  }
  
  // Check against office IP ranges
  for (const allowedIP of OFFICE_CONFIG.allowedIPs) {
    if (allowedIP.includes('/')) {
      // CIDR notation check (simplified)
      const [network, mask] = allowedIP.split('/');
      if (clientIP.startsWith(network.split('.').slice(0, -1).join('.'))) {
        console.log('✅ Office network access allowed');
        return true;
      }
    } else if (clientIP === allowedIP) {
      console.log('✅ Exact IP match allowed');
      return true;
    }
  }
  
  console.log('❌ IP not in office network');
  return false;
};

// Helper function to get current time in office timezone
const getOfficeTime = () => {
  return moment().tz(OFFICE_CONFIG.timezone);
};

const router = express.Router();

// @route   GET /api/attendance/office-status
// @desc    Check if current IP is from office premises
// @access  Private
router.get('/office-status', authenticate, async (req, res) => {
  try {
    const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip || req.connection.remoteAddress;
    const actualIP = clientIP.includes(',') ? clientIP.split(',')[0].trim() : clientIP;
    
    const isOffice = isOfficeIP(actualIP);
    const officeTime = getOfficeTime();
    
    res.json({
      isOfficeIP: isOffice,
      clientIP: actualIP,
      currentTime: officeTime.format('YYYY-MM-DD HH:mm:ss'),
      timezone: OFFICE_CONFIG.timezone,
      workingHours: OFFICE_CONFIG.workingHours,
      message: isOffice 
        ? 'You are connected from office premises' 
        : 'You are not connected from office premises. Check-in/out is not allowed.'
    });
  } catch (error) {
    console.error('Error checking office status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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
    
    // Calculate working days in current month (including all 7 days)
    let totalWorkingDays = 0;
    let presentDays = 0;
    let lateDays = 0;
    
    for (let d = new Date(startOfMonth); d <= currentDate; d.setDate(d.getDate() + 1)) {
      // Include all days (7 days a week)
      totalWorkingDays++;
      if (Math.random() > 0.1) { // 90% attendance
        presentDays++;
        if (Math.random() > 0.8) { // 20% late when present
          lateDays++;
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

    const officeTime = getOfficeTime();
    const today = officeTime.clone().startOf('day').toDate();
    
    // Check if today is a working day (Monday to Friday)
    const dayOfWeek = officeTime.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday (1) to Friday (5)
    
    if (!isWorkingDay) {
      return res.json({ 
        checkedIn: false, 
        checkedOut: false,
        checkIn: null,
        checkOut: null,
        totalHours: 0,
        status: 'weekend',
        message: 'Today is not a working day'
      });
    }

    // Get real attendance record for today
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (attendance) {
      const hasCheckedIn = attendance.checkIn && attendance.checkIn.time;
      const hasCheckedOut = attendance.checkOut && attendance.checkOut.time;
      
      const response = {
        checkedIn: hasCheckedIn,
        checkedOut: hasCheckedOut,
        checkIn: hasCheckedIn ? attendance.checkIn.time : null,
        checkOut: hasCheckedOut ? attendance.checkOut.time : null,
        totalHours: attendance.totalHours || 0,
        regularHours: attendance.regularHours || 0,
        overtimeHours: attendance.overtimeHours || 0,
        breakTime: '0h 0m',
        status: attendance.status,
        isLate: attendance.isLate || false,
        lateMinutes: attendance.lateMinutes || 0,
        earlyDeparture: attendance.earlyDeparture || false,
        earlyDepartureMinutes: attendance.earlyDepartureMinutes || 0
      };

      res.json(response);
    } else {
      res.json({ 
        checkedIn: false, 
        checkedOut: false,
        checkIn: null,
        checkOut: null,
        totalHours: 0,
        status: 'not-marked'
      });
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
    
    // Get employee record
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    
    // Build date query
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate()
      };
    } else {
      // Default to last 30 days
      dateQuery = {
        $gte: moment().subtract(30, 'days').startOf('day').toDate(),
        $lte: moment().endOf('day').toDate()
      };
    }
    
    // Get real attendance records
    const attendanceRecords = await Attendance.find({
      employee: employee._id,
      date: dateQuery
    }).sort({ date: -1 }).limit(parseInt(limit));
    
    // Format records for frontend
    const formattedRecords = attendanceRecords.map(record => ({
      _id: record._id,
      date: record.date,
      checkIn: record.checkIn?.time ? { time: record.checkIn.time } : null,
      checkOut: record.checkOut?.time ? { time: record.checkOut.time } : null,
      totalHours: record.totalHours || 0,
      regularHours: record.regularHours || 0,
      overtimeHours: record.overtimeHours || 0,
      status: record.status || 'absent',
      isLate: record.isLate || false,
      lateMinutes: record.lateMinutes || 0,
      earlyDeparture: record.earlyDeparture || false,
      earlyDepartureMinutes: record.earlyDepartureMinutes || 0,
      breaks: record.breaks || []
    }));
    
    // Calculate stats (excluding weekends)
    const workingDayRecords = formattedRecords.filter(r => r.status !== 'weekend');
    const totalWorkingDays = workingDayRecords.length;
    const presentDays = workingDayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const absentDays = workingDayRecords.filter(r => r.status === 'absent').length;
    const lateDays = workingDayRecords.filter(r => r.status === 'late').length;
    const totalHours = workingDayRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const averageHours = presentDays > 0 ? totalHours / presentDays : 0;
    
    const stats = {
      totalDays: totalWorkingDays,
      presentDays,
      absentDays,
      lateDays,
      totalHours: Math.round(totalHours * 100) / 100,
      averageHours: Math.round(averageHours * 100) / 100
    };
    
    res.json({
      attendance: formattedRecords,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalWorkingDays / parseInt(limit)),
        totalRecords: totalWorkingDays,
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
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const officeTime = getOfficeTime();
    const today = officeTime.clone().startOf('day').toDate();
    
    // Try to get real attendance record for today
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    let attendanceStatus;

    if (attendance) {
      // Real attendance data exists
      const hasCheckedIn = attendance.checkIn && attendance.checkIn.time;
      const hasCheckedOut = attendance.checkOut && attendance.checkOut.time;
      
      attendanceStatus = {
        date: today.toISOString().split('T')[0],
        checkedIn: hasCheckedIn,
        isCheckedIn: hasCheckedIn,
        checkedOut: hasCheckedOut,
        isCheckedOut: hasCheckedOut,
        checkInTime: hasCheckedIn ? attendance.checkIn.time : null,
        checkOutTime: hasCheckedOut ? attendance.checkOut.time : null,
        status: attendance.status,
        isLate: attendance.isLate || false,
        lateMinutes: attendance.lateMinutes || 0,
        totalHours: attendance.totalHours || 0,
        workingHours: attendance.totalHours ? `${Math.floor(attendance.totalHours)}h ${Math.round((attendance.totalHours % 1) * 60)}m` : '0h 0m'
      };
    } else {
      // No attendance record for today
      attendanceStatus = {
        date: today.toISOString().split('T')[0],
        checkedIn: false,
        isCheckedIn: false,
        checkedOut: false,
        isCheckedOut: false,
        checkInTime: null,
        checkOutTime: null,
        status: 'absent',
        isLate: false,
        lateMinutes: 0,
        totalHours: 0,
        workingHours: '0h 0m'
      };
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
    console.log('📥 Check-in request received from IP:', req.ip);
    console.log('📥 Request headers:', req.headers);

    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Get client IP (handle proxy/forwarded cases)
    const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip || req.connection.remoteAddress;
    const actualIP = clientIP.includes(',') ? clientIP.split(',')[0].trim() : clientIP;
    
    console.log('🔍 Client IP detected:', actualIP);

    // Validate office location by IP
    if (!isOfficeIP(actualIP)) {
      return res.status(403).json({ 
        success: false,
        message: 'Check-in is only allowed from office premises. Please ensure you are connected to the office network.',
        clientIP: actualIP
      });
    }

    const { location, deviceInfo } = req.body;
    const officeTime = getOfficeTime();
    const today = officeTime.clone().startOf('day').toDate();
    
    // Check if today is a working day (Monday to Friday)
    const dayOfWeek = officeTime.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday (1) to Friday (5)
    
    if (!isWorkingDay) {
      return res.status(400).json({ 
        success: false,
        message: 'Check-in is only allowed on working days (Monday to Friday)',
        dayOfWeek: officeTime.format('dddd')
      });
    }
    
    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (existingAttendance && existingAttendance.checkIn?.time) {
      return res.status(400).json({ 
        success: false,
        message: 'Already checked in today',
        checkInTime: moment(existingAttendance.checkIn.time).tz(OFFICE_CONFIG.timezone).format('HH:mm')
      });
    }

    // Get check-in time in office timezone
    const checkInTime = officeTime.toDate();
    const workStart = moment.tz(officeTime.format('YYYY-MM-DD') + ' ' + OFFICE_CONFIG.workingHours.start, OFFICE_CONFIG.timezone);
    const isLate = officeTime.isAfter(workStart);
    const lateMinutes = isLate ? Math.ceil(officeTime.diff(workStart, 'minutes')) : 0;

    // Calculate flexible end time based on check-in time (9 hours later)
    // If employee comes at 9:30 AM, they can leave at 6:30 PM (9 hours later)
    const flexibleEndTime = moment(officeTime).add(9, 'hours');

    const attendanceData = {
      employee: employee._id,
      date: today,
      checkIn: {
        time: checkInTime,
        location: location || { 
          address: 'Office Location', 
          ipAddress: actualIP,
          method: 'ip-validation'
        },
        method: 'web',
        deviceInfo: deviceInfo || { 
          userAgent: req.headers['user-agent'],
          ip: actualIP
        },
        ipAddress: actualIP,
        isValidLocation: true,
        isLate: isLate,
        lateMinutes: lateMinutes
      },
      status: isLate ? 'late' : 'present',
      isLate: isLate,
      lateMinutes: lateMinutes,
      flexibleEndTime: flexibleEndTime.toDate() // Store when employee can leave based on check-in time
    };

    let attendance;
    if (existingAttendance) {
      Object.assign(existingAttendance, attendanceData);
      attendance = await existingAttendance.save();
    } else {
      attendance = new Attendance(attendanceData);
      await attendance.save();
    }

    console.log('✅ Check-in successful for employee:', employee.employeeId, 'at', officeTime.format('HH:mm'));

    const lateMessage = isLate 
      ? ` (${Math.floor(lateMinutes / 60)}h ${lateMinutes % 60}m late)`
      : '';

    res.json({
      success: true,
      message: `Check-in successful at ${officeTime.format('HH:mm')}${lateMessage}. You can leave at ${flexibleEndTime.format('HH:mm')}`,
      isLate: isLate,
      lateMinutes: lateMinutes,
      flexibleEndTime: flexibleEndTime.format('HH:mm'),
      checkInTime: officeTime.format('HH:mm'),
      attendance: {
        checkIn: attendance.checkIn,
        status: attendance.status,
        isLate: attendance.isLate,
        lateMinutes: attendance.lateMinutes
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
    console.log('📤 Check-out request received from IP:', req.ip);

    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Get client IP (handle proxy/forwarded cases)
    const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip || req.connection.remoteAddress;
    const actualIP = clientIP.includes(',') ? clientIP.split(',')[0].trim() : clientIP;
    
    console.log('🔍 Client IP detected:', actualIP);

    // Validate office location by IP
    if (!isOfficeIP(actualIP)) {
      return res.status(403).json({ 
        success: false,
        message: 'Check-out is only allowed from office premises. Please ensure you are connected to the office network.',
        clientIP: actualIP
      });
    }

    const { location, deviceInfo, earlyLeaveReason } = req.body;
    const officeTime = getOfficeTime();
    const today = officeTime.clone().startOf('day').toDate();
    
    // Check if today is a working day (Monday to Friday)
    const dayOfWeek = officeTime.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday (1) to Friday (5)
    
    if (!isWorkingDay) {
      return res.status(400).json({ 
        success: false,
        message: 'Check-out is only allowed on working days (Monday to Friday)',
        dayOfWeek: officeTime.format('dddd')
      });
    }
    
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
        message: 'Already checked out today',
        checkOutTime: moment(attendance.checkOut.time).tz(OFFICE_CONFIG.timezone).format('HH:mm')
      });
    }

    // Get checkout time in office timezone
    const checkOutTime = officeTime.toDate();
    
    // Use flexible end time if available, otherwise use standard 7 PM
    const workEnd = attendance.flexibleEndTime 
      ? moment(attendance.flexibleEndTime).tz(OFFICE_CONFIG.timezone)
      : moment.tz(officeTime.format('YYYY-MM-DD') + ' ' + OFFICE_CONFIG.workingHours.end, OFFICE_CONFIG.timezone);
    
    const isEarlyDeparture = officeTime.isBefore(workEnd);
    const earlyMinutes = isEarlyDeparture ? Math.ceil(workEnd.diff(officeTime, 'minutes')) : 0;

    // Update attendance record with checkout
    attendance.checkOut = {
      time: checkOutTime,
      location: location || { 
        address: 'Office Location', 
        ipAddress: actualIP,
        method: 'ip-validation'
      },
      method: 'web',
      deviceInfo: deviceInfo || { 
        userAgent: req.headers['user-agent'],
        ip: actualIP
      },
      ipAddress: actualIP,
      earlyLeaveReason: earlyLeaveReason || null,
      isValidLocation: true,
      isEarlyDeparture: isEarlyDeparture,
      earlyMinutes: earlyMinutes
    };

    // Calculate total hours (in office timezone)
    const checkInMoment = moment(attendance.checkIn.time).tz(OFFICE_CONFIG.timezone);
    const checkOutMoment = officeTime;
    const totalHours = checkOutMoment.diff(checkInMoment, 'minutes') / 60; // Convert minutes to hours
    attendance.totalHours = Math.round(totalHours * 100) / 100; // Round to 2 decimal places
    
    // Store early departure information
    attendance.earlyDeparture = isEarlyDeparture;
    attendance.earlyDepartureMinutes = earlyMinutes;

    await attendance.save();

    console.log('✅ Check-out successful for employee:', employee.employeeId, 'at', officeTime.format('HH:mm'));

    const flexibleEndTimeStr = attendance.flexibleEndTime 
      ? moment(attendance.flexibleEndTime).tz(OFFICE_CONFIG.timezone).format('HH:mm')
      : '19:00';

    res.json({
      success: true,
      message: `Check-out successful at ${officeTime.format('HH:mm')}${isEarlyDeparture ? ` (${Math.floor(earlyMinutes / 60)}h ${earlyMinutes % 60}m before ${flexibleEndTimeStr})` : ''}`,
      isEarlyDeparture: isEarlyDeparture,
      earlyMinutes: earlyMinutes,
      flexibleEndTime: flexibleEndTimeStr,
      checkOutTime: officeTime.format('HH:mm'),
      totalHours: attendance.totalHours,
      workingHours: `${Math.floor(attendance.totalHours)}h ${Math.round((attendance.totalHours % 1) * 60)}m`,
      attendance: {
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        totalHours: attendance.totalHours,
        isEarlyDeparture: isEarlyDeparture,
        earlyMinutes: earlyMinutes
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

// @route   POST /api/attendance/auto-checkout
// @desc    Automatic checkout due to inactivity
// @access  Private
router.post('/auto-checkout', authenticate, async (req, res) => {
  try {
    console.log('🔄 Auto checkout request received');

    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const officeTime = getOfficeTime();
    const today = officeTime.clone().startOf('day').toDate();
    
    // Check if today is a working day (Monday to Friday)
    const dayOfWeek = officeTime.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday (1) to Friday (5)
    
    if (!isWorkingDay) {
      return res.status(400).json({ 
        success: false,
        message: 'Auto checkout is only allowed on working days (Monday to Friday)',
        dayOfWeek: officeTime.format('dddd')
      });
    }

    // Check if it's lunch time (2 PM to 3 PM) - don't auto checkout during lunch
    const currentHour = officeTime.hour();
    const currentMinute = officeTime.minute();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const lunchStartMinutes = 14 * 60; // 2 PM = 14:00
    const lunchEndMinutes = 15 * 60;   // 3 PM = 15:00
    
    if (currentTimeInMinutes >= lunchStartMinutes && currentTimeInMinutes < lunchEndMinutes) {
      return res.status(400).json({ 
        success: false,
        message: 'Auto checkout is not allowed during lunch time (2 PM to 3 PM)',
        currentTime: officeTime.format('HH:mm'),
        lunchTime: '14:00 - 15:00'
      });
    }
    
    // Find today's attendance record
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (!attendance || !attendance.checkIn?.time) {
      return res.status(400).json({ 
        success: false,
        message: 'No check-in found for today. Cannot perform auto checkout.' 
      });
    }

    if (attendance.checkOut?.time) {
      return res.status(400).json({ 
        success: false,
        message: 'Already checked out today',
        checkOutTime: moment(attendance.checkOut.time).tz(OFFICE_CONFIG.timezone).format('HH:mm')
      });
    }

    // Get client IP (handle proxy/forwarded cases)
    const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip || req.connection.remoteAddress;
    const actualIP = clientIP.includes(',') ? clientIP.split(',')[0].trim() : clientIP;

    // Get checkout time in office timezone
    const checkOutTime = officeTime.toDate();
    
    // Use flexible end time if available, otherwise use standard 7 PM
    const workEnd = attendance.flexibleEndTime 
      ? moment(attendance.flexibleEndTime).tz(OFFICE_CONFIG.timezone)
      : moment.tz(officeTime.format('YYYY-MM-DD') + ' ' + OFFICE_CONFIG.workingHours.end, OFFICE_CONFIG.timezone);
    
    const isEarlyDeparture = officeTime.isBefore(workEnd);
    const earlyMinutes = isEarlyDeparture ? Math.ceil(workEnd.diff(officeTime, 'minutes')) : 0;

    // Update attendance record with auto checkout
    attendance.checkOut = {
      time: checkOutTime,
      location: { 
        address: 'Office Location (Auto Checkout)', 
        ipAddress: actualIP,
        method: 'auto-checkout'
      },
      method: 'auto-checkout',
      deviceInfo: { 
        userAgent: req.headers['user-agent'],
        ip: actualIP
      },
      ipAddress: actualIP,
      earlyLeaveReason: 'Automatic checkout due to inactivity (30+ minutes)',
      isValidLocation: true,
      isEarlyDeparture: isEarlyDeparture,
      earlyMinutes: earlyMinutes,
      isAutoCheckout: true
    };

    // Calculate total hours (in office timezone)
    const checkInMoment = moment(attendance.checkIn.time).tz(OFFICE_CONFIG.timezone);
    const checkOutMoment = officeTime;
    const totalHours = checkOutMoment.diff(checkInMoment, 'minutes') / 60; // Convert minutes to hours
    attendance.totalHours = Math.round(totalHours * 100) / 100; // Round to 2 decimal places
    
    // Store early departure information
    attendance.earlyDeparture = isEarlyDeparture;
    attendance.earlyDepartureMinutes = earlyMinutes;
    attendance.isAutoCheckout = true;

    await attendance.save();

    console.log('✅ Auto checkout successful for employee:', employee.employeeId, 'at', officeTime.format('HH:mm'));

    const flexibleEndTimeStr = attendance.flexibleEndTime 
      ? moment(attendance.flexibleEndTime).tz(OFFICE_CONFIG.timezone).format('HH:mm')
      : '19:00';

    res.json({
      success: true,
      message: `Automatic checkout completed at ${officeTime.format('HH:mm')} due to inactivity${isEarlyDeparture ? ` (${Math.floor(earlyMinutes / 60)}h ${earlyMinutes % 60}m before ${flexibleEndTimeStr})` : ''}`,
      isEarlyDeparture: isEarlyDeparture,
      earlyMinutes: earlyMinutes,
      flexibleEndTime: flexibleEndTimeStr,
      checkOutTime: officeTime.format('HH:mm'),
      totalHours: attendance.totalHours,
      workingHours: `${Math.floor(attendance.totalHours)}h ${Math.round((attendance.totalHours % 1) * 60)}m`,
      isAutoCheckout: true,
      attendance: {
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        totalHours: attendance.totalHours,
        isEarlyDeparture: isEarlyDeparture,
        earlyMinutes: earlyMinutes
      }
    });

  } catch (error) {
    console.error('❌ Error in auto checkout:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to perform auto checkout',
      details: error.stack
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
  query('date').optional().isISO8601(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('period').optional().isIn(['today', 'yesterday', 'week', 'month', 'quarter'])
], async (req, res) => {
  try {
    let startDate, endDate;
    
    // Handle different period types
    if (req.query.period) {
      const now = moment().tz('Asia/Kolkata');
      switch (req.query.period) {
        case 'today':
          startDate = now.clone().startOf('day').toDate();
          endDate = now.clone().endOf('day').toDate();
          break;
        case 'yesterday':
          startDate = now.clone().subtract(1, 'day').startOf('day').toDate();
          endDate = now.clone().subtract(1, 'day').endOf('day').toDate();
          break;
        case 'week':
          startDate = now.clone().startOf('week').toDate();
          endDate = now.clone().endOf('week').toDate();
          break;
        case 'month':
          startDate = now.clone().startOf('month').toDate();
          endDate = now.clone().endOf('month').toDate();
          break;
        case 'quarter':
          startDate = now.clone().startOf('quarter').toDate();
          endDate = now.clone().endOf('quarter').toDate();
          break;
        default:
          startDate = now.clone().startOf('day').toDate();
          endDate = now.clone().endOf('day').toDate();
      }
    } else if (req.query.startDate && req.query.endDate) {
      startDate = moment(req.query.startDate).startOf('day').toDate();
      endDate = moment(req.query.endDate).endOf('day').toDate();
    } else if (req.query.date) {
      const date = moment(req.query.date).startOf('day').toDate();
      startDate = date;
      endDate = moment(date).endOf('day').toDate();
    } else {
      // Default to today
      const now = moment().tz('Asia/Kolkata');
      startDate = now.clone().startOf('day').toDate();
      endDate = now.clone().endOf('day').toDate();
    }
    
    console.log('📊 Team summary requested for period:', req.query.period || 'custom');
    console.log('📅 Date range:', moment(startDate).format('YYYY-MM-DD'), 'to', moment(endDate).format('YYYY-MM-DD'));
    console.log('👤 Requested by user role:', req.user.role);
    
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

    // Get attendance records for the date range
    const attendanceRecords = await Attendance.find({
      ...employeeFilter,
      date: { $gte: startDate, $lte: endDate }
    }).populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName employmentInfo.department')
      .populate('leaveRequest', 'leaveType status');
    
    console.log('📋 Found attendance records:', attendanceRecords.length);
    attendanceRecords.forEach(record => {
      console.log(`  - ${record.employee.employeeId}: ${record.status} (CheckIn: ${record.checkIn?.time ? 'Yes' : 'No'}, CheckOut: ${record.checkOut?.time ? 'Yes' : 'No'})`);
    });

    // Get all employees for the filter
    const allEmployees = await Employee.find(
      req.user.role === 'manager' 
        ? { 'employmentInfo.reportingManager': (await Employee.findOne({ user: req.user._id }))._id, 'employmentInfo.isActive': true }
        : { 'employmentInfo.isActive': true }
    ).select('_id personalInfo.firstName personalInfo.lastName employeeId');

    console.log('👥 Total employees found:', allEmployees.length);
    console.log('👥 Employee list:', allEmployees.map(emp => `${emp.employeeId} - ${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`));

    // Calculate aggregate statistics for the date range
    const totalRecords = attendanceRecords.length;
    const presentRecords = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const absentRecords = attendanceRecords.filter(r => r.status === 'absent').length;
    const lateRecords = attendanceRecords.filter(r => r.status === 'late').length;
    const totalHours = attendanceRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const averageHours = presentRecords > 0 ? totalHours / presentRecords : 0;

    // Group attendance by date for detailed view
    const attendanceByDate = {};
    const currentDate = moment(startDate);
    
    // Initialize all dates in range
    while (currentDate.isSameOrBefore(endDate, 'day')) {
      const dateKey = currentDate.format('YYYY-MM-DD');
      const dayOfWeek = currentDate.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      attendanceByDate[dateKey] = {
        date: currentDate.format('YYYY-MM-DD'),
        dayOfWeek: currentDate.format('dddd'),
        isWeekend,
        employees: []
      };
      
      // Add employee data for this date
      for (const employee of allEmployees) {
        const attendanceRecord = attendanceRecords.find(
          record => record.employee._id.toString() === employee._id.toString() &&
                   moment(record.date).format('YYYY-MM-DD') === dateKey
        );

        let status = isWeekend ? 'weekend' : 'absent';
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
        }

        attendanceByDate[dateKey].employees.push({
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
      
      currentDate.add(1, 'day');
    }

    // Transform response to match frontend expectations
    const response = {
      dateRange: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
        period: req.query.period || 'custom'
      },
      stats: {
        totalEmployees: allEmployees.length,
        totalRecords,
        presentRecords,
        absentRecords,
        lateRecords,
        totalHours: Math.round(totalHours * 100) / 100,
        averageHours: Math.round(averageHours * 100) / 100,
        attendanceRate: allEmployees.length > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0
      },
      attendanceByDate,
      // For backward compatibility with single-date requests
      employees: Object.values(attendanceByDate)[0]?.employees || []
    };

    res.json(response);

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
  body('status').isIn(['present', 'absent', 'late', 'half-day', 'on-leave', 'weekend']),
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

    // Calculate statistics (including all 7 days)
    const totalWorkingDays = moment().daysInMonth(); // All days in month

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

// @route   GET /api/attendance/calendar
// @desc    Get attendance data for calendar view (Admin/HR/Manager)
// @access  Private (Admin, HR, Manager)
router.get('/calendar', [
  authenticate,
  authorize(['admin', 'hr', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('employeeId').optional().isMongoId()
], async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    
    // Default to current month if no dates provided
    const start = startDate ? moment(startDate).startOf('day').toDate() : moment().startOf('month').toDate();
    const end = endDate ? moment(endDate).endOf('day').toDate() : moment().endOf('month').toDate();
    
    // Build employee filter
    let employeeFilter = {};
    if (employeeId) {
      employeeFilter = { _id: employeeId };
    } else if (req.user.role === 'manager') {
      // Get manager's team members
      const managerEmployee = await Employee.findOne({ user: req.user._id });
      if (!managerEmployee) {
        return res.status(404).json({ message: 'Manager employee profile not found' });
      }
      
      const teamMembers = await Employee.find({
        'employmentInfo.reportingManager': managerEmployee._id,
        'employmentInfo.isActive': true
      }).select('_id');
      
      employeeFilter = { _id: { $in: teamMembers.map(emp => emp._id) } };
    } else {
      // Admin/HR can see all active employees
      employeeFilter = { 'employmentInfo.isActive': true };
    }
    
    // Get employees
    const employees = await Employee.find(employeeFilter)
      .select('employeeId personalInfo.firstName personalInfo.lastName employmentInfo.department')
      .populate('employmentInfo.department', 'name code');
    
    // Get attendance records for the date range
    const attendanceRecords = await Attendance.find({
      employee: { $in: employees.map(emp => emp._id) },
      date: { $gte: start, $lte: end }
    }).populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName');
    
    // Create a map for quick lookup
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      const dateKey = moment(record.date).format('YYYY-MM-DD');
      const empId = record.employee._id.toString();
      
      if (!attendanceMap[dateKey]) {
        attendanceMap[dateKey] = {};
      }
      
      attendanceMap[dateKey][empId] = {
        _id: record._id,
        employeeId: record.employee.employeeId,
        employeeName: `${record.employee.personalInfo.firstName} ${record.employee.personalInfo.lastName}`,
        checkIn: record.checkIn?.time || null,
        checkOut: record.checkOut?.time || null,
        totalHours: record.totalHours || 0,
        status: record.status || 'absent',
        isLate: record.isLate || false,
        lateMinutes: record.lateMinutes || 0,
        earlyDeparture: record.earlyDeparture || false,
        earlyDepartureMinutes: record.earlyDepartureMinutes || 0
      };
    });
    
    // Generate calendar data
    const calendarData = [];
    const currentDate = moment(start);
    
    while (currentDate.isSameOrBefore(end, 'day')) {
      const dateKey = currentDate.format('YYYY-MM-DD');
      const dayData = {
        date: dateKey,
        dayOfWeek: currentDate.format('dddd'),
        employees: []
      };
      
      employees.forEach(emp => {
        const empId = emp._id.toString();
        const attendance = attendanceMap[dateKey]?.[empId];
        
        // Check if this date is a weekend
        const dayOfWeek = currentDate.day(); // 0 = Sunday, 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        dayData.employees.push({
          employeeId: emp.employeeId,
          employeeName: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
          department: emp.employmentInfo.department?.name || 'N/A',
          attendance: attendance || {
            status: isWeekend ? 'weekend' : 'absent',
            checkIn: null,
            checkOut: null,
            totalHours: 0,
            isLate: false,
            lateMinutes: 0
          }
        });
      });
      
      calendarData.push(dayData);
      currentDate.add(1, 'day');
    }
    
    res.json({
      calendarData,
      employees: employees.map(emp => ({
        _id: emp._id,
        employeeId: emp.employeeId,
        name: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
        department: emp.employmentInfo.department?.name || 'N/A'
      })),
      dateRange: {
        start: moment(start).format('YYYY-MM-DD'),
        end: moment(end).format('YYYY-MM-DD')
      }
    });
    
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;