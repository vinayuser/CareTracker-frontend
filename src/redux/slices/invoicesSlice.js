import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const fetchInvoices = createAsyncThunk('invoices/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_ROUTES.AGENCY.INVOICES.LIST}?${query}` : API_ROUTES.AGENCY.INVOICES.LIST;
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchInvoiceById = createAsyncThunk('invoices/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_ROUTES.AGENCY.INVOICES.LIST}/${id}`);
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to load invoice');
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const generateInvoice = createAsyncThunk('invoices/generate', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ROUTES.AGENCY.INVOICES.GENERATE, payload);
    toast.success(response.data.message || 'Invoice draft created');
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to generate invoice');
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const sendInvoice = createAsyncThunk('invoices/send', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_ROUTES.AGENCY.INVOICES.SEND}/${id}/send`);
    toast.success(response.data.message || 'Invoice sent');
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to send invoice');
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const markInvoicePaid = createAsyncThunk('invoices/markPaid', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_ROUTES.AGENCY.INVOICES.PAID}/${id}/paid`);
    toast.success(response.data.message || 'Invoice marked paid');
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update invoice');
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const voidInvoice = createAsyncThunk('invoices/void', async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_ROUTES.AGENCY.INVOICES.VOID}/${id}/void`);
    toast.success(response.data.message || 'Invoice voided');
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to void invoice');
    return rejectWithValue(error.response?.data || error.message);
  }
});

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState: {
    list: [],
    loading: false,
    actionLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => { state.loading = true; })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchInvoices.rejected, (state) => { state.loading = false; })
      .addCase(generateInvoice.pending, (state) => { state.actionLoading = true; })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) state.list = [action.payload, ...state.list];
      })
      .addCase(generateInvoice.rejected, (state) => { state.actionLoading = false; })
      .addCase(sendInvoice.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) return;
        state.list = state.list.map((inv) => (inv.id === updated.id ? updated : inv));
      })
      .addCase(markInvoicePaid.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) return;
        state.list = state.list.map((inv) => (inv.id === updated.id ? updated : inv));
      })
      .addCase(voidInvoice.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) return;
        state.list = state.list.map((inv) => (inv.id === updated.id ? updated : inv));
      });
  },
});

export default invoicesSlice.reducer;
