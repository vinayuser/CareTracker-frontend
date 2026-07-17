import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
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

const persistUser = (state, user, token) => {
  if (token) localStorage.setItem('token', token);
  localStorage.setItem('authUser', JSON.stringify(user));
  state.isAuthenticated = true;
  state.user = user;
  state.role = user?.role ?? '';
  state.authChecked = true;
  state.isLoading = false;
  state.error = null;
};

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

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(API_ROUTES.UPDATE_PROFILE, payload);
      toast.success(response.data.message || 'Profile updated');
      return response.data?.data?.user || response.data?.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(API_ROUTES.CHANGE_PASSWORD, payload);
      toast.success(response.data.message || 'Password updated');
      return response.data?.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
      return rejectWithValue(error.response?.data || error.message);
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
  profileSaving: false,
  passwordSaving: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      persistUser(state, action.payload.user, action.payload.token);
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
        // Only block the app shell on the initial session check — not on profile refreshes.
        if (!state.authChecked) state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        persistUser(state, action.payload);
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = '';
        state.authChecked = true;
        state.isLoading = false;
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');
      })
      .addCase(updateProfile.pending, (state) => { state.profileSaving = true; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileSaving = false;
        persistUser(state, action.payload);
      })
      .addCase(updateProfile.rejected, (state) => { state.profileSaving = false; })
      .addCase(changePassword.pending, (state) => { state.passwordSaving = true; })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.passwordSaving = false;
        const user = action.payload?.user;
        const token = action.payload?.token;
        if (user) persistUser(state, user, token);
      })
      .addCase(changePassword.rejected, (state) => { state.passwordSaving = false; });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
