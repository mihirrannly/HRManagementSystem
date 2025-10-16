const express = require('express');
const { body, query, validationResult } = require('express-validator');
const moment = require('moment-timezone');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { LeaveRequest } = require('../models/Leave');
const { authenticate, authorize } = require('../middleware/auth');
const { checkPermissions, MODULES, ACTIONS } = require('../middleware/permissions');
const attendanceService = require('../services/attendanceService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `attendance-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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
    start: '10:00', // Office starts at 10 AM
    end: '19:00' // Office ends at 7 PM
  }
};

// Helper function to check if IP is in office network
const isOfficeIP = (clientIP) => {
  console.log('🔍 Checking IP:', clientIP);
  
  // Check if IP validation is disabled (for testing/development)
  if (process.env.DISABLE_IP_VALIDATION === 'true') {
    console.log('⚠️  IP validation is DISABLED (testing mode)');
    return true;
  }
  
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
    
    // Check if today is a weekend
    const dayOfWeek = officeTime.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday (0) or Saturday (6)
    
    // Note: We allow attendance on weekends, but mark it as weekend work

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
    
    // Check if today is a weekend (but still allow check-in)
    const dayOfWeek = officeTime.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday (0) or Saturday (6)
    
    // Note: We allow check-in on weekends for employees who work on weekends
    // The system will mark it as 'weekend' status for proper tracking
    
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
        isLate: isWeekend ? false : isLate, // No late marking on weekends
        lateMinutes: isWeekend ? 0 : lateMinutes // No late minutes on weekends
      },
      status: isWeekend ? 'weekend' : (isLate ? 'late' : 'present'),
      isLate: isWeekend ? false : isLate,
      lateMinutes: isWeekend ? 0 : lateMinutes,
      flexibleEndTime: flexibleEndTime.toDate(), // Store when employee can leave based on check-in time
      isWeekendWork: isWeekend // Flag to identify weekend work
    };

    let attendance;
    if (existingAttendance) {
      Object.assign(existingAttendance, attendanceData);
      attendance = await existingAttendance.save();
    } else {
      attendance = new Attendance(attendanceData);
      await attendance.save();
    }

    console.log('✅ Check-in successful for employee:', employee.employeeId, 'at', officeTime.format('HH:mm'), isWeekend ? '(Weekend)' : '');

    const lateMessage = isLate && !isWeekend
      ? ` (${Math.floor(lateMinutes / 60)}h ${lateMinutes % 60}m late)`
      : '';
    
    const weekendMessage = isWeekend ? ' (Weekend work - Great dedication! 🌟)' : '';

    res.json({
      success: true,
      message: `Check-in successful at ${officeTime.format('HH:mm')}${lateMessage}${weekendMessage}. You can leave at ${flexibleEndTime.format('HH:mm')}`,
      isLate: isWeekend ? false : isLate,
      lateMinutes: isWeekend ? 0 : lateMinutes,
      flexibleEndTime: flexibleEndTime.format('HH:mm'),
      checkInTime: officeTime.format('HH:mm'),
      isWeekend: isWeekend,
      dayOfWeek: officeTime.format('dddd'),
      attendance: {
        checkIn: attendance.checkIn,
        status: attendance.status,
        isLate: attendance.isLate,
        lateMinutes: attendance.lateMinutes,
        isWeekendWork: isWeekend
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
    
    // Check if today is a weekend (but still allow check-out)
    const dayOfWeek = officeTime.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday (0) or Saturday (6)
    
    // Note: We allow check-out on weekends for employees who work on weekends
    
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

    console.log('✅ Check-out successful for employee:', employee.employeeId, 'at', officeTime.format('HH:mm'), isWeekend ? '(Weekend)' : '');

    const flexibleEndTimeStr = attendance.flexibleEndTime 
      ? moment(attendance.flexibleEndTime).tz(OFFICE_CONFIG.timezone).format('HH:mm')
      : '19:00';
    
    const weekendMessage = isWeekend ? ' Thanks for your weekend dedication! 🌟' : '';
    const earlyMessage = !isWeekend && isEarlyDeparture ? ` (${Math.floor(earlyMinutes / 60)}h ${earlyMinutes % 60}m before ${flexibleEndTimeStr})` : '';

    res.json({
      success: true,
      message: `Check-out successful at ${officeTime.format('HH:mm')}${earlyMessage}${weekendMessage}`,
      isEarlyDeparture: isWeekend ? false : isEarlyDeparture,
      earlyMinutes: isWeekend ? 0 : earlyMinutes,
      flexibleEndTime: flexibleEndTimeStr,
      checkOutTime: officeTime.format('HH:mm'),
      totalHours: attendance.totalHours,
      workingHours: `${Math.floor(attendance.totalHours)}h ${Math.round((attendance.totalHours % 1) * 60)}m`,
      isWeekend: isWeekend,
      dayOfWeek: officeTime.format('dddd'),
      attendance: {
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        totalHours: attendance.totalHours,
        isEarlyDeparture: isWeekend ? false : isEarlyDeparture,
        earlyMinutes: isWeekend ? 0 : earlyMinutes,
        isWeekendWork: isWeekend
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
    
    // Filter out records with null employees (orphaned records)
    const validAttendanceRecords = attendanceRecords.filter(record => {
      if (record.employee) {
        console.log(`  - ${record.employee.employeeId}: ${record.status} (CheckIn: ${record.checkIn?.time ? 'Yes' : 'No'}, CheckOut: ${record.checkOut?.time ? 'Yes' : 'No'})`);
        return true;
      } else {
        console.log(`  - ⚠️  Skipping record with null employee: ${record._id} - ${record.status}`);
        return false;
      }
    });
    
    console.log('📋 Valid attendance records:', validAttendanceRecords.length);

    // Get all employees for the filter
    const allEmployees = await Employee.find(
      req.user.role === 'manager' 
        ? { 'employmentInfo.reportingManager': (await Employee.findOne({ user: req.user._id }))._id, 'employmentInfo.isActive': true }
        : { 'employmentInfo.isActive': true }
    ).select('_id personalInfo.firstName personalInfo.lastName employeeId');

    console.log('👥 Total employees found:', allEmployees.length);
    console.log('👥 Employee list:', allEmployees.map(emp => `${emp.employeeId} - ${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`));

    // Calculate aggregate statistics for the date range
    const totalRecords = validAttendanceRecords.length;
    const presentRecords = validAttendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const absentRecords = validAttendanceRecords.filter(r => r.status === 'absent').length;
    const lateRecords = validAttendanceRecords.filter(r => r.status === 'late').length;
    const totalHours = validAttendanceRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
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
        const attendanceRecord = validAttendanceRecords.find(
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
    const currentDate = moment().tz('Asia/Kolkata');
    const startOfMonth = currentDate.clone().startOf('month').toDate();
    const endOfMonth = currentDate.clone().endOf('month').toDate();

    // Fetch real attendance records for current month
    const attendanceRecords = await Attendance.find({
      employee: employee._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Calculate statistics
    const totalDaysInMonth = currentDate.daysInMonth();
    const daysPassed = currentDate.date(); // Days that have passed in the month
    
    // Filter by status (present includes late and half-day)
    const presentDays = attendanceRecords.filter(record => 
      record.status === 'present' || record.status === 'late' || record.status === 'half-day'
    ).length;
    
    const lateDays = attendanceRecords.filter(record => record.status === 'late').length;
    const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
    
    // Calculate attendance percentage based on days passed
    const attendancePercentage = daysPassed > 0 
      ? Math.round((presentDays / daysPassed) * 100) 
      : 0;

    res.json({
      present: presentDays,
      absent: absentDays,
      late: lateDays,
      totalWorkingDays: daysPassed, // Only count days that have passed
      totalDaysInMonth: totalDaysInMonth,
      attendancePercentage: attendancePercentage,
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

// @route   GET /api/attendance/punch-records
// @desc    Get punch records with daily aggregation (first punch in, last punch out, total hours)
// @access  Private
router.get('/punch-records', [
  authenticate
], async (req, res) => {
  try {
    console.log('\n🔍 Punch Records Request:');
    console.log('Query params:', req.query);
    console.log('User:', req.user.id, req.user.role);
    
    const { startDate, endDate, employeeId } = req.query;
    const userId = req.user.id;
    
    console.log('📋 Parsed params:');
    console.log('  - employeeId:', employeeId);
    console.log('  - employeeId type:', typeof employeeId);
    console.log('  - employeeId is undefined?', employeeId === undefined);
    console.log('  - employeeId is empty string?', employeeId === '');
    
    // Determine which employee(s) to fetch data for
    let queryFilter = {};
    let findLatestPunch = false;
    const isAdminOrHR = req.user.role === 'admin' || req.user.role === 'hr';
    
    // Check if employeeId is provided and not empty
    if (employeeId && employeeId !== '') {
      // Specific employee requested - check permissions
      if (!isAdminOrHR) {
        const currentEmployee = await Employee.findOne({ user: userId });
        console.log('🔐 Permission check:');
        console.log('  - Current employee found:', currentEmployee ? currentEmployee.employeeId : 'NOT FOUND');
        console.log('  - Current employee _id:', currentEmployee?._id.toString());
        console.log('  - Requested employeeId:', employeeId);
        console.log('  - Do they match?', currentEmployee?._id.toString() === employeeId);
        
        if (!currentEmployee || currentEmployee._id.toString() !== employeeId) {
          console.log('❌ Permission denied: Employee mismatch');
          return res.status(403).json({ message: 'Not authorized to view this data' });
        }
        console.log('✅ Permission granted: Employee can view their own data');
      }
      queryFilter.employee = employeeId;
    } else {
      // No specific employee requested
      if (isAdminOrHR) {
        // Admin/HR requesting without employee - find latest punch for the date
        console.log('👑 Admin/HR requesting latest punch for date');
        findLatestPunch = true;
      } else {
        // Regular employee - only show their own records
        const employee = await Employee.findOne({ user: userId });
        if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
        }
        queryFilter.employee = employee._id;
      }
    }
    
    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate()
      };
    } else {
      // Default to current month
      dateFilter.date = {
        $gte: moment().startOf('month').toDate(),
        $lte: moment().endOf('month').toDate()
      };
    }
    
    // Fetch attendance records with punch records
    console.log('📅 Date filter:', dateFilter);
    console.log('👤 Query filter:', queryFilter);
    
    // If finding latest, also show who has attendance number 19 for debugging
    if (findLatestPunch) {
      const emp19 = await Employee.findOne({ attendanceNumber: '19' }).lean();
      if (emp19) {
        console.log('🔍 DEBUG: Employee with Att#19:', emp19.employeeId, 
                    emp19.personalInfo?.firstName, emp19.personalInfo?.lastName);
        // Check if they have attendance today
        const att19 = await Attendance.findOne({
          employee: emp19._id,
          ...dateFilter
        }).lean();
        if (att19) {
          console.log('   ✅ Has attendance record today with', att19.punchRecords?.length || 0, 'punches');
          if (att19.punchRecords && att19.punchRecords.length > 0) {
            const latestPunch = att19.punchRecords[att19.punchRecords.length - 1];
            console.log('   ⏰ Latest punch:', moment(latestPunch.time).format('HH:mm:ss'));
          }
        } else {
          console.log('   ❌ No attendance record today');
        }
      } else {
        console.log('🔍 DEBUG: No employee with Att#19 found');
      }
    }
    
    const attendanceRecords = await Attendance.find({
      ...queryFilter,
      ...dateFilter
    })
    .populate('employee', 'personalInfo.firstName personalInfo.lastName employeeId attendanceNumber')
    .sort({ date: -1, employee: 1 })
    .lean();
    
    console.log('📊 Found', attendanceRecords.length, 'attendance records');
    console.log('Punch records count per record:', attendanceRecords.map(r => r.punchRecords?.length || 0));
    console.log('📋 Employees with attendance:', attendanceRecords.map(r => 
      `${r.employee?.employeeId || 'N/A'} (Att#: ${r.employee?.attendanceNumber || 'N/A'}) - ${r.punchRecords?.length || 0} punches`
    ));
    
    // If finding latest punch and no records found, return empty
    if (findLatestPunch && attendanceRecords.length === 0) {
      return res.json({
        success: true,
        records: [],
        dateRange: {
          start: dateFilter.date?.$gte || null,
          end: dateFilter.date?.$lte || null
        },
        latestPunch: true
      });
    }
    
    // Process and aggregate data
    const processedRecords = attendanceRecords.map(record => {
      const punchRecords = record.punchRecords || [];
      
      // Sort punch records by time
      const sortedPunches = [...punchRecords].sort((a, b) => 
        new Date(a.time) - new Date(b.time)
      );
      
      // Get first and last punch (regardless of type)
      const firstPunch = sortedPunches.length > 0 ? sortedPunches[0] : null;
      const lastPunch = sortedPunches.length > 0 ? sortedPunches[sortedPunches.length - 1] : null;
      
      // Also get first IN and last OUT for backward compatibility
      const inPunches = sortedPunches.filter(p => p.type === 'in');
      const outPunches = sortedPunches.filter(p => p.type === 'out');
      const firstPunchIn = inPunches.length > 0 ? inPunches[0] : null;
      const lastPunchOut = outPunches.length > 0 ? outPunches[outPunches.length - 1] : null;
      
      // Calculate total hours between first and last punch (matches database calculation)
      let totalMinutes = 0;
      let hasActivePunch = false;
      
      if (firstPunch && lastPunch) {
        // Calculate time between first and last punch
        const diff = new Date(lastPunch.time) - new Date(firstPunch.time);
        totalMinutes = Math.floor(diff / (1000 * 60));
        
        // Check if still active (last punch is IN and it's the last punch overall)
        if (lastPunch.type === 'in') {
          hasActivePunch = true;
        }
      }
      
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return {
        _id: record._id,
        date: record.date,
        employee: record.employee,
        firstPunch: firstPunch,           // NEW: First punch (any type)
        lastPunch: lastPunch,             // NEW: Last punch (any type)
        firstPunchIn: firstPunchIn,       // Keep for backward compatibility
        lastPunchOut: lastPunchOut,       // Keep for backward compatibility
        punchRecords: sortedPunches,
        totalPunches: sortedPunches.length,
        totalHours: hours,
        totalMinutes: minutes,
        totalTimeFormatted: `${hours}h ${minutes}m`,
        status: record.status,
        isActiveSession: hasActivePunch,
        checkIn: record.checkIn,
        checkOut: record.checkOut
      };
    });
    
    // If we need to find the latest punch, return all records but mark the latest
    let finalRecords = processedRecords;
    let latestPunchInfo = null;
    
    if (findLatestPunch && processedRecords.length > 0) {
      console.log('🔍 Finding latest punch across all employees...');
      console.log('📊 Total records to check:', processedRecords.length);
      
      // Find the most recent punch across ALL employees
      let latestPunchTime = null;
      let latestPunchRecord = null;
      let latestPunchData = null;
      
      for (const record of processedRecords) {
        if (record.punchRecords && record.punchRecords.length > 0) {
          // Check ALL punches in this record
          for (const punch of record.punchRecords) {
            const punchTime = new Date(punch.time);
            
            if (!latestPunchTime || punchTime > latestPunchTime) {
              latestPunchTime = punchTime;
              latestPunchRecord = record;
              latestPunchData = punch;
              console.log('   🆕 New latest:', record.employee.employeeId, 
                          '- Punch at', moment(punchTime).format('HH:mm:ss'),
                          'Type:', punch.type);
            }
          }
        }
      }
      
      if (latestPunchRecord) {
        console.log('✅ FINAL RESULT - Latest punch:', latestPunchRecord.employee.employeeId, 
                    '(', latestPunchRecord.employee.personalInfo.firstName, latestPunchRecord.employee.personalInfo.lastName, ')',
                    'at', moment(latestPunchTime).format('HH:mm:ss'));
        
        // Store info about the latest punch
        latestPunchInfo = {
          employee: latestPunchRecord.employee,
          punch: latestPunchData,
          time: latestPunchTime
        };
        
        // Return ALL records, not just the latest
        finalRecords = processedRecords;
      } else {
        console.log('❌ No latest punch found');
        finalRecords = [];
      }
    }
    
    console.log('✅ Returning', finalRecords.length, 'processed records');
    
    res.json({
      success: true,
      records: finalRecords,
      dateRange: {
        start: dateFilter.date?.$gte || null,
        end: dateFilter.date?.$lte || null
      },
      latestPunch: findLatestPunch,
      latestPunchInfo: latestPunchInfo
    });
    
  } catch (error) {
    console.error('❌ Error fetching punch records:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   POST /api/attendance/import/preview
// @desc    Preview attendance data from Excel file before import
// @access  Private (Admin, HR)
router.post('/import/preview', [
  authenticate,
  authorize(['admin', 'hr']),
  upload.single('file')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('📥 Attendance import preview requested');
    console.log('📄 File:', req.file.originalname);

    // Read the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { 
      header: 1, // Get raw data with first row as array
      defval: '' // Default value for empty cells
    });

    if (jsonData.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    // Extract headers (first row)
    const headers = jsonData[0];
    
    // Extract data rows (remaining rows)
    const dataRows = jsonData.slice(1, Math.min(11, jsonData.length)); // Preview first 10 rows

    // Detect common column mappings
    const columnMapping = detectColumnMapping(headers);

    // Store file info in session for later import
    const fileInfo = {
      path: req.file.path,
      originalName: req.file.originalname,
      uploadedAt: new Date().toISOString(),
      totalRows: jsonData.length - 1, // Exclude header row
      headers: headers
    };

    res.json({
      success: true,
      fileInfo,
      headers,
      dataRows,
      suggestedMapping: columnMapping,
      totalRows: jsonData.length - 1,
      previewRows: dataRows.length
    });

  } catch (error) {
    console.error('❌ Error previewing attendance data:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      success: false,
      message: 'Error previewing file',
      error: error.message 
    });
  }
});

// @route   POST /api/attendance/import/execute
// @desc    Execute attendance data import from Excel file
// @access  Private (Admin, HR)
router.post('/import/execute', [
  authenticate,
  authorize(['admin', 'hr']),
  body('filePath').notEmpty(),
  body('columnMapping').isObject(),
  body('month').optional().isString(),
  body('year').optional().isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { filePath, columnMapping, month, year } = req.body;

    console.log('📥 Attendance import execution started');
    console.log('📄 File path:', filePath);
    console.log('🗺️  Column mapping:', columnMapping);

    // Verify file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ 
        success: false,
        message: 'File not found. Please upload the file again.' 
      });
    }

    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with headers
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: null });

    if (jsonData.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        success: false,
        message: 'No data found in Excel file' 
      });
    }

    console.log(`📊 Processing ${jsonData.length} attendance records...`);

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      created: [],
      updated: []
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i];
        const rowNumber = i + 2; // +2 because Excel rows start at 1 and first row is header

        // Extract data based on column mapping
        const employeeIdValue = row[columnMapping.employeeId];
        const dateValue = row[columnMapping.date];
        const checkInValue = row[columnMapping.checkIn];
        const checkOutValue = row[columnMapping.checkOut];
        const statusValue = row[columnMapping.status];

        // Validate required fields
        if (!employeeIdValue || !dateValue) {
          results.skipped++;
          results.errors.push({
            row: rowNumber,
            error: 'Missing employee ID or date'
          });
          continue;
        }

        // Find employee by employeeId
        const employee = await Employee.findOne({ employeeId: employeeIdValue });
        if (!employee) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            employeeId: employeeIdValue,
            error: `Employee not found: ${employeeIdValue}`
          });
          continue;
        }

        // Parse date
        let attendanceDate;
        if (typeof dateValue === 'number') {
          // Excel date serial number
          attendanceDate = moment(xlsx.SSF.parse_date_code(dateValue)).startOf('day').toDate();
        } else {
          // String date
          attendanceDate = moment(dateValue, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'DD-MM-YYYY']).startOf('day').toDate();
        }

        if (!attendanceDate || !moment(attendanceDate).isValid()) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            employeeId: employeeIdValue,
            error: `Invalid date format: ${dateValue}`
          });
          continue;
        }

        // Parse check-in time
        let checkInTime = null;
        if (checkInValue) {
          checkInTime = parseTimeValue(checkInValue, attendanceDate);
        }

        // Parse check-out time
        let checkOutTime = null;
        if (checkOutValue) {
          checkOutTime = parseTimeValue(checkOutValue, attendanceDate);
        }

        // Determine status
        let status = 'present';
        if (statusValue) {
          const normalizedStatus = statusValue.toString().toLowerCase().trim();
          if (['present', 'absent', 'late', 'half-day', 'holiday', 'weekend', 'on-leave'].includes(normalizedStatus)) {
            status = normalizedStatus;
          }
        } else if (!checkInTime && !checkOutTime) {
          status = 'absent';
        }

        // Calculate total hours if both check-in and check-out exist
        let totalHours = 0;
        let regularHours = 0;
        let overtimeHours = 0;
        
        if (checkInTime && checkOutTime) {
          const diffMs = checkOutTime - checkInTime;
          totalHours = Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
          regularHours = Math.min(totalHours, 8);
          overtimeHours = Math.max(0, totalHours - 8);
        }

        // Check if record already exists
        const existingAttendance = await Attendance.findOne({
          employee: employee._id,
          date: attendanceDate
        });

        const attendanceData = {
          employee: employee._id,
          date: attendanceDate,
          status,
          totalHours,
          regularHours,
          overtimeHours,
          isManualEntry: true,
          createdBy: req.user._id
        };

        // Add check-in data if available
        if (checkInTime) {
          attendanceData.checkIn = {
            time: checkInTime,
            method: 'manual',
            location: { address: 'Imported from Excel' }
          };

          // Determine if late
          const workStart = moment(attendanceDate).hour(9).minute(0);
          const isLate = moment(checkInTime).isAfter(workStart);
          const lateMinutes = isLate ? Math.ceil(moment(checkInTime).diff(workStart, 'minutes')) : 0;

          attendanceData.isLate = isLate;
          attendanceData.lateMinutes = lateMinutes;
        }

        // Add check-out data if available
        if (checkOutTime) {
          attendanceData.checkOut = {
            time: checkOutTime,
            method: 'manual',
            location: { address: 'Imported from Excel' }
          };
        }

        if (existingAttendance) {
          // Update existing record
          Object.assign(existingAttendance, attendanceData);
          existingAttendance.updatedAt = new Date();
          await existingAttendance.save();
          
          results.updated.push({
            employeeId: employeeIdValue,
            date: moment(attendanceDate).format('YYYY-MM-DD'),
            status
          });
          results.success++;
        } else {
          // Create new record
          const newAttendance = new Attendance(attendanceData);
          await newAttendance.save();
          
          results.created.push({
            employeeId: employeeIdValue,
            date: moment(attendanceDate).format('YYYY-MM-DD'),
            status
          });
          results.success++;
        }

      } catch (rowError) {
        console.error(`❌ Error processing row ${i + 2}:`, rowError);
        results.failed++;
        results.errors.push({
          row: i + 2,
          error: rowError.message
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    console.log('✅ Attendance import completed');
    console.log(`📊 Results: ${results.success} success, ${results.failed} failed, ${results.skipped} skipped`);

    res.json({
      success: true,
      message: `Import completed: ${results.success} records processed successfully`,
      results
    });

  } catch (error) {
    console.error('❌ Error executing attendance import:', error);

    // Clean up uploaded file if it exists
    if (req.body.filePath && fs.existsSync(req.body.filePath)) {
      fs.unlinkSync(req.body.filePath);
    }

    res.status(500).json({ 
      success: false,
      message: 'Error importing attendance data',
      error: error.message 
    });
  }
});

// Helper function to detect column mapping based on common header names
function detectColumnMapping(headers) {
  const mapping = {
    employeeId: null,
    date: null,
    checkIn: null,
    checkOut: null,
    status: null,
    totalHours: null
  };

  headers.forEach((header, index) => {
    const normalizedHeader = header.toString().toLowerCase().trim();

    // Employee ID variations
    if (normalizedHeader.match(/employee.*id|emp.*id|staff.*id|id/i)) {
      mapping.employeeId = header;
    }
    // Date variations
    else if (normalizedHeader.match(/date|day|attendance.*date/i)) {
      mapping.date = header;
    }
    // Check-in variations
    else if (normalizedHeader.match(/check.*in|in.*time|clock.*in|entry.*time|login/i)) {
      mapping.checkIn = header;
    }
    // Check-out variations
    else if (normalizedHeader.match(/check.*out|out.*time|clock.*out|exit.*time|logout/i)) {
      mapping.checkOut = header;
    }
    // Status variations
    else if (normalizedHeader.match(/status|attendance.*status|present|absent/i)) {
      mapping.status = header;
    }
    // Total hours variations
    else if (normalizedHeader.match(/total.*hours|hours.*worked|working.*hours/i)) {
      mapping.totalHours = header;
    }
  });

  return mapping;
}

// Helper function to parse time values from various formats
function parseTimeValue(timeValue, baseDate) {
  try {
    if (!timeValue) return null;

    // If it's already a Date object
    if (timeValue instanceof Date) {
      return timeValue;
    }

    // Excel time serial number (decimal between 0 and 1)
    if (typeof timeValue === 'number' && timeValue >= 0 && timeValue < 1) {
      const totalMinutes = Math.round(timeValue * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return moment(baseDate).hour(hours).minute(minutes).second(0).toDate();
    }

    // Excel date-time serial number (number > 1)
    if (typeof timeValue === 'number' && timeValue > 1) {
      return moment(xlsx.SSF.parse_date_code(timeValue)).toDate();
    }

    // String time format (e.g., "09:30", "9:30 AM", "09:30:00")
    if (typeof timeValue === 'string') {
      const timeStr = timeValue.trim();
      
      // Try parsing with various formats
      const formats = ['HH:mm:ss', 'HH:mm', 'h:mm A', 'h:mm:ss A', 'hh:mm A', 'hh:mm:ss A'];
      
      for (const format of formats) {
        const parsed = moment(timeStr, format, true);
        if (parsed.isValid()) {
          return moment(baseDate)
            .hour(parsed.hour())
            .minute(parsed.minute())
            .second(parsed.second())
            .toDate();
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error parsing time value:', timeValue, error);
    return null;
  }
}

// @route   POST /api/attendance/import-single
// @desc    Import a single attendance record (for batch imports from frontend)
// @access  Private (Admin, HR)
router.post('/import-single', 
  authenticate,
  authorize(['admin', 'hr']),
  async (req, res) => {
  try {
    // Validate input
    if (!req.body.employeeId || !req.body.date) {
      return res.status(400).json({ 
        success: false,
        message: 'employeeId and date are required' 
      });
    }

    const { employeeId, date, checkIn, checkOut, status } = req.body;

    // Find employee by employeeId
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      // Return success with skipped flag for historical employees no longer in system
      return res.status(200).json({
        success: true,
        skipped: true,
        message: `Employee not found in system (may be historical): ${employeeId}`
      });
    }

    // Parse date
    const attendanceDate = moment(date, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']).startOf('day').toDate();
    if (!moment(attendanceDate).isValid()) {
      return res.status(400).json({
        success: false,
        message: `Invalid date format: ${date}`
      });
    }

    // Parse times
    let checkInTime = null;
    if (checkIn) {
      checkInTime = parseTimeValue(checkIn, attendanceDate);
    }

    let checkOutTime = null;
    if (checkOut) {
      checkOutTime = parseTimeValue(checkOut, attendanceDate);
    }

    // Determine status
    let attendanceStatus = 'present';
    if (status) {
      const normalizedStatus = status.toString().toLowerCase().trim();
      if (['present', 'absent', 'late', 'half-day', 'holiday', 'weekend', 'on-leave'].includes(normalizedStatus)) {
        attendanceStatus = normalizedStatus;
      }
    } else if (!checkInTime && !checkOutTime) {
      attendanceStatus = 'absent';
    }

    // Calculate total hours
    let totalHours = 0;
    let regularHours = 0;
    let overtimeHours = 0;
    
    if (checkInTime && checkOutTime) {
      const diffMs = checkOutTime - checkInTime;
      totalHours = Math.max(0, diffMs / (1000 * 60 * 60));
      regularHours = Math.min(totalHours, 8);
      overtimeHours = Math.max(0, totalHours - 8);
    }

    // Check if record exists
    const existingAttendance = await Attendance.findOne({
      employee: employee._id,
      date: attendanceDate
    });

    const attendanceData = {
      employee: employee._id,
      date: attendanceDate,
      status: attendanceStatus,
      totalHours,
      regularHours,
      overtimeHours,
      isManualEntry: true,
      createdBy: req.user._id
    };

    if (checkInTime) {
      attendanceData.checkIn = {
        time: checkInTime,
        method: 'manual',
        location: { address: 'Imported from Rannkly Report' }
      };

      // Use OFFICE_CONFIG start time instead of hardcoded 9 AM
      const workStart = moment.tz(moment(attendanceDate).format('YYYY-MM-DD') + ' ' + OFFICE_CONFIG.workingHours.start, OFFICE_CONFIG.timezone);
      const isLate = moment(checkInTime).isAfter(workStart);
      const lateMinutes = isLate ? Math.ceil(moment(checkInTime).diff(workStart, 'minutes')) : 0;

      attendanceData.isLate = isLate;
      attendanceData.lateMinutes = lateMinutes;
    }

    if (checkOutTime) {
      attendanceData.checkOut = {
        time: checkOutTime,
        method: 'manual',
        location: { address: 'Imported from Rannkly Report' }
      };
    }

    let created = false;
    if (existingAttendance) {
      Object.assign(existingAttendance, attendanceData);
      existingAttendance.updatedAt = new Date();
      await existingAttendance.save();
    } else {
      const newAttendance = new Attendance(attendanceData);
      await newAttendance.save();
      created = true;
    }

    res.json({
      success: true,
      created,
      message: created ? 'Attendance record created' : 'Attendance record updated'
    });

  } catch (error) {
    console.error('❌ Error importing single record:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Request body:', req.body);
    
    // Ensure we always send a response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

// @route   GET /api/attendance/export
// @desc    Export attendance data to Excel or PDF
// @access  Private (Admin, HR, Manager)
router.get('/export', [
  authenticate,
  authorize(['admin', 'hr', 'manager']),
  query('format').isIn(['excel', 'pdf']),
  query('startDate').notEmpty().isISO8601(),
  query('endDate').notEmpty().isISO8601(),
  query('employeeId').optional().isString(),
  query('period').optional().isIn(['daily', 'weekly', 'monthly', 'custom'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { format, startDate, endDate, employeeId, period = 'custom' } = req.query;
    
    console.log('📊 Export request:', { format, startDate, endDate, employeeId, period });

    // Build employee filter
    let employeeFilter = {};
    if (employeeId && employeeId !== 'all') {
      // Single employee
      const employee = await Employee.findOne({ employeeId: employeeId });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      employeeFilter = { _id: employee._id };
    } else if (req.user.role === 'manager') {
      // Manager can only export their team's data
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
      // Admin/HR can export all active employees
      employeeFilter = { 'employmentInfo.isActive': true };
    }

    // Get employees
    const employees = await Employee.find(employeeFilter)
      .select('employeeId personalInfo.firstName personalInfo.lastName employmentInfo.department employmentInfo.designation')
      .populate('employmentInfo.department', 'name')
      .sort({ employeeId: 1 });

    if (employees.length === 0) {
      return res.status(404).json({ message: 'No employees found' });
    }

    // Parse date range
    const start = moment(startDate).startOf('day').toDate();
    const end = moment(endDate).endOf('day').toDate();

    // Get attendance records
    const attendanceRecords = await Attendance.find({
      employee: { $in: employees.map(emp => emp._id) },
      date: { $gte: start, $lte: end }
    }).populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName');

    // Create attendance map for quick lookup
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      const dateKey = moment(record.date).format('YYYY-MM-DD');
      const empId = record.employee._id.toString();
      
      if (!attendanceMap[empId]) {
        attendanceMap[empId] = {};
      }
      
      attendanceMap[empId][dateKey] = record;
    });

    // Generate days array
    const days = [];
    const currentDate = moment(start);
    while (currentDate.isSameOrBefore(end, 'day')) {
      days.push(currentDate.clone());
      currentDate.add(1, 'day');
    }

    if (format === 'excel') {
      // Generate Excel file with improved table format
      const exportData = [];
      
      // Title row
      exportData.push([`Attendance Report: ${moment(start).format('DD MMM YYYY')} to ${moment(end).format('DD MMM YYYY')}`]);
      exportData.push([]); // Empty row for spacing
      
      // Build header rows
      // Row 1: Main headers with date labels
      const dateHeaders = ['Employee ID', 'Name', 'Department', 'Designation'];
      days.forEach(day => {
        dateHeaders.push(day.format('DD-MMM-YYYY'));
        dateHeaders.push('', '', ''); // Placeholder for merged cells
      });
      dateHeaders.push('Summary', '', '', ''); // Summary header
      exportData.push(dateHeaders);
      
      // Row 2: Sub-headers for each date column
      const subHeaders = ['', '', '', '']; // Empty under employee info
      days.forEach(() => {
        subHeaders.push('Status', 'Check In', 'Check Out', 'Hours');
      });
      subHeaders.push('Present', 'Absent', 'Late', 'Total Hrs');
      exportData.push(subHeaders);
      
      // Data rows - one row per employee
      employees.forEach(emp => {
        const row = [
          emp.employeeId,
          `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
          emp.employmentInfo.department?.name || 'N/A',
          emp.employmentInfo.designation || 'N/A'
        ];

        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
        let totalHours = 0;

        // Add attendance data for each day (4 columns per day)
        days.forEach(day => {
          const dateKey = day.format('YYYY-MM-DD');
          const attendance = attendanceMap[emp._id.toString()]?.[dateKey];
          
          if (attendance) {
            const checkIn = attendance.checkIn?.time ? moment(attendance.checkIn.time).format('HH:mm') : '-';
            const checkOut = attendance.checkOut?.time ? moment(attendance.checkOut.time).format('HH:mm') : '-';
            const hours = attendance.totalHours ? attendance.totalHours.toFixed(2) : '0.00';
            const status = attendance.status.toUpperCase();
            
            row.push(status, checkIn, checkOut, hours);
            
            // Update counts
            if (attendance.status === 'present' || attendance.status === 'late') {
              presentCount++;
              totalHours += attendance.totalHours || 0;
            }
            if (attendance.status === 'absent') {
              absentCount++;
            }
            if (attendance.status === 'late') {
              lateCount++;
            }
          } else {
            // Check if weekend
            const dayOfWeek = day.day();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const status = isWeekend ? 'WEEKEND' : 'ABSENT';
            row.push(status, '-', '-', '0.00');
            if (!isWeekend) {
              absentCount++;
            }
          }
        });

        // Add summary columns
        row.push(presentCount, absentCount, lateCount, totalHours.toFixed(2));
        exportData.push(row);
      });

      // Create workbook
      const ws = xlsx.utils.aoa_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Attendance');

      // Set column widths - 4 columns per day plus employee info and summary
      const colWidths = [
        { wch: 12 },  // Employee ID
        { wch: 25 },  // Employee Name
        { wch: 18 },  // Department
        { wch: 18 },  // Designation
      ];
      
      // Add widths for each day (4 columns per day)
      days.forEach(() => {
        colWidths.push(
          { wch: 10 },  // Status
          { wch: 10 },  // Check In
          { wch: 10 },  // Check Out
          { wch: 8 }    // Hours
        );
      });
      
      // Summary column widths
      colWidths.push(
        { wch: 10 },  // Present
        { wch: 10 },  // Absent
        { wch: 10 },  // Late
        { wch: 12 }   // Total Hours
      );
      
      ws['!cols'] = colWidths;

      // Generate buffer
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Send file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Attendance_Report_${moment(start).format('YYYY-MM-DD')}_to_${moment(end).format('YYYY-MM-DD')}.xlsx`);
      res.send(buffer);

    } else if (format === 'pdf') {
      // Generate PDF file with table layout using PDFKit
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ 
        margin: 30, 
        size: 'A4',
        layout: 'landscape' 
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Attendance_Report_${moment(start).format('YYYY-MM-DD')}_to_${moment(end).format('YYYY-MM-DD')}.pdf`);

      // Pipe PDF to response
      doc.pipe(res);

      // Helper function to draw a table
      const drawTable = (doc, data, startY, headers) => {
        const colWidths = [60, 70, 70, 50]; // Date, Status, Check In, Check Out, Hours
        const rowHeight = 18;
        const startX = 30;
        let currentY = startY;

        // Draw header row
        doc.fontSize(9).font('Helvetica-Bold');
        doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fillAndStroke('#4472C4', '#000');
        
        let currentX = startX;
        doc.fillColor('#ffffff');
        headers.forEach((header, i) => {
          doc.text(header, currentX + 5, currentY + 5, { width: colWidths[i] - 10, align: 'center' });
          currentX += colWidths[i];
        });
        currentY += rowHeight;

        // Draw data rows
        doc.font('Helvetica').fontSize(8);
        data.forEach((row, index) => {
          // Check for page break
          if (currentY > 500) {
            doc.addPage();
            currentY = 50;
            
            // Redraw header on new page
            doc.fontSize(9).font('Helvetica-Bold');
            doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fillAndStroke('#4472C4', '#000');
            
            currentX = startX;
            doc.fillColor('#ffffff');
            headers.forEach((header, i) => {
              doc.text(header, currentX + 5, currentY + 5, { width: colWidths[i] - 10, align: 'center' });
              currentX += colWidths[i];
            });
            currentY += rowHeight;
            doc.font('Helvetica').fontSize(8);
          }

          // Alternate row colors
          const fillColor = index % 2 === 0 ? '#f0f0f0' : '#ffffff';
          doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fillAndStroke(fillColor, '#cccccc');
          
          currentX = startX;
          doc.fillColor('#000000');
          row.forEach((cell, i) => {
            doc.text(String(cell), currentX + 5, currentY + 5, { width: colWidths[i] - 10, align: i === 0 ? 'left' : 'center' });
            currentX += colWidths[i];
          });
          currentY += rowHeight;
        });

        return currentY;
      };

      // Add title
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000').text('Attendance Report', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text(`Period: ${moment(start).format('DD MMM YYYY')} to ${moment(end).format('DD MMM YYYY')}`, { align: 'center' });
      doc.moveDown(2);

      // Process each employee
      employees.forEach((emp, empIndex) => {
        // Check if we need a new page for employee header
        if (doc.y > 480) {
          doc.addPage();
        }

        // Employee header
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000')
          .text(`${emp.employeeId} - ${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`, 30, doc.y);
        doc.fontSize(9).font('Helvetica')
          .text(`Department: ${emp.employmentInfo.department?.name || 'N/A'} | Designation: ${emp.employmentInfo.designation || 'N/A'}`, 30, doc.y);
        doc.moveDown(0.5);

        // Prepare attendance data for table
        const tableData = [];
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;
        let totalHours = 0;

        days.forEach(day => {
          const dateKey = day.format('YYYY-MM-DD');
          const attendance = attendanceMap[emp._id.toString()]?.[dateKey];
          
          if (attendance) {
            const checkIn = attendance.checkIn?.time ? moment(attendance.checkIn.time).format('HH:mm') : '-';
            const checkOut = attendance.checkOut?.time ? moment(attendance.checkOut.time).format('HH:mm') : '-';
            const hours = attendance.totalHours ? attendance.totalHours.toFixed(2) : '0.00';
            const status = attendance.status.toUpperCase();
            
            tableData.push([
              day.format('DD-MMM-YYYY'),
              status,
              checkIn,
              checkOut,
              hours
            ]);
            
            if (attendance.status === 'present' || attendance.status === 'late') {
              presentCount++;
              totalHours += attendance.totalHours || 0;
            }
            if (attendance.status === 'absent') {
              absentCount++;
            }
            if (attendance.status === 'late') {
              lateCount++;
            }
          } else {
            const dayOfWeek = day.day();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const status = isWeekend ? 'WEEKEND' : 'ABSENT';
            
            tableData.push([
              day.format('DD-MMM-YYYY'),
              status,
              '-',
              '-',
              '0.00'
            ]);
            
            if (!isWeekend) {
              absentCount++;
            }
          }
        });

        // Draw attendance table
        const tableHeaders = ['Date', 'Status', 'Check In', 'Check Out', 'Hours'];
        const endY = drawTable(doc, tableData, doc.y, tableHeaders);
        doc.y = endY + 10;

        // Add summary
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000')
          .text(`Summary: Present: ${presentCount} | Absent: ${absentCount} | Late: ${lateCount} | Total Hours: ${totalHours.toFixed(2)}h`, 30, doc.y);
        doc.moveDown(1.5);

        // Add separator line between employees
        if (empIndex < employees.length - 1) {
          doc.strokeColor('#cccccc').lineWidth(1).moveTo(30, doc.y).lineTo(800, doc.y).stroke();
          doc.moveDown(1);
        }
      });

      // Finalize PDF
      doc.end();
    }

  } catch (error) {
    console.error('❌ Error exporting attendance:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        message: 'Error exporting attendance data',
        error: error.message 
      });
    }
  }
});

// @route   GET /api/attendance/late-employees-report
// @desc    Export report of employees who came late (after 10:00 AM) and did not complete 9 hours
// @access  Private (Admin, HR, Manager)
router.get('/late-employees-report', [
  authenticate,
  authorize(['admin', 'hr', 'manager']),
  query('format').optional().isIn(['excel', 'pdf']).withMessage('Format must be excel or pdf'),
  query('startDate').notEmpty().isISO8601().withMessage('Start date is required'),
  query('endDate').notEmpty().isISO8601().withMessage('End date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { format = 'excel', startDate, endDate } = req.query;
    const start = moment(startDate).startOf('day').toDate();
    const end = moment(endDate).endOf('day').toDate();
    
    console.log('📊 Late employees report request:', { format, startDate, endDate });

    // Build employee filter based on role
    let employeeFilter = { 'employmentInfo.isActive': true };
    if (req.user.role === 'manager') {
      const managerEmployee = await Employee.findOne({ user: req.user._id });
      if (!managerEmployee) {
        return res.status(404).json({ message: 'Manager employee profile not found' });
      }
      
      const teamMembers = await Employee.find({
        'employmentInfo.reportingManager': managerEmployee._id,
        'employmentInfo.isActive': true
      }).select('_id');
      
      employeeFilter = { _id: { $in: teamMembers.map(emp => emp._id) } };
    }

    // Get employees
    const employees = await Employee.find(employeeFilter)
      .select('employeeId personalInfo.firstName personalInfo.lastName employmentInfo.department employmentInfo.designation')
      .populate('employmentInfo.department', 'name');

    // Get attendance records for the date range
    const attendanceRecords = await Attendance.find({
      employee: { $in: employees.map(emp => emp._id) },
      date: { $gte: start, $lte: end }
    }).populate('employee', 'employeeId personalInfo.firstName personalInfo.lastName employmentInfo.department employmentInfo.designation');

    // Filter for late arrivals (after 10:00 AM) and incomplete hours (< 9)
    const lateEmployeeRecords = [];
    const employeeStatsMap = new Map(); // Track stats per employee
    
    attendanceRecords.forEach(record => {
      if (!record.employee) {
        return; // Skip if no employee
      }

      // Get first and last punch times (this is how totalHours is calculated)
      let firstPunchTime = null;
      let lastPunchTime = null;
      let checkInTime = null;
      
      if (record.punchRecords && record.punchRecords.length > 0) {
        // Sort punches by time
        const sortedPunches = [...record.punchRecords].sort((a, b) => new Date(a.time) - new Date(b.time));
        firstPunchTime = moment(sortedPunches[0].time);
        lastPunchTime = moment(sortedPunches[sortedPunches.length - 1].time);
        
        // Get first IN punch for late calculation
        const firstInPunch = sortedPunches.find(p => p.type === 'in');
        checkInTime = firstInPunch ? moment(firstInPunch.time) : firstPunchTime;
      } else if (record.checkIn && record.checkIn.time) {
        // Fallback to old checkIn/checkOut if no punch records
        firstPunchTime = moment(record.checkIn.time);
        lastPunchTime = record.checkOut?.time ? moment(record.checkOut.time) : firstPunchTime;
        checkInTime = firstPunchTime;
      } else {
        return; // Skip if no punch data at all
      }

      const checkInHour = checkInTime.hour();
      const checkInMinute = checkInTime.minute();
      const totalHours = record.totalHours || 0;
      
      // Check if came after 10:00 AM
      const isLateCheckIn = checkInHour > 10 || (checkInHour === 10 && checkInMinute > 0);
      
      // Check if did not complete 9 hours
      const incompleteHours = totalHours < 9;
      
      // Include only if both conditions are met
      if (isLateCheckIn && incompleteHours) {
        const empId = record.employee._id.toString();
        const empKey = record.employee.employeeId || empId;
        
        // Update employee stats
        if (!employeeStatsMap.has(empKey)) {
          employeeStatsMap.set(empKey, {
            employeeId: record.employee.employeeId,
            name: `${record.employee.personalInfo.firstName} ${record.employee.personalInfo.lastName}`,
            department: record.employee.employmentInfo?.department?.name || 'N/A',
            designation: record.employee.employmentInfo?.designation || 'N/A',
            totalLateDays: 0,
            totalIncompleteHours: 0,
            records: []
          });
        }
        
        const stats = employeeStatsMap.get(empKey);
        stats.totalLateDays += 1;
        stats.totalIncompleteHours += (9 - totalHours);
        
        lateEmployeeRecords.push({
          employeeId: record.employee.employeeId,
          employeeName: `${record.employee.personalInfo.firstName} ${record.employee.personalInfo.lastName}`,
          department: record.employee.employmentInfo?.department?.name || 'N/A',
          designation: record.employee.employmentInfo?.designation || 'N/A',
          date: moment(record.date).format('YYYY-MM-DD'),
          checkInTime: checkInTime.format('HH:mm'),
          firstPunchTime: firstPunchTime.format('HH:mm'),
          lastPunchTime: lastPunchTime.format('HH:mm'),
          checkOutTime: record.checkOut?.time ? moment(record.checkOut.time).format('HH:mm') : 'N/A',
          totalPunches: record.punchRecords?.length || 0,
          totalHours: totalHours.toFixed(2),
          hoursShort: (9 - totalHours).toFixed(2),
          minutesLate: isLateCheckIn ? ((checkInHour - 10) * 60 + checkInMinute) : 0
        });
        
        stats.records.push({
          date: moment(record.date).format('YYYY-MM-DD'),
          checkInTime: checkInTime.format('HH:mm'),
          firstPunchTime: firstPunchTime.format('HH:mm'),
          lastPunchTime: lastPunchTime.format('HH:mm'),
          totalHours: totalHours.toFixed(2),
          hoursShort: (9 - totalHours).toFixed(2)
        });
      }
    });

    console.log(`📋 Found ${lateEmployeeRecords.length} records of late arrivals with incomplete hours`);

    if (lateEmployeeRecords.length === 0) {
      return res.status(404).json({ 
        message: 'No employees found who came late (after 10:00 AM) and did not complete 9 hours during this period' 
      });
    }

    // Generate Excel report
    if (format === 'excel') {
      const exportData = [];
      
      // Title row
      exportData.push(['Late Employees Report (After 10:00 AM & < 9 Hours)']);
      exportData.push([`Period: ${moment(start).format('DD MMM YYYY')} to ${moment(end).format('DD MMM YYYY')}`]);
      exportData.push([`Generated on: ${moment().format('DD MMM YYYY HH:mm')}`]);
      exportData.push([`Total Records: ${lateEmployeeRecords.length}`]);
      exportData.push([]); // Empty row
      exportData.push(['NOTE: Total Hours is calculated from First Punch to Last Punch (includes all IN/OUT punches)']);
      exportData.push(['Late calculation is based on Check-In time (first IN punch after 10:00 AM)']);
      exportData.push([]); // Empty row
      
      // Headers
      exportData.push([
        'Employee ID',
        'Employee Name',
        'Department',
        'Designation',
        'Date',
        'First Punch',
        'Last Punch',
        'Total Punches',
        'Total Hours',
        'Hours Short of 9',
        'Check-In (First IN)',
        'Minutes Late'
      ]);
      
      // Data rows
      lateEmployeeRecords.forEach(record => {
        exportData.push([
          record.employeeId,
          record.employeeName,
          record.department,
          record.designation,
          record.date,
          record.firstPunchTime,
          record.lastPunchTime,
          record.totalPunches,
          record.totalHours,
          record.hoursShort,
          record.checkInTime,
          record.minutesLate
        ]);
      });
      
      // Add summary section
      exportData.push([]); // Empty row
      exportData.push(['EMPLOYEE SUMMARY']);
      exportData.push([
        'Employee ID',
        'Employee Name',
        'Department',
        'Total Late Days',
        'Total Hours Short'
      ]);
      
      // Sort by total late days descending
      const sortedStats = Array.from(employeeStatsMap.values()).sort((a, b) => b.totalLateDays - a.totalLateDays);
      
      sortedStats.forEach(stats => {
        exportData.push([
          stats.employeeId,
          stats.name,
          stats.department,
          stats.totalLateDays,
          stats.totalIncompleteHours.toFixed(2)
        ]);
      });

      // Create workbook
      const ws = xlsx.utils.aoa_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Late Employees');

      // Set column widths
      ws['!cols'] = [
        { wch: 15 },  // Employee ID
        { wch: 25 },  // Employee Name
        { wch: 20 },  // Department
        { wch: 20 },  // Designation
        { wch: 12 },  // Date
        { wch: 12 },  // First Punch
        { wch: 12 },  // Last Punch
        { wch: 12 },  // Total Punches
        { wch: 12 },  // Total Hours
        { wch: 15 },  // Hours Short
        { wch: 15 },  // Check-In (First IN)
        { wch: 12 }   // Minutes Late
      ];

      // Generate buffer
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Send file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Late_Employees_Report_${moment(start).format('YYYY-MM-DD')}_to_${moment(end).format('YYYY-MM-DD')}.xlsx`);
      res.send(buffer);

    } else if (format === 'pdf') {
      // Generate PDF
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ 
        size: 'A4', 
        layout: 'landscape',
        margin: 40 
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Late_Employees_Report_${moment(start).format('YYYY-MM-DD')}_to_${moment(end).format('YYYY-MM-DD')}.pdf`);

      // Pipe to response
      doc.pipe(res);

      // Title
      doc.fontSize(18).font('Helvetica-Bold').text('Late Employees Report', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('(Arrived after 10:00 AM & Did not complete 9 hours)', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Period: ${moment(start).format('DD MMM YYYY')} to ${moment(end).format('DD MMM YYYY')}`, { align: 'center' });
      doc.text(`Generated on: ${moment().format('DD MMM YYYY HH:mm')}`, { align: 'center' });
      doc.text(`Total Records: ${lateEmployeeRecords.length}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(8).font('Helvetica-Oblique').text('Note: Total Hours calculated from First Punch to Last Punch', { align: 'center' });
      doc.moveDown(1);

      // Table configuration
      const tableTop = doc.y;
      const tableLeft = 40;
      const colWidths = [80, 120, 100, 80, 70, 70, 60, 60];
      let yPosition = tableTop;

      // Draw table headers
      doc.fontSize(8).font('Helvetica-Bold');
      const headers = ['Employee ID', 'Name', 'Department', 'Date', 'First Punch', 'Last Punch', 'Hours', 'Short'];
      let xPos = tableLeft;
      headers.forEach((header, i) => {
        doc.text(header, xPos, yPosition, { width: colWidths[i], align: 'left' });
        xPos += colWidths[i];
      });
      
      yPosition += 20;
      doc.moveTo(tableLeft, yPosition).lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), yPosition).stroke();
      yPosition += 5;

      // Draw table rows
      doc.font('Helvetica').fontSize(7);
      lateEmployeeRecords.forEach((record, index) => {
        if (yPosition > 520) { // Check if we need a new page
          doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
          yPosition = 40;
          
          // Redraw headers on new page
          doc.fontSize(8).font('Helvetica-Bold');
          xPos = tableLeft;
          headers.forEach((header, i) => {
            doc.text(header, xPos, yPosition, { width: colWidths[i], align: 'left' });
            xPos += colWidths[i];
          });
          yPosition += 20;
          doc.moveTo(tableLeft, yPosition).lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), yPosition).stroke();
          yPosition += 5;
          doc.font('Helvetica').fontSize(7);
        }

        xPos = tableLeft;
        const rowData = [
          record.employeeId,
          record.employeeName,
          record.department,
          moment(record.date).format('DD MMM'),
          record.firstPunchTime,
          record.lastPunchTime,
          record.totalHours,
          record.hoursShort
        ];
        
        rowData.forEach((data, i) => {
          doc.text(data || 'N/A', xPos, yPosition, { width: colWidths[i], align: 'left' });
          xPos += colWidths[i];
        });
        
        yPosition += 15;
      });

      // Add summary section on new page
      doc.addPage({ size: 'A4', layout: 'portrait', margin: 40 });
      doc.fontSize(14).font('Helvetica-Bold').text('Employee Summary', 40, 40);
      doc.moveDown(1);

      yPosition = doc.y;
      const summaryColWidths = [100, 150, 120, 80, 100];
      
      // Summary headers
      doc.fontSize(9).font('Helvetica-Bold');
      const summaryHeaders = ['Employee ID', 'Name', 'Department', 'Late Days', 'Hours Short'];
      xPos = 40;
      summaryHeaders.forEach((header, i) => {
        doc.text(header, xPos, yPosition, { width: summaryColWidths[i], align: 'left' });
        xPos += summaryColWidths[i];
      });
      
      yPosition += 20;
      doc.moveTo(40, yPosition).lineTo(40 + summaryColWidths.reduce((a, b) => a + b, 0), yPosition).stroke();
      yPosition += 5;

      // Summary data
      doc.font('Helvetica').fontSize(8);
      const sortedStats = Array.from(employeeStatsMap.values()).sort((a, b) => b.totalLateDays - a.totalLateDays);
      
      sortedStats.forEach(stats => {
        if (yPosition > 720) {
          doc.addPage({ size: 'A4', layout: 'portrait', margin: 40 });
          yPosition = 40;
        }

        xPos = 40;
        const summaryData = [
          stats.employeeId,
          stats.name,
          stats.department,
          stats.totalLateDays.toString(),
          stats.totalIncompleteHours.toFixed(2)
        ];
        
        summaryData.forEach((data, i) => {
          doc.text(data || 'N/A', xPos, yPosition, { width: summaryColWidths[i], align: 'left' });
          xPos += summaryColWidths[i];
        });
        
        yPosition += 18;
      });

      // Finalize PDF
      doc.end();
    }

  } catch (error) {
    console.error('❌ Error generating late employees report:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        message: 'Error generating late employees report',
        error: error.message 
      });
    }
  }
});

module.exports = router;