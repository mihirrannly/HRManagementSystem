/**
 * Check Attendance Status for Employee CODR034
 */

const mongoose = require('mongoose');
const moment = require('moment-timezone');
require('dotenv').config();

// Import models
const User = require('./server/models/User');
const Employee = require('./server/models/Employee');
const Attendance = require('./server/models/Attendance');

async function checkAttendanceStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly_hr');
    console.log('✅ Connected to MongoDB\n');

    // Find employee with ID CODR034
    const employee = await Employee.findOne({ employeeId: 'CODR034' });
    
    if (!employee) {
      console.log('❌ Employee CODR034 not found in database');
      process.exit(1);
    }

    // Get user info
    const user = employee.user ? await User.findById(employee.user) : null;
    
    console.log('👤 Employee Found:');
    console.log('   Employee ID:', employee.employeeId);
    console.log('   Name:', employee.personalInfo?.firstName, employee.personalInfo?.lastName);
    console.log('   Email:', user?.email || 'N/A');
    console.log('   User ID:', employee.user || 'N/A');
    console.log('');

    // Get today's date
    const today = moment().startOf('day').toDate();
    console.log('📅 Checking attendance for:', moment(today).format('YYYY-MM-DD'));
    console.log('');

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (!attendance) {
      console.log('❌ No attendance record found for today');
      console.log('   This means the check-in was NOT saved to the database');
      console.log('');
      console.log('💡 Possible reasons:');
      console.log('   1. Check-in request failed (check server logs)');
      console.log('   2. IP validation failed (not on office network)');
      console.log('   3. Backend error occurred');
      console.log('   4. Request never reached the server');
    } else {
      console.log('✅ Attendance record found!');
      console.log('');
      console.log('📊 Attendance Details:');
      console.log('   Status:', attendance.status);
      console.log('');
      
      if (attendance.checkIn?.time) {
        console.log('   ✅ CHECK-IN:');
        console.log('      Time:', moment(attendance.checkIn.time).format('YYYY-MM-DD HH:mm:ss'));
        console.log('      Method:', attendance.checkIn.method);
        console.log('      IP Address:', attendance.checkIn.ipAddress);
        console.log('      Valid Location:', attendance.checkIn.isValidLocation);
        console.log('      Is Late:', attendance.isLate);
        if (attendance.isLate) {
          console.log('      Late Minutes:', attendance.lateMinutes);
        }
      } else {
        console.log('   ❌ No check-in recorded');
      }
      
      console.log('');
      
      if (attendance.checkOut?.time) {
        console.log('   ✅ CHECK-OUT:');
        console.log('      Time:', moment(attendance.checkOut.time).format('YYYY-MM-DD HH:mm:ss'));
        console.log('      Method:', attendance.checkOut.method);
        console.log('      IP Address:', attendance.checkOut.ipAddress);
        console.log('      Early Departure:', attendance.earlyDeparture);
        if (attendance.earlyDeparture) {
          console.log('      Early Minutes:', attendance.earlyDepartureMinutes);
        }
      } else {
        console.log('   ⏰ Not checked out yet');
      }
      
      console.log('');
      
      if (attendance.totalHours) {
        console.log('   📊 Total Hours:', attendance.totalHours.toFixed(2));
      }
      
      console.log('');
      console.log('🔍 Raw Attendance Data:');
      console.log(JSON.stringify(attendance, null, 2));
    }

    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('');

    // Check recent attendance records (last 7 days)
    const sevenDaysAgo = moment().subtract(7, 'days').startOf('day').toDate();
    const recentAttendance = await Attendance.find({
      employee: employee._id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 });

    if (recentAttendance.length > 0) {
      console.log('📋 Recent Attendance (Last 7 Days):');
      console.log('');
      recentAttendance.forEach(record => {
        const dateStr = moment(record.date).format('YYYY-MM-DD (ddd)');
        const checkIn = record.checkIn?.time ? moment(record.checkIn.time).format('HH:mm') : '--:--';
        const checkOut = record.checkOut?.time ? moment(record.checkOut.time).format('HH:mm') : '--:--';
        const hours = record.totalHours ? record.totalHours.toFixed(2) : '0.00';
        console.log(`   ${dateStr} | In: ${checkIn} | Out: ${checkOut} | Hours: ${hours} | Status: ${record.status}`);
      });
    } else {
      console.log('📋 No attendance records found in the last 7 days');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('');
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

checkAttendanceStatus();

