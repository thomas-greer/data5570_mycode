import { configureStore } from '@reduxjs/toolkit';
import accountabilityReducer from './accountabilitySlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    accountability: accountabilityReducer,
    auth: authReducer,
  },
});