import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userManagementService from '../services/userManagementService';

// Async Thunk for getting pending users
export const getPendingUsers = createAsyncThunk(
  'userManagement/getPendingUsers',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await userManagementService.getPendingUsers(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for assigning role
export const assignRole = createAsyncThunk(
  'userManagement/assignRole',
  async ({ userId, role }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await userManagementService.assignRole(userId, role, token);
      return { ...response, userId }; // Include userId in response for state update
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  pendingUsers: [],
  loading: false,
  assigningRole: false,
  error: null,
  successMessage: null,
};

// Slice
const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    clearUserManagementMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearPendingUsers: (state) => {
      state.pendingUsers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Pending Users
      .addCase(getPendingUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingUsers = action.payload;
        state.error = null;
      })
      .addCase(getPendingUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Assign Role
      .addCase(assignRole.pending, (state) => {
        state.assigningRole = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(assignRole.fulfilled, (state, action) => {
        state.assigningRole = false;
        state.successMessage = action.payload.message || 'Role assigned successfully!';
        state.error = null;
        // Remove the user from pending list after successful role assignment
        state.pendingUsers = state.pendingUsers.filter(
          user => user.user_id !== action.payload.userId
        );
      })
      .addCase(assignRole.rejected, (state, action) => {
        state.assigningRole = false;
        state.error = action.payload;
        state.successMessage = null;
      });
  },
});

export const { clearUserManagementMessages, clearPendingUsers } = userManagementSlice.actions;
export default userManagementSlice.reducer;