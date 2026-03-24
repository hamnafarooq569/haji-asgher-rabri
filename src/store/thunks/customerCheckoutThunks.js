import { createAsyncThunk } from "@reduxjs/toolkit";
import customerCheckoutService from "@/services/customerCheckoutService";

export const validateCustomerOrder = createAsyncThunk(
  "customerCheckout/validateCustomerOrder",
  async (payload, thunkAPI) => {
    try {
      return await customerCheckoutService.validateOrder(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to validate order"
      );
    }
  }
);

export const placeCustomerOrder = createAsyncThunk(
  "customerCheckout/placeCustomerOrder",
  async (payload, thunkAPI) => {
    try {
      return await customerCheckoutService.placeOrder(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to place order"
      );
    }
  }
);