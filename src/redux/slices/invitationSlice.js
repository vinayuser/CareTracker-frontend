import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchInvitationStats = createAsyncThunk(
  'invitations/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.ADMIN.INVITATION.STATS);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchInvitations = createAsyncThunk(
  'invitations/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams
        ? `${API_ROUTES.ADMIN.INVITATION.LIST}?${queryParams}`
        : API_ROUTES.ADMIN.INVITATION.LIST;
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const sendInvitation = createAsyncThunk(
  'invitations/send',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.ADMIN.INVITATION.CREATE, payload);
      toast.success('Invitation sent successfully');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const resendInvitation = createAsyncThunk(
  'invitations/resend',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_ROUTES.ADMIN.INVITATION.RESEND}/${id}/resend`);
      toast.success('Invitation resent successfully');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const validateInvitationToken = createAsyncThunk(
  'invitations/validateToken',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.ADMIN.INVITATION.VALIDATE, {
        params: { token },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const invitationSlice = createSlice({
  name: 'invitations',
  initialState: {
    list: [],
    stats: { total: 0, accepted: 0, pending: 0, expired: 0 },
    sentInvitation: null,
    validatedInvite: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearSentInvitation: (state) => {
      state.sentInvitation = null;
    },
    clearValidatedInvite: (state) => {
      state.validatedInvite = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvitationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchInvitations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchInvitations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(sendInvitation.fulfilled, (state, action) => {
        state.sentInvitation = action.payload;
        state.list.unshift(action.payload);
      })
      .addCase(resendInvitation.fulfilled, (state, action) => {
        const index = state.list.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(validateInvitationToken.fulfilled, (state, action) => {
        state.validatedInvite = action.payload;
      });
  },
});

export const { clearSentInvitation, clearValidatedInvite } = invitationSlice.actions;
export default invitationSlice.reducer;
