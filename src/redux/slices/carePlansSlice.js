import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchCarePlanOptions = createAsyncThunk('carePlans/fetchOptions', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_ROUTES.AGENCY.CARE_PLANS.OPTIONS);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchCarePlans = createAsyncThunk('carePlans/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_ROUTES.AGENCY.CARE_PLANS.LIST}?${query}` : API_ROUTES.AGENCY.CARE_PLANS.LIST;
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchCarePlanStats = createAsyncThunk('carePlans/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_ROUTES.AGENCY.CARE_PLANS.STATS);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchCarePlan = createAsyncThunk('carePlans/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_ROUTES.AGENCY.CARE_PLANS.LIST}/${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const createCarePlan = createAsyncThunk('carePlans/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ROUTES.AGENCY.CARE_PLANS.LIST, payload);
    toast.success('Care plan created successfully');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateCarePlan = createAsyncThunk('carePlans/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`${API_ROUTES.AGENCY.CARE_PLANS.LIST}/${id}`, payload);
    toast.success('Care plan updated successfully');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const deleteCarePlan = createAsyncThunk('carePlans/delete', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_ROUTES.AGENCY.CARE_PLANS.LIST}/${id}`);
    toast.success('Care plan deleted');
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const carePlansSlice = createSlice({
  name: 'carePlans',
  initialState: {
    list: [],
    selected: null,
    options: null,
    stats: { total: 0, active: 0, draft: 0, archived: 0 },
    loading: false,
  },
  reducers: { clearSelectedCarePlan(state) { state.selected = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarePlans.pending, (state) => { state.loading = true; })
      .addCase(fetchCarePlans.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCarePlans.rejected, (state) => { state.loading = false; })
      .addCase(fetchCarePlanOptions.fulfilled, (state, action) => { state.options = action.payload; })
      .addCase(fetchCarePlanStats.fulfilled, (state, action) => { state.stats = action.payload || state.stats; })
      .addCase(fetchCarePlan.fulfilled, (state, action) => { state.selected = action.payload; })
      .addCase(createCarePlan.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(updateCarePlan.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        state.selected = action.payload;
      })
      .addCase(deleteCarePlan.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearSelectedCarePlan } = carePlansSlice.actions;
export default carePlansSlice.reducer;
