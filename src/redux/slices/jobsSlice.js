import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchJobs = createAsyncThunk('jobs/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_ROUTES.AGENCY.JOBS.LIST);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchJob = createAsyncThunk('jobs/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_ROUTES.AGENCY.JOBS.LIST}/${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchJobStats = createAsyncThunk('jobs/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_ROUTES.AGENCY.JOB_APPLICATIONS.STATS);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const createJob = createAsyncThunk('jobs/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ROUTES.AGENCY.JOBS.CREATE, payload);
    toast.success('Job created successfully');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateJob = createAsyncThunk(
  'jobs/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_ROUTES.AGENCY.JOBS.UPDATE}/${id}`, payload);
      toast.success('Job updated successfully');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteJob = createAsyncThunk('jobs/delete', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_ROUTES.AGENCY.JOBS.DELETE}/${id}`);
    toast.success('Job deleted');
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const completeJobHiring = createAsyncThunk(
  'jobs/completeHiring',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_ROUTES.AGENCY.JOBS.COMPLETE_HIRING}/${id}/complete-hiring`,
      );
      toast.success(response.data.message || 'Hiring cycle complete — caregiver added to roster');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const reopenJobHiring = createAsyncThunk(
  'jobs/reopenHiring',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_ROUTES.AGENCY.JOBS.REOPEN_HIRING}/${id}/reopen-hiring`,
      );
      toast.success('Hiring cycle reopened — you can continue hiring for this job');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const generateJobAi = createAsyncThunk('jobs/generateAi', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ROUTES.AGENCY.JOBS.GENERATE_AI, payload, {
      timeout: 120000,
    });
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.message || 'AI generation failed';
    toast.error(message);
    return rejectWithValue(error.response?.data || error.message);
  }
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    list: [],
    selected: null,
    stats: [],
    stagesMetadata: [],
    loading: false,
    aiLoading: false,
  },
  reducers: {
    clearSelectedJob(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchJobs.rejected, (state) => { state.loading = false; })
      .addCase(fetchJob.fulfilled, (state, action) => { state.selected = action.payload; })
      .addCase(fetchJobStats.fulfilled, (state, action) => {
        state.stats = action.payload?.data || [];
        state.stagesMetadata = action.payload?.stages_metadata || [];
      })
      .addCase(createJob.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(updateJob.fulfilled, (state, action) => {
        const idx = state.list.findIndex((j) => j.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        state.selected = action.payload;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.list = state.list.filter((j) => j.id !== action.payload);
      })
      .addCase(completeJobHiring.fulfilled, (state, action) => {
        const jobId = action.payload?.id;
        if (!jobId) return;
        const idx = state.list.findIndex((j) => j.id === jobId);
        if (idx !== -1) {
          state.list[idx] = { ...state.list[idx], hiringStatus: 'Complete', hiring_status: 'Complete' };
        }
        const statIdx = state.stats.findIndex((s) => s.job_id === jobId);
        if (statIdx !== -1) {
          state.stats[statIdx] = { ...state.stats[statIdx], hiring_status: 'Complete' };
        }
      })
      .addCase(reopenJobHiring.fulfilled, (state, action) => {
        const jobId = action.payload?.id;
        if (!jobId) return;
        const idx = state.list.findIndex((j) => j.id === jobId);
        if (idx !== -1) {
          state.list[idx] = { ...state.list[idx], hiringStatus: 'Open', hiring_status: 'Open' };
        }
        const statIdx = state.stats.findIndex((s) => s.job_id === jobId);
        if (statIdx !== -1) {
          state.stats[statIdx] = { ...state.stats[statIdx], hiring_status: 'Open' };
        }
      })
      .addCase(generateJobAi.pending, (state) => { state.aiLoading = true; })
      .addCase(generateJobAi.fulfilled, (state) => { state.aiLoading = false; })
      .addCase(generateJobAi.rejected, (state) => { state.aiLoading = false; });
  },
});

export const { clearSelectedJob } = jobsSlice.actions;
export default jobsSlice.reducer;
