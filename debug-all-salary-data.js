const mongoose = require('mongoose');
const SalaryDetails = require('./server/models/SalaryDetails');
const Employee = require('./server/models/Employee');

async function debugAllSalaryData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/rannkly-hr', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('🔍 Debugging All Salary Data...\n');
    
    // Get all salary details records
    const allSalaryRecords = await SalaryDetails.find({})
      .populate('employee', 'employeeId personalInfo')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`📊 Found ${allSalaryRecords.length} salary records (showing latest 10):`);
    
    allSalaryRecords.forEach((record, index) => {
      console.log(`\n📋 Record ${index + 1}:`);
      console.log(`   👤 Employee: ${record.employee?.personalInfo?.firstName} ${record.employee?.personalInfo?.lastName} (${record.employeeId})`);
      console.log(`   💰 Total CTC: ₹${record.totalCTC?.toLocaleString() || '0'}`);
      console.log(`   💵 Gross Salary: ₹${record.grossSalary?.toLocaleString() || '0'}`);
      console.log(`   🏦 Basic Salary: ₹${record.earnings?.basicSalary?.toLocaleString() || '0'}`);
      console.log(`   📅 Month/Year: ${record.month}/${record.year}`);
      console.log(`   📥 Imported From: ${record.importedFrom || 'unknown'}`);
      console.log(`   🗓️ Created: ${record.createdAt}`);
    });
    
    // Check for any records with high CTC values
    const highCTCRecords = await SalaryDetails.find({
      totalCTC: { $gt: 500000 }
    }).populate('employee', 'employeeId personalInfo');
    
    console.log(`\n💰 Records with CTC > ₹5,00,000: ${highCTCRecords.length}`);
    highCTCRecords.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.employee?.personalInfo?.firstName} ${record.employee?.personalInfo?.lastName}: ₹${record.totalCTC?.toLocaleString()}`);
    });
    
    // Check for Anshi specifically with different search terms
    const anshiVariations = await Employee.find({
      $or: [
        { 'personalInfo.firstName': /anshi/i },
        { 'personalInfo.lastName': /anshi/i },
        { 'personalInfo.firstName': /aanshi/i },
        { 'personalInfo.lastName': /aanshi/i },
        { employeeId: /anshi/i },
        { employeeId: /aanshi/i }
      ]
    });
    
    console.log(`\n👤 Anshi variations found: ${anshiVariations.length}`);
    anshiVariations.forEach((emp, index) => {
      console.log(`   ${index + 1}. ${emp.employeeId} - ${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging salary data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the debug
debugAllSalaryData();
