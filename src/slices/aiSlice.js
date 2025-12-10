import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import aiService from '../services/aiService';

// Async Thunk for analyzing emergencies
export const analyzeEmergencies = createAsyncThunk(
  'ai/analyzeEmergencies',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await aiService.analyzeEmergencies(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for optimizing route
export const optimizeRoute = createAsyncThunk(
  'ai/optimizeRoute',
  async (routeId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await aiService.optimizeRoute(routeId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for generating predictive alerts
export const generatePredictiveAlerts = createAsyncThunk(
  'ai/generatePredictiveAlerts',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await aiService.generatePredictiveAlerts(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  analysis: null,
  routeOptimization: null,
  predictiveAlerts: [],
  analyzing: false,
  optimizing: false,
  generatingAlerts: false,
  error: null,
  successMessage: null,
};

// Slice
const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAIMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearAnalysis: (state) => {
      state.analysis = null;
    },
    clearRouteOptimization: (state) => {
      state.routeOptimization = null;
    },
    clearPredictiveAlerts: (state) => {
      state.predictiveAlerts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Analyze Emergencies
      .addCase(analyzeEmergencies.pending, (state) => {
        state.analyzing = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(analyzeEmergencies.fulfilled, (state, action) => {
        state.analyzing = false;
        state.analysis = action.payload;
        state.successMessage = 'Emergency analysis completed!';
        state.error = null;
      })
      .addCase(analyzeEmergencies.rejected, (state, action) => {
        state.analyzing = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      // Optimize Route
      .addCase(optimizeRoute.pending, (state) => {
        state.optimizing = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(optimizeRoute.fulfilled, (state, action) => {
        state.optimizing = false;
        state.routeOptimization = action.payload;
        state.successMessage = 'Route optimization completed!';
        state.error = null;
      })
      .addCase(optimizeRoute.rejected, (state, action) => {
        state.optimizing = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      // Generate Predictive Alerts
      .addCase(generatePredictiveAlerts.pending, (state) => {
        state.generatingAlerts = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(generatePredictiveAlerts.fulfilled, (state, action) => {
        state.generatingAlerts = false;
        state.predictiveAlerts = action.payload;
        state.successMessage = 'Predictive alerts generated!';
        state.error = null;
      })
      .addCase(generatePredictiveAlerts.rejected, (state, action) => {
        state.generatingAlerts = false;
        state.error = action.payload;
        state.successMessage = null;
      });
  },
});

export const { 
  clearAIMessages, 
  clearAnalysis, 
  clearRouteOptimization, 
  clearPredictiveAlerts 
} = aiSlice.actions;
export default aiSlice.reducer;