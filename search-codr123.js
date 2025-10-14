const mongoose = require('mongoose');
const User = require('./server/models/User');
const Employee = require('./server/models/Employee');

async function searchCODR123() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rannkly-hr', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Search for any employee with "123" in their ID
    console.log('\n🔍 Searching for employees with "123" in their ID...');
    const employees = await Employee.find({
      employeeId: { $regex: '123', $options: 'i' }
    }).populate('user', 'email role isActive');

    if (employees.length === 0) {
      console.log('❌ No employees found with "123" in their ID');
      
      // Let's check the total count
      const totalCount = await Employee.countDocuments({});
      console.log(`\n📊 Total employees in database: ${totalCount}`);
      
      // Show the very latest employees
      console.log('\n📋 Last 5 employees created:');
      const latest = await Employee.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'email role');
      
      for (const emp of latest) {
        console.log(`- ${emp.employeeId}: ${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`);
        console.log(`  Email: ${emp.user?.email || 'No email'}, Role: ${emp.user?.role || 'No role'}`);
        console.log(`  Created: ${emp.createdAt}`);
      }
    } else {
      console.log(`✅ Found ${employees.length} employee(s):\n`);
      
      for (const emp of employees) {
        console.log('━'.repeat(60));
        console.log(`📋 Employee ID: ${emp.employeeId}`);
        console.log(`👤 Name: ${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`);
        if (emp.user) {
          console.log(`📧 Email: ${emp.user.email}`);
          console.log(`🎭 Current Role: ${emp.user.role}`);
          console.log(`✅ Active: ${emp.user.isActive}`);
          console.log(`🆔 User ID: ${emp.user._id}`);
        } else {
          console.log('❌ No user account linked!');
        }
      }
    }

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

searchCODR123();


