// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';

// Function to load user from localStorage and check token validity
const loadUserFromStorage = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // If no token or user, return null
  if (!token || !user) {
    return { user: null, token: null, isAuthenticated: false };
  }

  // Check if token is expired
  if (authService.isTokenExpired(token)) {
    // Clear expired data
    authService.clearAuth();
    return { user: null, token: null, isAuthenticated: false };
  }

  // Token is valid, return user data
  return {
    user: JSON.parse(user),
    token: token,
    isAuthenticated: true,
  };
};

// Load initial state from localStorage
const initialAuthState = loadUserFromStorage();

const initialState = {
  user: initialAuthState.user,
  token: initialAuthState.token,
  isAuthenticated: initialAuthState.isAuthenticated,
  loading: false,
  error: null,
  successMessage: null,
};

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(username, password);
      
      // Parse JWT to get user info
      const userInfo = authService.parseJWT(response.access_token);
      
      if (!userInfo) {
        throw new Error('Failed to parse token');
      }

      // Store in localStorage
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      return {
        token: response.access_token,
        user: userInfo,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  authService.clearAuth();
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    // Action to check and clear expired token
    checkTokenExpiration: (state) => {
      if (state.token && authService.isTokenExpired(state.token)) {
        authService.clearAuth();
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload.message || 'Registration successful! Please login.';
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.successMessage = null;
      });
  },
});

export const { clearMessages, checkTokenExpiration } = authSlice.actions;
export default authSlice.reducer;