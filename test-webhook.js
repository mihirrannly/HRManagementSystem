/**
 * Test Script for Webhook API Endpoint
 * 
 * Usage: node test-webhook.js
 * 
 * Make sure to:
 * 1. Start your server (npm run dev or npm start)
 * 2. Set ATTENDANCE_AUTH_KEY in your .env file
 * 3. Update AUTH_KEY constant below to match your .env value
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';
const AUTH_KEY = process.env.ATTENDANCE_AUTH_KEY || 'test-auth-key-123';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to log with color
function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Health Check
async function testHealthCheck() {
  log('cyan', '\n=== Test 1: Health Check ===');
  try {
    const response = await axios.get(`${BASE_URL}/api/webhook/health`);
    log('green', '✓ Health check passed');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    log('red', '✗ Health check failed');
    console.error('Error:', error.response?.data || error.message);
    return false;
  }
}

// Test 2: Valid Webhook Request (Single Record)
async function testValidWebhookSingle() {
  log('cyan', '\n=== Test 2: Valid Webhook - Single Record ===');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/webhook/attendance`,
      {
        employeeId: 'EMP001',
        date: '2025-10-10',
        checkIn: '09:00:00',
        checkOut: '18:00:00',
        status: 'present',
        location: 'Office',
        notes: 'Regular attendance'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-key': AUTH_KEY
        }
      }
    );
    log('green', '✓ Single record webhook passed');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    log('red', '✗ Single record webhook failed');
    console.error('Error:', error.response?.data || error.message);
    return false;
  }
}

// Test 3: Valid Webhook Request (Multiple Records)
async function testValidWebhookMultiple() {
  log('cyan', '\n=== Test 3: Valid Webhook - Multiple Records ===');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/webhook/attendance`,
      [
        {
          employeeId: 'EMP001',
          date: '2025-10-10',
          checkIn: '09:00:00',
          checkOut: '18:00:00',
          status: 'present'
        },
        {
          employeeId: 'EMP002',
          date: '2025-10-10',
          checkIn: '09:15:00',
          checkOut: '18:30:00',
          status: 'present'
        },
        {
          employeeId: 'EMP003',
          date: '2025-10-10',
          checkIn: '09:30:00',
          checkOut: '17:45:00',
          status: 'present'
        }
      ],
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-key': AUTH_KEY
        }
      }
    );
    log('green', '✓ Multiple records webhook passed');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    log('red', '✗ Multiple records webhook failed');
    console.error('Error:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Missing Auth Key (Should Fail)
async function testMissingAuthKey() {
  log('cyan', '\n=== Test 4: Missing Auth Key (Expected to Fail) ===');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/webhook/attendance`,
      {
        employeeId: 'EMP001',
        date: '2025-10-10'
      },
      {
        headers: {
          'Content-Type': 'application/json'
          // No x-auth-key header
        }
      }
    );
    log('red', '✗ Test failed - Should have rejected request without auth key');
    console.log('Response:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      log('green', '✓ Correctly rejected request without auth key');
      console.log('Response:', error.response.data);
      return true;
    } else {
      log('red', '✗ Unexpected error');
      console.error('Error:', error.response?.data || error.message);
      return false;
    }
  }
}

// Test 5: Invalid Auth Key (Should Fail)
async function testInvalidAuthKey() {
  log('cyan', '\n=== Test 5: Invalid Auth Key (Expected to Fail) ===');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/webhook/attendance`,
      {
        employeeId: 'EMP001',
        date: '2025-10-10'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-key': 'wrong-invalid-key-12345'
        }
      }
    );
    log('red', '✗ Test failed - Should have rejected request with invalid auth key');
    console.log('Response:', response.data);
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      log('green', '✓ Correctly rejected request with invalid auth key');
      console.log('Response:', error.response.data);
      return true;
    } else {
      log('red', '✗ Unexpected error');
      console.error('Error:', error.response?.data || error.message);
      return false;
    }
  }
}

// Run all tests
async function runAllTests() {
  log('blue', '\n╔════════════════════════════════════════════════════╗');
  log('blue', '║     WEBHOOK API ENDPOINT TEST SUITE              ║');
  log('blue', '╚════════════════════════════════════════════════════╝');
  
  log('yellow', `\nServer URL: ${BASE_URL}`);
  log('yellow', `Auth Key: ${AUTH_KEY}`);
  
  const results = [];
  
  // Run tests sequentially
  results.push({ name: 'Health Check', passed: await testHealthCheck() });
  results.push({ name: 'Valid Webhook (Single)', passed: await testValidWebhookSingle() });
  results.push({ name: 'Valid Webhook (Multiple)', passed: await testValidWebhookMultiple() });
  results.push({ name: 'Missing Auth Key', passed: await testMissingAuthKey() });
  results.push({ name: 'Invalid Auth Key', passed: await testInvalidAuthKey() });
  
  // Summary
  log('blue', '\n╔════════════════════════════════════════════════════╗');
  log('blue', '║     TEST SUMMARY                                   ║');
  log('blue', '╚════════════════════════════════════════════════════╝');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✓' : '✗';
    const color = result.passed ? 'green' : 'red';
    log(color, `${status} ${result.name}`);
  });
  
  log('yellow', `\n${passed}/${total} tests passed`);
  
  if (passed === total) {
    log('green', '\n🎉 All tests passed! Webhook endpoint is working correctly.');
  } else {
    log('red', `\n⚠️  ${total - passed} test(s) failed. Please check the errors above.`);
  }
  
  log('cyan', '\n💡 Tip: Check your server console logs to see the webhook data being received.');
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/api/health`);
    return true;
  } catch (error) {
    log('red', `\n❌ Cannot connect to server at ${BASE_URL}`);
    log('yellow', '\nPlease make sure:');
    log('yellow', '1. Your server is running (npm run dev or npm start)');
    log('yellow', '2. The server is listening on the correct port');
    log('yellow', '3. ATTENDANCE_AUTH_KEY is set in your .env file\n');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
  process.exit(0);
})();

