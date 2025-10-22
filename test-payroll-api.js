const axios = require('axios');

// Test script to verify payroll API endpoints
const testPayrollAPI = async () => {
  try {
    console.log('🧪 Testing Payroll API Endpoints...\n');

    const baseURL = 'http://localhost:5001';
    
    // Test 1: Check server health
    console.log('1. Testing server health...');
    try {
      const response = await axios.get(`${baseURL}/api/health`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
      return;
    }

    // Test 2: Check payroll routes
    console.log('\n2. Testing payroll routes...');
    try {
      const response = await axios.get(`${baseURL}/api/payroll/payslips`);
      console.log('✅ Payroll routes accessible');
    } catch (error) {
      console.log('❌ Payroll routes error:', error.response?.status, error.response?.data?.message);
    }

    // Test 3: Check employee salaries endpoint (without auth)
    console.log('\n3. Testing employee salaries endpoint...');
    try {
      const response = await axios.get(`${baseURL}/api/payroll/employee-salaries`);
      console.log('✅ Employee salaries endpoint accessible');
      console.log('   - Response status:', response.status);
      console.log('   - Data keys:', Object.keys(response.data || {}));
    } catch (error) {
      console.log('❌ Employee salaries endpoint error:', error.response?.status, error.response?.data?.message);
    }

    // Test 4: Check salary management routes
    console.log('\n4. Testing salary management routes...');
    try {
      const response = await axios.get(`${baseURL}/api/salary-management`);
      console.log('✅ Salary management routes accessible');
    } catch (error) {
      console.log('❌ Salary management routes error:', error.response?.status, error.response?.data?.message);
    }

    // Test 5: Check employees routes
    console.log('\n5. Testing employees routes...');
    try {
      const response = await axios.get(`${baseURL}/api/employees`);
      console.log('✅ Employees routes accessible');
    } catch (error) {
      console.log('❌ Employees routes error:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n🎉 API endpoint tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check if server is running on port 5001');
    console.log('2. Verify authentication tokens');
    console.log('3. Check database connection');
    console.log('4. Test with actual user login');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testPayrollAPI();
