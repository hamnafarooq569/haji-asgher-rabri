import { createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "@/services/orderService";

// Get all orders
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to fetch orders" }
      );
    }
  }
);

// Get single order by id
export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to fetch order details" }
      );
    }
  }
);

export const changeOrderStatus = createAsyncThunk(
  "orders/changeOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus({ id, status });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to update order status",
        }
      );
    }
  }
);

// Update payment status
export const changePaymentStatus = createAsyncThunk(
  "orders/changePaymentStatus",
  async ({ id, paymentStatus }, { rejectWithValue }) => {
    try {
      const response = await orderService.updatePaymentStatus({ id, paymentStatus });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to update payment status" }
      );
    }
  }
);

export const fetchPublicProducts = createAsyncThunk(
  "orders/fetchPublicProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getPublicProducts(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch public products",
        }
      );
    }
  }
);

// Restore order
export const restoreOrderThunk = createAsyncThunk(
  "orders/restoreOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.restoreOrder(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to restore order" }
      );
    }
  }
);

// Fetch invoice data
export const fetchOrderInvoice = createAsyncThunk(
  "orders/fetchOrderInvoice",
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderInvoice(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to fetch invoice" }
      );
    }
  }
);

// Fetch printable order data
export const fetchPrintableOrder = createAsyncThunk(
  "orders/fetchPrintableOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.getPrintableOrder(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message || "Failed to fetch printable order" }
      );
    }
  }
);