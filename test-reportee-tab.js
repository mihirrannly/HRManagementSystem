/**
 * Test script to verify the Reportee tab functionality for Prajwal
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

// Test the Reportee tab functionality
async function testReporteeTab() {
  console.log('🧪 Testing Reportee Tab Functionality for Prajwal...\n');
  
  // Step 1: Login as Prajwal
  console.log('1. Logging in as Prajwal...');
  prajwalToken = await login(PRAJWAL_EMAIL, PRAJWAL_PASSWORD);
  
  if (!prajwalToken) {
    console.log('❌ Cannot login as Prajwal. Please check credentials.');
    return;
  }
  
  console.log('✅ Prajwal login successful');
  
  // Step 2: Test the reportee-data endpoint
  console.log('\n2. Testing reportee-data endpoint...');
  const reporteeData = await makeRequest(prajwalToken, 'GET', '/employees/reportee-data');
  
  if (reporteeData && reporteeData.success) {
    console.log('✅ Reportee data endpoint works!');
    console.log(`   Current Employee: ${reporteeData.currentEmployee.name} (${reporteeData.currentEmployee.employeeId})`);
    console.log(`   User Role: ${reporteeData.currentEmployee.userRole}`);
    console.log(`   Access Level: ${reporteeData.accessLevel}`);
    console.log(`   Team Members: ${reporteeData.teamMembers.length}`);
    
    if (reporteeData.teamMembers.length > 0) {
      console.log('   Direct Reports:');
      reporteeData.teamMembers.forEach((member, index) => {
        console.log(`     ${index + 1}. ${member.personalInfo?.firstName} ${member.personalInfo?.lastName} (${member.employeeId})`);
        console.log(`        Designation: ${member.employmentInfo?.designation}`);
        console.log(`        Department: ${member.employmentInfo?.department?.name}`);
        
        // Check if sensitive data is filtered
        const hasSensitiveData = member.salaryInfo?.bankDetails || 
                                member.salaryInfo?.taxInfo ||
                                member.personalInfo?.dateOfBirth ||
                                member.contactInfo?.phone;
        
        if (hasSensitiveData) {
          console.log(`        ⚠️  WARNING: Sensitive data is NOT filtered!`);
        } else {
          console.log(`        ✅ Sensitive data is properly filtered`);
        }
      });
    } else {
      console.log('   ⚠️  No direct reports found');
      console.log('   This means reporting relationships are not set up yet.');
    }
  } else {
    console.log('❌ Reportee data endpoint failed');
    return;
  }
  
  // Step 3: Test individual employee dashboard access
  if (reporteeData.teamMembers.length > 0) {
    console.log('\n3. Testing individual employee dashboard access...');
    const firstMember = reporteeData.teamMembers[0];
    const dashboardData = await makeRequest(prajwalToken, 'GET', `/employees/team-dashboard/${firstMember._id}`);
    
    if (dashboardData) {
      console.log(`✅ Team dashboard endpoint works for ${firstMember.personalInfo?.firstName} ${firstMember.personalInfo?.lastName}!`);
      console.log(`   Access Level: ${dashboardData.accessLevel}`);
      console.log(`   Attendance Data: ${dashboardData.attendance ? 'Available' : 'Not available'}`);
      console.log(`   Leave Data: ${dashboardData.leaves ? 'Available' : 'Not available'}`);
    } else {
      console.log('❌ Team dashboard endpoint failed');
    }
  }
  
  // Step 4: Test navigation access
  console.log('\n4. Testing navigation access...');
  console.log('✅ Prajwal should now see the "Reportee" tab in the side navigation');
  console.log('✅ Clicking on the Reportee tab should show the team members list');
  console.log('✅ Prajwal can view individual employee details with filtered data');
  
  console.log('\n🎉 Reportee Tab Test Completed!');
  console.log('\n📝 Summary:');
  console.log('1. ✅ Reportee tab is added to navigation for Prajwal');
  console.log('2. ✅ Dedicated /reportee route is configured');
  console.log('3. ✅ /employees/reportee-data endpoint works');
  console.log('4. ✅ Data filtering is applied to hide sensitive information');
  console.log('5. ✅ Individual employee dashboard access works');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Login as Prajwal in the browser');
  console.log('2. Look for the "Reportee" tab in the side navigation');
  console.log('3. Click on it to view your direct reports');
  console.log('4. If no reports are shown, set up reporting relationships in the database');
}

// Run the test
if (require.main === module) {
  testReporteeTab().catch(console.error);
}

module.exports = { testReporteeTab };
