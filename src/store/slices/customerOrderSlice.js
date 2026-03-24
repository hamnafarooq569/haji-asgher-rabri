import { createSlice } from "@reduxjs/toolkit";
import {
  fetchMyOrders,
  fetchOrderByNumber,
  cancelCustomerOrder,
} from "@/store/thunks/customerOrderThunks";

const initialState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  successMessage: null,
};

const customerOrderSlice = createSlice({
  name: "customerOrders",
  initialState,
  reducers: {
    clearCustomerOrdersError: (state) => {
      state.error = null;
    },
    clearCustomerOrdersMessage: (state) => {
      state.successMessage = null;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload?.orders || [];
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
      })

      .addCase(fetchOrderByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload?.order || action.payload || null;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch order details";
      })

      .addCase(cancelCustomerOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(cancelCustomerOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message || "Order cancelled successfully";

        if (action.payload?.order) {
          const updatedOrder = action.payload.order;

          state.orders = state.orders.map((order) =>
            order.orderNumber === updatedOrder.orderNumber
              ? { ...order, status: updatedOrder.status }
              : order
          );

          if (
            state.selectedOrder &&
            state.selectedOrder.orderNumber === updatedOrder.orderNumber
          ) {
            state.selectedOrder = {
              ...state.selectedOrder,
              status: updatedOrder.status,
            };
          }
        }
      })
      .addCase(cancelCustomerOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to cancel order";
      });
  },
});

export const {
  clearCustomerOrdersError,
  clearCustomerOrdersMessage,
  clearSelectedOrder,
} = customerOrderSlice.actions;

export default customerOrderSlice.reducer;