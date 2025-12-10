import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import routeService from '../services/routeService';

// Async Thunk for calculating route
export const calculateRoute = createAsyncThunk(
  'route/calculateRoute',
  async ({ caseIds, startPointGps }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await routeService.calculateRoute(caseIds, startPointGps, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for getting route details
export const getRouteDetails = createAsyncThunk(
  'route/getRouteDetails',
  async (routeId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await routeService.getRouteDetails(routeId, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for getting all routes
export const getAllRoutes = createAsyncThunk(
  'route/getAllRoutes',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await routeService.getAllRoutes(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  routes: [],
  currentRoute: null,
  routeDetails: null,
  calculating: false,
  loading: false,
  fetchingDetails: false,
  error: null,
  successMessage: null,
};

// Slice
const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    clearRouteMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearRouteDetails: (state) => {
      state.routeDetails = null;
    },
    setCurrentRoute: (state, action) => {
      state.currentRoute = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Calculate Route
      .addCase(calculateRoute.pending, (state) => {
        state.calculating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(calculateRoute.fulfilled, (state, action) => {
        state.calculating = false;
        state.successMessage = 'Route calculated successfully!';
        state.error = null;
        state.currentRoute = action.payload;
        // Add to routes list if not already there
        if (action.payload.route_id) {
          const exists = state.routes.find(r => r.route_id === action.payload.route_id);
          if (!exists) {
            state.routes.unshift(action.payload);
          }
        }
      })
      .addCase(calculateRoute.rejected, (state, action) => {
        state.calculating = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      // Get Route Details
      .addCase(getRouteDetails.pending, (state) => {
        state.fetchingDetails = true;
        state.error = null;
      })
      .addCase(getRouteDetails.fulfilled, (state, action) => {
        state.fetchingDetails = false;
        state.routeDetails = action.payload;
        state.error = null;
      })
      .addCase(getRouteDetails.rejected, (state, action) => {
        state.fetchingDetails = false;
        state.error = action.payload;
      })
      // Get All Routes
      .addCase(getAllRoutes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRoutes.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
        state.error = null;
      })
      .addCase(getAllRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRouteMessages, clearRouteDetails, setCurrentRoute } = routeSlice.actions;
export default routeSlice.reducer;