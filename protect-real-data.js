#!/usr/bin/env node

/**
 * Data Protection Script
 * 
 * This script ensures that only real employee data exists in the system
 * and prevents accidental creation of dummy/test data.
 */

const mongoose = require('mongoose');
const User = require('./server/models/User');
const Employee = require('./server/models/Employee');

// CRITICAL: This script is DISABLED to prevent accidental deletion of real employee data
// The previous version mistakenly deleted legitimate CSV-imported employees

console.log('🚨 DATA PROTECTION SCRIPT DISABLED');
console.log('⚠️  This script previously deleted legitimate employee data by mistake');
console.log('💡 Only manually delete data after careful verification');
console.log('');
console.log('🛡️  To protect data:');
console.log('   1. Always verify employee legitimacy before deletion');
console.log('   2. Check with admin before removing any employee records');
console.log('   3. Use specific email/ID filters, not broad patterns');
console.log('');
process.exit(0);

// DISABLED CODE - DO NOT USE WITHOUT MANUAL VERIFICATION
/*
// List of real/allowed email addresses
const REAL_EMAILS = [
  'mihir@rannkly.com'
  // Add more real employee emails here as needed
];

// List of real/allowed employee IDs  
const REAL_EMPLOYEE_IDS = [
  'CODR0100'
  // Add more real employee IDs here as needed
];
*/

async function protectRealData() {
  try {
    console.log('🛡️  Running Data Protection Script...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rannkly_hr', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Find and remove dummy users
    const dummyUsers = await User.find({
      email: { $nin: REAL_EMAILS }
    });
    
    if (dummyUsers.length > 0) {
      console.log(`🧹 Found ${dummyUsers.length} dummy users to remove:`);
      dummyUsers.forEach(u => console.log(`   - ${u.email} (${u.role})`));
      
      const userDeleteResult = await User.deleteMany({
        email: { $nin: REAL_EMAILS }
      });
      console.log(`✅ Removed ${userDeleteResult.deletedCount} dummy users`);
    }
    
    // Find and remove dummy employees
    const dummyEmployees = await Employee.find({
      employeeId: { $nin: REAL_EMPLOYEE_IDS }
    });
    
    if (dummyEmployees.length > 0) {
      console.log(`🧹 Found ${dummyEmployees.length} dummy employees to remove:`);
      dummyEmployees.forEach(e => console.log(`   - ${e.employeeId}: ${e.personalInfo.firstName} ${e.personalInfo.lastName}`));
      
      const empDeleteResult = await Employee.deleteMany({
        employeeId: { $nin: REAL_EMPLOYEE_IDS }
      });
      console.log(`✅ Removed ${empDeleteResult.deletedCount} dummy employees`);
    }
    
    // Verify remaining data
    const remainingUsers = await User.find({}, 'email role');
    const remainingEmployees = await Employee.find({}, 'employeeId personalInfo.firstName personalInfo.lastName').populate('user', 'email');
    
    console.log('\n📋 Protected Data Summary:');
    console.log(`   Real users: ${remainingUsers.length}`);
    console.log(`   Real employees: ${remainingEmployees.length}`);
    
    if (remainingUsers.length > 0) {
      console.log('\n✅ Remaining Users:');
      remainingUsers.forEach(u => console.log(`   - ${u.email} (${u.role})`));
    }
    
    if (remainingEmployees.length > 0) {
      console.log('\n✅ Remaining Employees:');
      remainingEmployees.forEach(e => console.log(`   - ${e.employeeId}: ${e.personalInfo.firstName} ${e.personalInfo.lastName}`));
    }
    
    console.log('\n🎉 Data protection completed successfully!');
    
  } catch (error) {
    console.error('❌ Data protection failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the protection script
if (require.main === module) {
  protectRealData();
}

module.exports = { protectRealData, REAL_EMAILS, REAL_EMPLOYEE_IDS };
