const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { authenticate } = require('../middleware/auth');
const moment = require('moment-timezone');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/face_detection');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'face-' + uniqueSuffix + '.jpg');
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Office configuration
const OFFICE_CONFIG = {
  timezone: 'Asia/Kolkata',
  workingHours: {
    start: '10:00', // Office starts at 10 AM
    end: '19:00' // Office ends at 7 PM
  }
};

// Helper function to get current time in office timezone
const getOfficeTime = () => {
  return moment().tz(OFFICE_CONFIG.timezone);
};

// @route   POST /api/face-detection/register-face
// @desc    Register employee face for face detection attendance
// @access  Private (Admin, HR)
router.post('/register-face', [
  authenticate,
  upload.single('faceImage'),
  body('employeeId').isString().notEmpty(),
  body('faceEmbedding').optional().isString()
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

    const { employeeId, faceEmbedding } = req.body;
    const faceImage = req.file;

    // Find employee
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    // Store face data
    const faceData = {
      faceImage: faceImage ? faceImage.filename : null,
      faceEmbedding: faceEmbedding || null,
      registeredAt: new Date(),
      registeredBy: req.user._id
    };

    // Update employee with face data
    employee.faceData = faceData;
    await employee.save();

    res.json({
      success: true,
      message: 'Face registered successfully',
      faceData: {
        employeeId: employee.employeeId,
        employeeName: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
        registeredAt: faceData.registeredAt
      }
    });

  } catch (error) {
    console.error('Error registering face:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to register face',
      error: error.message 
    });
  }
});

// @route   POST /api/face-detection/verify-and-checkin
// @desc    Verify face and mark attendance (check-in)
// @access  Public (for tablet kiosk)
router.post('/verify-and-checkin', [
  upload.single('faceImage'),
  body('faceEmbedding').optional().isString(),
  body('deviceInfo').optional().isObject(),
  body('location').optional().isObject()
], async (req, res) => {
  try {
    const { faceEmbedding, deviceInfo, location } = req.body;
    const faceImage = req.file;

    if (!faceImage && !faceEmbedding) {
      return res.status(400).json({ 
        success: false,
        message: 'Face image or embedding is required' 
      });
    }

    // TODO: Implement face recognition logic here
    // For now, we'll simulate face matching
    const recognizedEmployee = await simulateFaceRecognition(faceImage, faceEmbedding);
    
    if (!recognizedEmployee) {
      return res.status(404).json({ 
        success: false,
        message: 'Face not recognized. Please register your face first.',
        code: 'FACE_NOT_RECOGNIZED'
      });
    }

    // Check if employee is already checked in today
    const officeTime = getOfficeTime();
    const today = officeTime.clone().startOf('day').toDate();
    
    const existingAttendance = await Attendance.findOne({
      employee: recognizedEmployee._id,
      date: today
    });

    if (existingAttendance && existingAttendance.checkIn?.time) {
      return res.status(400).json({ 
        success: false,
        message: 'Already checked in today',
        checkInTime: moment(existingAttendance.checkIn.time).tz(OFFICE_CONFIG.timezone).format('HH:mm'),
        employee: {
          employeeId: recognizedEmployee.employeeId,
          name: `${recognizedEmployee.personalInfo.firstName} ${recognizedEmployee.personalInfo.lastName}`
        }
      });
    }

    // Mark attendance
    const checkInTime = officeTime.toDate();
    const workStart = moment.tz(officeTime.format('YYYY-MM-DD') + ' ' + OFFICE_CONFIG.workingHours.start, OFFICE_CONFIG.timezone);
    const isLate = officeTime.isAfter(workStart);
    const lateMinutes = isLate ? Math.ceil(officeTime.diff(workStart, 'minutes')) : 0;

    const attendanceData = {
      employee: recognizedEmployee._id,
      date: today,
      checkIn: {
        time: checkInTime,
        location: location || { 
          address: 'Office Location (Face Detection)', 
          method: 'face-detection'
        },
        method: 'face-detection',
        deviceInfo: deviceInfo || { 
          userAgent: req.headers['user-agent'],
          device: 'Tablet Kiosk'
        },
        ipAddress: req.ip,
        faceImage: faceImage ? faceImage.filename : null,
        faceEmbedding: faceEmbedding,
        isValidLocation: true
      },
      status: isLate ? 'late' : 'present',
      isLate: isLate,
      lateMinutes: lateMinutes
    };

    let attendance;
    if (existingAttendance) {
      Object.assign(existingAttendance, attendanceData);
      attendance = await existingAttendance.save();
    } else {
      attendance = new Attendance(attendanceData);
      await attendance.save();
    }

    console.log('✅ Face detection check-in successful for employee:', recognizedEmployee.employeeId, 'at', officeTime.format('HH:mm'));

    const lateMessage = isLate 
      ? ` (${Math.floor(lateMinutes / 60)}h ${lateMinutes % 60}m late)`
      : '';

    res.json({
      success: true,
      message: `Check-in successful at ${officeTime.format('HH:mm')}${lateMessage}`,
      isLate: isLate,
      lateMinutes: lateMinutes,
      checkInTime: officeTime.format('HH:mm'),
      employee: {
        employeeId: recognizedEmployee.employeeId,
        name: `${recognizedEmployee.personalInfo.firstName} ${recognizedEmployee.personalInfo.lastName}`,
        department: recognizedEmployee.employmentInfo?.department?.name || 'N/A'
      },
      attendance: {
        checkIn: attendance.checkIn,
        status: attendance.status,
        isLate: attendance.isLate,
        lateMinutes: attendance.lateMinutes
      }
    });

  } catch (error) {
    console.error('❌ Error in face detection check-in:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process face detection check-in',
      error: error.message 
    });
  }
});

// @route   POST /api/face-detection/verify-and-checkout
// @desc    Verify face and mark attendance (check-out)
// @access  Public (for tablet kiosk)
router.post('/verify-and-checkout', [
  upload.single('faceImage'),
  body('faceEmbedding').optional().isString(),
  body('deviceInfo').optional().isObject(),
  body('location').optional().isObject()
], async (req, res) => {
  try {
    const { faceEmbedding, deviceInfo, location } = req.body;
    const faceImage = req.file;

    if (!faceImage && !faceEmbedding) {
      return res.status(400).json({ 
        success: false,
        message: 'Face image or embedding is required' 
      });
    }

    // TODO: Implement face recognition logic here
    const recognizedEmployee = await simulateFaceRecognition(faceImage, faceEmbedding);
    
    if (!recognizedEmployee) {
      return res.status(404).json({ 
        success: false,
        message: 'Face not recognized. Please register your face first.',
        code: 'FACE_NOT_RECOGNIZED'
      });
    }

    // Find today's attendance record
    const officeTime = getOfficeTime();
    const today = officeTime.clone().startOf('day').toDate();
    
    const attendance = await Attendance.findOne({
      employee: recognizedEmployee._id,
      date: today
    });

    if (!attendance || !attendance.checkIn?.time) {
      return res.status(400).json({ 
        success: false,
        message: 'Please check-in first before checking out',
        employee: {
          employeeId: recognizedEmployee.employeeId,
          name: `${recognizedEmployee.personalInfo.firstName} ${recognizedEmployee.personalInfo.lastName}`
        }
      });
    }

    if (attendance.checkOut?.time) {
      return res.status(400).json({ 
        success: false,
        message: 'Already checked out today',
        checkOutTime: moment(attendance.checkOut.time).tz(OFFICE_CONFIG.timezone).format('HH:mm'),
        employee: {
          employeeId: recognizedEmployee.employeeId,
          name: `${recognizedEmployee.personalInfo.firstName} ${recognizedEmployee.personalInfo.lastName}`
        }
      });
    }

    // Mark checkout
    const checkOutTime = officeTime.toDate();
    
    attendance.checkOut = {
      time: checkOutTime,
      location: location || { 
        address: 'Office Location (Face Detection)', 
        method: 'face-detection'
      },
      method: 'face-detection',
      deviceInfo: deviceInfo || { 
        userAgent: req.headers['user-agent'],
        device: 'Tablet Kiosk'
      },
      ipAddress: req.ip,
      faceImage: faceImage ? faceImage.filename : null,
      faceEmbedding: faceEmbedding,
      isValidLocation: true
    };

    // Calculate total hours
    const checkInMoment = moment(attendance.checkIn.time).tz(OFFICE_CONFIG.timezone);
    const checkOutMoment = officeTime;
    const totalHours = checkOutMoment.diff(checkInMoment, 'minutes') / 60;
    attendance.totalHours = Math.round(totalHours * 100) / 100;

    await attendance.save();

    console.log('✅ Face detection check-out successful for employee:', recognizedEmployee.employeeId, 'at', officeTime.format('HH:mm'));

    res.json({
      success: true,
      message: `Check-out successful at ${officeTime.format('HH:mm')}`,
      checkOutTime: officeTime.format('HH:mm'),
      totalHours: attendance.totalHours,
      workingHours: `${Math.floor(attendance.totalHours)}h ${Math.round((attendance.totalHours % 1) * 60)}m`,
      employee: {
        employeeId: recognizedEmployee.employeeId,
        name: `${recognizedEmployee.personalInfo.firstName} ${recognizedEmployee.personalInfo.lastName}`,
        department: recognizedEmployee.employmentInfo?.department?.name || 'N/A'
      },
      attendance: {
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        totalHours: attendance.totalHours
      }
    });

  } catch (error) {
    console.error('❌ Error in face detection check-out:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process face detection check-out',
      error: error.message 
    });
  }
});

// @route   GET /api/face-detection/employees
// @desc    Get list of employees with face data
// @access  Private (Admin, HR)
router.get('/employees', authenticate, async (req, res) => {
  try {
    const employees = await Employee.find({ 
      'faceData.faceImage': { $exists: true } 
    }).select('employeeId personalInfo.firstName personalInfo.lastName faceData employmentInfo.department');

    const employeesWithFaceData = employees.map(emp => ({
      _id: emp._id,
      employeeId: emp.employeeId,
      name: `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
      department: emp.employmentInfo?.department?.name || 'N/A',
      faceRegistered: !!emp.faceData?.faceImage,
      registeredAt: emp.faceData?.registeredAt
    }));

    res.json({
      success: true,
      employees: employeesWithFaceData,
      total: employeesWithFaceData.length
    });

  } catch (error) {
    console.error('Error fetching employees with face data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch employees with face data',
      error: error.message 
    });
  }
});

// @route   DELETE /api/face-detection/employee/:employeeId
// @desc    Remove face data for an employee
// @access  Private (Admin, HR)
router.delete('/employee/:employeeId', authenticate, async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    // Remove face image file if exists
    if (employee.faceData?.faceImage) {
      const imagePath = path.join(__dirname, '../uploads/face_detection', employee.faceData.faceImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove face data from employee record
    employee.faceData = undefined;
    await employee.save();

    res.json({
      success: true,
      message: 'Face data removed successfully',
      employee: {
        employeeId: employee.employeeId,
        name: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`
      }
    });

  } catch (error) {
    console.error('Error removing face data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to remove face data',
      error: error.message 
    });
  }
});

// Helper function to simulate face recognition
// TODO: Replace with actual face recognition implementation
async function simulateFaceRecognition(faceImage, faceEmbedding) {
  // For demo purposes, we'll return a random employee
  // In production, implement actual face recognition logic here
  const employees = await Employee.find({ 
    'faceData.faceImage': { $exists: true } 
  }).limit(1);
  
  return employees.length > 0 ? employees[0] : null;
}

module.exports = router;

