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

export const getAgencyById = createAsyncThunk(
  'agencies/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_ROUTES.ADMIN.AGENCY.LIST}/${id}`);
      return response.data.data;
    } catch (error) {
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
    agency: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
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
      .addCase(getAgencyById.fulfilled, (state, action) => {
        state.agency = action.payload;
      })
      .addCase(updateAgency.fulfilled, (state, action) => {
        const index = state.list.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteAgency.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item.id !== action.payload);
      });
  },
});

export default agencySlice.reducer;
