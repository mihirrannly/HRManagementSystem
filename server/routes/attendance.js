const express = require('express');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

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
    const { location } = req.body;
    
    // Mock check-in response
    const checkInTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    res.json({
      success: true,
      message: 'Checked in successfully',
      checkInTime,
      location: location || 'Office'
    });

  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance/checkout
// @desc    Check out for attendance
// @access  Private
router.post('/checkout', authenticate, async (req, res) => {
  try {
    // Mock check-out response
    const checkOutTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    res.json({
      success: true,
      message: 'Checked out successfully',
      checkOutTime,
      totalWorkingHours: '8:45'
    });

  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;