import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchInsuranceIntakes = createAsyncThunk('insuranceIntakes/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_ROUTES.AGENCY.INSURANCE_INTAKES.LIST}?${query}` : API_ROUTES.AGENCY.INSURANCE_INTAKES.LIST;
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchInsuranceIntakeStats = createAsyncThunk('insuranceIntakes/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_ROUTES.AGENCY.INSURANCE_INTAKES.STATS);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchInsuranceIntake = createAsyncThunk('insuranceIntakes/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_ROUTES.AGENCY.INSURANCE_INTAKES.LIST}/${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const createInsuranceIntake = createAsyncThunk('insuranceIntakes/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ROUTES.AGENCY.INSURANCE_INTAKES.LIST, payload);
    toast.success('Insurance intake saved successfully');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateInsuranceIntake = createAsyncThunk('insuranceIntakes/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`${API_ROUTES.AGENCY.INSURANCE_INTAKES.LIST}/${id}`, payload);
    toast.success('Insurance intake updated successfully');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const deleteInsuranceIntake = createAsyncThunk('insuranceIntakes/delete', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_ROUTES.AGENCY.INSURANCE_INTAKES.LIST}/${id}`);
    toast.success('Insurance intake deleted');
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const insuranceIntakesSlice = createSlice({
  name: 'insuranceIntakes',
  initialState: {
    list: [],
    selected: null,
    stats: { total: 0, draft: 0, submitted: 0, verified: 0 },
    loading: false,
  },
  reducers: { clearSelectedInsuranceIntake(state) { state.selected = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInsuranceIntakes.pending, (state) => { state.loading = true; })
      .addCase(fetchInsuranceIntakes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchInsuranceIntakes.rejected, (state) => { state.loading = false; })
      .addCase(fetchInsuranceIntakeStats.fulfilled, (state, action) => { state.stats = action.payload || state.stats; })
      .addCase(fetchInsuranceIntake.fulfilled, (state, action) => { state.selected = action.payload; })
      .addCase(createInsuranceIntake.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(updateInsuranceIntake.fulfilled, (state, action) => {
        const idx = state.list.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        state.selected = action.payload;
      })
      .addCase(deleteInsuranceIntake.fulfilled, (state, action) => {
        state.list = state.list.filter((i) => i.id !== action.payload);
      });
  },
});

export const { clearSelectedInsuranceIntake } = insuranceIntakesSlice.actions;
export default insuranceIntakesSlice.reducer;
