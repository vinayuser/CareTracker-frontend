import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchTeamStats = createAsyncThunk(
  'adminTeam/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.ADMIN.TEAM.STATS);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchTeamMembers = createAsyncThunk(
  'adminTeam/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.ADMIN.TEAM.LIST, { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const createTeamMember = createAsyncThunk(
  'adminTeam/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ROUTES.ADMIN.TEAM.CREATE, payload);
      toast.success('Team member created successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateTeamMember = createAsyncThunk(
  'adminTeam/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_ROUTES.ADMIN.TEAM.UPDATE}/${id}`, updates);
      toast.success(updates.moduleAccess ? 'Permissions updated' : 'Team member updated');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const setTeamMemberStatus = createAsyncThunk(
  'adminTeam/setStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${API_ROUTES.ADMIN.TEAM.STATUS}/${id}/status`, { status });
      toast.success(`Account marked as ${status}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const setTeamMemberPassword = createAsyncThunk(
  'adminTeam/setPassword',
  async ({ id, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`${API_ROUTES.ADMIN.TEAM.PASSWORD}/${id}/password`, { password });
      toast.success('Password updated successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteTeamMember = createAsyncThunk(
  'adminTeam/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_ROUTES.ADMIN.TEAM.DELETE}/${id}`);
      toast.success('Team member deleted');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const adminTeamSlice = createSlice({
  name: 'adminTeam',
  initialState: {
    list: [],
    stats: {
      total: 0,
      active: 0,
      inactive: 0,
      superAdmins: 0,
      platformAdmins: 0,
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      from: 0,
      to: 0,
    },
    loading: false,
    actionLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamStats.fulfilled, (state, action) => {
        state.stats = action.payload || state.stats;
      })
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.list || [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchTeamMembers.rejected, (state) => {
        state.loading = false;
        state.list = [];
      })
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.list = state.list.filter((member) => member.id !== action.payload);
        state.actionLoading = false;
      })
      .addMatcher(
        (action) => [
          createTeamMember.pending.type,
          updateTeamMember.pending.type,
          setTeamMemberStatus.pending.type,
          setTeamMemberPassword.pending.type,
          deleteTeamMember.pending.type,
        ].includes(action.type),
        (state) => {
          state.actionLoading = true;
        },
      )
      .addMatcher(
        (action) => [
          createTeamMember.fulfilled.type,
          createTeamMember.rejected.type,
          updateTeamMember.fulfilled.type,
          updateTeamMember.rejected.type,
          setTeamMemberStatus.fulfilled.type,
          setTeamMemberStatus.rejected.type,
          setTeamMemberPassword.fulfilled.type,
          setTeamMemberPassword.rejected.type,
          deleteTeamMember.fulfilled.type,
          deleteTeamMember.rejected.type,
        ].includes(action.type),
        (state) => {
          state.actionLoading = false;
        },
      );
  },
});

export default adminTeamSlice.reducer;
