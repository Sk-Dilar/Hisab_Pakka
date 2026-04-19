import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function for API requests
const apiRequest = async (endpoint, method = "GET", data = null) => {
  const token = localStorage.getItem("token");

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
};

// Async thunk for login
export const loginAsync = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/auth/login", "POST", {
        email,
        password,
      });
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk for register
export const registerAsync = createAsyncThunk(
  "auth/register",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/auth/register", "POST", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Load user from localStorage on app start
export const loadUserAsync = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        return { token, user: JSON.parse(user) };
      }
      return rejectWithValue("No user found");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk for forgot password
export const forgotPasswordAsync = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/auth/forgot-password", "POST", {
        email,
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk for reset password
export const resetPasswordAsync = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/auth/reset-password", "POST", {
        token,
        newPassword,
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  successMessage: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.successMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register cases
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load user cases
      .addCase(loadUserAsync.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loadUserAsync.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Forgot password cases
      .addCase(forgotPasswordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPasswordAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(forgotPasswordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset password cases
      .addCase(resetPasswordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(resetPasswordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, clearSuccessMessage } = authSlice.actions;
export default authSlice.reducer;
