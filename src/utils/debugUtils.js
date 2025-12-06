// src/utils/debugUtils.js
// Utility functions for debugging authentication issues

export const debugAuth = {
  // Check localStorage contents
  checkLocalStorage: () => {
    console.log('=== LocalStorage Debug ===');
    console.log('Token:', localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token Payload:', payload);
        console.log('Token Expires:', new Date(payload.exp * 1000));
        console.log('Is Expired:', payload.exp < Date.now() / 1000);
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
  },

  // Clear all auth data
  clearAuth: () => {
    console.log('Clearing all authentication data...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Auth data cleared! Refresh the page.');
  },

  // Test API connection
  testConnection: async (baseUrl = 'http://localhost:8000') => {
    console.log(`Testing connection to ${baseUrl}...`);
    
    try {
      // Test register endpoint
      const registerResponse = await fetch(`${baseUrl}/auth/register`, {
        method: 'OPTIONS',
      });
      console.log('Register endpoint:', registerResponse.status === 200 ? 'OK' : 'Failed');

      // Test login endpoint  
      const loginResponse = await fetch(`${baseUrl}/auth/token`, {
        method: 'OPTIONS',
      });
      console.log('Login endpoint:', loginResponse.status === 200 ? 'OK' : 'Failed');
      
    } catch (error) {
      console.error('Connection failed:', error.message);
      console.log('Make sure your backend is running!');
    }
  },

  // Test register with sample data
  testRegister: async (baseUrl = 'http://localhost:8000') => {
    console.log('Testing registration...');
    
    const testData = {
      email: `test${Date.now()}@example.com`,
      first_name: 'Test',
      last_name: 'User',
      id_number: `${Date.now()}`,
      county: 'Taita Taveta',
      password: 'test123',
      role: 'County Coordinator',
      phone_number: '+254712345678',
    };

    try {
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Registration successful!', data);
        console.log('Test credentials:', {
          email: testData.email,
          password: testData.password,
        });
      } else {
        console.log('Registration failed:', data);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  },

  // Test login
  testLogin: async (email, password, baseUrl = 'http://localhost:8000') => {
    console.log('Testing login...');
    
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await fetch(`${baseUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Login successful!');
        console.log('Token:', data.access_token);
        
        // Parse token
        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        console.log('User Info:', payload);
      } else {
        console.log('Login failed:', data);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  },

  // Show current Redux state (call from component)
  showReduxState: (store) => {
    console.log('=== Redux State ===');
    const state = store.getState();
    console.log('Auth:', state.auth);
  },
};

// Make it available in browser console
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
  console.log('Debug utilities loaded! Use window.debugAuth in console');
  console.log('Available commands:');
  console.log('  debugAuth.checkLocalStorage()');
  console.log('  debugAuth.clearAuth()');
  console.log('  debugAuth.testConnection()');
  console.log('  debugAuth.testRegister()');
  console.log('  debugAuth.testLogin("email@example.com", "password")');
}

export default debugAuth;