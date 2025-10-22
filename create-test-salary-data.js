const mongoose = require('mongoose');
const SalaryDetails = require('./server/models/SalaryDetails');
const Employee = require('./server/models/Employee');

async function createTestSalaryData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/rannkly-hr', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('🔧 Creating Test Salary Data...\n');
    
    // Find Anshi (CODR0188)
    const anshi = await Employee.findOne({ employeeId: 'CODR0188' });
    
    if (!anshi) {
      console.log('❌ Anshi (CODR0188) not found');
      return;
    }
    
    console.log('👤 Found Anshi:', anshi.personalInfo?.firstName, anshi.personalInfo?.lastName);
    
    // Create salary data for Anshi with CTC 780000
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const salaryData = {
      employee: anshi._id,
      employeeId: anshi.employeeId,
      month: currentMonth,
      year: currentYear,
      
      // Anshi's salary breakdown (based on your specification)
      totalCTC: 780000, // Annual CTC
      earnings: {
        basicSalary: 46800, // 60% of monthly gross
        hra: 18720, // 24% of monthly gross
        conveyanceAllowance: 7020, // 9% of monthly gross
        specialAllowance: 5460, // 7% of monthly gross
        medicalAllowance: 3000,
        performanceBonus: 0,
        overtimePay: 0,
        otherAllowances: 0
      },
      deductions: {
        providentFund: 0,
        employeeStateInsurance: 0,
        professionalTax: 0,
        incomeTax: 0,
        loanRepayment: 0,
        advanceDeduction: 0,
        lopAmount: 0,
        otherDeductions: 0
      },
      grossSalary: 78000, // Monthly gross (780000/12)
      netSalary: 78000, // No deductions for now
      
      paymentStatus: 'pending',
      importedFrom: 'csv',
      createdBy: anshi._id,
      updatedBy: anshi._id
    };
    
    // Check if record already exists
    const existingRecord = await SalaryDetails.findOne({
      employee: anshi._id,
      month: currentMonth,
      year: currentYear
    });
    
    if (existingRecord) {
      console.log('📋 Updating existing record...');
      Object.assign(existingRecord, salaryData);
      await existingRecord.save();
      console.log('✅ Updated existing salary record');
    } else {
      console.log('📋 Creating new record...');
      const newRecord = new SalaryDetails(salaryData);
      await newRecord.save();
      console.log('✅ Created new salary record');
    }
    
    // Verify the data
    const savedRecord = await SalaryDetails.findOne({
      employee: anshi._id,
      month: currentMonth,
      year: currentYear
    });
    
    console.log('\n📊 Saved Salary Data:');
    console.log(`   💰 Total CTC: ₹${savedRecord.totalCTC?.toLocaleString()}`);
    console.log(`   💵 Gross Salary: ₹${savedRecord.grossSalary?.toLocaleString()}`);
    console.log(`   🏦 Basic Salary: ₹${savedRecord.earnings?.basicSalary?.toLocaleString()}`);
    console.log(`   🏠 HRA: ₹${savedRecord.earnings?.hra?.toLocaleString()}`);
    console.log(`   💸 Net Salary: ₹${savedRecord.netSalary?.toLocaleString()}`);
    
    console.log('\n🎉 Test salary data created successfully!');
    console.log('Now you can test the employee details view to see the correct CTC and monthly salary.');
    
  } catch (error) {
    console.error('❌ Error creating test salary data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
createTestSalaryData();
