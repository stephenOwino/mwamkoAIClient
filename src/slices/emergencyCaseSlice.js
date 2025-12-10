// src/slices/emergencyCaseSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import emergencyCaseService from '../services/emergencyCaseService';

// Async Thunk for creating emergency case
export const createEmergencyCase = createAsyncThunk(
  'emergencyCase/createEmergencyCase',
  async (caseData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      console.log('🔐 Using token:', token ? 'Token exists' : 'No token');
      console.log('📝 Case data being sent:', caseData);

      const response = await emergencyCaseService.createEmergencyCase(caseData, token);
      
      console.log('✨ Create case response:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Create case error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for getting emergency cases
export const getEmergencyCases = createAsyncThunk(
  'emergencyCase/getEmergencyCases',
  async (filters = {}, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await emergencyCaseService.getEmergencyCases(token, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  cases: [],
  loading: false,
  creatingCase: false,
  error: null,
  successMessage: null,
  filters: {
    status: null,
    severity: null,
    disaster_type: null,
  },
};

// Slice
const emergencyCaseSlice = createSlice({
  name: 'emergencyCase',
  initialState,
  reducers: {
    clearEmergencyCaseMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: null,
        severity: null,
        disaster_type: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Emergency Case
      .addCase(createEmergencyCase.pending, (state) => {
        state.creatingCase = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createEmergencyCase.fulfilled, (state, action) => {
        state.creatingCase = false;
        state.successMessage = 'Emergency case created successfully!';
        state.error = null;
        
        console.log('✅ Case created, payload:', action.payload);
        
        // The API might return the case in different formats
        // Check if it's nested in a 'case' property or directly returned
        const newCase = action.payload.case || action.payload;
        
        if (newCase && newCase.case_id) {
          console.log('➕ Adding case to state:', newCase);
          state.cases.unshift(newCase);
        } else {
          console.warn('⚠️ No case data in response:', action.payload);
        }
      })
      .addCase(createEmergencyCase.rejected, (state, action) => {
        state.creatingCase = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      // Get Emergency Cases
      .addCase(getEmergencyCases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmergencyCases.fulfilled, (state, action) => {
        state.loading = false;
        state.cases = action.payload || [];
        state.error = null;
        
        console.log('📋 Cases loaded:', state.cases.length);
      })
      .addCase(getEmergencyCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearEmergencyCaseMessages, setFilters, clearFilters } = emergencyCaseSlice.actions;
export default emergencyCaseSlice.reducer;