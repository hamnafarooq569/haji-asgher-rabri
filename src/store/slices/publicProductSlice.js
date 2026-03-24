import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllProducts,
  fetchProductBySlug,
} from "@/store/thunks/publicProductThunks";

const initialState = {
  products: [],
  meta: null,
  currentProduct: null,
  loading: false,
  error: null,
};

const publicProductSlice = createSlice({
  name: "publicProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload?.products || [];
        state.meta = action.payload?.meta || null;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch products";
      })

      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload?.product || null;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch product";
      });
  },
});

export default publicProductSlice.reducer;