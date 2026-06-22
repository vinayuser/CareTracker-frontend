import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchPlans = createAsyncThunk(
  'subscriptionPlans/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.ADMIN.SUBSCRIPTION_PLAN.LIST);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchActivePlans = createAsyncThunk(
  'subscriptionPlans/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.ADMIN.SUBSCRIPTION_PLAN.ACTIVE);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getPlanById = createAsyncThunk(
  'subscriptionPlans/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_ROUTES.ADMIN.SUBSCRIPTION_PLAN.LIST}/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const createPlan = createAsyncThunk(
  'subscriptionPlans/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.ADMIN.SUBSCRIPTION_PLAN.CREATE, payload);
      toast.success('Plan created successfully');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updatePlan = createAsyncThunk(
  'subscriptionPlans/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_ROUTES.ADMIN.SUBSCRIPTION_PLAN.UPDATE}/${id}`, payload);
      toast.success('Plan updated successfully');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deletePlan = createAsyncThunk(
  'subscriptionPlans/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_ROUTES.ADMIN.SUBSCRIPTION_PLAN.DELETE}/${id}`);
      toast.success('Plan deleted successfully');
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const subscriptionPlanSlice = createSlice({
  name: 'subscriptionPlans',
  initialState: {
    list: [],
    activeList: [],
    plan: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchActivePlans.fulfilled, (state, action) => {
        state.activeList = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getPlanById.fulfilled, (state, action) => {
        state.plan = action.payload;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        const index = state.list.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item.id !== action.payload);
      });
  },
});

export default subscriptionPlanSlice.reducer;
