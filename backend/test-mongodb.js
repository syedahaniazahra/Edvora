// test-auth.js
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAuth() {
  const testUser = {
    username: `testuser_${Date.now()}`,
    password: 'testpassword123',
    email: 'test@example.com'
  };

  console.log('🧪 Testing authentication flow...\n');

  try {
    // 1. Register
    console.log('1. Registering user...');
    const registerResponse = await axios.post(`${API_URL}/register`, testUser);
    console.log('✅ Registration:', registerResponse.data.message);
    console.log('   User ID:', registerResponse.data.user?.id);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Login
    console.log('\n2. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/login`, {
      username: testUser.username,
      password: testUser.password
    });
    
    console.log('✅ Login:', loginResponse.data.message);
    console.log('   Token received:', loginResponse.data.token ? 'Yes' : 'No');

    // 3. Test protected endpoint
    console.log('\n3. Testing protected endpoint...');
    const profileResponse = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('✅ Profile access:', profileResponse.data.message);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAuth();