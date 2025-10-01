/**
 * Script to diagnose and fix Prajwal's manager access issue
 * This script will help identify why Prajwal (CODR083) cannot see team member data
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const PRAJWAL_EMAIL = 'prajwal@rannkly.com'; // Update this with Prajwal's actual email
const ADMIN_EMAIL = 'admin@rannkly.com'; // Update with admin email
const ADMIN_PASSWORD = 'password123'; // Update with admin password

let adminToken = null;

// Helper function to login
async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    return response.data.token;
  } catch (error) {
    console.error(`Login failed for ${email}:`, error.response?.data || error.message);
    return null;
  }
}

// Helper function to make authenticated requests
async function makeRequest(token, method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Request failed for ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
}

// Step 1: Diagnose the issue
async function diagnoseIssue() {
  console.log('🔍 Diagnosing Prajwal\'s manager access issue...\n');
  
  // Login as admin first
  adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  if (!adminToken) {
    console.log('❌ Cannot login as admin. Please check admin credentials.');
    return;
  }
  
  // Get debug information for Prajwal
  console.log('1. Getting debug information for Prajwal...');
  const debugInfo = await makeRequest(adminToken, 'GET', `/employees/debug-manager-access`);
  
  if (debugInfo && debugInfo.debug) {
    const debug = debugInfo.debug;
    
    console.log('📊 Current Status:');
    console.log(`   User Email: ${debug.currentUser.email}`);
    console.log(`   User Role: ${debug.currentUser.role}`);
    console.log(`   Has Manager Role: ${debug.currentUser.hasManagerRole}`);
    console.log(`   Employee ID: ${debug.currentEmployee.employeeId}`);
    console.log(`   Employee Name: ${debug.currentEmployee.name}`);
    console.log(`   Designation: ${debug.currentEmployee.designation}`);
    console.log(`   Team Members: ${debug.teamMembers.count}`);
    
    if (debug.teamMembers.count > 0) {
      console.log('   Team Members:');
      debug.teamMembers.members.forEach(member => {
        console.log(`     - ${member.name} (${member.employeeId}) - ${member.designation}`);
      });
    }
    
    console.log('\n🔧 Recommendations:');
    if (debug.recommendations.needsManagerRole) {
      console.log(`   ❌ ${debug.recommendations.needsManagerRole}`);
    }
    if (debug.recommendations.needsReportingRelationships) {
      console.log(`   ❌ ${debug.recommendations.needsReportingRelationships}`);
    }
    if (debug.recommendations.checkEmployeeData) {
      console.log(`   ❌ ${debug.recommendations.checkEmployeeData}`);
    }
    
    return debug;
  } else {
    console.log('❌ Could not get debug information');
    return null;
  }
}

// Step 2: Fix the issue
async function fixManagerAccess(debugInfo) {
  if (!debugInfo) {
    console.log('❌ Cannot fix - no debug information available');
    return;
  }
  
  console.log('\n🔧 Fixing manager access...\n');
  
  const needsRoleUpdate = !debugInfo.currentUser.hasManagerRole;
  const needsReportingRelationships = debugInfo.teamMembers.count === 0;
  
  if (needsRoleUpdate || needsReportingRelationships) {
    // You'll need to provide the employee IDs of people who should report to Prajwal
    const reportingEmployeeIds = [
      // Add employee IDs here that should report to Prajwal
      // Example: 'CODR084', 'CODR085', 'CODR086'
    ];
    
    const fixData = {
      userEmail: PRAJWAL_EMAIL,
      setAsManager: needsRoleUpdate,
      reportingManagerEmployeeIds: needsReportingRelationships ? reportingEmployeeIds : []
    };
    
    console.log('2. Applying fixes...');
    const fixResult = await makeRequest(adminToken, 'POST', '/employees/fix-manager-access', fixData);
    
    if (fixResult && fixResult.success) {
      console.log('✅ Manager access fixed successfully!');
      console.log('📋 Changes made:');
      fixResult.results.changes.forEach(change => {
        console.log(`   - ${change}`);
      });
      
      console.log(`\n📊 Updated team members: ${fixResult.results.teamMembers.count}`);
      if (fixResult.results.teamMembers.count > 0) {
        fixResult.results.teamMembers.members.forEach(member => {
          console.log(`   - ${member.name} (${member.employeeId})`);
        });
      }
    } else {
      console.log('❌ Failed to fix manager access');
    }
  } else {
    console.log('✅ No fixes needed - manager access is already properly configured');
  }
}

// Step 3: Test the fix
async function testFix() {
  console.log('\n🧪 Testing the fix...\n');
  
  // Login as Prajwal to test
  const prajwalToken = await login(PRAJWAL_EMAIL, 'password123'); // Update with Prajwal's password
  if (!prajwalToken) {
    console.log('❌ Cannot login as Prajwal to test. Please check credentials.');
    return;
  }
  
  // Test team members endpoint
  console.log('3. Testing team members endpoint...');
  const teamMembers = await makeRequest(prajwalToken, 'GET', '/employees/my-team');
  
  if (teamMembers && teamMembers.teamMembers) {
    console.log(`✅ Team members endpoint works! Found ${teamMembers.teamMembers.length} team members`);
    teamMembers.teamMembers.forEach(member => {
      console.log(`   - ${member.personalInfo?.firstName} ${member.personalInfo?.lastName} (${member.employeeId})`);
    });
  } else {
    console.log('❌ Team members endpoint still not working');
  }
  
  // Test reporting structure endpoint
  console.log('\n4. Testing reporting structure endpoint...');
  const reportingStructure = await makeRequest(prajwalToken, 'GET', '/employees/reporting-structure');
  
  if (reportingStructure && reportingStructure.statistics) {
    console.log(`✅ Reporting structure endpoint works!`);
    console.log(`   Is Manager: ${reportingStructure.statistics.isManager}`);
    console.log(`   Team Size: ${reportingStructure.statistics.totalTeamSize}`);
  } else {
    console.log('❌ Reporting structure endpoint not working');
  }
}

// Main function
async function main() {
  console.log('🚀 Prajwal Manager Access Fix Script\n');
  console.log('This script will help diagnose and fix why Prajwal cannot see team member data.\n');
  
  try {
    // Step 1: Diagnose
    const debugInfo = await diagnoseIssue();
    
    // Step 2: Fix
    await fixManagerAccess(debugInfo);
    
    // Step 3: Test
    await testFix();
    
    console.log('\n🎉 Script completed!');
    console.log('\n📝 Next steps:');
    console.log('1. If Prajwal still cannot see team data, check that:');
    console.log('   - His user role is set to "manager"');
    console.log('   - Employees have their reportingManager field set to Prajwal\'s employee ID');
    console.log('   - The employees are active (isActive: true)');
    console.log('2. You can also manually check the database:');
    console.log('   - Users collection: role should be "manager"');
    console.log('   - Employees collection: employmentInfo.reportingManager should point to Prajwal\'s employee ID');
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { diagnoseIssue, fixManagerAccess, testFix };
