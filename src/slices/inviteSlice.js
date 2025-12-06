import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import inviteService from '../services/inviteService';

// Async Thunk for inviting user
export const inviteUser = createAsyncThunk(
  'invite/inviteUser',
  async (inviteData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await inviteService.inviteUser(inviteData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for getting invited users (optional - for future use)
export const getInvitedUsers = createAsyncThunk(
  'invite/getInvitedUsers',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await inviteService.getInvitedUsers(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for resending invitation (optional - for future use)
export const resendInvitation = createAsyncThunk(
  'invite/resendInvitation',
  async (email, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await inviteService.resendInvitation(email, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for accepting invitation (no auth required)
export const acceptInvite = createAsyncThunk(
  'invite/acceptInvite',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await inviteService.acceptInvite(token, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  loading: false,
  error: null,
  successMessage: null,
  invitedUsers: [],
  fetchingUsers: false,
  resendingInvite: false,
  acceptingInvite: false,
};

// Slice
const inviteSlice = createSlice({
  name: 'invite',
  initialState,
  reducers: {
    clearInviteMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearInvitedUsers: (state) => {
      state.invitedUsers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Invite User
      .addCase(inviteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(inviteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || 'User invited successfully!';
        state.error = null;
        // Optionally track invited users
        if (action.payload.user) {
          state.invitedUsers.push(action.payload.user);
        }
      })
      .addCase(inviteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      // Get Invited Users
      .addCase(getInvitedUsers.pending, (state) => {
        state.fetchingUsers = true;
        state.error = null;
      })
      .addCase(getInvitedUsers.fulfilled, (state, action) => {
        state.fetchingUsers = false;
        state.invitedUsers = action.payload.users || action.payload;
        state.error = null;
      })
      .addCase(getInvitedUsers.rejected, (state, action) => {
        state.fetchingUsers = false;
        state.error = action.payload;
      })
      // Resend Invitation
      .addCase(resendInvitation.pending, (state) => {
        state.resendingInvite = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resendInvitation.fulfilled, (state, action) => {
        state.resendingInvite = false;
        state.successMessage = action.payload.message || 'Invitation resent successfully!';
        state.error = null;
      })
      .addCase(resendInvitation.rejected, (state, action) => {
        state.resendingInvite = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      // Accept Invitation
      .addCase(acceptInvite.pending, (state) => {
        state.acceptingInvite = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(acceptInvite.fulfilled, (state, action) => {
        state.acceptingInvite = false;
        state.successMessage = action.payload.message || 'Account created successfully! Please login.';
        state.error = null;
      })
      .addCase(acceptInvite.rejected, (state, action) => {
        state.acceptingInvite = false;
        state.error = action.payload;
        state.successMessage = null;
      });
  },
});

export const { clearInviteMessages, clearInvitedUsers } = inviteSlice.actions;
export default inviteSlice.reducer;