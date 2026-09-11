import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchAgencies = createAsyncThunk(
  'agencies/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.ADMIN.AGENCY.LIST);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

/** Lightweight id + name list for dropdowns. */
export const fetchAgencyOptions = createAsyncThunk(
  'agencies/fetchOptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.ADMIN.AGENCY.OPTIONS);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getAgencyById = createAsyncThunk(
  'agencies/fetchById',
  async (id, { rejectWithValue, signal }) => {
    try {
      const response = await axiosInstance.get(`${API_ROUTES.ADMIN.AGENCY.DETAIL}/${id}`, { signal });
      return response.data.data;
    } catch (error) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return rejectWithValue({ aborted: true });
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateAgency = createAsyncThunk(
  'agencies/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_ROUTES.ADMIN.AGENCY.UPDATE}/${id}`, payload);
      toast.success('Agency updated successfully');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteAgency = createAsyncThunk(
  'agencies/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_ROUTES.ADMIN.AGENCY.DELETE}/${id}`);
      toast.success('Agency and all related records deleted');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete agency');
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchAgencyLifecycle = createAsyncThunk(
  'agencies/fetchLifecycle',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.search) query.set('search', params.search);
      const qs = query.toString();
      const url = qs
        ? `${API_ROUTES.ADMIN.AGENCY.LIFECYCLE}?${qs}`
        : API_ROUTES.ADMIN.AGENCY.LIFECYCLE;
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const archiveAgency = createAsyncThunk(
  'agencies/archive',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_ROUTES.ADMIN.AGENCY.ARCHIVE}/${id}/archive`);
      toast.success('Agency archived — portal access disabled');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to archive agency');
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const restoreAgency = createAsyncThunk(
  'agencies/restore',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_ROUTES.ADMIN.AGENCY.RESTORE}/${id}/restore`);
      toast.success('Agency restored');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore agency');
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const agencySlice = createSlice({
  name: 'agencies',
  initialState: {
    list: [],
    options: [],
    lifecycleItems: [],
    lifecycleStats: { total: 0, active: 0, archived: 0 },
    agency: null,
    status: 'idle',
    optionsStatus: 'idle',
    lifecycleStatus: 'idle',
    detailStatus: 'idle',
    error: null,
  },
  reducers: {
    clearSelectedAgency(state) {
      state.agency = null;
      state.detailStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgencies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAgencies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAgencies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAgencyOptions.pending, (state) => {
        state.optionsStatus = 'loading';
      })
      .addCase(fetchAgencyOptions.fulfilled, (state, action) => {
        state.optionsStatus = 'succeeded';
        state.options = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAgencyOptions.rejected, (state, action) => {
        state.optionsStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAgencyLifecycle.pending, (state) => {
        state.lifecycleStatus = 'loading';
      })
      .addCase(fetchAgencyLifecycle.fulfilled, (state, action) => {
        state.lifecycleStatus = 'succeeded';
        state.lifecycleItems = Array.isArray(action.payload?.items) ? action.payload.items : [];
        state.lifecycleStats = action.payload?.stats || { total: 0, active: 0, archived: 0 };
      })
      .addCase(fetchAgencyLifecycle.rejected, (state, action) => {
        state.lifecycleStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(getAgencyById.pending, (state, action) => {
        state.detailStatus = 'loading';
        state.error = null;
        if (state.agency?.id !== action.meta.arg) {
          state.agency = null;
        }
      })
      .addCase(getAgencyById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.agency = action.payload;
      })
      .addCase(getAgencyById.rejected, (state, action) => {
        if (action.meta.aborted || action.payload?.aborted) return;
        state.detailStatus = 'failed';
        state.agency = null;
        state.error = action.payload;
      })
      .addCase(updateAgency.fulfilled, (state, action) => {
        const updated = action.payload;
        const listIndex = state.list.findIndex((item) => item.id === updated.id);
        if (listIndex !== -1) state.list[listIndex] = updated;
        const optIndex = state.options.findIndex((item) => item.id === updated.id);
        if (optIndex !== -1) {
          state.options[optIndex] = {
            ...state.options[optIndex],
            name: updated.name,
            status: updated.status,
          };
        }
        if (state.agency?.id === updated.id) {
          state.agency = updated;
        }
      })
      .addCase(deleteAgency.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.filter((item) => item.id !== id);
        state.options = state.options.filter((item) => item.id !== id);
        state.lifecycleItems = state.lifecycleItems.filter((item) => item.id !== id);
        if (state.agency?.id === id) {
          state.agency = null;
          state.detailStatus = 'idle';
        }
      })
      .addCase(archiveAgency.fulfilled, (state, action) => {
        const updated = action.payload;
        state.list = state.list.filter((item) => item.id !== updated.id);
        state.options = state.options.filter((item) => item.id !== updated.id);
        const idx = state.lifecycleItems.findIndex((item) => item.id === updated.id);
        if (idx !== -1) state.lifecycleItems[idx] = updated;
        if (state.agency?.id === updated.id) state.agency = updated;
      })
      .addCase(restoreAgency.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.lifecycleItems.findIndex((item) => item.id === updated.id);
        if (idx !== -1) state.lifecycleItems[idx] = updated;
        if (state.agency?.id === updated.id) state.agency = updated;
      });
  },
});

export const { clearSelectedAgency } = agencySlice.actions;
export default agencySlice.reducer;
