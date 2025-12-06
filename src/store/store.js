// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import inviteReducer from '../slices/inviteSlice';
import userManagementReducer from '../slices/userManagementSlice';


const store = configureStore({
  reducer: {
    auth: authReducer,
    invite: inviteReducer,
    userManagement: userManagementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;