import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../lib/api';

export const fetchCheckIns = createAsyncThunk(
  'match/fetchCheckIns',
  async ({ token, year, month }, { rejectWithValue }) => {
    try {
      const now = new Date();
      const y = year ?? now.getFullYear();
      const m = month ?? now.getMonth() + 1;
      const qs = `?year=${y}&month=${m}`;
      return await apiFetch(`/api/checkins/${qs}`, { token, method: 'GET' });
    } catch (e) {
      return rejectWithValue(
        e instanceof Error ? e.message : 'Failed to fetch check-ins'
      );
    }
  }
);

export const submitCheckIn = createAsyncThunk(
  'match/submitCheckIn',
  async ({ token, status }, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiFetch('/api/checkins/submit/', {
        token,
        body: { status },
      });
      dispatch(fetchCheckIns({ token }));
      return data;
    } catch (e) {
      return rejectWithValue(
        e instanceof Error ? e.message : 'Failed to submit check-in'
      );
    }
  }
);

export const findMatch = createAsyncThunk(
  'match/findMatch',
  async ({ token, goal_category, target_per_week }, { rejectWithValue }) => {
    try {
      return await apiFetch('/api/match/find/', {
        token,
        body: { goal_category, target_per_week },
      });
    } catch (e) {
      return rejectWithValue(
        e instanceof Error ? e.message : 'Failed to request match'
      );
    }
  }
);

export const fetchMatchStatus = createAsyncThunk(
  'match/fetchMatchStatus',
  async ({ token }, { rejectWithValue }) => {
    try {
      return await apiFetch('/api/match/status/', { token, method: 'GET' });
    } catch (e) {
      return rejectWithValue(
        e instanceof Error ? e.message : 'Failed to fetch match status'
      );
    }
  }
);

