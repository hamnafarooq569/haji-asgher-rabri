import { createSlice } from "@reduxjs/toolkit";
import {
  fetchProducts,
  fetchAllProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  updateProductStatus,
  fetchProductCategories,
} from "@/store/thunks/productThunks";

const initialState = {
  items: [],
  allItems: [],
  currentProduct: null,
  categories: [],

  loading: false,
  listLoading: false,
  detailsLoading: false,
  submitLoading: false,
  categoryLoading: false,

  error: null,
  successMessage: null,

  filters: {
    search: "",
    page: 1,
    limit: 10,
  },

  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

const normalizeProductList = (payload) => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      meta: {
        total: payload.length,
        page: 1,
        limit: payload.length || 10,
        totalPages: 1,
      },
    };
  }

  if (payload?.products && Array.isArray(payload.products)) {
    return {
      items: payload.products,
      meta: {
        total: payload.total || payload.products.length || 0,
        page: payload.page || 1,
        limit: payload.limit || 10,
        totalPages: payload.totalPages || 1,
      },
    };
  }

  if (payload?.data && Array.isArray(payload.data)) {
    return {
      items: payload.data,
      meta: {
        total: payload.total || payload.data.length || 0,
        page: payload.page || 1,
        limit: payload.limit || 10,
        totalPages: payload.totalPages || 1,
      },
    };
  }

  return {
    items: [],
    meta: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };
};

const normalizeSingleProduct = (payload) => {
  if (payload?.product) return payload.product;
  if (payload?.data) return payload.data;
  return payload;
};

const normalizeCategories = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload?.categories && Array.isArray(payload.categories)) return payload.categories;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  return [];
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProductFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    setProductSearch: (state, action) => {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },

    setProductPage: (state, action) => {
      state.filters.page = action.payload;
    },

    setProductLimit: (state, action) => {
      state.filters.limit = action.payload;
      state.filters.page = 1;
    },

    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },

    clearProductMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },

    resetProductState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.listLoading = false;
        const { items, meta } = normalizeProductList(action.payload);
        state.items = items;
        state.meta = meta;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload || "Failed to fetch products";
      })

      // fetchAllProducts
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        const normalized = normalizeProductList(action.payload);
        state.allItems = normalized.items;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch all products";
      })

      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentProduct = normalizeSingleProduct(action.payload);
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || "Failed to fetch product details";
      })

      // createProduct
      .addCase(createProduct.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Product created successfully";
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to create product";
      })

      // updateProduct
      .addCase(updateProduct.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Product updated successfully";
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to update product";
      })

      // deleteProduct
      .addCase(deleteProduct.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Product deleted successfully";
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to delete product";
      })

      // restoreProduct
      .addCase(restoreProduct.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(restoreProduct.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Product restored successfully";
      })
      .addCase(restoreProduct.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to restore product";
      })

      // updateProductStatus
      .addCase(updateProductStatus.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateProductStatus.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Product status updated successfully";
      })
      .addCase(updateProductStatus.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Failed to update product status";
      })

      // fetchProductCategories
      .addCase(fetchProductCategories.pending, (state) => {
        state.categoryLoading = true;
        state.error = null;
      })
      .addCase(fetchProductCategories.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.categories = normalizeCategories(action.payload);
      })
      .addCase(fetchProductCategories.rejected, (state, action) => {
        state.categoryLoading = false;
        state.error = action.payload || "Failed to fetch categories";
      });
  },
});

export const {
  setProductFilters,
  setProductSearch,
  setProductPage,
  setProductLimit,
  clearCurrentProduct,
  clearProductMessages,
  resetProductState,
} = productSlice.actions;

export default productSlice.reducer;