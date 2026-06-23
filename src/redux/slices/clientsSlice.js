import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchClients = createAsyncThunk('clients/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_ROUTES.AGENCY.CLIENTS.LIST}?${query}` : API_ROUTES.AGENCY.CLIENTS.LIST;
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchClientStats = createAsyncThunk('clients/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_ROUTES.AGENCY.CLIENTS.STATS);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchClient = createAsyncThunk('clients/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_ROUTES.AGENCY.CLIENTS.LIST}/${id}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const addClient = createAsyncThunk('clients/create', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ROUTES.AGENCY.CLIENTS.LIST, payload);
    toast.success('Client created successfully');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateClient = createAsyncThunk('clients/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`${API_ROUTES.AGENCY.CLIENTS.LIST}/${id}`, payload);
    toast.success('Client updated successfully');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const deleteClient = createAsyncThunk('clients/delete', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_ROUTES.AGENCY.CLIENTS.LIST}/${id}`);
    toast.success('Client deleted');
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const clientsSlice = createSlice({
  name: 'clients',
  initialState: { list: [], selected: null, stats: { total: 0, active: 0, inactive: 0 }, loading: false },
  reducers: { clearSelectedClient(state) { state.selected = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => { state.loading = true; })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchClients.rejected, (state) => { state.loading = false; })
      .addCase(fetchClientStats.fulfilled, (state, action) => { state.stats = action.payload || state.stats; })
      .addCase(fetchClient.fulfilled, (state, action) => { state.selected = action.payload; })
      .addCase(addClient.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(updateClient.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        state.selected = action.payload;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      });
  },
});

export const { clearSelectedClient } = clientsSlice.actions;
export default clientsSlice.reducer;
