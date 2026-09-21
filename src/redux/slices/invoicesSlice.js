import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

const emptyPagination = {
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 1,
  from: 0,
  to: 0,
};

const normalizeListPayload = (data) => {
  if (Array.isArray(data)) {
    return {
      list: data,
      pagination: { ...emptyPagination, total: data.length, to: data.length },
    };
  }
  return {
    list: Array.isArray(data?.list) ? data.list : [],
    pagination: { ...emptyPagination, ...(data?.pagination || {}) },
  };
};

export const fetchInvoices = createAsyncThunk('invoices/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ).toString();
    const url = query ? `${API_ROUTES.AGENCY.INVOICES.LIST}?${query}` : API_ROUTES.AGENCY.INVOICES.LIST;
    const response = await axiosInstance.get(url);
    return normalizeListPayload(response.data.data);
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
    pagination: emptyPagination,
    loading: false,
    actionLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => { state.loading = true; })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInvoices.rejected, (state) => { state.loading = false; })
      .addCase(generateInvoice.pending, (state) => { state.actionLoading = true; })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          state.list = [{
            id: action.payload.id,
            invoiceCode: action.payload.invoiceCode,
            clientId: action.payload.clientId,
            clientName: action.payload.clientName,
            clientEmail: action.payload.clientEmail,
            periodFrom: action.payload.periodFrom,
            periodTo: action.payload.periodTo,
            status: action.payload.status,
            total: action.payload.total,
            lineCount: action.payload.lines?.length || 0,
          }, ...state.list].slice(0, state.pagination.limit || 5);
          state.pagination = {
            ...state.pagination,
            total: (state.pagination.total || 0) + 1,
          };
        }
      })
      .addCase(generateInvoice.rejected, (state) => { state.actionLoading = false; })
      .addCase(sendInvoice.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) return;
        state.list = state.list.map((inv) => (inv.id === updated.id
          ? { ...inv, status: updated.status, lineCount: updated.lines?.length ?? inv.lineCount }
          : inv));
      })
      .addCase(markInvoicePaid.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) return;
        state.list = state.list.map((inv) => (inv.id === updated.id
          ? { ...inv, status: updated.status }
          : inv));
      })
      .addCase(voidInvoice.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) return;
        state.list = state.list.map((inv) => (inv.id === updated.id
          ? { ...inv, status: updated.status }
          : inv));
      });
  },
});

export default invoicesSlice.reducer;
