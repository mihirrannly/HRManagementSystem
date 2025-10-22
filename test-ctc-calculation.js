const axios = require('axios');

async function testCTCCalculation() {
  try {
    console.log('🧪 Testing CTC Calculation...\n');
    
    // Test the payroll API endpoint
    const response = await axios.get('http://localhost:5000/api/payroll/employee-salaries', {
      params: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      },
      headers: {
        'Authorization': 'Bearer your-token-here' // You'll need to replace this with a valid token
      }
    });
    
    console.log('📊 API Response Status:', response.status);
    console.log('📋 Total Employees:', response.data.totalEmployees);
    
    // Check first few employees
    const employees = response.data.employeeSalaries.slice(0, 3);
    
    employees.forEach((emp, index) => {
      console.log(`\n👤 Employee ${index + 1}: ${emp.name} (${emp.employeeId})`);
      console.log(`   📈 Data Source: ${emp.dataSource}`);
      console.log(`   💰 Total CTC: ₹${emp.totalCTC?.toLocaleString() || '0'}`);
      console.log(`   💵 Gross Salary: ₹${emp.grossSalary?.toLocaleString() || '0'}`);
      console.log(`   💸 Net Salary: ₹${emp.netSalary?.toLocaleString() || '0'}`);
      console.log(`   🏦 Basic Salary: ₹${emp.basicSalary?.toLocaleString() || '0'}`);
      console.log(`   🏠 HRA: ₹${emp.hra?.toLocaleString() || '0'}`);
      
      // Check if CTC is annual (should be 12x monthly gross approximately)
      if (emp.totalCTC && emp.grossSalary) {
        const ratio = emp.totalCTC / emp.grossSalary;
        console.log(`   📊 CTC/Gross Ratio: ${ratio.toFixed(2)} (should be ~12 for annual CTC)`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing CTC calculation:', error.message);
    if (error.response) {
      console.error('📋 Response Status:', error.response.status);
      console.error('📋 Response Data:', error.response.data);
    }
  }
}

// Run the test
testCTCCalculation();
