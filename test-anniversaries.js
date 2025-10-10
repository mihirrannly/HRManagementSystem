const axios = require('axios');

// Test the anniversaries endpoint
async function testAnniversaries() {
  try {
    console.log('🧪 Testing Anniversaries Endpoint...\n');
    
    // First, login to get a token
    // Try multiple credential combinations
    let loginResponse;
    const credentials = [
      { email: 'admin@rannkly.com', password: 'Admin@123' },
      { email: 'hr@rannkly.com', password: 'Hr@123' },
      { email: 'mihir@rannkly.com', password: 'password123' },
    ];
    
    for (const cred of credentials) {
      try {
        loginResponse = await axios.post('http://localhost:5001/api/auth/login', cred);
        console.log(`✅ Login successful with ${cred.email}\n`);
        break;
      } catch (err) {
        console.log(`❌ Failed to login with ${cred.email}`);
      }
    }
    
    if (!loginResponse) {
      throw new Error('Could not login with any credentials');
    }
    
    const token = loginResponse.data.token;
    
    // Test the anniversaries endpoint
    const response = await axios.get('http://localhost:5001/api/employees/anniversaries', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Anniversary Data:');
    console.log('='.repeat(60));
    console.log(`Success: ${response.data.success}`);
    console.log(`\nThis Month's Anniversaries (${response.data.thisMonth.length}):`);
    response.data.thisMonth.forEach(emp => {
      console.log(`  - ${emp.name} (${emp.yearsOfService} years) - ${new Date(emp.anniversaryDate).toDateString()}`);
    });
    
    console.log(`\nUpcoming Anniversaries (${response.data.upcoming.length}):`);
    response.data.upcoming.forEach(emp => {
      console.log(`  - ${emp.name} (${emp.yearsOfService} years) - ${new Date(emp.anniversaryDate).toDateString()}`);
    });
    console.log('='.repeat(60));
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAnniversaries();

