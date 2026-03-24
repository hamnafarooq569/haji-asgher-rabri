import { createSlice } from "@reduxjs/toolkit";
import {
  validateCustomerOrder,
  placeCustomerOrder,
} from "@/store/thunks/customerCheckoutThunks";

const initialState = {
  validation: null,
  placedOrder: null,
  loading: false,
  error: null,
  successMessage: null,
};

const customerCheckoutSlice = createSlice({
  name: "customerCheckout",
  initialState,
  reducers: {
    clearCustomerCheckoutError: (state) => {
      state.error = null;
    },
    clearCustomerCheckoutMessage: (state) => {
      state.successMessage = null;
    },
    clearPlacedOrder: (state) => {
      state.placedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateCustomerOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCustomerOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.validation = action.payload || null;
      })
      .addCase(validateCustomerOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to validate order";
      })

      .addCase(placeCustomerOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(placeCustomerOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.placedOrder = action.payload?.order || null;
        state.successMessage =
          action.payload?.message || "Order placed successfully";
      })
      .addCase(placeCustomerOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to place order";
      });
  },
});

export const {
  clearCustomerCheckoutError,
  clearCustomerCheckoutMessage,
  clearPlacedOrder,
} = customerCheckoutSlice.actions;

export default customerCheckoutSlice.reducer;