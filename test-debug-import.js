const fs = require('fs');
const { default: fetch } = require('node-fetch');
const Papa = require('papaparse');

async function testDebugImport() {
  try {
    // Login
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@rannkly.com',
        password: 'admin123456'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.token) {
      console.error('Failed to get token:', loginData);
      return;
    }
    
    console.log('✅ Got authentication token');
    
    // Parse CSV - just take the first row for testing
    const csvContent = fs.readFileSync('sample_employee_data.csv', 'utf8');
    const parseResult = Papa.parse(csvContent, {
      header: false,
      skipEmptyLines: true,
      delimiter: ','
    });
    
    const headers = parseResult.data[0];
    const firstRowData = parseResult.data[1]; // Just test with first row
    
    const employeeData = [{}];
    headers.forEach((header, index) => {
      employeeData[0][header] = firstRowData[index] || '';
    });
    
    console.log('🧪 Testing with first employee:', employeeData[0].email);
    
    // Import just one employee
    const response = await fetch('http://localhost:5001/api/organization/import-master-data', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employees: employeeData,
        headers: headers,
        mode: 'comprehensive'
      })
    });
    
    const result = await response.json();
    console.log('Import result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testDebugImport();
