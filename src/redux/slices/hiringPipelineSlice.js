import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchHiringPipeline = createAsyncThunk(
  'hiringPipeline/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.AGENCY.HIRING_PIPELINE.GET);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchHiringDocuments = createAsyncThunk(
  'hiringPipeline/fetchDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.AGENCY.HIRING_PIPELINE.DOCUMENTS);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const saveHiringPipeline = createAsyncThunk(
  'hiringPipeline/save',
  async (stages, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(API_ROUTES.AGENCY.HIRING_PIPELINE.SAVE, { stages });
      toast.success('Hiring pipeline saved successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save hiring pipeline';
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const hiringPipelineSlice = createSlice({
  name: 'hiringPipeline',
  initialState: {
    stages: [],
    availableDocuments: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    setLocalStages(state, action) {
      state.stages = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHiringPipeline.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHiringPipeline.fulfilled, (state, action) => {
        state.loading = false;
        state.stages = action.payload?.stages || [];
        state.availableDocuments = action.payload?.availableDocuments || [];
      })
      .addCase(fetchHiringPipeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchHiringDocuments.fulfilled, (state, action) => {
        state.availableDocuments = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(saveHiringPipeline.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveHiringPipeline.fulfilled, (state, action) => {
        state.saving = false;
        state.stages = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(saveHiringPipeline.rejected, (state) => {
        state.saving = false;
      });
  },
});

export const { setLocalStages } = hiringPipelineSlice.actions;
export default hiringPipelineSlice.reducer;
