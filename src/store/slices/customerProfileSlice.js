import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCustomerProfile,
  updateCustomerProfile,
} from "@/store/thunks/customerProfileThunks";

const initialState = {
  customer: null,
  loading: false,
  error: null,
  successMessage: null,
};

const customerProfileSlice = createSlice({
  name: "customerProfile",
  initialState,
  reducers: {
    clearCustomerProfileError: (state) => {
      state.error = null;
    },
    clearCustomerProfileMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload?.customer || null;
      })
      .addCase(fetchCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch profile";
      })

      .addCase(updateCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload?.customer || null;
        state.successMessage =
          action.payload?.message || "Profile updated successfully";
      })
      .addCase(updateCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update profile";
      });
  },
});

export const {
  clearCustomerProfileError,
  clearCustomerProfileMessage,
} = customerProfileSlice.actions;

export default customerProfileSlice.reducer;