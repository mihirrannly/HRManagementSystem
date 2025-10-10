const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Employee = require('./server/models/Employee');
const User = require('./server/models/User');
const Department = require('./server/models/Department');
const bcrypt = require('bcryptjs');

async function addTestAnniversaryData() {
  try {
    console.log('\n🎉 Adding Test Anniversary Data...\n');

    // Get a department
    let department = await Department.findOne();
    if (!department) {
      department = await Department.create({
        name: 'Engineering',
        code: 'ENG',
        description: 'Engineering Department'
      });
      console.log('✅ Created Engineering department');
    }

    // Check if Rajesh Kumar already exists
    let existingEmployee = await Employee.findOne({
      'personalInfo.firstName': 'Rajesh',
      'personalInfo.lastName': 'Kumar'
    });

    if (existingEmployee) {
      console.log('⚠️  Rajesh Kumar already exists. Updating their joining date...');
      
      // Update to have an October anniversary from 5 years ago
      const anniversaryDate = new Date(2020, 9, 15); // October 15, 2020
      existingEmployee.employmentInfo.dateOfJoining = anniversaryDate;
      existingEmployee.employmentInfo.isActive = true;
      await existingEmployee.save();
      
      console.log('✅ Updated Rajesh Kumar:');
      console.log(`   Joining Date: ${anniversaryDate.toDateString()}`);
      console.log(`   Years of Service: 5 years`);
      console.log(`   Will appear in "This Month's Anniversaries" card`);
      
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        email: 'rajesh.kumar@rannkly.com',
        password: hashedPassword,
        role: 'employee',
        isActive: true
      });
      console.log('✅ Created user account for Rajesh Kumar');

      // Create employee with October joining date from 5 years ago
      const anniversaryDate = new Date(2020, 9, 15); // October 15, 2020
      
      const employee = await Employee.create({
        user: user._id,
        personalInfo: {
          firstName: 'Rajesh',
          lastName: 'Kumar',
          dateOfBirth: new Date(1990, 5, 15),
          gender: 'male'
        },
        contactInfo: {
          personalEmail: 'rajesh.kumar@example.com',
          phone: '+91-9876543210'
        },
        employmentInfo: {
          department: department._id,
          designation: 'Senior Software Engineer',
          dateOfJoining: anniversaryDate,
          employeeType: 'full-time',
          workLocation: 'office',
          isActive: true
        }
      });

      console.log('✅ Created Rajesh Kumar:');
      console.log(`   Employee ID: ${employee.employeeId}`);
      console.log(`   Joining Date: ${anniversaryDate.toDateString()}`);
      console.log(`   Years of Service: 5 years`);
      console.log(`   Will appear in "This Month's Anniversaries" card`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎊 SUCCESS! Anniversary test data added.');
    console.log('='.repeat(70));
    console.log('\n✅ Now you should see BOTH anniversary cards:');
    console.log('   🎉 This Month\'s Anniversaries: Rajesh Kumar (5 years)');
    console.log('   📅 Upcoming Anniversaries: Ashutosh Kumar Singh (3 years)');
    console.log('\n💡 Restart your frontend to see the changes:');
    console.log('   1. Stop the current dev server (Ctrl+C)');
    console.log('   2. Run: npm run dev');
    console.log('   3. Refresh your browser');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

addTestAnniversaryData();


