import { createSlice } from "@reduxjs/toolkit";
import {
  startCustomerAuth,
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  fetchCustomerMe,
  resendCustomerOtp,
  verifyCustomerOtp,
} from "@/store/thunks/customerAuthThunks";

const initialState = {
  customer: null,
  loading: false,
  error: null,
  successMessage: null,
  isAuthenticated: false,
  authDraft: {
    name: "",
    email: "",
    phone: "",
    password: "",
    purpose: "login",
  },
  otpSession: null,
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
    setAuthDraft: (state, action) => {
      state.authDraft = {
        ...state.authDraft,
        ...action.payload,
      };
    },
    clearAuthDraft: (state) => {
      state.authDraft = initialState.authDraft;
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
        state.successMessage =
          action.payload?.message || "OTP sent successfully";
        state.otpSession = action.payload?.otpSession || null;
      })
      .addCase(startCustomerAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to start auth";
      })

      .addCase(verifyCustomerOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCustomerOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "OTP verified successfully";
        state.otpSession = null;

        if (action.payload?.customer) {
          state.customer = action.payload.customer;
          state.isAuthenticated = true;
        }
      })
      .addCase(verifyCustomerOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to verify OTP";
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
        state.authDraft = initialState.authDraft;
        state.otpSession = null;
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
  setAuthDraft,
  clearAuthDraft,
} = customerAuthSlice.actions;

export default customerAuthSlice.reducer;