import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vehicleService from '../services/vehicleService';

// Async Thunk for creating vehicle
export const createVehicle = createAsyncThunk(
  'vehicle/createVehicle',
  async (vehicleData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await vehicleService.createVehicle(vehicleData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for getting vehicles
export const getVehicles = createAsyncThunk(
  'vehicle/getVehicles',
  async (filters = {}, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await vehicleService.getVehicles(token, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for updating vehicle status
export const updateVehicleStatus = createAsyncThunk(
  'vehicle/updateVehicleStatus',
  async ({ vehicleId, status }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await vehicleService.updateVehicleStatus(vehicleId, status, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk for updating vehicle location
export const updateVehicleLocation = createAsyncThunk(
  'vehicle/updateVehicleLocation',
  async ({ vehicleId, location }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const token = auth.token;

      const response = await vehicleService.updateVehicleLocation(vehicleId, location, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  vehicles: [],
  loading: false,
  creatingVehicle: false,
  updatingStatus: false,
  updatingLocation: false,
  error: null,
  successMessage: null,
  filters: {
    status: null,
    vehicle_type: null,
  },
};

// Slice
const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    clearVehicleMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setVehicleFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearVehicleFilters: (state) => {
      state.filters = {
        status: null,
        vehicle_type: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Vehicle
      .addCase(createVehicle.pending, (state) => {
        state.creatingVehicle = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.creatingVehicle = false;
        state.successMessage = 'Vehicle created successfully!';
        state.error = null;
        // Add new vehicle to the list
        if (action.payload) {
          state.vehicles.unshift(action.payload);
        }
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.creatingVehicle = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      // Get Vehicles
      .addCase(getVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
        state.error = null;
      })
      .addCase(getVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Vehicle Status
      .addCase(updateVehicleStatus.pending, (state) => {
        state.updatingStatus = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateVehicleStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        state.successMessage = 'Vehicle status updated!';
        state.error = null;
        // Update vehicle in the list
        const index = state.vehicles.findIndex(v => v.vehicle_id === action.payload.vehicle_id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
      })
      .addCase(updateVehicleStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.error = action.payload;
        state.successMessage = null;
      })
      // Update Vehicle Location
      .addCase(updateVehicleLocation.pending, (state) => {
        state.updatingLocation = true;
        state.error = null;
      })
      .addCase(updateVehicleLocation.fulfilled, (state, action) => {
        state.updatingLocation = false;
        state.successMessage = 'Vehicle location updated!';
        state.error = null;
        // Update vehicle in the list
        const index = state.vehicles.findIndex(v => v.vehicle_id === action.payload.vehicle_id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
      })
      .addCase(updateVehicleLocation.rejected, (state, action) => {
        state.updatingLocation = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearVehicleMessages, 
  setVehicleFilters, 
  clearVehicleFilters 
} = vehicleSlice.actions;
export default vehicleSlice.reducer;