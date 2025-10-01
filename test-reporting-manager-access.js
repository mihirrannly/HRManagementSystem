/**
 * Test script to verify reporting manager access control implementation
 * This script tests the new data filtering functionality
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_CREDENTIALS = {
  manager: {
    email: 'manager@rannkly.com',
    password: 'password123'
  },
  employee: {
    email: 'employee@rannkly.com', 
    password: 'password123'
  },
  admin: {
    email: 'admin@rannkly.com',
    password: 'password123'
  }
};

let authTokens = {};

// Helper function to login and get token
async function login(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    return response.data.token;
  } catch (error) {
    console.error(`Login failed for ${credentials.email}:`, error.response?.data || error.message);
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

// Test function to verify data filtering
async function testDataFiltering() {
  console.log('🧪 Testing Reporting Manager Access Control...\n');
  
  // Step 1: Login as different user types
  console.log('1. Logging in as different user types...');
  
  for (const [role, credentials] of Object.entries(TEST_CREDENTIALS)) {
    const token = await login(credentials);
    if (token) {
      authTokens[role] = token;
      console.log(`✅ ${role} login successful`);
    } else {
      console.log(`❌ ${role} login failed`);
    }
  }
  
  if (!authTokens.manager || !authTokens.employee) {
    console.log('❌ Cannot proceed with tests - missing authentication tokens');
    return;
  }
  
  // Step 2: Get employee list to find a team member
  console.log('\n2. Getting employee list...');
  const employeeList = await makeRequest(authTokens.manager, 'GET', '/employees');
  
  if (!employeeList || !employeeList.employees || employeeList.employees.length === 0) {
    console.log('❌ No employees found in the system');
    return;
  }
  
  const teamMember = employeeList.employees[0];
  console.log(`✅ Found team member: ${teamMember.personalInfo?.firstName} ${teamMember.personalInfo?.lastName}`);
  
  // Step 3: Test manager access to team member data
  console.log('\n3. Testing manager access to team member data...');
  const managerAccess = await makeRequest(authTokens.manager, 'GET', `/employees/${teamMember._id}`);
  
  if (managerAccess) {
    console.log('✅ Manager can access team member data');
    
    // Check if sensitive data is filtered
    const hasSensitiveData = managerAccess.salaryInfo?.bankDetails || 
                            managerAccess.salaryInfo?.taxInfo ||
                            managerAccess.personalInfo?.dateOfBirth ||
                            managerAccess.contactInfo?.phone;
    
    if (hasSensitiveData) {
      console.log('❌ Sensitive data is NOT filtered for manager access');
      console.log('Sensitive data found:', {
        bankDetails: !!managerAccess.salaryInfo?.bankDetails,
        taxInfo: !!managerAccess.salaryInfo?.taxInfo,
        dateOfBirth: !!managerAccess.personalInfo?.dateOfBirth,
        phone: !!managerAccess.contactInfo?.phone
      });
    } else {
      console.log('✅ Sensitive data is properly filtered for manager access');
    }
    
    // Check if work-related data is available
    const hasWorkData = managerAccess.personalInfo?.firstName &&
                       managerAccess.employmentInfo?.designation &&
                       managerAccess.employmentInfo?.department;
    
    if (hasWorkData) {
      console.log('✅ Work-related data is available for manager access');
    } else {
      console.log('❌ Work-related data is missing for manager access');
    }
  } else {
    console.log('❌ Manager cannot access team member data');
  }
  
  // Step 4: Test team dashboard endpoint
  console.log('\n4. Testing team dashboard endpoint...');
  const teamDashboard = await makeRequest(authTokens.manager, 'GET', `/employees/team-dashboard/${teamMember._id}`);
  
  if (teamDashboard) {
    console.log('✅ Team dashboard endpoint works');
    console.log(`   Access level: ${teamDashboard.accessLevel}`);
    console.log(`   Employee name: ${teamDashboard.employee?.personalInfo?.firstName} ${teamDashboard.employee?.personalInfo?.lastName}`);
    console.log(`   Attendance data: ${teamDashboard.attendance ? 'Available' : 'Not available'}`);
    console.log(`   Leave data: ${teamDashboard.leaves ? 'Available' : 'Not available'}`);
  } else {
    console.log('❌ Team dashboard endpoint failed');
  }
  
  // Step 5: Test admin access (should see all data)
  if (authTokens.admin) {
    console.log('\n5. Testing admin access (should see all data)...');
    const adminAccess = await makeRequest(authTokens.admin, 'GET', `/employees/${teamMember._id}`);
    
    if (adminAccess) {
      console.log('✅ Admin can access employee data');
      
      // Admin should see sensitive data
      const hasSensitiveData = adminAccess.salaryInfo?.bankDetails || 
                              adminAccess.salaryInfo?.taxInfo ||
                              adminAccess.personalInfo?.dateOfBirth ||
                              adminAccess.contactInfo?.phone;
      
      if (hasSensitiveData) {
        console.log('✅ Admin can see sensitive data (as expected)');
      } else {
        console.log('❌ Admin cannot see sensitive data (unexpected)');
      }
    } else {
      console.log('❌ Admin cannot access employee data');
    }
  }
  
  console.log('\n🎉 Testing completed!');
}

// Run the test
if (require.main === module) {
  testDataFiltering().catch(console.error);
}

module.exports = { testDataFiltering };
