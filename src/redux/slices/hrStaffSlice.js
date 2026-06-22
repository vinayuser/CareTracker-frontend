import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchHrStaff = createAsyncThunk(
  'hrStaff/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams
        ? `${API_ROUTES.AGENCY.HR_STAFF.LIST}?${queryParams}`
        : API_ROUTES.AGENCY.HR_STAFF.LIST;
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchHrStaffStats = createAsyncThunk(
  'hrStaff/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.AGENCY.HR_STAFF.STATS);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchHrStaffMember = createAsyncThunk(
  'hrStaff/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_ROUTES.AGENCY.HR_STAFF.LIST}/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const addHrStaff = createAsyncThunk('hrStaff/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ROUTES.AGENCY.HR_STAFF.CREATE, payload);
    toast.success('HR account created successfully');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const editHrStaff = createAsyncThunk(
  'hrStaff/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_ROUTES.AGENCY.HR_STAFF.UPDATE}/${id}`, updates);
      toast.success(updates.moduleAccess ? 'Module access updated' : 'HR profile updated');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const setHrStaffStatus = createAsyncThunk(
  'hrStaff/setStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${API_ROUTES.AGENCY.HR_STAFF.STATUS}/${id}/status`, {
        status,
      });
      toast.success(`Account marked as ${status}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const hrStaffSlice = createSlice({
  name: 'hrStaff',
  initialState: {
    list: [],
    stats: { total: 0, active: 0, inactive: 0, pending: 0 },
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedHrStaff(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHrStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHrStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchHrStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchHrStaffStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchHrStaffMember.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(addHrStaff.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(editHrStaff.fulfilled, (state, action) => {
        const index = state.list.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        state.selected = action.payload;
      })
      .addCase(setHrStaffStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      });
  },
});

export const { clearSelectedHrStaff } = hrStaffSlice.actions;
export default hrStaffSlice.reducer;
