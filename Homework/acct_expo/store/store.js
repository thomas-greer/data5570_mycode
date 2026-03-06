import { configureStore } from '@reduxjs/toolkit';
import accountabilityReducer from './accountabilitySlice';

export const store = configureStore({
  reducer: {
    accountability: accountabilityReducer,
  },
});