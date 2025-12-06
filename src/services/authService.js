const API_BASE_URL = 'http://localhost:8000'; 

const authService = {
  // Register new user (County Coordinator only)
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  async login(username, password) {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Parse JWT token to extract user info
  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const decoded = JSON.parse(jsonPayload);
      
      // Extract user info from JWT payload
      // Based on your backend: {sub: email, id: user_id, county: county, role: role}
      return {
        id: decoded.id,
        email: decoded.sub,
        county: decoded.county,
        role: decoded.role,
        exp: decoded.exp,
      };
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  },

  // Check if token is expired
  isTokenExpired(token) {
    try {
      const decoded = this.parseJWT(token);
      if (!decoded || !decoded.exp) return true;
      
      // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  },

  // Get stored user
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;