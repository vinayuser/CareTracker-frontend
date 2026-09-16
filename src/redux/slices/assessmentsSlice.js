import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

const emptyPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  from: 0,
  to: 0,
};

function slimListItem(item) {
  if (!item) return item;
  if (!item.formData && !item.client) return item;
  const { formData, client, ...rest } = item;
  return {
    ...rest,
    clientPhoto: item.clientPhoto || client?.profilePic || '',
    packetProgress: item.packetProgress || { total: 15, saved: 0, started: 0 },
    recommendedWeeklyHours: item.recommendedWeeklyHours
      ?? formData?.carePlanSummary?.recommendedWeeklyHours
      ?? 0,
  };
}

function normalizeListPayload(data) {
  if (Array.isArray(data)) {
    const items = data.map(slimListItem);
    return {
      items,
      pagination: {
        ...emptyPagination,
        total: items.length,
        limit: items.length || 10,
        from: items.length ? 1 : 0,
        to: items.length,
      },
    };
  }
  return {
    items: (data?.items || []).map(slimListItem),
    pagination: { ...emptyPagination, ...(data?.pagination || {}) },
  };
}

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
    const q = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
      ),
    ).toString();
    const url = q ? `${API_ROUTES.AGENCY.ASSESSMENTS.LIST}?${q}` : API_ROUTES.AGENCY.ASSESSMENTS.LIST;
    const res = await axiosInstance.get(url);
    return normalizeListPayload(res.data.data);
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
    toast.success(payload?.successMessage || 'Assessment saved');
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const updateAssessment = createAsyncThunk('assessments/update', async ({ id, payload, successMessage }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`${API_ROUTES.AGENCY.ASSESSMENTS.LIST}/${id}`, payload);
    toast.success(successMessage || 'Assessment updated');
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

export const updateAssessmentQuote = createAsyncThunk('assessments/updateQuote', async ({ id, pricing }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`${API_ROUTES.AGENCY.ASSESSMENTS.LIST}/${id}/update-quote`, pricing);
    toast.success('Quote updated — email sent to client and agency');
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

function replaceListItem(state, assessment) {
  if (!assessment?.id) return;
  const slim = slimListItem(assessment);
  const i = state.list.findIndex((x) => x.id === slim.id);
  if (i !== -1) state.list[i] = slim;
}

const assessmentsSlice = createSlice({
  name: 'assessments',
  initialState: {
    list: [],
    selected: null,
    stats: { total: 0, enquiry: 0, quoted: 0, accepted: 0, declined: 0 },
    pagination: emptyPagination,
    loading: false,
  },
  reducers: { clearSelectedAssessment: (s) => { s.selected = null; } },
  extraReducers: (b) => {
    b.addCase(fetchAssessments.pending, (s) => { s.loading = true; })
      .addCase(fetchAssessments.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.items;
        s.pagination = a.payload.pagination;
      })
      .addCase(fetchAssessments.rejected, (s) => { s.loading = false; })
      .addCase(fetchAssessmentStats.fulfilled, (s, a) => { s.stats = a.payload || s.stats; })
      .addCase(fetchAssessment.fulfilled, (s, a) => { s.selected = a.payload; })
      .addCase(addAssessment.fulfilled, (s, a) => { s.list.unshift(slimListItem(a.payload)); })
      .addCase(updateAssessment.fulfilled, (s, a) => {
        replaceListItem(s, a.payload);
        s.selected = a.payload;
      })
      .addCase(deleteAssessment.fulfilled, (s, a) => { s.list = s.list.filter((x) => x.id !== a.payload); })
      .addCase(generateAssessmentQuote.fulfilled, (s, a) => {
        replaceListItem(s, a.payload.assessment);
      })
      .addCase(updateAssessmentQuote.fulfilled, (s, a) => {
        replaceListItem(s, a.payload.assessment);
      })
      .addCase(acceptAssessmentQuote.fulfilled, (s, a) => {
        replaceListItem(s, a.payload.assessment);
      });
  },
});

export const { clearSelectedAssessment } = assessmentsSlice.actions;
export default assessmentsSlice.reducer;
