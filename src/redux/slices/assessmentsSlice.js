import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchAssessmentStats = createAsyncThunk('assessments/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(API_ROUTES.AGENCY.ASSESSMENTS.STATS);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const fetchAssessments = createAsyncThunk('assessments/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const q = new URLSearchParams(params).toString();
    const url = q ? `${API_ROUTES.AGENCY.ASSESSMENTS.LIST}?${q}` : API_ROUTES.AGENCY.ASSESSMENTS.LIST;
    const res = await axiosInstance.get(url);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const fetchAssessment = createAsyncThunk('assessments/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`${API_ROUTES.AGENCY.ASSESSMENTS.LIST}/${id}`);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const addAssessment = createAsyncThunk('assessments/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(API_ROUTES.AGENCY.ASSESSMENTS.LIST, payload);
    toast.success('Assessment saved');
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const updateAssessment = createAsyncThunk('assessments/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`${API_ROUTES.AGENCY.ASSESSMENTS.LIST}/${id}`, payload);
    toast.success('Assessment updated');
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const deleteAssessment = createAsyncThunk('assessments/delete', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_ROUTES.AGENCY.ASSESSMENTS.LIST}/${id}`);
    toast.success('Assessment deleted');
    return id;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const generateAssessmentQuote = createAsyncThunk('assessments/generateQuote', async ({ id, pricing }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`${API_ROUTES.AGENCY.ASSESSMENTS.LIST}/${id}/generate-quote`, pricing);
    toast.success('Care plan quote generated');
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const acceptAssessmentQuote = createAsyncThunk('assessments/acceptQuote', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`${API_ROUTES.AGENCY.ASSESSMENTS.LIST}/${id}/accept-quote`);
    toast.success('Client onboarded — care plan activated');
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

const assessmentsSlice = createSlice({
  name: 'assessments',
  initialState: { list: [], selected: null, stats: { total: 0, enquiry: 0, quoted: 0, accepted: 0, declined: 0 }, loading: false },
  reducers: { clearSelectedAssessment: (s) => { s.selected = null; } },
  extraReducers: (b) => {
    b.addCase(fetchAssessments.pending, (s) => { s.loading = true; })
      .addCase(fetchAssessments.fulfilled, (s, a) => { s.loading = false; s.list = Array.isArray(a.payload) ? a.payload : []; })
      .addCase(fetchAssessments.rejected, (s) => { s.loading = false; })
      .addCase(fetchAssessmentStats.fulfilled, (s, a) => { s.stats = a.payload || s.stats; })
      .addCase(fetchAssessment.fulfilled, (s, a) => { s.selected = a.payload; })
      .addCase(addAssessment.fulfilled, (s, a) => { s.list.unshift(a.payload); })
      .addCase(updateAssessment.fulfilled, (s, a) => {
        const i = s.list.findIndex((x) => x.id === a.payload.id);
        if (i !== -1) s.list[i] = a.payload;
        s.selected = a.payload;
      })
      .addCase(deleteAssessment.fulfilled, (s, a) => { s.list = s.list.filter((x) => x.id !== a.payload); })
      .addCase(generateAssessmentQuote.fulfilled, (s, a) => {
        const i = s.list.findIndex((x) => x.id === a.payload.assessment.id);
        if (i !== -1) s.list[i] = a.payload.assessment;
      })
      .addCase(acceptAssessmentQuote.fulfilled, (s, a) => {
        const i = s.list.findIndex((x) => x.id === a.payload.assessment.id);
        if (i !== -1) s.list[i] = a.payload.assessment;
      });
  },
});

export const { clearSelectedAssessment } = assessmentsSlice.actions;
export default assessmentsSlice.reducer;
