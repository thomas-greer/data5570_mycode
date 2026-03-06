import { createSlice } from '@reduxjs/toolkit';

const accountabilitySlice = createSlice({
  name: 'accountability',
  initialState: {
    displayName: '',
    category: '',
    targetPerWeek: '',
    partnerName: '',
    checkIns: [],
  },
  reducers: {
    setUserInfo: (state, action) => {
      state.displayName = action.payload.displayName;
      state.category = action.payload.category;
      state.targetPerWeek = action.payload.targetPerWeek;
      state.partnerName = action.payload.partnerName;
    },
    addCheckIn: (state, action) => {
      state.checkIns.push(action.payload);
    },
  },
});

export const { setUserInfo, addCheckIn } = accountabilitySlice.actions;
export default accountabilitySlice.reducer;