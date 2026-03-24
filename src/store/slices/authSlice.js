import { createSlice } from "@reduxjs/toolkit";
import {
  loginAdminThunk,
  fetchAdminProfileThunk,
  logoutAdminThunk,
} from "@/store/thunks/authThunks";

const initialState = {
  admin: null,
  permissions: [],
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    resetAuthState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdminThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdminThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.isAuthenticated = true;
        state.admin = action.payload?.user || action.payload?.admin || null;
        state.permissions = action.payload?.permissions || [];
      })
      .addCase(loginAdminThunk.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.isAuthenticated = false;
        state.admin = null;
        state.permissions = [];
        state.error = action.payload || "Login failed";
      })

      .addCase(fetchAdminProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.isAuthenticated = true;
        state.admin = action.payload?.user || action.payload?.admin || null;
        state.permissions = action.payload?.permissions || [];
      })
      .addCase(fetchAdminProfileThunk.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
        state.isAuthenticated = false;
        state.admin = null;
        state.permissions = [];
      })

      .addCase(logoutAdminThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAdminThunk.fulfilled, (state) => {
        state.admin = null;
        state.permissions = [];
        state.isAuthenticated = false;
        state.loading = false;
        state.initialized = true;
        state.error = null;
      })
      .addCase(logoutAdminThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearAuthError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;