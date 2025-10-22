const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly-hr-management');

// Import models
const Employee = require('./server/models/Employee');
const SalaryDetails = require('./server/models/SalaryDetails');

const fixSalaryData = async () => {
  try {
    console.log('🔧 Fixing Salary Data...\n');

    // Get all active employees
    const employees = await Employee.find({ 'employmentInfo.isActive': true });
    console.log(`📊 Found ${employees.length} active employees`);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    console.log(`📅 Creating salary data for ${currentMonth}/${currentYear}`);

    // Create salary data for each employee
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      console.log(`\n👤 Processing ${employee.employeeId} - ${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`);

      // Create realistic salary data based on employee ID
      const baseSalary = 30000 + (i * 5000); // Varying base salaries
      const salaryData = {
        employee: employee._id,
        month: currentMonth,
        year: currentYear,
        earnings: {
          basicSalary: Math.floor(baseSalary * 0.6), // 60% basic
          hra: Math.floor(baseSalary * 0.2), // 20% HRA
          conveyanceAllowance: 2000,
          medicalAllowance: 3000,
          specialAllowance: Math.floor(baseSalary * 0.1), // 10% special
          performanceBonus: Math.floor(baseSalary * 0.05), // 5% bonus
          overtimePay: 0,
          otherAllowances: 1000
        },
        deductions: {
          providentFund: Math.floor(baseSalary * 0.6 * 0.12), // 12% of basic
          employeeStateInsurance: Math.floor(baseSalary * 0.0075), // 0.75% of gross
          professionalTax: 200,
          incomeTax: Math.floor(baseSalary * 0.1), // 10% tax
          loanRepayment: 0,
          advanceDeduction: 0,
          lopAmount: 0,
          otherDeductions: 0
        },
        grossSalary: baseSalary,
        totalCTC: Math.floor(baseSalary * 1.2) // 20% more than gross
      };

      // Create or update salary details
      await SalaryDetails.findOneAndUpdate(
        { 
          employee: employee._id, 
          month: currentMonth, 
          year: currentYear 
        },
        salaryData,
        { upsert: true, new: true }
      );

      // Update employee salary info
      const employeeSalaryInfo = {
        currentSalary: {
          basic: salaryData.earnings.basicSalary,
          hra: salaryData.earnings.hra,
          allowances: salaryData.earnings.conveyanceAllowance + 
                     salaryData.earnings.medicalAllowance + 
                     salaryData.earnings.specialAllowance + 
                     salaryData.earnings.performanceBonus + 
                     salaryData.earnings.otherAllowances,
          grossSalary: salaryData.grossSalary,
          ctc: salaryData.totalCTC
        }
      };

      await Employee.findByIdAndUpdate(employee._id, {
        $set: { salaryInfo: employeeSalaryInfo }
      });

      console.log(`   ✅ Created salary data: Basic ₹${salaryData.earnings.basicSalary}, Gross ₹${salaryData.grossSalary}`);
    }

    console.log('\n🎉 Salary data fixed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Updated ${employees.length} employees`);
    console.log(`   - Created salary records for ${currentMonth}/${currentYear}`);
    console.log(`   - Updated employee salary profiles`);
    console.log('\n🚀 Now test the payroll section in the frontend!');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Run the fix
fixSalaryData();
