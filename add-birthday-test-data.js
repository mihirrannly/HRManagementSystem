const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Employee = require('./server/models/Employee');

async function addBirthdayTestData() {
  try {
    console.log('\n🎂 Adding Birthday Test Data...\n');

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Update Rajesh Kumar to have a birthday this month
    const rajesh = await Employee.findOne({
      'personalInfo.firstName': 'Rajesh',
      'personalInfo.lastName': 'Kumar'
    });

    if (rajesh) {
      rajesh.personalInfo.dateOfBirth = new Date(1990, currentMonth, 20); // October 20, 1990
      await rajesh.save();
      console.log('✅ Updated Rajesh Kumar:');
      console.log(`   Birthday: October 20, 1990`);
      console.log(`   Age: ${currentYear - 1990} years old`);
      console.log(`   Will appear in "This Month's Birthdays" card`);
    }

    // Update Ashutosh Kumar Singh to have a birthday next month
    const ashutosh = await Employee.findOne({
      'personalInfo.firstName': 'Ashutosh'
    });

    if (ashutosh) {
      const nextMonth = (currentMonth + 1) % 12;
      ashutosh.personalInfo.dateOfBirth = new Date(1995, nextMonth, 15); // November 15, 1995
      await ashutosh.save();
      console.log('\n✅ Updated Ashutosh Kumar Singh:');
      console.log(`   Birthday: November 15, 1995`);
      console.log(`   Age: ${currentYear - 1995} years old`);
      console.log(`   Will appear in "Upcoming Birthdays" card`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎊 SUCCESS! Birthday test data added.');
    console.log('='.repeat(70));
    console.log('\n✅ Now you should see FOUR types of cards:');
    console.log('   🎉 This Month\'s Anniversaries: Rajesh Kumar (5 years)');
    console.log('   📅 Upcoming Anniversaries: Ashutosh Kumar Singh (3 years)');
    console.log('   🎂 This Month\'s Birthdays: Rajesh Kumar (turning 35)');
    console.log('   🎈 Upcoming Birthdays: Ashutosh Kumar Singh (turning 30)');
    console.log('\n💡 Refresh your browser to see the changes!');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

addBirthdayTestData();


