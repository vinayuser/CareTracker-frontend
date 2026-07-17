import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

const base = API_ROUTES.AGENCY.CAREGIVERS.LIST;

export const fetchCaregivers = createAsyncThunk(
  'caregivers/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${base}?${queryParams}` : base;
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
      const response = await axiosInstance.patch(`${base}/${id}/password`, { password });
      toast.success('Caregiver password updated');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update password';
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const editCaregiver = createAsyncThunk(
  'caregivers/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${base}/${id}`, updates);
      toast.success('Caregiver updated');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update caregiver';
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const setCaregiverStatus = createAsyncThunk(
  'caregivers/setStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${base}/${id}/status`, { status });
      toast.success(`Account marked as ${status}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const sendCaregiverEmail = createAsyncThunk(
  'caregivers/sendEmail',
  async ({ id, subject, message }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${base}/${id}/email`, { subject, message });
      toast.success('Email sent to caregiver');
      return response.data.data;
    } catch (error) {
      const messageText = error.response?.data?.message || 'Failed to send email';
      toast.error(messageText);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const upsert = (list, item) => {
  if (!item?.id) return list;
  const index = list.findIndex((c) => c.id === item.id);
  if (index === -1) return list;
  const next = [...list];
  next[index] = item;
  return next;
};

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
      })
      .addCase(editCaregiver.fulfilled, (state, action) => {
        state.list = upsert(state.list, action.payload);
      })
      .addCase(setCaregiverStatus.fulfilled, (state, action) => {
        state.list = upsert(state.list, action.payload);
      })
      .addCase(setCaregiverPassword.fulfilled, (state, action) => {
        state.list = upsert(state.list, action.payload);
      });
  },
});

export default caregiversSlice.reducer;
