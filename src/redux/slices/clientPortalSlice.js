import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchClientDashboard = createAsyncThunk(
  'clientPortal/dashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.CLIENT.DASHBOARD);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchClientCarePlans = createAsyncThunk(
  'clientPortal/carePlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.CLIENT.CARE_PLANS);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchClientCarePlan = createAsyncThunk(
  'clientPortal/carePlan',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_ROUTES.CLIENT.CARE_PLANS}/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const signClientCarePlan = createAsyncThunk(
  'clientPortal/signCarePlan',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_ROUTES.CLIENT.CARE_PLANS}/${id}/sign`,
        payload,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchClientVisits = createAsyncThunk(
  'clientPortal/visits',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.CLIENT.VISITS, { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchClientCaregivers = createAsyncThunk(
  'clientPortal/caregivers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.CLIENT.CAREGIVERS);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchClientCaregiver = createAsyncThunk(
  'clientPortal/caregiver',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_ROUTES.CLIENT.CAREGIVERS}/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchClientEvvEnrollments = createAsyncThunk(
  'clientPortal/evvEnrollments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.CLIENT.EVV_ENROLLMENTS);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchClientEvvEnrollment = createAsyncThunk(
  'clientPortal/evvEnrollment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_ROUTES.CLIENT.EVV_ENROLLMENTS}/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const signClientEvvEnrollment = createAsyncThunk(
  'clientPortal/signEvvEnrollment',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_ROUTES.CLIENT.EVV_ENROLLMENTS}/${id}/sign`,
        payload,
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const clientPortalSlice = createSlice({
  name: 'clientPortal',
  initialState: {
    dashboard: null,
    dashboardLoading: false,
    carePlans: [],
    carePlansLoading: false,
    selectedPlan: null,
    planLoading: false,
    visits: [],
    visitsLoading: false,
    caregivers: [],
    caregiversLoading: false,
    selectedCaregiver: null,
    caregiverDetailLoading: false,
    evvEnrollments: [],
    evvEnrollmentsLoading: false,
    selectedEvvEnrollment: null,
    evvEnrollmentLoading: false,
  },
  reducers: {
    clearSelectedClientPlan(state) {
      state.selectedPlan = null;
    },
    clearSelectedClientCaregiver(state) {
      state.selectedCaregiver = null;
    },
    clearSelectedClientEvvEnrollment(state) {
      state.selectedEvvEnrollment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientDashboard.pending, (state) => { state.dashboardLoading = true; })
      .addCase(fetchClientDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchClientDashboard.rejected, (state) => { state.dashboardLoading = false; })
      .addCase(fetchClientCarePlans.pending, (state) => { state.carePlansLoading = true; })
      .addCase(fetchClientCarePlans.fulfilled, (state, action) => {
        state.carePlansLoading = false;
        state.carePlans = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchClientCarePlans.rejected, (state) => { state.carePlansLoading = false; })
      .addCase(fetchClientCarePlan.pending, (state) => { state.planLoading = true; })
      .addCase(fetchClientCarePlan.fulfilled, (state, action) => {
        state.planLoading = false;
        state.selectedPlan = action.payload;
      })
      .addCase(fetchClientCarePlan.rejected, (state) => { state.planLoading = false; })
      .addCase(signClientCarePlan.fulfilled, (state, action) => {
        state.selectedPlan = action.payload;
      })
      .addCase(fetchClientVisits.pending, (state) => { state.visitsLoading = true; })
      .addCase(fetchClientVisits.fulfilled, (state, action) => {
        state.visitsLoading = false;
        state.visits = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchClientVisits.rejected, (state) => {
        state.visitsLoading = false;
        state.visits = [];
      })
      .addCase(fetchClientCaregivers.pending, (state) => { state.caregiversLoading = true; })
      .addCase(fetchClientCaregivers.fulfilled, (state, action) => {
        state.caregiversLoading = false;
        state.caregivers = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchClientCaregivers.rejected, (state) => {
        state.caregiversLoading = false;
        state.caregivers = [];
      })
      .addCase(fetchClientCaregiver.pending, (state) => {
        state.caregiverDetailLoading = true;
        state.selectedCaregiver = null;
      })
      .addCase(fetchClientCaregiver.fulfilled, (state, action) => {
        state.caregiverDetailLoading = false;
        state.selectedCaregiver = action.payload;
      })
      .addCase(fetchClientCaregiver.rejected, (state) => {
        state.caregiverDetailLoading = false;
        state.selectedCaregiver = null;
      })
      .addCase(fetchClientEvvEnrollments.pending, (state) => { state.evvEnrollmentsLoading = true; })
      .addCase(fetchClientEvvEnrollments.fulfilled, (state, action) => {
        state.evvEnrollmentsLoading = false;
        state.evvEnrollments = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchClientEvvEnrollments.rejected, (state) => {
        state.evvEnrollmentsLoading = false;
        state.evvEnrollments = [];
      })
      .addCase(fetchClientEvvEnrollment.pending, (state) => { state.evvEnrollmentLoading = true; })
      .addCase(fetchClientEvvEnrollment.fulfilled, (state, action) => {
        state.evvEnrollmentLoading = false;
        state.selectedEvvEnrollment = action.payload;
      })
      .addCase(fetchClientEvvEnrollment.rejected, (state) => {
        state.evvEnrollmentLoading = false;
        state.selectedEvvEnrollment = null;
      })
      .addCase(signClientEvvEnrollment.fulfilled, (state, action) => {
        state.selectedEvvEnrollment = action.payload;
        const idx = state.evvEnrollments.findIndex((e) => e.id === action.payload?.id);
        if (idx >= 0) state.evvEnrollments[idx] = action.payload;
        else if (action.payload) state.evvEnrollments.unshift(action.payload);
      });
  },
});

export const {
  clearSelectedClientPlan,
  clearSelectedClientCaregiver,
  clearSelectedClientEvvEnrollment,
} = clientPortalSlice.actions;
export default clientPortalSlice.reducer;
