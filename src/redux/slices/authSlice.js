import { createSlice } from '@reduxjs/toolkit';

const storedUser = (() => {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const initialState = {
  isAuthenticated: !!localStorage.getItem('token'),
  user: storedUser,
  role: storedUser?.role ?? '',
  isLoading: false,
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
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = '';
      localStorage.removeItem('token');
      localStorage.removeItem('authUser');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
