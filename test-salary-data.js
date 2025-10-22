const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly-hr-management');

// Import models
const Employee = require('./server/models/Employee');
const SalaryDetails = require('./server/models/SalaryDetails');

const testSalaryData = async () => {
  try {
    console.log('🔍 Testing Salary Data in Database...\n');

    // Test 1: Check if employees exist
    console.log('1. Checking employees...');
    const employees = await Employee.find({ 'employmentInfo.isActive': true }).limit(5);
    console.log(`✅ Found ${employees.length} active employees`);
    
    if (employees.length > 0) {
      const sampleEmployee = employees[0];
      console.log(`   Sample employee: ${sampleEmployee.employeeId} - ${sampleEmployee.personalInfo?.firstName} ${sampleEmployee.personalInfo?.lastName}`);
      console.log(`   Current salary:`, sampleEmployee.salaryInfo?.currentSalary);
    }

    // Test 2: Check if salary details exist
    console.log('\n2. Checking salary details...');
    const salaryDetails = await SalaryDetails.find().limit(5);
    console.log(`✅ Found ${salaryDetails.length} salary detail records`);
    
    if (salaryDetails.length > 0) {
      const sampleSalary = salaryDetails[0];
      console.log(`   Sample salary record:`, {
        employee: sampleSalary.employee,
        month: sampleSalary.month,
        year: sampleSalary.year,
        grossSalary: sampleSalary.grossSalary,
        earnings: sampleSalary.earnings
      });
    }

    // Test 3: Check employee salary info
    console.log('\n3. Checking employee salary info...');
    const employeesWithSalary = await Employee.find({ 
      'employmentInfo.isActive': true,
      'salaryInfo.currentSalary': { $exists: true, $ne: null }
    }).limit(3);
    
    console.log(`✅ Found ${employeesWithSalary.length} employees with salary info`);
    
    employeesWithSalary.forEach((emp, index) => {
      console.log(`   Employee ${index + 1}:`, {
        employeeId: emp.employeeId,
        name: `${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName}`,
        currentSalary: emp.salaryInfo?.currentSalary
      });
    });

    // Test 4: Create sample salary data if none exists
    if (salaryDetails.length === 0 && employees.length > 0) {
      console.log('\n4. Creating sample salary data...');
      
      const sampleEmployee = employees[0];
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const sampleSalaryData = {
        employee: sampleEmployee._id,
        month: currentMonth,
        year: currentYear,
        earnings: {
          basicSalary: 50000,
          hra: 15000,
          conveyanceAllowance: 2000,
          medicalAllowance: 3000,
          specialAllowance: 10000,
          performanceBonus: 5000,
          overtimePay: 2000,
          otherAllowances: 1000
        },
        deductions: {
          providentFund: 6000,
          employeeStateInsurance: 375,
          professionalTax: 200,
          incomeTax: 5000,
          loanRepayment: 0,
          advanceDeduction: 0,
          lopAmount: 0,
          otherDeductions: 0
        },
        grossSalary: 87000,
        totalCTC: 100000
      };
      
      const newSalaryDetail = new SalaryDetails(sampleSalaryData);
      await newSalaryDetail.save();
      
      console.log(`✅ Created sample salary data for ${sampleEmployee.employeeId}`);
      console.log(`   Basic Salary: ₹${sampleSalaryData.earnings.basicSalary}`);
      console.log(`   HRA: ₹${sampleSalaryData.earnings.hra}`);
      console.log(`   Gross Salary: ₹${sampleSalaryData.grossSalary}`);
    }

    // Test 5: Update employee salary info if missing
    if (employeesWithSalary.length === 0 && employees.length > 0) {
      console.log('\n5. Updating employee salary info...');
      
      const sampleEmployee = employees[0];
      const salaryInfo = {
        currentSalary: {
          basic: 50000,
          hra: 15000,
          allowances: 20000,
          grossSalary: 85000,
          ctc: 100000
        }
      };
      
      await Employee.findByIdAndUpdate(sampleEmployee._id, {
        $set: { salaryInfo }
      });
      
      console.log(`✅ Updated salary info for ${sampleEmployee.employeeId}`);
    }

    console.log('\n🎉 Salary data test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check if salary records exist in database');
    console.log('2. Create salary records if missing');
    console.log('3. Test payroll section in frontend');
    console.log('4. Verify salary data is displayed correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Run the test
testSalaryData();
