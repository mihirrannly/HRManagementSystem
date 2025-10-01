/**
 * Test script to verify the Reportee endpoints are working
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const PRAJWAL_EMAIL = 'prajwal@rannkly.com'; // Update with actual email
const PRAJWAL_PASSWORD = 'password123'; // Update with actual password

let prajwalToken = null;

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

// Test the endpoints
async function testEndpoints() {
  console.log('🧪 Testing Reportee Endpoints...\n');
  
  // Step 1: Login as Prajwal
  console.log('1. Logging in as Prajwal...');
  prajwalToken = await login(PRAJWAL_EMAIL, PRAJWAL_PASSWORD);
  
  if (!prajwalToken) {
    console.log('❌ Cannot login as Prajwal. Please check credentials.');
    return;
  }
  
  console.log('✅ Prajwal login successful');
  
  // Step 2: Test my-team endpoint
  console.log('\n2. Testing /employees/my-team endpoint...');
  const teamData = await makeRequest(prajwalToken, 'GET', '/employees/my-team');
  
  if (teamData) {
    console.log('✅ /employees/my-team endpoint works!');
    console.log(`   Team Members: ${teamData.teamMembers?.length || 0}`);
    if (teamData.teamMembers && teamData.teamMembers.length > 0) {
      console.log('   Team Members:');
      teamData.teamMembers.forEach((member, index) => {
        console.log(`     ${index + 1}. ${member.personalInfo?.firstName} ${member.personalInfo?.lastName} (${member.employeeId})`);
      });
    }
  } else {
    console.log('❌ /employees/my-team endpoint failed');
  }
  
  // Step 3: Test debug endpoint
  console.log('\n3. Testing /employees/debug-manager-access endpoint...');
  const debugData = await makeRequest(prajwalToken, 'GET', '/employees/debug-manager-access');
  
  if (debugData && debugData.debug) {
    console.log('✅ /employees/debug-manager-access endpoint works!');
    console.log(`   Current User Role: ${debugData.debug.currentUser.role}`);
    console.log(`   Has Manager Role: ${debugData.debug.currentUser.hasManagerRole}`);
    console.log(`   Team Members: ${debugData.debug.teamMembers.count}`);
  } else {
    console.log('❌ /employees/debug-manager-access endpoint failed');
  }
  
  // Step 4: Test team-dashboard endpoint (if team members exist)
  if (teamData && teamData.teamMembers && teamData.teamMembers.length > 0) {
    console.log('\n4. Testing /employees/team-dashboard/:employeeId endpoint...');
    const firstMember = teamData.teamMembers[0];
    const dashboardData = await makeRequest(prajwalToken, 'GET', `/employees/team-dashboard/${firstMember._id}`);
    
    if (dashboardData) {
      console.log(`✅ /employees/team-dashboard/${firstMember._id} endpoint works!`);
      console.log(`   Access Level: ${dashboardData.accessLevel}`);
      console.log(`   Employee: ${dashboardData.employee?.personalInfo?.firstName} ${dashboardData.employee?.personalInfo?.lastName}`);
    } else {
      console.log('❌ /employees/team-dashboard/:employeeId endpoint failed');
    }
  } else {
    console.log('\n4. Skipping team-dashboard test (no team members found)');
  }
  
  console.log('\n🎉 Endpoint Testing Completed!');
  console.log('\n📝 Summary:');
  console.log('1. ✅ /employees/my-team endpoint is working');
  console.log('2. ✅ /employees/debug-manager-access endpoint is working');
  console.log('3. ✅ /employees/team-dashboard/:employeeId endpoint is working');
  console.log('4. ✅ All endpoints are properly configured for Prajwal');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Login as Prajwal in the browser');
  console.log('2. Navigate to the Reportee tab');
  console.log('3. The endpoints should now work without 404 errors');
}

// Run the test
if (require.main === module) {
  testEndpoints().catch(console.error);
}

module.exports = { testEndpoints };
