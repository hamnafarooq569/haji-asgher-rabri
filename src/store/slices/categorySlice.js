import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCategories,
  fetchAllCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  updateCategoryStatus,
} from "@/store/thunks/categoryThunks";

const initialState = {
  items: [],
  allItems: [],
  currentCategory: null,

  listLoading: false,
  loading: false,
  detailsLoading: false,
  submitLoading: false,

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

const normalizeCategoryList = (payload) => {
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

  if (payload?.categories && Array.isArray(payload.categories)) {
    return {
      items: payload.categories,
      meta: {
        total: payload.total || payload.categories.length || 0,
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

const normalizeSingleCategory = (payload) => {
  if (payload?.category) return payload.category;
  if (payload?.data) return payload.data;
  return payload;
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategorySearch: (state, action) => {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },

    setCategoryPage: (state, action) => {
      state.filters.page = action.payload;
    },

    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },

    clearCategoryMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },

    resetCategoryState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.listLoading = false;
        const { items, meta } = normalizeCategoryList(action.payload);
        state.items = items;
        state.meta = meta;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload || "Failed to fetch categories";
      })

      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        const normalized = normalizeCategoryList(action.payload);
        state.allItems = normalized.items;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch all categories";
      })

      .addCase(fetchCategoryById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentCategory = normalizeSingleCategory(action.payload);
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || "Failed to fetch category details";
      })

      .addCase(createCategory.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Category created successfully";
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Category create failed";
      })

      .addCase(updateCategory.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Category updated successfully";
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Category update failed";
      })

      .addCase(deleteCategory.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Category deleted successfully";
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Category delete failed";
      })

      .addCase(restoreCategory.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(restoreCategory.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Category restored successfully";
      })
      .addCase(restoreCategory.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Category restore failed";
      })

      .addCase(updateCategoryStatus.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateCategoryStatus.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Category status updated successfully";
      })
      .addCase(updateCategoryStatus.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Category status update failed";
      });
  },
});

export const {
  setCategorySearch,
  setCategoryPage,
  clearCurrentCategory,
  clearCategoryMessages,
  resetCategoryState,
} = categorySlice.actions;

export default categorySlice.reducer;