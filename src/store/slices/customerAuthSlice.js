import { createSlice } from "@reduxjs/toolkit";
import {
  startCustomerAuth,
  verifyCustomerOtp,
  resendCustomerOtp,
  logoutCustomer,
  fetchCustomerMe,
} from "@/store/thunks/customerAuthThunks";

const initialState = {
  customer: null,
  loading: false,
  error: null,
  successMessage: null,
  isAuthenticated: false,
  otpSent: false,
  authEmail: "",
  authName: "",
  authPhone: "",
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
    resetCustomerAuthState: (state) => {
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
    setAuthDraft: (state, action) => {
      state.authEmail = action.payload?.email || "";
      state.authName = action.payload?.name || "";
      state.authPhone = action.payload?.phone || "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startCustomerAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(startCustomerAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.successMessage = action.payload?.message || "OTP sent successfully";
        state.authEmail = action.payload?.email || state.authEmail;
      })
      .addCase(startCustomerAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to send OTP";
      })

      .addCase(verifyCustomerOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCustomerOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload?.customer || null;
        state.isAuthenticated = true;
        state.successMessage =
          action.payload?.message || "OTP verified successfully";
      })
      .addCase(verifyCustomerOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to verify OTP";
        state.isAuthenticated = false;
      })

      .addCase(resendCustomerOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendCustomerOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "OTP resent successfully";
      })
      .addCase(resendCustomerOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to resend OTP";
      })

      .addCase(logoutCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = null;
        state.isAuthenticated = false;
        state.otpSent = false;
        state.authEmail = "";
        state.authName = "";
        state.authPhone = "";
        state.successMessage =
          action.payload?.message || "Logged out successfully";
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
  setAuthDraft,
} = customerAuthSlice.actions;

export default customerAuthSlice.reducer;