import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { dedupeRequest } from '../../utils/dedupeRequest';

export const fetchEvvDashboard = createAsyncThunk('dashboards/evv', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_ROUTES.AGENCY.EVV_DASHBOARD}?${query}` : API_ROUTES.AGENCY.EVV_DASHBOARD;
    const data = await dedupeRequest(`GET:${url}`, async () => {
      const response = await axiosInstance.get(url);
      return response.data.data;
    });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchCaregiverDashboard = createAsyncThunk('dashboards/caregiver', async (_, { rejectWithValue }) => {
  try {
    const data = await dedupeRequest(`GET:${API_ROUTES.CAREGIVER.DASHBOARD}`, async () => {
      const response = await axiosInstance.get(API_ROUTES.CAREGIVER.DASHBOARD);
      return response.data.data;
    });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const emptyEvv = {
  range: { from: '', to: '', label: '' },
  overview: {
    total_visits: 0,
    verified_visits: 0,
    exceptions: 0,
    missed: 0,
    unverified_visits: 0,
    avg_duration: '00h 00m',
    verified_pct: 0,
    trends: {},
  },
  verification_status: [],
  verification_methods: [],
  compliance: { percent: 0, goal: 90 },
  enrollment: { total: 0, pending: 0, submitted: 0, verified: 0, rejected: 0 },
  recent_visits: [],
};

const dashboardsSlice = createSlice({
  name: 'dashboards',
  initialState: {
    evv: emptyEvv,
    caregiver: null,
    evvLoading: false,
    caregiverLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvvDashboard.pending, (state) => { state.evvLoading = true; state.error = null; })
      .addCase(fetchEvvDashboard.fulfilled, (state, action) => {
        state.evvLoading = false;
        state.evv = { ...emptyEvv, ...(action.payload || {}) };
      })
      .addCase(fetchEvvDashboard.rejected, (state, action) => {
        state.evvLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCaregiverDashboard.pending, (state) => { state.caregiverLoading = true; state.error = null; })
      .addCase(fetchCaregiverDashboard.fulfilled, (state, action) => {
        state.caregiverLoading = false;
        state.caregiver = action.payload;
      })
      .addCase(fetchCaregiverDashboard.rejected, (state, action) => {
        state.caregiverLoading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardsSlice.reducer;
