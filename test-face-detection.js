const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-face.jpg'); // You'll need to add a test image

// Test functions
async function testFaceRegistration() {
  console.log('🧪 Testing Face Registration...');
  
  try {
    // First, get a list of employees
    const employeesResponse = await axios.get(`${BASE_URL}/employees`);
    const employees = employeesResponse.data.employees || [];
    
    if (employees.length === 0) {
      console.log('❌ No employees found. Please add employees first.');
      return;
    }
    
    const testEmployee = employees[0];
    console.log(`📝 Testing with employee: ${testEmployee.employeeId}`);
    
    // Create a dummy image file for testing
    const dummyImageBuffer = Buffer.from('dummy-image-data');
    const formData = new FormData();
    formData.append('faceImage', dummyImageBuffer, {
      filename: 'test-face.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('employeeId', testEmployee.employeeId);
    
    const response = await axios.post(`${BASE_URL}/face-detection/register-face`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });
    
    if (response.data.success) {
      console.log('✅ Face registration test passed');
      console.log('📊 Response:', response.data);
    } else {
      console.log('❌ Face registration test failed');
      console.log('📊 Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Face registration test error:', error.response?.data || error.message);
  }
}

async function testGetRegisteredFaces() {
  console.log('🧪 Testing Get Registered Faces...');
  
  try {
    const response = await axios.get(`${BASE_URL}/face-detection/employees`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      }
    });
    
    if (response.data.success) {
      console.log('✅ Get registered faces test passed');
      console.log('📊 Response:', response.data);
    } else {
      console.log('❌ Get registered faces test failed');
      console.log('📊 Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Get registered faces test error:', error.response?.data || error.message);
  }
}

async function testFaceDetectionCheckIn() {
  console.log('🧪 Testing Face Detection Check-In...');
  
  try {
    // Create a dummy image file for testing
    const dummyImageBuffer = Buffer.from('dummy-image-data');
    const formData = new FormData();
    formData.append('faceImage', dummyImageBuffer, {
      filename: 'test-face.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('deviceInfo', JSON.stringify({
      userAgent: 'Test Agent',
      device: 'Test Device',
      timestamp: new Date().toISOString()
    }));
    formData.append('location', JSON.stringify({
      address: 'Test Location',
      method: 'test'
    }));
    
    const response = await axios.post(`${BASE_URL}/face-detection/verify-and-checkin`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    if (response.data.success) {
      console.log('✅ Face detection check-in test passed');
      console.log('📊 Response:', response.data);
    } else {
      console.log('❌ Face detection check-in test failed (expected for simulation)');
      console.log('📊 Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Face detection check-in test error:', error.response?.data || error.message);
  }
}

async function testHealthCheck() {
  console.log('🧪 Testing Health Check...');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed');
    console.log('📊 Response:', response.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Face Detection API Tests...\n');
  
  // Test health check first
  await testHealthCheck();
  console.log('');
  
  // Test face registration
  await testFaceRegistration();
  console.log('');
  
  // Test get registered faces
  await testGetRegisteredFaces();
  console.log('');
  
  // Test face detection check-in
  await testFaceDetectionCheckIn();
  console.log('');
  
  console.log('🏁 Face Detection API Tests Completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Navigate to /tablet-kiosk for tablet interface');
  console.log('3. Use face registration component for HR/Admin');
  console.log('4. Implement actual face recognition algorithm');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testFaceRegistration,
  testGetRegisteredFaces,
  testFaceDetectionCheckIn,
  testHealthCheck,
  runTests
};






