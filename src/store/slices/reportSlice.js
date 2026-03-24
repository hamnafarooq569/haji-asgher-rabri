import { createSlice } from "@reduxjs/toolkit";
import {
  fetchSalesReport,
  fetchSellingReport,
  fetchCustomerReport,
  fetchMarginReport,
} from "@/store/thunks/reportThunks";

const initialState = {
  salesReport: null,
  salesRows: [],
  salesSummary: {
    totalSales: 0,
    totalOrders: 0,
    paidOrders: 0,
    cancelledOrders: 0,
  },

  sellingReport: null,
  sellingRows: [],
  sellingSummary: {
    topSellingProduct: "-",
    totalItemsSold: 0,
    deliveredOrders: 0,
    averageOrderValue: 0,
  },

  customerReport: null,
  customerRows: [],
  customerSummary: {
    totalCustomers: 0,
    repeatCustomers: 0,
    newCustomers: 0,
    topCustomerSpend: 0,
  },

  marginReport: null,
  marginRows: [],
  marginSummary: {
    totalRevenue: 0,
    estimatedCost: 0,
    grossMargin: 0,
    marginPercent: 0,
  },

  loading: false,
  error: null,
};

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.salesReport = action.payload || {};

        const payload = action.payload || {};

        state.salesRows =
          payload?.rows ||
          payload?.sales ||
          payload?.orders ||
          payload?.data ||
          [];

        state.salesSummary = {
          totalSales:
            payload?.summary?.totalSales ||
            payload?.totals?.totalSales ||
            payload?.totalSales ||
            0,
          totalOrders:
            payload?.summary?.totalOrders ||
            payload?.totals?.totalOrders ||
            payload?.totalOrders ||
            0,
          paidOrders:
            payload?.summary?.paidOrders ||
            payload?.totals?.paidOrders ||
            payload?.paidOrders ||
            0,
          cancelledOrders:
            payload?.summary?.cancelledOrders ||
            payload?.totals?.cancelledOrders ||
            payload?.cancelledOrders ||
            0,
        };
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || {
          message: "Failed to fetch sales report",
        };
      })

      .addCase(fetchSellingReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellingReport.fulfilled, (state, action) => {
        state.loading = false;
        state.sellingReport = action.payload || {};

        const payload = action.payload || {};

        state.sellingRows =
          payload?.rows ||
          payload?.selling ||
          payload?.products ||
          payload?.data ||
          [];

        state.sellingSummary = {
          topSellingProduct:
            payload?.summary?.topSellingProduct ||
            payload?.totals?.topSellingProduct ||
            payload?.topSellingProduct ||
            "-",
          totalItemsSold:
            payload?.summary?.totalItemsSold ||
            payload?.totals?.totalItemsSold ||
            payload?.totalItemsSold ||
            0,
          deliveredOrders:
            payload?.summary?.deliveredOrders ||
            payload?.totals?.deliveredOrders ||
            payload?.deliveredOrders ||
            0,
          averageOrderValue:
            payload?.summary?.averageOrderValue ||
            payload?.totals?.averageOrderValue ||
            payload?.averageOrderValue ||
            0,
        };
      })
      .addCase(fetchSellingReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || {
          message: "Failed to fetch selling report",
        };
      })

      .addCase(fetchCustomerReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
        .addCase(fetchCustomerReport.fulfilled, (state, action) => {
        state.loading = false;
        state.customerReport = action.payload || {};

        const payload = action.payload || {};
        const rows =
            payload?.rows ||
            payload?.customers ||
            payload?.data ||
            [];

        state.customerRows = Array.isArray(rows) ? rows : [];

        const totalCustomers =
            Number(payload?.total || 0) || state.customerRows.length;

        const repeatCustomers = state.customerRows.filter(
            (row) => Number(row?.totalOrders || 0) > 1
        ).length;

        const newCustomers = state.customerRows.filter(
            (row) => Number(row?.totalOrders || 0) === 1
        ).length;

        const topCustomerSpend = state.customerRows.reduce((max, row) => {
            const amount = Number(row?.totalSpent || row?.totalAmount || 0);
            return amount > max ? amount : max;
        }, 0);

        state.customerSummary = {
            totalCustomers,
            repeatCustomers,
            newCustomers,
            topCustomerSpend,
        };
        })
      .addCase(fetchCustomerReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || {
          message: "Failed to fetch customer report",
        };
      })

      .addCase(fetchMarginReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    .addCase(fetchMarginReport.fulfilled, (state, action) => {
    state.loading = false;
    state.marginReport = action.payload || {};

    const payload = action.payload || {};
    const rows =
        payload?.rows ||
        payload?.margin ||
        payload?.products ||
        payload?.data ||
        [];

    state.marginRows = Array.isArray(rows) ? rows : [];

    const summary = payload?.summary || {};

    const totalRevenue =
        Number(summary?.total || payload?.totalRevenue || 0) ||
        state.marginRows.reduce(
        (sum, row) => sum + Number(row?.lineTotal || row?.revenue || 0),
        0
        );

    const grossMargin =
        Number(summary?.margin5 || payload?.grossMargin || 0) ||
        totalRevenue * 0.05;

    const estimatedCost =
        totalRevenue - grossMargin;

    const marginPercent =
        totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

    state.marginSummary = {
        totalRevenue,
        estimatedCost,
        grossMargin,
        marginPercent,
    };
    })
      .addCase(fetchMarginReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || {
          message: "Failed to fetch margin report",
        };
      });
  },
});

export default reportSlice.reducer;