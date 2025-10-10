const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

const API_URL = 'http://localhost:5000';

// Create a sample Excel file for testing
function createSampleExcelFile() {
  console.log('📝 Creating sample Excel file...');
  
  const data = [
    ['Employee ID', 'Date', 'Check-in', 'Check-out', 'Status'],
    ['EMP001', '2025-01-01', '09:00', '18:00', 'present'],
    ['EMP002', '2025-01-01', '09:30', '18:00', 'late'],
    ['EMP003', '2025-01-01', '', '', 'absent'],
    ['EMP001', '2025-01-02', '09:15', '17:45', 'present'],
    ['EMP002', '2025-01-02', '09:00', '18:30', 'present'],
    ['EMP003', '2025-01-02', '10:00', '18:00', 'late'],
    ['EMP001', '2025-01-03', '', '', 'on-leave'],
    ['EMP002', '2025-01-03', '09:00', '13:00', 'half-day'],
    ['EMP003', '2025-01-03', '09:00', '18:00', 'present'],
  ];

  const ws = xlsx.utils.aoa_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Attendance');

  const filePath = path.join(__dirname, 'test-attendance-data.xlsx');
  xlsx.writeFile(wb, filePath);

  console.log('✅ Sample file created:', filePath);
  return filePath;
}

// Test the import preview endpoint
async function testImportPreview(token, filePath) {
  console.log('\n🔍 Testing import preview endpoint...');

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const response = await axios.post(
      `${API_URL}/api/attendance/import/preview`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Preview endpoint response:');
    console.log('   - Success:', response.data.success);
    console.log('   - Total Rows:', response.data.totalRows);
    console.log('   - Preview Rows:', response.data.previewRows);
    console.log('   - Headers:', response.data.headers);
    console.log('   - Suggested Mapping:', response.data.suggestedMapping);

    return response.data;
  } catch (error) {
    console.error('❌ Preview endpoint error:', error.response?.data || error.message);
    throw error;
  }
}

// Test the import execute endpoint
async function testImportExecute(token, fileInfo, columnMapping) {
  console.log('\n🚀 Testing import execute endpoint...');

  try {
    const response = await axios.post(
      `${API_URL}/api/attendance/import/execute`,
      {
        filePath: fileInfo.path,
        columnMapping: columnMapping
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Execute endpoint response:');
    console.log('   - Success:', response.data.success);
    console.log('   - Message:', response.data.message);
    console.log('   - Results:');
    console.log('     • Success:', response.data.results.success);
    console.log('     • Failed:', response.data.results.failed);
    console.log('     • Skipped:', response.data.results.skipped);
    console.log('     • Created:', response.data.results.created.length);
    console.log('     • Updated:', response.data.results.updated.length);

    if (response.data.results.errors.length > 0) {
      console.log('   - Errors:');
      response.data.results.errors.forEach(error => {
        console.log(`     • Row ${error.row}: ${error.error}`);
      });
    }

    return response.data;
  } catch (error) {
    console.error('❌ Execute endpoint error:', error.response?.data || error.message);
    throw error;
  }
}

// Login to get token
async function login() {
  console.log('🔐 Logging in as admin...');

  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@rannkly.com',
      password: 'admin123'
    });

    console.log('✅ Login successful');
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting Attendance Import Tests\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Create sample Excel file
    const filePath = createSampleExcelFile();

    // Step 2: Login
    const token = await login();

    // Step 3: Test preview endpoint
    const previewData = await testImportPreview(token, filePath);

    // Step 4: Test execute endpoint with suggested mapping
    const columnMapping = previewData.suggestedMapping;
    const executeData = await testImportExecute(token, previewData.fileInfo, columnMapping);

    console.log('\n' + '=' .repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('=' .repeat(60));

    // Clean up test file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('\n🧹 Cleaned up test file');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('=' .repeat(60));
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests, createSampleExcelFile, testImportPreview, testImportExecute };

