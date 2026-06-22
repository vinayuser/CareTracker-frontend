import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const checkUserIdAvailability = createAsyncThunk(
  'registration/checkUserId',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.REGISTRATION.CHECK_USER_ID, {
        params: { email: userId },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const createRegistrationAccount = createAsyncThunk(
  'registration/createAccount',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.REGISTRATION.ACCOUNT, payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const submitRegistration = createAsyncThunk(
  'registration/submit',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.REGISTRATION.SUBMIT, payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const processRegistrationPayment = createAsyncThunk(
  'registration/processPayment',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.REGISTRATION.PAYMENT, payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const registrationSlice = createSlice({
  name: 'registration',
  initialState: {
    userIdAvailable: null,
    account: null,
    paymentResult: null,
    registrationResult: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    resetRegistrationState: (state) => {
      state.userIdAvailable = null;
      state.account = null;
      state.paymentResult = null;
      state.registrationResult = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUserIdAvailability.fulfilled, (state) => {
        state.userIdAvailable = true;
      })
      .addCase(checkUserIdAvailability.rejected, (state) => {
        state.userIdAvailable = false;
      })
      .addCase(createRegistrationAccount.fulfilled, (state, action) => {
        state.account = action.payload;
      })
      .addCase(submitRegistration.fulfilled, (state, action) => {
        state.registrationResult = action.payload;
      })
      .addCase(processRegistrationPayment.fulfilled, (state, action) => {
        state.paymentResult = action.payload;
      });
  },
});

export const { resetRegistrationState } = registrationSlice.actions;
export default registrationSlice.reducer;
