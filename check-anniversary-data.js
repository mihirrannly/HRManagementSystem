const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Employee = require('./server/models/Employee');

async function checkAnniversaryData() {
  try {
    console.log('\n🔍 Checking for Anniversary Data...\n');
    console.log('='.repeat(70));

    // Get current date info
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11
    const currentYear = currentDate.getFullYear();
    const nextMonth = (currentMonth + 1) % 12;
    
    console.log(`📅 Current Date: ${currentDate.toDateString()}`);
    console.log(`📅 Current Month: ${currentMonth} (${currentDate.toLocaleString('default', { month: 'long' })})`);
    console.log(`📅 Next Month: ${nextMonth} (${new Date(currentYear, nextMonth).toLocaleString('default', { month: 'long' })})`);
    console.log('='.repeat(70));

    // Get all employees
    const allEmployees = await Employee.find({})
      .select('personalInfo.firstName personalInfo.lastName employmentInfo.dateOfJoining employmentInfo.isActive employeeId')
      .lean();

    console.log(`\n📊 Total Employees: ${allEmployees.length}`);

    // Filter active employees with joining dates
    const activeWithDates = allEmployees.filter(emp => 
      emp.employmentInfo?.isActive && emp.employmentInfo?.dateOfJoining
    );
    console.log(`✅ Active Employees with Joining Dates: ${activeWithDates.length}`);

    // Check for employees with joining dates in current month
    const thisMonthJoiners = activeWithDates.filter(emp => {
      const joiningDate = new Date(emp.employmentInfo.dateOfJoining);
      return joiningDate.getMonth() === currentMonth;
    });

    console.log(`\n🎉 Employees who joined in ${currentDate.toLocaleString('default', { month: 'long' })}: ${thisMonthJoiners.length}`);
    
    thisMonthJoiners.forEach(emp => {
      const joiningDate = new Date(emp.employmentInfo.dateOfJoining);
      const yearsOfService = currentYear - joiningDate.getFullYear();
      console.log(`  - ${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName} (${emp.employeeId})`);
      console.log(`    Joined: ${joiningDate.toDateString()}`);
      console.log(`    Years of Service: ${yearsOfService}`);
      console.log(`    Eligible: ${yearsOfService >= 1 ? '✅ YES' : '❌ NO (less than 1 year)'}`);
    });

    // Check for employees with joining dates in next month
    const nextMonthJoiners = activeWithDates.filter(emp => {
      const joiningDate = new Date(emp.employmentInfo.dateOfJoining);
      return joiningDate.getMonth() === nextMonth;
    });

    console.log(`\n📅 Employees who joined in ${new Date(currentYear, nextMonth).toLocaleString('default', { month: 'long' })}: ${nextMonthJoiners.length}`);
    
    nextMonthJoiners.forEach(emp => {
      const joiningDate = new Date(emp.employmentInfo.dateOfJoining);
      const yearsOfService = currentYear - joiningDate.getFullYear();
      console.log(`  - ${emp.personalInfo?.firstName} ${emp.personalInfo?.lastName} (${emp.employeeId})`);
      console.log(`    Joined: ${joiningDate.toDateString()}`);
      console.log(`    Years of Service: ${yearsOfService}`);
      console.log(`    Eligible: ${yearsOfService >= 1 ? '✅ YES' : '❌ NO (less than 1 year)'}`);
    });

    // Count eligible anniversaries
    const eligibleThisMonth = thisMonthJoiners.filter(emp => {
      const joiningDate = new Date(emp.employmentInfo.dateOfJoining);
      const yearsOfService = currentYear - joiningDate.getFullYear();
      return yearsOfService >= 1;
    });

    const eligibleNextMonth = nextMonthJoiners.filter(emp => {
      const joiningDate = new Date(emp.employmentInfo.dateOfJoining);
      const yearsOfService = currentYear - joiningDate.getFullYear();
      return yearsOfService >= 1;
    });

    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(70));
    console.log(`This Month's Eligible Anniversaries: ${eligibleThisMonth.length}`);
    console.log(`Next Month's Eligible Anniversaries: ${eligibleNextMonth.length}`);
    
    if (eligibleThisMonth.length === 0 && eligibleNextMonth.length === 0) {
      console.log('\n⚠️  NO ELIGIBLE ANNIVERSARIES FOUND!');
      console.log('\n💡 To see anniversary cards, you need employees who:');
      console.log('   1. Are active (employmentInfo.isActive = true)');
      console.log('   2. Have a joining date (employmentInfo.dateOfJoining)');
      console.log('   3. Have completed at least 1 year of service');
      console.log(`   4. Joined in ${currentDate.toLocaleString('default', { month: 'long' })} or ${new Date(currentYear, nextMonth).toLocaleString('default', { month: 'long' })}`);
      console.log('\n💡 Consider adding test data with joining dates in October/November from previous years.');
    } else {
      console.log('\n✅ You should see anniversary cards on the dashboard!');
      console.log('   Make sure to restart the frontend if it\'s running.');
    }

    console.log('='.repeat(70));
    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkAnniversaryData();


