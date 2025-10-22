const axios = require('axios');

// Test script to verify salary API with authentication
const testSalaryAPIWithAuth = async () => {
  try {
    console.log('🧪 Testing Salary API with Authentication...\n');

    const baseURL = 'http://localhost:5001';
    
    // Test 1: Login to get authentication token
    console.log('1. Testing login...');
    let authToken = null;
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'hr@rannkly.com',
        password: 'password123' // Replace with actual password
      });
      
      authToken = loginResponse.data.token;
      console.log('✅ Login successful');
      console.log('   - Token received:', authToken ? 'Yes' : 'No');
      console.log('   - User role:', loginResponse.data.user?.role);
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
      console.log('   - Try with different credentials or check if user exists');
      return;
    }

    // Test 2: Test employee salaries endpoint with auth
    console.log('\n2. Testing employee salaries endpoint...');
    try {
      const response = await axios.get(`${baseURL}/api/payroll/employee-salaries`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        params: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        }
      });
      
      console.log('✅ Employee salaries endpoint accessible');
      console.log('   - Total employees:', response.data.totalEmployees);
      console.log('   - Employee salaries found:', response.data.employeeSalaries?.length || 0);
      
      if (response.data.employeeSalaries?.length > 0) {
        const sampleEmployee = response.data.employeeSalaries[0];
        console.log('\n📄 Sample Employee Salary Data:');
        console.log('   - Employee ID:', sampleEmployee.employeeId);
        console.log('   - Name:', sampleEmployee.name);
        console.log('   - Data Source:', sampleEmployee.dataSource);
        console.log('   - Basic Salary:', sampleEmployee.basicSalary);
        console.log('   - HRA:', sampleEmployee.hra);
        console.log('   - Gross Salary:', sampleEmployee.grossSalary);
        console.log('   - Total CTC:', sampleEmployee.totalCTC);
        
        // Check if salary data is not 0
        if (sampleEmployee.basicSalary > 0) {
          console.log('   ✅ Salary data is properly populated!');
        } else {
          console.log('   ❌ Salary data is still showing 0');
        }
      }
    } catch (error) {
      console.log('❌ Employee salaries endpoint error:', error.response?.data?.message || error.message);
    }

    // Test 3: Test salary management endpoint
    console.log('\n3. Testing salary management endpoint...');
    try {
      const response = await axios.get(`${baseURL}/api/salary-management`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('✅ Salary management endpoint accessible');
      console.log('   - Salary records found:', response.data.salaryRecords?.length || 0);
    } catch (error) {
      console.log('❌ Salary management endpoint error:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Salary API tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open the application in browser');
    console.log('2. Login with hr@rannkly.com');
    console.log('3. Navigate to Payroll section');
    console.log('4. Click "View Details" on any employee');
    console.log('5. Check if salary data is displayed correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testSalaryAPIWithAuth();
