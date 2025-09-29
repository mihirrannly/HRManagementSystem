const axios = require('axios');

async function testPermissionsAPI() {
  try {
    console.log('🧪 Testing Permissions API...');
    
    // First, let's try to login to get a valid token
    console.log('1. Attempting login...');
    
    // Try with a test admin user
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'test@admin.com',
      password: 'test123'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    
    // Set up axios with the token
    const apiClient = axios.create({
      baseURL: 'http://localhost:5001/api',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Test the permissions endpoints
    console.log('2. Testing /permissions/modules...');
    try {
      const modulesResponse = await apiClient.get('/permissions/modules');
      console.log('✅ Modules endpoint working:', modulesResponse.data);
    } catch (error) {
      console.error('❌ Modules endpoint failed:', error.response?.data || error.message);
    }
    
    console.log('3. Testing /permissions/test...');
    try {
      const testResponse = await apiClient.get('/permissions/test');
      console.log('✅ Test endpoint working:', testResponse.data);
    } catch (error) {
      console.error('❌ Test endpoint failed:', error.response?.data || error.message);
    }
    
    console.log('4. Testing /permissions/roles...');
    try {
      const rolesResponse = await apiClient.get('/permissions/roles');
      console.log('✅ Roles endpoint working:', rolesResponse.data);
    } catch (error) {
      console.error('❌ Roles endpoint failed:', error.response?.data || error.message);
    }
    
    console.log('5. Testing /permissions/users...');
    try {
      const usersResponse = await apiClient.get('/permissions/users');
      console.log('✅ Users endpoint working:', usersResponse.data);
    } catch (error) {
      console.error('❌ Users endpoint failed:', error.response?.data || error.message);
    }
    
  } catch (loginError) {
    console.error('❌ Login failed:', loginError.response?.data || loginError.message);
    console.log('🔍 Trying to test endpoints without authentication to see the error...');
    
    // Test without auth to see the actual server error
    try {
      const response = await axios.get('http://localhost:5001/api/permissions/modules');
      console.log('Unexpected success:', response.data);
    } catch (error) {
      console.log('Expected auth error:', error.response?.data || error.message);
    }
  }
}

testPermissionsAPI().catch(console.error);
