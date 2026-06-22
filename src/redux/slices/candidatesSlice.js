import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchApplications = createAsyncThunk(
  'candidates/fetchApplications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const url = query
        ? `${API_ROUTES.AGENCY.JOB_APPLICATIONS.LIST}?${query}`
        : API_ROUTES.AGENCY.JOB_APPLICATIONS.LIST;
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchStageCandidates = createAsyncThunk(
  'candidates/fetchStageCandidates',
  async ({ jobId, stageId, viewType }, { rejectWithValue }) => {
    try {
      let url;
      if (viewType === 'rejected') {
        url = `${API_ROUTES.AGENCY.JOB_APPLICATIONS.REJECTED}/${jobId}/rejected`;
      } else if (viewType === 'hired') {
        url = `${API_ROUTES.AGENCY.JOB_APPLICATIONS.HIRED}/${jobId}`;
      } else {
        url = `${API_ROUTES.AGENCY.JOB_APPLICATIONS.BY_STAGE}/${jobId}/stage/${stageId}`;
      }
      const response = await axiosInstance.get(url);
      const data = response.data.data;
      if (viewType === 'hired' || viewType === 'rejected') {
        return { applications: Array.isArray(data) ? data : [] };
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const addCandidateToJob = createAsyncThunk(
  'candidates/apply',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        API_ROUTES.AGENCY.JOB_APPLICATIONS.CREATE,
        payload,
        payload instanceof FormData ? { timeout: 60000 } : undefined,
      );
      toast.success('Candidate added successfully');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const moveToNextStage = createAsyncThunk(
  'candidates/nextStage',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_ROUTES.AGENCY.JOB_APPLICATIONS.NEXT_STAGE}/${id}/next-stage`,
      );
      toast.success('Moved to next stage');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const moveToPreviousStage = createAsyncThunk(
  'candidates/previousStage',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_ROUTES.AGENCY.JOB_APPLICATIONS.PREVIOUS_STAGE}/${id}/previous-stage`,
      );
      toast.success('Moved to previous stage');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const undoCandidateHire = createAsyncThunk(
  'candidates/undoHire',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_ROUTES.AGENCY.JOB_APPLICATIONS.UNDO_HIRE}/${id}/undo-hire`,
      );
      toast.success('Moved back to final stage');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const rejectCandidate = createAsyncThunk(
  'candidates/reject',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_ROUTES.AGENCY.JOB_APPLICATIONS.REJECT}/${id}/reject`,
      );
      toast.success('Candidate rejected');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const completeCandidateHire = createAsyncThunk(
  'candidates/completeHire',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_ROUTES.AGENCY.JOB_APPLICATIONS.COMPLETE_HIRE}/${id}/complete-hire`,
      );
      toast.success('Candidate marked as hired');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const setApplicationStage = createAsyncThunk(
  'candidates/setStage',
  async ({ id, stageId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_ROUTES.AGENCY.JOB_APPLICATIONS.SET_STAGE}/${id}/set-stage`,
        { stage_id: stageId },
      );
      toast.success('Stage updated');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState: {
    applications: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => { state.loading = true; })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchApplications.rejected, (state) => { state.loading = false; })
      .addCase(addCandidateToJob.fulfilled, (state, action) => {
        state.applications.unshift(action.payload);
      });
  },
});

export default candidatesSlice.reducer;
