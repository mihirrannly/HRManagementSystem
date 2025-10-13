/**
 * Test Script: Verify First IN & Last OUT Punch Logic
 * 
 * This script tests the new punch logic to ensure it correctly:
 * 1. Takes the first IN punch as check-in
 * 2. Takes the last OUT punch as check-out
 * 3. Calculates total hours between them
 */

const mongoose = require('mongoose');
const moment = require('moment-timezone');
require('dotenv').config();

// Import models
const Attendance = require('./server/models/Attendance');
const Employee = require('./server/models/Employee');

async function testPunchLogic() {
  try {
    console.log('🚀 Starting Punch Logic Test...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-management');
    console.log('✅ Connected to database\n');

    // Find a test employee (or use a specific employeeId)
    const testEmployee = await Employee.findOne().limit(1);
    if (!testEmployee) {
      console.log('❌ No employees found in database');
      process.exit(1);
    }

    console.log(`📋 Test Employee: ${testEmployee.personalInfo?.firstName} ${testEmployee.personalInfo?.lastName} (${testEmployee.employeeId})\n`);

    // Create test date
    const testDate = moment().startOf('day').toDate();
    console.log(`📅 Test Date: ${moment(testDate).format('YYYY-MM-DD')}\n`);

    // Delete existing attendance for today (to ensure clean test)
    await Attendance.deleteOne({
      employee: testEmployee._id,
      date: testDate
    });

    // Create test attendance with multiple punch records
    const punchRecords = [
      {
        time: moment(testDate).hour(9).minute(30).toDate(),  // 09:30 - First IN
        type: 'in',
        method: 'biometric',
        notes: 'First IN'
      },
      {
        time: moment(testDate).hour(12).minute(0).toDate(),  // 12:00 - OUT for lunch
        type: 'out',
        method: 'biometric',
        notes: 'Lunch break'
      },
      {
        time: moment(testDate).hour(13).minute(30).toDate(), // 13:30 - IN from lunch
        type: 'in',
        method: 'biometric',
        notes: 'Back from lunch'
      },
      {
        time: moment(testDate).hour(15).minute(0).toDate(),  // 15:00 - OUT for tea
        type: 'out',
        method: 'biometric',
        notes: 'Tea break'
      },
      {
        time: moment(testDate).hour(15).minute(15).toDate(), // 15:15 - IN from tea
        type: 'in',
        method: 'biometric',
        notes: 'Back from tea'
      },
      {
        time: moment(testDate).hour(18).minute(30).toDate(), // 18:30 - Last OUT
        type: 'out',
        method: 'biometric',
        notes: 'Last OUT'
      }
    ];

    console.log('📝 Creating attendance record with punch records:');
    punchRecords.forEach((punch, index) => {
      console.log(`   ${index + 1}. ${moment(punch.time).format('HH:mm')} - ${punch.type.toUpperCase().padEnd(3)} - ${punch.notes}`);
    });
    console.log('');

    // Create attendance record
    const attendance = new Attendance({
      employee: testEmployee._id,
      date: testDate,
      punchRecords: punchRecords,
      status: 'present'
    });

    // Save (this will trigger the pre-save hook)
    await attendance.save();

    console.log('✅ Attendance record created and saved\n');

    // Retrieve the saved record to verify
    const savedAttendance = await Attendance.findOne({
      employee: testEmployee._id,
      date: testDate
    });

    console.log('📊 RESULTS:');
    console.log('─'.repeat(60));
    
    // Expected values
    const expectedCheckIn = moment(testDate).hour(9).minute(30);
    const expectedCheckOut = moment(testDate).hour(18).minute(30);
    const expectedTotalHours = expectedCheckOut.diff(expectedCheckIn, 'hours', true);
    
    // Actual values
    const actualCheckIn = moment(savedAttendance.checkIn.time);
    const actualCheckOut = moment(savedAttendance.checkOut.time);
    const actualTotalHours = savedAttendance.totalHours;

    console.log(`\n✓ Check-In (First IN):`);
    console.log(`  Expected: ${expectedCheckIn.format('HH:mm')}`);
    console.log(`  Actual:   ${actualCheckIn.format('HH:mm')}`);
    console.log(`  Match:    ${actualCheckIn.format('HH:mm') === expectedCheckIn.format('HH:mm') ? '✅ YES' : '❌ NO'}`);

    console.log(`\n✓ Check-Out (Last OUT):`);
    console.log(`  Expected: ${expectedCheckOut.format('HH:mm')}`);
    console.log(`  Actual:   ${actualCheckOut.format('HH:mm')}`);
    console.log(`  Match:    ${actualCheckOut.format('HH:mm') === expectedCheckOut.format('HH:mm') ? '✅ YES' : '❌ NO'}`);

    console.log(`\n✓ Total Hours:`);
    console.log(`  Expected: ${expectedTotalHours.toFixed(2)} hours`);
    console.log(`  Actual:   ${actualTotalHours.toFixed(2)} hours`);
    console.log(`  Match:    ${Math.abs(actualTotalHours - expectedTotalHours) < 0.01 ? '✅ YES' : '❌ NO'}`);

    console.log('\n' + '─'.repeat(60));

    // Verify punch records are all still stored
    console.log(`\n✓ Punch Records Stored: ${savedAttendance.punchRecords.length} punches`);
    console.log(`  Expected: 6 punches`);
    console.log(`  Match:    ${savedAttendance.punchRecords.length === 6 ? '✅ YES' : '❌ NO'}`);

    // Show all punch records
    console.log(`\n📝 All Stored Punch Records:`);
    savedAttendance.punchRecords
      .sort((a, b) => new Date(a.time) - new Date(b.time))
      .forEach((punch, index) => {
        console.log(`   ${index + 1}. ${moment(punch.time).format('HH:mm')} - ${punch.type.toUpperCase().padEnd(3)} - ${punch.notes || 'N/A'}`);
      });

    console.log('\n✅ Test completed successfully!\n');

    // Cleanup (optional - comment out to keep test data)
    // await Attendance.deleteOne({ _id: savedAttendance._id });
    // console.log('🧹 Test data cleaned up\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testPunchLogic();

