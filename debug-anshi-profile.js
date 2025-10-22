const mongoose = require('mongoose');
const Employee = require('./server/models/Employee');

async function debugAnshiProfile() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/rannkly-hr', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('🔍 Debugging Anshi Profile Data...\n');
    
    // Find both Anshi records
    const anshiRecords = await Employee.find({
      $or: [
        { 'personalInfo.firstName': /anshi/i },
        { 'personalInfo.lastName': /anshi/i },
        { 'personalInfo.firstName': /aanshi/i },
        { 'personalInfo.lastName': /aanshi/i },
        { employeeId: /anshi/i },
        { employeeId: /aanshi/i }
      ]
    });
    
    anshiRecords.forEach((emp, index) => {
      console.log(`\n👤 Anshi Record ${index + 1}:`);
      console.log(`   🆔 Employee ID: ${emp.employeeId}`);
      console.log(`   👤 Name: ${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}`);
      console.log(`   💰 Current Salary:`, emp.salaryInfo?.currentSalary);
      console.log(`   🏢 Department: ${emp.employmentInfo?.department}`);
      console.log(`   💼 Designation: ${emp.employmentInfo?.designation}`);
      console.log(`   📅 Date of Joining: ${emp.employmentInfo?.dateOfJoining}`);
    });
    
    // Check if there are any employees with salary data
    const employeesWithSalary = await Employee.find({
      'salaryInfo.currentSalary.ctc': { $gt: 0 }
    }).limit(5);
    
    console.log(`\n💰 Employees with salary data: ${employeesWithSalary.length}`);
    employeesWithSalary.forEach((emp, index) => {
      console.log(`   ${index + 1}. ${emp.employeeId} - ${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}: CTC ₹${emp.salaryInfo?.currentSalary?.ctc?.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging Anshi profile:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the debug
debugAnshiProfile();
