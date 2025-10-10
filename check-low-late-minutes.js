const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly-hr')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const Employee = require('./server/models/Employee');
const Attendance = require('./server/models/Attendance');

async function checkLowLateMinutes() {
  try {
    const sangita = await Employee.findOne({ 
      'personalInfo.firstName': 'Sangita',
      'personalInfo.lastName': 'Gopal Singh'
    });
    
    if (!sangita) {
      console.log('❌ Sangita not found');
      process.exit(1);
    }
    
    const startDate = new Date('2025-09-01');
    const endDate = new Date('2025-09-30');
    
    const records = await Attendance.find({
      employee: sangita._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Only regular working days
    const regularWorkingDays = records.filter(r => 
      r.status !== 'weekend' && r.status !== 'holiday' && r.status !== 'on-leave'
    );
    
    console.log(`\n📊 Regular working days: ${regularWorkingDays.length}\n`);
    
    // Group by lateMinutes ranges
    const under5 = regularWorkingDays.filter(r => r.lateMinutes >= 0 && r.lateMinutes < 5);
    const under10 = regularWorkingDays.filter(r => r.lateMinutes >= 5 && r.lateMinutes < 10);
    const under15 = regularWorkingDays.filter(r => r.lateMinutes >= 10 && r.lateMinutes < 15);
    const over15 = regularWorkingDays.filter(r => r.lateMinutes >= 15);
    
    console.log(`Under 5 minutes (possibly considered "on-time"): ${under5.length}`);
    if (under5.length > 0) {
      under5.forEach(r => {
        console.log(`  - ${r.date.toISOString().split('T')[0]}: ${r.lateMinutes} min`);
      });
    }
    
    console.log(`\n5-10 minutes: ${under10.length}`);
    console.log(`10-15 minutes: ${under15.length}`);
    console.log(`Over 15 minutes: ${over15.length}`);
    
    console.log(`\n\nCONCLUSION: If Monthly Grid shows 3 on-time days, it might be counting records with lateMinutes < 5 as on-time.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkLowLateMinutes();

