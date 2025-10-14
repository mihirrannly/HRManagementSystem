const axios = require('axios');

const baseURL = 'http://localhost:5000/api';

// You'll need to replace this with a valid admin/HR token
const token = 'YOUR_TOKEN_HERE'; // Get this from localStorage in browser

async function testCreateAnnouncement() {
  try {
    console.log('🧪 Testing announcement creation...\n');
    
    const testAnnouncement = {
      title: 'Test Announcement',
      content: 'This is a test announcement to verify creation is working',
      priority: 'medium',
      category: 'general',
      targetAudience: 'all',
      isPinned: false,
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: null,
      isPoll: false,
      pollOptions: [],
      targetDepartments: [],
      targetLocations: [],
      targetRoles: []
    };

    console.log('Sending request with payload:');
    console.log(JSON.stringify(testAnnouncement, null, 2));
    console.log('\n');

    const response = await axios.post(`${baseURL}/announcements`, testAnnouncement, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ SUCCESS! Announcement created:');
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ Failed:', response.data.message);
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
  }
}

console.log('========================================');
console.log('📝 Announcement Creation Test');
console.log('========================================\n');
console.log('⚠️  INSTRUCTIONS:');
console.log('1. Open browser DevTools (F12)');
console.log('2. Go to Console tab');
console.log('3. Type: localStorage.getItem("token")');
console.log('4. Copy the token value');
console.log('5. Replace YOUR_TOKEN_HERE in this script');
console.log('6. Run: node test-create-announcement.js\n');
console.log('========================================\n');

if (token === 'YOUR_TOKEN_HERE') {
  console.log('⚠️  Please set your token first (see instructions above)');
  console.log('   Token should be from an admin or HR user\n');
} else {
  testCreateAnnouncement();
}

