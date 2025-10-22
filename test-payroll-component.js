// Test script to verify Payroll component functionality
const axios = require('axios');

const testPayrollComponent = async () => {
  try {
    console.log('🧪 Testing Payroll Component...\n');

    // Test 1: Check if payroll endpoint is accessible
    console.log('1. Testing payroll endpoint accessibility...');
    try {
      const response = await axios.get('http://localhost:5000/api/payroll/payslips', {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
        }
      });
      console.log('✅ Payroll endpoint accessible');
      console.log('   - Payslips found:', response.data.payslips?.length || 0);
    } catch (error) {
      console.log('❌ Payroll endpoint error:', error.response?.data?.message || error.message);
    }

    // Test 2: Check employee salaries endpoint
    console.log('\n2. Testing employee salaries endpoint...');
    try {
      const response = await axios.get('http://localhost:5000/api/payroll/employee-salaries', {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
        },
        params: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        }
      });
      console.log('✅ Employee salaries endpoint accessible');
      console.log('   - Total employees:', response.data.totalEmployees);
      console.log('   - Employee salaries:', response.data.employeeSalaries?.length || 0);
    } catch (error) {
      console.log('❌ Employee salaries endpoint error:', error.response?.data?.message || error.message);
    }

    // Test 3: Check if server is running
    console.log('\n3. Testing server connectivity...');
    try {
      const response = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server connectivity issue:', error.message);
      console.log('   - Make sure the server is running with: npm run dev');
    }

    console.log('\n🎉 Payroll component tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testPayrollComponent();
