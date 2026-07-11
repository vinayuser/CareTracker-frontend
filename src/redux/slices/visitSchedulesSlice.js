import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { dedupeRequest } from '../../utils/dedupeRequest';

export const fetchVisitSchedules = createAsyncThunk('visitSchedules/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_ROUTES.AGENCY.VISIT_SCHEDULES.LIST}?${query}` : API_ROUTES.AGENCY.VISIT_SCHEDULES.LIST;
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchVisitScheduleStats = createAsyncThunk('visitSchedules/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_ROUTES.AGENCY.VISIT_SCHEDULES.STATS);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchVisitScheduleOptions = createAsyncThunk('visitSchedules/fetchOptions', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_ROUTES.AGENCY.VISIT_SCHEDULES.OPTIONS);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchCarePlanScheduleSources = createAsyncThunk('visitSchedules/carePlanSources', async (carePlanId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_ROUTES.AGENCY.VISIT_SCHEDULES.CARE_PLAN_SOURCES}/${carePlanId}/sources`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const createVisitSchedule = createAsyncThunk('visitSchedules/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ROUTES.AGENCY.VISIT_SCHEDULES.LIST, payload);
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create schedule');
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateVisitSchedule = createAsyncThunk('visitSchedules/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`${API_ROUTES.AGENCY.VISIT_SCHEDULES.LIST}/${id}`, payload);
    toast.success(response.data.message || 'Schedule updated');
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update schedule');
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const deleteVisitSchedule = createAsyncThunk('visitSchedules/delete', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_ROUTES.AGENCY.VISIT_SCHEDULES.LIST}/${id}`);
    toast.success('Schedule deleted');
    return id;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete schedule');
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchAgencyVisits = createAsyncThunk('visitSchedules/fetchVisits', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_ROUTES.AGENCY.VISITS.LIST}?${query}` : API_ROUTES.AGENCY.VISITS.LIST;
    const data = await dedupeRequest(`GET:${url}`, async () => {
      const response = await axiosInstance.get(url);
      return response.data.data;
    });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchCaregiverVisits = createAsyncThunk('visitSchedules/caregiverVisits', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_ROUTES.CAREGIVER.VISITS.LIST}?${query}` : API_ROUTES.CAREGIVER.VISITS.LIST;
    const data = await dedupeRequest(`GET:${url}`, async () => {
      const response = await axiosInstance.get(url);
      return response.data.data;
    });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const checkInVisit = createAsyncThunk('visitSchedules/checkIn', async ({ id, payload = {} }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_ROUTES.CAREGIVER.VISITS.CHECK_IN}/${id}/check-in`, payload);
    const visit = response.data.data;
    if (visit?.lateCheckIn || visit?.status === 'Exception') {
      toast.warning(response.data.message || 'Clocked in late — marked as exception for agency review');
    } else {
      toast.success(response.data.message || 'Clocked in');
    }
    return visit;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Clock-in failed');
    return rejectWithValue(error.response?.data || error.message);
  }
});
export const checkOutVisit = createAsyncThunk('visitSchedules/checkOut', async ({ id, payload = {} }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_ROUTES.CAREGIVER.VISITS.CHECK_OUT}/${id}/check-out`, payload);
    toast.success(response.data.message || 'Clocked out');
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Clock-out failed');
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const approveVisit = createAsyncThunk('visitSchedules/approve', async ({ id, payload = {} }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_ROUTES.AGENCY.VISITS.APPROVE}/${id}/approve`, payload);
    toast.success(response.data.message || 'Visit approved');
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to approve visit');
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const rejectVisit = createAsyncThunk('visitSchedules/reject', async ({ id, payload = {} }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_ROUTES.AGENCY.VISITS.REJECT}/${id}/reject`, payload);
    toast.success(response.data.message || 'Visit rejected');
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to reject visit');
    return rejectWithValue(error.response?.data || error.message);
  }
});

const visitSchedulesSlice = createSlice({
  name: 'visitSchedules',
  initialState: {
    list: [],
    visits: [],
    caregiverVisits: [],
    stats: {
      schedules_total: 0,
      schedules_active: 0,
      visits_today: 0,
      visits_scheduled: 0,
      visits_in_progress: 0,
      visits_completed: 0,
      visits_missed: 0,
    },
    options: null,
    loading: false,
  },
  reducers: {
    setAgencyVisits(state, action) {
      state.visits = Array.isArray(action.payload) ? action.payload : [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitSchedules.pending, (state) => { state.loading = true; })
      .addCase(fetchVisitSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchVisitSchedules.rejected, (state) => { state.loading = false; })
      .addCase(fetchVisitScheduleStats.fulfilled, (state, action) => {
        state.stats = { ...state.stats, ...(action.payload || {}) };
      })
      .addCase(fetchVisitScheduleOptions.fulfilled, (state, action) => {
        state.options = action.payload;
      })
      .addCase(createVisitSchedule.fulfilled, (state, action) => {
        if (action.payload?.schedule) state.list.unshift(action.payload.schedule);
      })
      .addCase(updateVisitSchedule.fulfilled, (state, action) => {
        const schedule = action.payload?.schedule;
        if (!schedule) return;
        const idx = state.list.findIndex((item) => item.id === schedule.id);
        if (idx >= 0) state.list[idx] = schedule;
      })
      .addCase(deleteVisitSchedule.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item.id !== action.payload);
      })
      .addCase(fetchAgencyVisits.pending, (state) => { state.loading = true; })
      .addCase(fetchAgencyVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.visits = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAgencyVisits.rejected, (state) => { state.loading = false; })
      .addCase(fetchCaregiverVisits.fulfilled, (state, action) => {
        state.caregiverVisits = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(checkInVisit.fulfilled, (state, action) => {
        const visit = action.payload;
        state.caregiverVisits = state.caregiverVisits.map((item) => (item.id === visit.id ? visit : item));
      })
      .addCase(checkOutVisit.fulfilled, (state, action) => {
        const visit = action.payload;
        state.caregiverVisits = state.caregiverVisits.map((item) => (item.id === visit.id ? visit : item));
        state.visits = state.visits.map((item) => (item.id === visit.id ? visit : item));
      })
      .addCase(approveVisit.fulfilled, (state, action) => {
        const visit = action.payload;
        state.visits = state.visits.map((item) => (item.id === visit.id ? visit : item));
      })
      .addCase(rejectVisit.fulfilled, (state, action) => {
        const visit = action.payload;
        state.visits = state.visits.map((item) => (item.id === visit.id ? visit : item));
      });
  },
});

export const { setAgencyVisits } = visitSchedulesSlice.actions;
export default visitSchedulesSlice.reducer;
