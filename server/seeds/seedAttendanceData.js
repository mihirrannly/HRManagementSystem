const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// Office configuration
const OFFICE_CONFIG = {
  timezone: 'Asia/Kolkata',
  workingHours: {
    start: '09:00',
    end: '18:00'
  }
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly-hr');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Generate random time within a range
const getRandomTime = (baseHour, baseMinute, variationMinutes = 30) => {
  const variation = Math.floor(Math.random() * variationMinutes * 2) - variationMinutes;
  return moment().hour(baseHour).minute(baseMinute).add(variation, 'minutes');
};

// Generate attendance status based on probabilities
const generateAttendanceStatus = (checkInTime) => {
  const workStart = moment().hour(9).minute(0);
  const lateThreshold = moment().hour(9).minute(15);
  
  if (checkInTime.isAfter(lateThreshold)) {
    return {
      status: 'late',
      isLate: true,
      lateMinutes: checkInTime.diff(workStart, 'minutes')
    };
  }
  
  return {
    status: 'present',
    isLate: false,
    lateMinutes: 0
  };
};

// Calculate working hours
const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  
  const duration = moment.duration(checkOut.diff(checkIn));
  return Math.round(duration.asHours() * 100) / 100;
};

// Generate dummy attendance for one employee for one day
const generateDayAttendance = async (employee, date) => {
  const dayMoment = moment(date).tz(OFFICE_CONFIG.timezone);
  const dayOfWeek = dayMoment.day(); // 0 = Sunday, 6 = Saturday
  
  // Skip weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return null;
  }
  
  // 90% attendance rate - 10% chance of being absent
  const isPresent = Math.random() > 0.1;
  
  if (!isPresent) {
    return new Attendance({
      employee: employee._id,
      date: dayMoment.startOf('day').toDate(),
      status: 'absent',
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      isLate: false,
      lateMinutes: 0,
      createdAt: dayMoment.toDate(),
      updatedAt: dayMoment.toDate()
    });
  }
  
  // Generate check-in time (8:30 AM to 10:30 AM)
  const checkInTime = getRandomTime(9, 0, 90); // 9 AM ± 90 minutes
  checkInTime.year(dayMoment.year()).month(dayMoment.month()).date(dayMoment.date());
  
  // Generate check-out time (5:30 PM to 8:00 PM)
  const checkOutTime = getRandomTime(18, 0, 120); // 6 PM ± 2 hours
  checkOutTime.year(dayMoment.year()).month(dayMoment.month()).date(dayMoment.date());
  
  // Ensure check-out is after check-in
  if (checkOutTime.isBefore(checkInTime)) {
    checkOutTime.add(8, 'hours');
  }
  
  const attendanceStatus = generateAttendanceStatus(checkInTime);
  const totalHours = calculateWorkingHours(checkInTime, checkOutTime);
  const regularHours = Math.min(totalHours, 8);
  const overtimeHours = Math.max(0, totalHours - 8);
  
  return new Attendance({
    employee: employee._id,
    date: dayMoment.startOf('day').toDate(),
    checkIn: {
      time: checkInTime.toDate(),
      location: {
        address: 'Office Location',
        coordinates: [77.2090, 28.6139], // Delhi coordinates
        method: 'ip-validation'
      },
      method: 'web',
      deviceInfo: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        browser: 'Chrome',
        os: 'Windows',
        device: 'Desktop'
      },
      ipAddress: '192.168.1.100',
      isValidLocation: true
    },
    checkOut: {
      time: checkOutTime.toDate(),
      location: {
        address: 'Office Location',
        coordinates: [77.2090, 28.6139],
        method: 'ip-validation'
      },
      method: 'web',
      deviceInfo: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        browser: 'Chrome',
        os: 'Windows',
        device: 'Desktop'
      },
      ipAddress: '192.168.1.100',
      isValidLocation: true
    },
    totalHours: totalHours,
    regularHours: regularHours,
    overtimeHours: overtimeHours,
    status: attendanceStatus.status,
    isLate: attendanceStatus.isLate,
    lateMinutes: attendanceStatus.lateMinutes,
    breaks: [],
    createdAt: dayMoment.toDate(),
    updatedAt: dayMoment.toDate()
  });
};

// Main seeding function
const seedAttendanceData = async () => {
  try {
    console.log('🌱 Starting attendance data seeding...');
    
    // Get all active employees
    const employees = await Employee.find({ 'employmentInfo.isActive': true });
    console.log(`👥 Found ${employees.length} active employees`);
    
    if (employees.length === 0) {
      console.log('❌ No active employees found. Please seed employee data first.');
      return;
    }
    
    // Clear existing attendance data
    console.log('🗑️ Clearing existing attendance data...');
    await Attendance.deleteMany({});
    
    // Generate dates for the last 30 days (working days only)
    const endDate = moment().tz(OFFICE_CONFIG.timezone);
    const startDate = moment().subtract(30, 'days').tz(OFFICE_CONFIG.timezone);
    
    console.log(`📅 Generating attendance from ${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')}`);
    
    let totalRecords = 0;
    let processedEmployees = 0;
    
    // Process each employee
    for (const employee of employees) {
      console.log(`👤 Processing ${employee.employeeId} - ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`);
      
      const attendanceRecords = [];
      const currentDate = startDate.clone();
      
      // Generate attendance for each day
      while (currentDate.isSameOrBefore(endDate, 'day')) {
        const attendanceRecord = await generateDayAttendance(employee, currentDate.toDate());
        
        if (attendanceRecord) {
          attendanceRecords.push(attendanceRecord);
        }
        
        currentDate.add(1, 'day');
      }
      
      // Bulk insert attendance records for this employee
      if (attendanceRecords.length > 0) {
        await Attendance.insertMany(attendanceRecords);
        totalRecords += attendanceRecords.length;
        console.log(`  ✅ Created ${attendanceRecords.length} attendance records`);
      }
      
      processedEmployees++;
      
      // Progress indicator
      if (processedEmployees % 10 === 0) {
        console.log(`📊 Progress: ${processedEmployees}/${employees.length} employees processed`);
      }
    }
    
    console.log('\n🎉 Attendance data seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Employees processed: ${processedEmployees}`);
    console.log(`   📋 Total attendance records created: ${totalRecords}`);
    console.log(`   📅 Date range: ${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')}`);
    
    // Generate some statistics
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📈 Attendance Statistics:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} records`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding attendance data:', error);
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  (async () => {
    await connectDB();
    await seedAttendanceData();
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  })();
}

module.exports = { seedAttendanceData };
