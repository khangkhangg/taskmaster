import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';

// Async thunks
export const login = createAsyncThunk('auth/login', async (credentials) => {
  const response = await authAPI.login(credentials);
  await AsyncStorage.setItem('@taskmaster:token', response.data.token);
  return response.data;
});

export const register = createAsyncThunk('auth/register', async (userData) => {
  const response = await authAPI.register(userData);
  await AsyncStorage.setItem('@taskmaster:token', response.data.token);
  return response.data;
});

export const loadUser = createAsyncThunk('auth/loadUser', async () => {
  const token = await AsyncStorage.getItem('@taskmaster:token');
  if (!token) throw new Error('No token found');
  const response = await authAPI.getProfile();
  return response.data;
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData) => {
  const response = await authAPI.updateProfile(userData);
  return response.data;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('@taskmaster:token');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
