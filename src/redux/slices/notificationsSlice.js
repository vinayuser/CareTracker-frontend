import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

export const NOTIFICATIONS_PAGE_SIZE = 20;

export const fetchNotifications = createAsyncThunk(
  'notifications/list',
  async (params = {}, { rejectWithValue }) => {
    const {
      page = 1,
      limit = NOTIFICATIONS_PAGE_SIZE,
      append = false,
      ...rest
    } = params;
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...Object.fromEntries(
          Object.entries(rest).filter(([, value]) => value !== undefined && value !== null),
        ),
      }).toString();
      const url = `${API_ROUTES.NOTIFICATIONS.LIST}?${query}`;
      const response = await axiosInstance.get(url);
      return {
        ...(response.data.data || {}),
        append: Boolean(append),
        requestedPage: page,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.NOTIFICATIONS.UNREAD_COUNT);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(API_ROUTES.NOTIFICATIONS.MARK_READ(id));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(API_ROUTES.NOTIFICATIONS.MARK_ALL_READ);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const emptyPagination = {
  page: 1,
  limit: NOTIFICATIONS_PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    pagination: { ...emptyPagination },
    loading: false,
    loadingMore: false,
    error: null,
  },
  reducers: {
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.pagination = { ...emptyPagination };
      state.loading = false;
      state.loadingMore = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state, action) => {
        const append = Boolean(action.meta?.arg?.append);
        if (append) state.loadingMore = true;
        else state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        const nextItems = action.payload?.items || [];
        if (action.payload?.append) {
          const seen = new Set(state.items.map((row) => row.id));
          state.items = [
            ...state.items,
            ...nextItems.filter((row) => row?.id && !seen.has(row.id)),
          ];
        } else {
          state.items = nextItems;
        }
        state.unreadCount = action.payload?.unreadCount ?? state.unreadCount;
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload?.unreadCount ?? 0;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = action.payload;
        if (!item?.id) return;
        const wasUnread = state.items.some((row) => row.id === item.id && !row.read);
        state.items = state.items.map((row) => (
          row.id === item.id ? { ...row, read: true, readAt: item.readAt } : row
        ));
        if (wasUnread || item.read) {
          state.unreadCount = Math.max(0, state.unreadCount - (wasUnread ? 1 : 0));
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((row) => ({ ...row, read: true }));
        state.unreadCount = 0;
      });
  },
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
