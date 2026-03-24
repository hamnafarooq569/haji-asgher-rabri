import { createAsyncThunk } from "@reduxjs/toolkit";
import customerOrderService from "@/services/customerOrderService";

export const fetchMyOrders = createAsyncThunk(
  "customerOrders/fetchMyOrders",
  async (_, thunkAPI) => {
    try {
      return await customerOrderService.getMyOrders();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const fetchOrderByNumber = createAsyncThunk(
  "customerOrders/fetchOrderByNumber",
  async (orderNumber, thunkAPI) => {
    try {
      return await customerOrderService.getOrderByNumber(orderNumber);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch order details"
      );
    }
  }
);

export const cancelCustomerOrder = createAsyncThunk(
  "customerOrders/cancelCustomerOrder",
  async (orderNumber, thunkAPI) => {
    try {
      return await customerOrderService.cancelOrder(orderNumber);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to cancel order"
      );
    }
  }
);