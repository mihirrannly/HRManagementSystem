const mongoose = require('mongoose');
const SalaryDetails = require('./server/models/SalaryDetails');
const Employee = require('./server/models/Employee');

async function debugCTCData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/rannkly-hr', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('🔍 Debugging CTC Data...\n');
    
    // Find Anshi's employee record
    const anshi = await Employee.findOne({ 
      $or: [
        { 'personalInfo.firstName': /anshi/i },
        { 'personalInfo.lastName': /anshi/i },
        { employeeId: /anshi/i }
      ]
    });
    
    if (!anshi) {
      console.log('❌ Anshi not found in Employee collection');
      return;
    }
    
    console.log('👤 Found Anshi:', {
      employeeId: anshi.employeeId,
      name: `${anshi.personalInfo?.firstName} ${anshi.personalInfo?.lastName}`,
      currentSalary: anshi.salaryInfo?.currentSalary
    });
    
    // Find Anshi's salary details
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const salaryDetails = await SalaryDetails.find({
      employee: anshi._id,
      year: currentYear
    }).sort({ month: -1 });
    
    console.log(`\n📊 Salary Details for ${currentYear}:`);
    console.log(`Found ${salaryDetails.length} records`);
    
    salaryDetails.forEach((record, index) => {
      console.log(`\n📋 Record ${index + 1} (Month ${record.month}):`);
      console.log(`   💰 Total CTC: ₹${record.totalCTC?.toLocaleString() || '0'}`);
      console.log(`   💵 Gross Salary: ₹${record.grossSalary?.toLocaleString() || '0'}`);
      console.log(`   🏦 Basic Salary: ₹${record.earnings?.basicSalary?.toLocaleString() || '0'}`);
      console.log(`   🏠 HRA: ₹${record.earnings?.hra?.toLocaleString() || '0'}`);
      console.log(`   📅 Imported From: ${record.importedFrom || 'unknown'}`);
      console.log(`   🗓️ Created: ${record.createdAt}`);
    });
    
    // Check if there's a record for current month
    const currentRecord = await SalaryDetails.findOne({
      employee: anshi._id,
      month: currentMonth,
      year: currentYear
    });
    
    if (currentRecord) {
      console.log(`\n✅ Current Month Record (${currentMonth}/${currentYear}):`);
      console.log(`   💰 Total CTC: ₹${currentRecord.totalCTC?.toLocaleString() || '0'}`);
      console.log(`   💵 Gross Salary: ₹${currentRecord.grossSalary?.toLocaleString() || '0'}`);
    } else {
      console.log(`\n❌ No record found for current month (${currentMonth}/${currentYear})`);
    }
    
  } catch (error) {
    console.error('❌ Error debugging CTC data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the debug
debugCTCData();
