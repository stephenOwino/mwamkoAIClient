import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import inviteReducer from '../slices/inviteSlice';
import userManagementReducer from '../slices/userManagementSlice';
import emergencyCaseReducer from '../slices/emergencyCaseSlice';
import routeReducer from '../slices/routeSlice';
import aiReducer from '../slices/aiSlice';
import vehicleReducer from '../slices/vehicleSlice';


const store = configureStore({
  reducer: {
    auth: authReducer,
    invite: inviteReducer,
    userManagement: userManagementReducer,
    emergencyCase: emergencyCaseReducer,
    route: routeReducer,
    ai: aiReducer,
    vehicle: vehicleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;