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
      toast.success('Agency deleted successfully');
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const agencySlice = createSlice({
  name: 'agencies',
  initialState: {
    list: [],
    options: [],
    agency: null,
    status: 'idle',
    optionsStatus: 'idle',
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
        if (state.agency?.id === id) {
          state.agency = null;
          state.detailStatus = 'idle';
        }
      });
  },
});

export const { clearSelectedAgency } = agencySlice.actions;
export default agencySlice.reducer;
