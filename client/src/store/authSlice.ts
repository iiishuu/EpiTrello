import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import { AuthState, RegisterData, LoginData, User } from '../types';

const initialState: AuthState = {
  user: authService.getStoredUser(),
  token: authService.getStoredToken(),
  isAuthenticated: !!authService.getStoredToken(),
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      return response;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response: { data: { error: string } } };
        return rejectWithValue(axiosError.response.data.error);
      }
      return rejectWithValue('Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data: LoginData, { rejectWithValue }) => {
    try {
      const response = await authService.login(data);
      return response;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response: { data: { error: string } } };
        return rejectWithValue(axiosError.response.data.error);
      }
      return rejectWithValue('Login failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response: { data: { error: string } } };
        return rejectWithValue(axiosError.response.data.error);
      }
      return rejectWithValue('Failed to fetch user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        authService.logout();
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
