const mongoose = require('mongoose');
const moment = require('moment-timezone');
require('dotenv').config();

const Attendance = require('./server/models/Attendance');

const OFFICE_CONFIG = {
  timezone: 'Asia/Kolkata',
  workingHours: {
    start: '10:00', // Office starts at 10 AM
    end: '19:00' // Office ends at 7 PM
  }
};

async function recalculateLateStatus() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Fetching all attendance records with check-in times...');
    const allAttendance = await Attendance.find({
      'checkIn.time': { $exists: true }
    });

    console.log(`📊 Found ${allAttendance.length} attendance records to process\n`);

    let updatedCount = 0;
    let noChangeCount = 0;

    for (const record of allAttendance) {
      const checkInTime = moment(record.checkIn.time).tz(OFFICE_CONFIG.timezone);
      const attendanceDate = moment(record.date).format('YYYY-MM-DD');
      const workStart = moment.tz(attendanceDate + ' ' + OFFICE_CONFIG.workingHours.start, OFFICE_CONFIG.timezone);
      
      // Recalculate late status
      const isLate = checkInTime.isAfter(workStart);
      const lateMinutes = isLate ? Math.ceil(checkInTime.diff(workStart, 'minutes')) : 0;
      
      // Check if update is needed
      const needsUpdate = record.isLate !== isLate || record.lateMinutes !== lateMinutes;
      
      if (needsUpdate) {
        const oldStatus = record.isLate ? `Late (${record.lateMinutes} min)` : 'On Time';
        const newStatus = isLate ? `Late (${lateMinutes} min)` : 'On Time';
        
        console.log(`📝 Updating: ${attendanceDate} - ${checkInTime.format('HH:mm')}`);
        console.log(`   Old: ${oldStatus} → New: ${newStatus}`);
        
        // Update the record
        record.isLate = isLate;
        record.lateMinutes = lateMinutes;
        
        // Update checkIn.isLate if it exists
        if (record.checkIn) {
          record.checkIn.isLate = isLate;
          record.checkIn.lateMinutes = lateMinutes;
        }
        
        // Update status if it was "late" but should be "present" now
        if (!isLate && record.status === 'late') {
          record.status = 'present';
          console.log(`   ✅ Status changed: late → present`);
        } else if (isLate && record.status === 'present') {
          record.status = 'late';
          console.log(`   ⚠️ Status changed: present → late`);
        }
        
        await record.save();
        updatedCount++;
      } else {
        noChangeCount++;
      }
    }

    console.log('\n✅ Recalculation complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Total records processed: ${allAttendance.length}`);
    console.log(`   - Records updated: ${updatedCount}`);
    console.log(`   - Records unchanged: ${noChangeCount}`);
    console.log('\n🎉 All attendance records now use 10 AM as the late threshold!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 MongoDB connection closed');
    process.exit(0);
  }
}

recalculateLateStatus();


