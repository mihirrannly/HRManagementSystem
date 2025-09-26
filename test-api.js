const axios = require('axios');

async function testAPI() {
  try {
    console.log('🔍 Testing API connection...');
    
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5001/api/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test 2: Try to get onboardings without auth (should fail)
    console.log('\n2. Testing onboarding endpoint without auth...');
    try {
      const onboardingResponse = await axios.get('http://localhost:5001/api/onboarding');
      console.log('✅ Onboarding data:', onboardingResponse.data);
    } catch (error) {
      console.log('❌ Expected auth error:', error.response?.status, error.response?.data?.message);
    }
    
    // Test 3: Try to login with admin credentials
    console.log('\n3. Testing admin login...');
    try {
      const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
        email: 'admin@company.com',
        password: 'admin123'
      });
      console.log('✅ Admin login successful');
      
      const token = loginResponse.data.token;
      
      // Test 4: Get onboardings with auth token
      console.log('\n4. Testing onboarding endpoint with auth...');
      const authOnboardingResponse = await axios.get('http://localhost:5001/api/onboarding', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Onboarding data with auth:');
      console.log(`   - Total onboardings: ${authOnboardingResponse.data.onboardings.length}`);
      authOnboardingResponse.data.onboardings.forEach((onboarding, index) => {
        console.log(`   ${index + 1}. ${onboarding.employeeName} (${onboarding.status}) - ${onboarding.documents.length} documents`);
      });
      
    } catch (loginError) {
      console.log('❌ Admin login failed:', loginError.response?.status, loginError.response?.data?.message);
      console.log('💡 You may need to create an admin user first');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('💡 Make sure the server is running on port 5001');
  }
}

testAPI();
