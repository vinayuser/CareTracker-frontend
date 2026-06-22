import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchCaregivers = createAsyncThunk(
  'caregivers/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams
        ? `${API_ROUTES.AGENCY.CAREGIVERS.LIST}?${queryParams}`
        : API_ROUTES.AGENCY.CAREGIVERS.LIST;
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchCaregiverStats = createAsyncThunk(
  'caregivers/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.AGENCY.CAREGIVERS.STATS);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const setCaregiverPassword = createAsyncThunk(
  'caregivers/setPassword',
  async ({ id, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${API_ROUTES.AGENCY.CAREGIVERS.LIST}/${id}/password`,
        { password },
      );
      toast.success('Caregiver password updated');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update password';
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const caregiversSlice = createSlice({
  name: 'caregivers',
  initialState: {
    list: [],
    stats: { total: 0, active: 0, inactive: 0, pending: 0 },
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCaregivers.pending, (state) => { state.loading = true; })
      .addCase(fetchCaregivers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCaregivers.rejected, (state) => { state.loading = false; })
      .addCase(fetchCaregiverStats.fulfilled, (state, action) => {
        state.stats = action.payload || state.stats;
      });
  },
});

export default caregiversSlice.reducer;
