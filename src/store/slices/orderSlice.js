import { createSlice } from "@reduxjs/toolkit";
import {
  fetchOrders,
  fetchOrderById,
  changeOrderStatus,
  changePaymentStatus,
  restoreOrderThunk,
  fetchOrderInvoice,
  fetchPrintableOrder,
} from "@/store/thunks/orderThunks";

const initialState = {
  orders: [],
  selectedOrder: null,
  invoiceData: null,
  printableOrder: null,

  loading: false,
  detailsLoading: false,
  statusLoading: false,
  paymentStatusLoading: false,
  restoreLoading: false,
  invoiceLoading: false,
  printLoading: false,

  error: null,
  detailsError: null,
  statusError: null,
  paymentStatusError: null,
  restoreError: null,
  invoiceError: null,
  printError: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
      state.detailsError = null;
    },

    clearInvoiceData: (state) => {
      state.invoiceData = null;
      state.invoiceError = null;
    },

    clearPrintableOrder: (state) => {
      state.printableOrder = null;
      state.printError = null;
    },

    clearOrderErrors: (state) => {
      state.error = null;
      state.detailsError = null;
      state.statusError = null;
      state.paymentStatusError = null;
      state.restoreError = null;
      state.invoiceError = null;
      state.printError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload?.orders || action.payload || [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: "Failed to fetch orders" };
      })

      // Fetch Single Order
      .addCase(fetchOrderById.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedOrder = action.payload?.order || action.payload || null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError =
          action.payload || { message: "Failed to fetch order details" };
      })

      // Change Order Status
      .addCase(changeOrderStatus.pending, (state) => {
        state.statusLoading = true;
        state.statusError = null;
      })
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        state.statusLoading = false;

        const updatedOrder = action.payload?.order || action.payload;

        if (updatedOrder?.id) {
          state.orders = state.orders.map((order) =>
            order.id === updatedOrder.id ? updatedOrder : order
          );

          if (state.selectedOrder?.id === updatedOrder.id) {
            state.selectedOrder = updatedOrder;
          }
        }
      })
      .addCase(changeOrderStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.statusError =
          action.payload || { message: "Failed to update order status" };
      })

      // Change Payment Status
      .addCase(changePaymentStatus.pending, (state) => {
        state.paymentStatusLoading = true;
        state.paymentStatusError = null;
      })
      .addCase(changePaymentStatus.fulfilled, (state, action) => {
        state.paymentStatusLoading = false;

        const updatedOrder = action.payload?.order || action.payload;

        if (updatedOrder?.id) {
          state.orders = state.orders.map((order) =>
            order.id === updatedOrder.id ? updatedOrder : order
          );

          if (state.selectedOrder?.id === updatedOrder.id) {
            state.selectedOrder = updatedOrder;
          }
        }
      })
      .addCase(changePaymentStatus.rejected, (state, action) => {
        state.paymentStatusLoading = false;
        state.paymentStatusError =
          action.payload || { message: "Failed to update payment status" };
      })

      // Restore Order
      .addCase(restoreOrderThunk.pending, (state) => {
        state.restoreLoading = true;
        state.restoreError = null;
      })
      .addCase(restoreOrderThunk.fulfilled, (state, action) => {
        state.restoreLoading = false;

        const restoredOrder = action.payload?.order || action.payload;

        if (restoredOrder?.id) {
          state.orders = state.orders.map((order) =>
            order.id === restoredOrder.id ? restoredOrder : order
          );

          if (state.selectedOrder?.id === restoredOrder.id) {
            state.selectedOrder = restoredOrder;
          }
        }
      })
      .addCase(restoreOrderThunk.rejected, (state, action) => {
        state.restoreLoading = false;
        state.restoreError =
          action.payload || { message: "Failed to restore order" };
      })

      // Fetch Invoice
      .addCase(fetchOrderInvoice.pending, (state) => {
        state.invoiceLoading = true;
        state.invoiceError = null;
      })
      .addCase(fetchOrderInvoice.fulfilled, (state, action) => {
        state.invoiceLoading = false;
        state.invoiceData = action.payload || null;
      })
      .addCase(fetchOrderInvoice.rejected, (state, action) => {
        state.invoiceLoading = false;
        state.invoiceError =
          action.payload || { message: "Failed to fetch invoice data" };
      })

      // Fetch Printable Order
      .addCase(fetchPrintableOrder.pending, (state) => {
        state.printLoading = true;
        state.printError = null;
      })
      .addCase(fetchPrintableOrder.fulfilled, (state, action) => {
        state.printLoading = false;
        state.printableOrder = action.payload || null;
      })
      .addCase(fetchPrintableOrder.rejected, (state, action) => {
        state.printLoading = false;
        state.printError =
          action.payload || { message: "Failed to fetch printable order" };
      });
  },
});

export const {
  clearSelectedOrder,
  clearInvoiceData,
  clearPrintableOrder,
  clearOrderErrors,
} = orderSlice.actions;

export default orderSlice.reducer;