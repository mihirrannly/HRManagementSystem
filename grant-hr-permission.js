const mongoose = require('mongoose');
const User = require('./server/models/User');
const Employee = require('./server/models/Employee');

// Get search term from command line argument
const searchTerm = process.argv[2];

async function grantHRPermission() {
  try {
    if (!searchTerm) {
      console.log('❌ Please provide an Employee ID, email, or name');
      console.log('Usage: node grant-hr-permission.js <employee_id_or_email_or_name>');
      console.log('Examples:');
      console.log('  node grant-hr-permission.js CODR021');
      console.log('  node grant-hr-permission.js priya.mishra@rannkly.com');
      console.log('  node grant-hr-permission.js "Priya Mishra"');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/rannkly-hr', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    let employee = null;
    let user = null;

    // Try to find by employee ID first
    console.log(`\n🔍 Searching for: "${searchTerm}"...`);
    employee = await Employee.findOne({ employeeId: searchTerm });

    // If not found by ID, try by email
    if (!employee) {
      user = await User.findOne({ email: searchTerm });
      if (user) {
        employee = await Employee.findOne({ user: user._id });
      }
    }

    // If still not found, try by name (case insensitive)
    if (!employee) {
      const nameParts = searchTerm.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      
      const query = {
        'personalInfo.firstName': new RegExp(firstName, 'i')
      };
      
      if (lastName) {
        query['personalInfo.lastName'] = new RegExp(lastName, 'i');
      }
      
      employee = await Employee.findOne(query);
    }

    if (!employee) {
      console.log('❌ No employee found with the provided information');
      console.log('\n📋 Available Employees (Last 20):');
      
      const employees = await Employee.find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .select('employeeId personalInfo.firstName personalInfo.lastName user');
      
      for (const emp of employees) {
        const usr = await User.findById(emp.user).select('email');
        console.log(`- ${emp.employeeId}: ${emp.personalInfo.firstName} ${emp.personalInfo.lastName} (${usr?.email || 'No email'})`);
      }
      
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('\n📋 Found Employee:');
    console.log(`Name: ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`);
    console.log(`Employee ID: ${employee.employeeId}`);

    // Find the associated user if not already found
    if (!user) {
      user = await User.findById(employee.user);
    }
    
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

    console.log('\n✅ Successfully granted HR permissions!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`);
    console.log(`🆔 Employee ID: ${employee.employeeId}`);
    console.log(`🎭 Role Updated: ${oldRole} → ${user.role}`);
    console.log('\n' + '='.repeat(60));
    console.log('⚠️  IMPORTANT: User must LOG OUT and LOG BACK IN');
    console.log('⚠️  for permissions changes to take effect!');
    console.log('='.repeat(60));

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

grantHRPermission();

