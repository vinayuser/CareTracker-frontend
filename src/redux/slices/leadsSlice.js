import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchLeadOptions = createAsyncThunk('leads/fetchOptions', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(API_ROUTES.AGENCY.LEADS.OPTIONS);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const fetchLeadStats = createAsyncThunk('leads/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(API_ROUTES.AGENCY.LEADS.STATS);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const fetchLeads = createAsyncThunk('leads/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const q = new URLSearchParams(params).toString();
    const url = q ? `${API_ROUTES.AGENCY.LEADS.LIST}?${q}` : API_ROUTES.AGENCY.LEADS.LIST;
    const res = await axiosInstance.get(url);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const fetchLead = createAsyncThunk('leads/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`${API_ROUTES.AGENCY.LEADS.LIST}/${id}`);
    return res.data.data;
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to load lead');
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const addLead = createAsyncThunk('leads/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(API_ROUTES.AGENCY.LEADS.LIST, payload);
    toast.success(res.data.message || 'Lead created');
    return res.data.data;
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to create lead');
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const updateLead = createAsyncThunk('leads/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`${API_ROUTES.AGENCY.LEADS.LIST}/${id}`, payload);
    toast.success(res.data.message || 'Lead updated');
    return res.data.data;
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to update lead');
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const deleteLead = createAsyncThunk('leads/delete', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_ROUTES.AGENCY.LEADS.LIST}/${id}`);
    toast.success('Lead deleted');
    return id;
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to delete lead');
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const convertLead = createAsyncThunk('leads/convert', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`${API_ROUTES.AGENCY.LEADS.LIST}/${id}/convert`, {});
    toast.success(res.data.message || 'Lead converted to client');
    return res.data.data;
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to convert lead');
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const logLeadContact = createAsyncThunk('leads/logContact', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`${API_ROUTES.AGENCY.LEADS.LIST}/${id}/log-contact`, payload);
    toast.success(res.data.message || 'Contact logged');
    return res.data.data;
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to log contact');
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const scheduleLeadAssessment = createAsyncThunk(
  'leads/scheduleAssessment',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${API_ROUTES.AGENCY.LEADS.LIST}/${id}/schedule-assessment`,
        payload,
      );
      toast.success(res.data.message || 'Home assessment scheduled');
      return res.data.data;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to schedule assessment');
      return rejectWithValue(e.response?.data || e.message);
    }
  },
);

export const createAssessmentFromLead = createAsyncThunk(
  'leads/createAssessment',
  async ({ id, payload = {} }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `${API_ROUTES.AGENCY.LEADS.LIST}/${id}/create-assessment`,
        payload,
      );
      toast.success(res.data.message || 'Assessment created from lead');
      return res.data.data;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create assessment');
      return rejectWithValue(e.response?.data || e.message);
    }
  },
);

const leadsSlice = createSlice({
  name: 'leads',
  initialState: {
    list: [],
    current: null,
    stats: { total: 0, hot: 0, converted: 0, open: 0, by_stage: {} },
    options: null,
    loading: false,
  },
  reducers: {
    clearCurrentLead(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeadOptions.fulfilled, (state, action) => {
        state.options = action.payload;
      })
      .addCase(fetchLeadStats.fulfilled, (state, action) => {
        state.stats = { ...state.stats, ...(action.payload || {}) };
      })
      .addCase(fetchLeads.pending, (state) => { state.loading = true; })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchLeads.rejected, (state) => { state.loading = false; })
      .addCase(fetchLead.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(addLead.fulfilled, (state, action) => {
        if (action.payload) state.list = [action.payload, ...state.list];
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) return;
        state.current = updated;
        state.list = state.list.map((item) => (item.id === updated.id ? updated : item));
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item.id !== action.payload);
      })
      .addCase(convertLead.fulfilled, (state, action) => {
        const lead = action.payload?.lead;
        if (!lead?.id) return;
        state.current = lead;
        state.list = state.list.map((item) => (item.id === lead.id ? lead : item));
      })
      .addCase(logLeadContact.fulfilled, (state, action) => {
        const lead = action.payload;
        if (!lead?.id) return;
        state.current = lead;
        state.list = state.list.map((item) => (item.id === lead.id ? lead : item));
      })
      .addCase(scheduleLeadAssessment.fulfilled, (state, action) => {
        const lead = action.payload?.lead || action.payload;
        if (!lead?.id) return;
        state.current = lead;
        state.list = state.list.map((item) => (item.id === lead.id ? lead : item));
      })
      .addCase(createAssessmentFromLead.fulfilled, (state, action) => {
        const lead = action.payload?.lead;
        if (!lead?.id) return;
        state.current = lead;
        state.list = state.list.map((item) => (item.id === lead.id ? lead : item));
      });
  },
});

export const { clearCurrentLead } = leadsSlice.actions;
export default leadsSlice.reducer;
