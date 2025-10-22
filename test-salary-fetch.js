const axios = require('axios');

// Test script to verify salary data fetching
const testSalaryFetch = async () => {
  try {
    console.log('🧪 Testing Salary Data Fetching...\n');

    // Test 1: Check if employee salaries endpoint works
    console.log('1. Testing employee salaries endpoint...');
    try {
      const response = await axios.get('http://localhost:5001/api/payroll/employee-salaries', {
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
      }
    } catch (error) {
      console.log('❌ Employee salaries endpoint error:', error.response?.data?.message || error.message);
    }

    // Test 2: Check salary management endpoint
    console.log('\n2. Testing salary management endpoint...');
    try {
      const response = await axios.get('http://localhost:5001/api/salary-management', {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
        }
      });
      
      console.log('✅ Salary management endpoint accessible');
      console.log('   - Salary records found:', response.data.salaryRecords?.length || 0);
    } catch (error) {
      console.log('❌ Salary management endpoint error:', error.response?.data?.message || error.message);
    }

    // Test 3: Check employees endpoint
    console.log('\n3. Testing employees endpoint...');
    try {
      const response = await axios.get('http://localhost:5001/api/employees', {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
        }
      });
      
      console.log('✅ Employees endpoint accessible');
      console.log('   - Total employees:', response.data.employees?.length || 0);
    } catch (error) {
      console.log('❌ Employees endpoint error:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Salary data fetching tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testSalaryFetch();
