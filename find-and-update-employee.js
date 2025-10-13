const mongoose = require('mongoose');
const User = require('./server/models/User');
const Employee = require('./server/models/Employee');

async function findAndUpdateEmployee() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/rannkly-hr', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // First, let's search for CODR123
    console.log('\n🔍 Searching for CODR123...');
    let employee = await Employee.findOne({ employeeId: 'CODR123' });
    
    if (!employee) {
      // Try searching in users by email or other fields
      console.log('⚠️  CODR123 not found as employee, searching in users...');
      
      // List recent employees to help identify
      const recentEmployees = await Employee.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select('employeeId personalInfo.firstName personalInfo.lastName user');
      
      console.log('\n📋 Recent Employees:');
      for (const emp of recentEmployees) {
        console.log(`- ${emp.employeeId}: ${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`);
      }
      
      // Search users
      const users = await User.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select('email role isActive createdAt');
      
      console.log('\n👥 Recent Users:');
      for (const usr of users) {
        console.log(`- ${usr.email} (Role: ${usr.role}, Active: ${usr.isActive})`);
      }
      
      // Try to find by user prompt
      console.log('\n❓ Please provide either:');
      console.log('   - The exact Employee ID');
      console.log('   - The email address');
      console.log('   - The employee name');
      
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('\n📋 Found Employee:');
    console.log(`Name: ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`);
    console.log(`Employee ID: ${employee.employeeId}`);
    console.log(`User ID: ${employee.user}`);

    // Find the associated user
    const user = await User.findById(employee.user);
    
    if (!user) {
      console.log('❌ User account not found for this employee');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('\n👤 Current User Details:');
    console.log(`Email: ${user.email}`);
    console.log(`Current Role: ${user.role}`);
    console.log(`Is Active: ${user.isActive}`);

    // Update user role to 'hr'
    const oldRole = user.role;
    user.role = 'hr';
    user.isActive = true;
    await user.save();

    console.log('\n✅ Successfully updated user permissions!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🎭 Old Role: ${oldRole} → New Role: ${user.role}`);
    console.log('\n⚠️  IMPORTANT: User must LOG OUT and LOG BACK IN for changes to take effect!');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

findAndUpdateEmployee();

