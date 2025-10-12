/**
 * Test Check-In for Employee CODR034
 * This script simulates a check-in request to debug the issue
 */

const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5001';

// You'll need to provide a valid JWT token for CODR034
// Get this from your browser's localStorage or cookies after logging in

async function testCheckIn() {
  console.log('🧪 Testing Check-In Functionality\n');
  
  // First, let's test the office-status endpoint
  console.log('Step 1: Checking office status...');
  try {
    const statusResponse = await axios.get(`${BASE_URL}/api/attendance/office-status`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });
    console.log('✅ Office Status:', statusResponse.data);
    console.log('');
  } catch (error) {
    console.log('❌ Office Status Error:', error.response?.data || error.message);
    console.log('⚠️  You need to login first and get the JWT token');
    console.log('');
  }
  
  // Now let's try to check in
  console.log('Step 2: Attempting check-in...');
  try {
    const checkinResponse = await axios.post(`${BASE_URL}/api/attendance/checkin`, {
      deviceInfo: {
        userAgent: 'Test Script',
        browser: 'Node.js',
        os: 'macOS',
        device: 'Desktop'
      }
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Check-in successful!');
    console.log('Response:', JSON.stringify(checkinResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Check-in failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('\n💡 To test properly:');
  console.log('1. Open browser and login as CODR034');
  console.log('2. Open Developer Tools (F12)');
  console.log('3. Go to Application/Storage tab');
  console.log('4. Find localStorage and copy the JWT token');
  console.log('5. Replace "YOUR_TOKEN_HERE" in this script');
  console.log('6. Run: node test-checkin.js');
}

testCheckIn();

