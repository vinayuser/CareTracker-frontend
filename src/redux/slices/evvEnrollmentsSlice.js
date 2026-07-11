import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchEvvEnrollments = createAsyncThunk('evvEnrollments/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_ROUTES.AGENCY.EVV_ENROLLMENTS.LIST}?${query}` : API_ROUTES.AGENCY.EVV_ENROLLMENTS.LIST;
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchEvvEnrollmentStats = createAsyncThunk('evvEnrollments/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_ROUTES.AGENCY.EVV_ENROLLMENTS.STATS);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchEvvEnrollment = createAsyncThunk('evvEnrollments/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_ROUTES.AGENCY.EVV_ENROLLMENTS.LIST}/${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const verifyEvvEnrollment = createAsyncThunk('evvEnrollments/verify', async ({ id, action, formData }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_ROUTES.AGENCY.EVV_ENROLLMENTS.LIST}/${id}/verify`, { action, formData });
    toast.success(action === 'reject' ? 'Enrollment rejected' : 'Enrollment verified successfully');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const deleteEvvEnrollment = createAsyncThunk('evvEnrollments/delete', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_ROUTES.AGENCY.EVV_ENROLLMENTS.LIST}/${id}`);
    toast.success('EVV enrollment deleted');
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const syncEvvFromCarePlan = createAsyncThunk('evvEnrollments/sync', async (carePlanId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_ROUTES.AGENCY.EVV_ENROLLMENTS.SYNC}/${carePlanId}`);
    toast.success(`Synced ${response.data.data.synced} EVV enrollment(s)`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchCaregiverEvvEnrollments = createAsyncThunk('evvEnrollments/caregiverFetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_ROUTES.CAREGIVER.EVV_ENROLLMENTS.LIST);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchCaregiverEvvEnrollment = createAsyncThunk('evvEnrollments/caregiverFetchOne', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_ROUTES.CAREGIVER.EVV_ENROLLMENTS.LIST}/${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const submitCaregiverEvvEnrollment = createAsyncThunk('evvEnrollments/caregiverSubmit', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_ROUTES.CAREGIVER.EVV_ENROLLMENTS.SUBMIT}/${id}/submit`, { formData });
    toast.success('EVV enrollment submitted to agency');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const evvEnrollmentsSlice = createSlice({
  name: 'evvEnrollments',
  initialState: {
    list: [],
    caregiverList: [],
    selected: null,
    stats: { total: 0, pending: 0, submitted: 0, verified: 0, rejected: 0 },
    loading: false,
  },
  reducers: {
    clearSelectedEvvEnrollment(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvvEnrollments.pending, (state) => { state.loading = true; })
      .addCase(fetchEvvEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchEvvEnrollments.rejected, (state) => { state.loading = false; })
      .addCase(fetchEvvEnrollmentStats.fulfilled, (state, action) => { state.stats = action.payload || state.stats; })
      .addCase(fetchEvvEnrollment.fulfilled, (state, action) => { state.selected = action.payload; })
      .addCase(verifyEvvEnrollment.fulfilled, (state, action) => {
        const idx = state.list.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        state.selected = action.payload;
      })
      .addCase(deleteEvvEnrollment.fulfilled, (state, action) => {
        state.list = state.list.filter((i) => i.id !== action.payload);
      })
      .addCase(fetchCaregiverEvvEnrollments.fulfilled, (state, action) => {
        state.caregiverList = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCaregiverEvvEnrollment.fulfilled, (state, action) => { state.selected = action.payload; })
      .addCase(submitCaregiverEvvEnrollment.fulfilled, (state, action) => {
        const idx = state.caregiverList.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.caregiverList[idx] = action.payload;
        state.selected = action.payload;
      });
  },
});

export const { clearSelectedEvvEnrollment } = evvEnrollmentsSlice.actions;
export default evvEnrollmentsSlice.reducer;
