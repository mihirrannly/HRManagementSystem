// PASTE THIS IN YOUR BROWSER CONSOLE (F12 → Console)
// This will test the check-in directly

console.log('🧪 Testing Check-In from Browser...\n');

// Step 1: Check if token exists
const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt');
console.log('1️⃣ Token Status:', token ? '✅ Found' : '❌ Missing');
if (!token) {
  console.error('❌ No authentication token found! Please login first.');
} else {
  console.log('   Token preview:', token.substring(0, 20) + '...');
}

// Step 2: Check axios baseURL
console.log('\n2️⃣ Axios Config:', window.axios ? '✅ Loaded' : '❌ Not loaded');

// Step 3: Try check-in
if (token) {
  console.log('\n3️⃣ Attempting check-in...');
  
  fetch('http://localhost:5001/api/attendance/checkin', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      deviceInfo: {
        userAgent: navigator.userAgent,
        browser: 'Test',
        os: navigator.platform,
        device: 'Desktop'
      }
    })
  })
  .then(response => {
    console.log('📡 Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    if (data.success) {
      console.log('✅ CHECK-IN SUCCESSFUL!');
      console.log('   Response:', data);
      console.log('\n🎯 Now check the UI - it should update!');
    } else {
      console.error('❌ CHECK-IN FAILED:');
      console.error('   Message:', data.message);
      console.error('   Full response:', data);
    }
  })
  .catch(error => {
    console.error('❌ ERROR:', error);
    console.error('   This means the request failed to reach the server');
  });
} else {
  console.log('\n⚠️ Cannot test check-in without a valid token.');
  console.log('   Please login first, then run this script again.');
}

console.log('\n' + '='.repeat(60));
