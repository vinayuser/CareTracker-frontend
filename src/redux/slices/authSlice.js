import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

const storedUser = (() => {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const hasToken = () => Boolean(localStorage.getItem('token'));

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue({ skipToast: true, message: 'No token' });
    }
    try {
      const response = await axiosInstance.get(API_ROUTES.ME, {
        skipErrorToast: true,
      });
      return response.data?.data?.user || response.data?.data;
    } catch (error) {
      return rejectWithValue({
        skipToast: true,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        isSessionExpired: Boolean(error.response?.data?.isSessionExpired),
      });
    }
  },
);

const initialState = {
  // Optimistic until /auth/me resolves when a token exists
  isAuthenticated: hasToken(),
  user: storedUser,
  role: storedUser?.role ?? '',
  authChecked: !hasToken(),
  isLoading: hasToken(),
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('authUser', JSON.stringify(action.payload.user));
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.user?.role ?? '';
      state.authChecked = true;
      state.isLoading = false;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = '';
      state.authChecked = true;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('authUser');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const user = action.payload;
        localStorage.setItem('authUser', JSON.stringify(user));
        state.isAuthenticated = true;
        state.user = user;
        state.role = user?.role ?? '';
        state.authChecked = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = '';
        state.authChecked = true;
        state.isLoading = false;
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
      });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
