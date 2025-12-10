// src/slices/emergencyCaseSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import emergencyCaseService from '../services/emergencyCaseService';

// Helper function to normalize case data from API
const normalizeCase = (apiCase) => {
  console.log('🔄 Normalizing case:', apiCase);
  
  return {
    // Keep original fields
    ...apiCase,
    
    // Normalize field names to match what Dashboard expects
    case_id: apiCase.case_id || apiCase.id,
    emergency_type: apiCase.emergency_type || apiCase.disaster_type || apiCase.type,
    case_status: apiCase.case_status || apiCase.status,
    priority_level: apiCase.priority_level || apiCase.severity || apiCase.priority,
    created_at: apiCase.created_at || apiCase.timestamp || new Date().toISOString(),
    
    // Keep both naming conventions for compatibility
    disaster_type: apiCase.disaster_type || apiCase.emergency_type,
    status: apiCase.status || apiCase.case_status,
    severity: apiCase.severity || apiCase.priority_level,
  };
};

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

      console.log('📡 Fetching emergency cases...');
      const response = await emergencyCaseService.getEmergencyCases(token, filters);
      
      console.log('📦 Raw API response:', response);
      console.log('📊 Number of cases received:', Array.isArray(response) ? response.length : 'Not an array');
      
      if (Array.isArray(response) && response.length > 0) {
        console.log('🔍 First case structure:', response[0]);
        console.log('🔑 Keys in first case:', Object.keys(response[0]));
      }
      
      return response;
    } catch (error) {
      console.error('❌ Fetch cases error:', error);
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
        const newCase = action.payload.case || action.payload;
        
        if (newCase && (newCase.case_id || newCase.id)) {
          const normalizedCase = normalizeCase(newCase);
          console.log('➕ Adding normalized case to state:', normalizedCase);
          state.cases.unshift(normalizedCase);
        } else {
          console.warn('⚠️ No valid case data in response:', action.payload);
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
        state.error = null;
        
        // Normalize all cases
        if (Array.isArray(action.payload)) {
          state.cases = action.payload.map(normalizeCase);
          console.log('📋 Cases loaded and normalized:', state.cases.length);
          
          if (state.cases.length > 0) {
            console.log('✅ First normalized case:', state.cases[0]);
            console.log('🔑 Normalized case keys:', Object.keys(state.cases[0]));
          }
        } else {
          console.warn('⚠️ API response is not an array:', action.payload);
          state.cases = [];
        }
      })
      .addCase(getEmergencyCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('❌ Failed to load cases:', action.payload);
      });
  },
});

export const { clearEmergencyCaseMessages, setFilters, clearFilters } = emergencyCaseSlice.actions;
export default emergencyCaseSlice.reducer;