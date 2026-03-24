import { createSlice } from "@reduxjs/toolkit";
import {
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  fetchCustomerMe,
} from "@/store/thunks/customerAuthThunks";

const initialState = {
  customer: null,
  loading: false,
  error: null,
  successMessage: null,
  isAuthenticated: false,
};

const customerAuthSlice = createSlice({
  name: "customerAuth",
  initialState,
  reducers: {
    clearCustomerAuthError: (state) => {
      state.error = null;
    },
    clearCustomerAuthMessage: (state) => {
      state.successMessage = null;
    },
    resetCustomerAuthState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload?.customer || null;
        state.isAuthenticated = !!action.payload?.customer;
        state.successMessage = action.payload?.message || "Login successful";
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to login";
        state.isAuthenticated = false;
      })

      .addCase(registerCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload?.customer || null;
        state.isAuthenticated = !!action.payload?.customer;
        state.successMessage =
          action.payload?.message || "Account created successfully";
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to register";
        state.isAuthenticated = false;
      })

      .addCase(logoutCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = null;
        state.isAuthenticated = false;
        state.successMessage =
          action.payload?.message || "Logged out successfully";
      })
      .addCase(logoutCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to logout";
      })

      .addCase(fetchCustomerMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerMe.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload?.customer || null;
        state.isAuthenticated = !!action.payload?.customer;
      })
      .addCase(fetchCustomerMe.rejected, (state) => {
        state.loading = false;
        state.customer = null;
        state.isAuthenticated = false;
      });
  },
});

export const {
  clearCustomerAuthError,
  clearCustomerAuthMessage,
  resetCustomerAuthState,
} = customerAuthSlice.actions;

export default customerAuthSlice.reducer;