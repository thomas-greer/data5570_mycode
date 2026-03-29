import { createSlice } from '@reduxjs/toolkit';
import { fetchCheckIns, fetchMatchStatus, findMatch } from './matchThunks';

function statusToLabel(status) {
  if (status === 'did_it') return 'Did It';
  if (status === 'partial') return 'Partial';
  if (status === 'missed') return 'Missed';
  return status;
}

function rowsToDateMap(rows) {
  const m = {};
  for (const row of rows || []) {
    if (row.date) m[row.date] = statusToLabel(row.status);
  }
  return m;
}

const accountabilitySlice = createSlice({
  name: 'accountability',
  initialState: {
    displayName: '',
    category: '',
    targetPerWeek: '',
    partnerName: '',
    matchId: '',
    myCheckinsByDate: {},
    partnerCheckinsByDate: {},
  },
  reducers: {
    setUserInfo: (state, action) => {
      const p = action.payload;
      if (p.displayName !== undefined) state.displayName = p.displayName;
      if (p.category !== undefined) state.category = p.category;
      if (p.targetPerWeek !== undefined) state.targetPerWeek = p.targetPerWeek;
      if (p.partnerName !== undefined) state.partnerName = p.partnerName;
      if (p.matchId !== undefined) state.matchId = p.matchId;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(findMatch.fulfilled, (state, action) => {
      const payload = action.payload || {};
      if (payload.partner_name) state.partnerName = payload.partner_name;
      else state.partnerName = 'Searching...';

      if (payload.match_id !== undefined && payload.match_id !== null) {
        state.matchId = payload.match_id;
      }
    });

    builder.addCase(fetchMatchStatus.fulfilled, (state, action) => {
      const payload = action.payload || {};

      if (payload.status === 'matched' && payload.partner_name) {
        state.partnerName = payload.partner_name;
        state.matchId = payload.match_id || '';
      } else if (payload.status === 'waiting') {
        state.partnerName = 'Searching...';
        state.matchId = payload.match_id || '';
      } else {
        state.partnerName = '';
        state.matchId = '';
      }
    });

    builder.addCase(fetchCheckIns.fulfilled, (state, action) => {
      const payload = action.payload || {};
      state.myCheckinsByDate = rowsToDateMap(payload.you);
      state.partnerCheckinsByDate = rowsToDateMap(payload.partner);
    });
  },
});

export const { setUserInfo } = accountabilitySlice.actions;
export default accountabilitySlice.reducer;
