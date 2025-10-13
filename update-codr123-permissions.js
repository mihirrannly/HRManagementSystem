const mongoose = require('mongoose');
const User = require('./server/models/User');
const Employee = require('./server/models/Employee');

async function updateCODR123Permissions() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/rannkly-hr', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Find employee with ID CODR123
    const employee = await Employee.findOne({ employeeId: 'CODR123' });
    
    if (!employee) {
      console.log('❌ Employee with ID CODR123 not found');
      process.exit(1);
    }

    console.log('\n📋 Found Employee:');
    console.log(`Name: ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`);
    console.log(`Employee ID: ${employee.employeeId}`);
    console.log(`User ID: ${employee.user}`);

    // Find the associated user
    const user = await User.findById(employee.user);
    
    if (!user) {
      console.log('❌ User account not found for this employee');
      process.exit(1);
    }

    console.log('\n👤 Current User Details:');
    console.log(`Email: ${user.email}`);
    console.log(`Current Role: ${user.role}`);
    console.log(`Is Active: ${user.isActive}`);

    // Update user role to 'hr'
    user.role = 'hr';
    user.isActive = true;
    await user.save();

    console.log('\n✅ Successfully updated user role to HR');
    console.log('📧 Email:', user.email);
    console.log('🎭 New Role:', user.role);
    console.log('\n⚠️  IMPORTANT: User must LOG OUT and LOG BACK IN for changes to take effect!');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateCODR123Permissions();

