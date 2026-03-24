import { createSlice } from "@reduxjs/toolkit";
import {
  fetchVariants,
  fetchAllVariants,
  fetchVariantById,
  createVariant,
  updateVariant,
  deleteVariant,
  updateVariantStatus,
} from "@/store/thunks/variantThunks";

const initialState = {
  items: [],
  allItems: [],
  currentVariant: null,

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

const normalizeList = (payload) => {
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

  if (payload?.variants && Array.isArray(payload.variants)) {
    return {
      items: payload.variants,
      meta: {
        total: payload.total || payload.variants.length || 0,
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

const normalizeSingle = (payload) => {
  if (payload?.variant) return payload.variant;
  if (payload?.data) return payload.data;
  return payload;
};

const variantSlice = createSlice({
  name: "variants",
  initialState,
  reducers: {
    setVariantSearch: (state, action) => {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setVariantPage: (state, action) => {
      state.filters.page = action.payload;
    },
    clearCurrentVariant: (state) => {
      state.currentVariant = null;
    },
    clearVariantMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetVariantState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVariants.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchVariants.fulfilled, (state, action) => {
        state.listLoading = false;
        const { items, meta } = normalizeList(action.payload);
        state.items = items;
        state.meta = meta;
      })
      .addCase(fetchVariants.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload || "Failed to fetch variants";
      })

      .addCase(fetchAllVariants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllVariants.fulfilled, (state, action) => {
        state.loading = false;
        const normalized = normalizeList(action.payload);
        state.allItems = normalized.items;
      })
      .addCase(fetchAllVariants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch all variants";
      })

      .addCase(fetchVariantById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchVariantById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentVariant = normalizeSingle(action.payload);
      })
      .addCase(fetchVariantById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || "Failed to fetch variant details";
      })

      .addCase(createVariant.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createVariant.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage =
          action.payload?.message || "Variant created successfully";
      })
      .addCase(createVariant.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Variant create failed";
      })

      .addCase(updateVariant.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateVariant.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage =
          action.payload?.message || "Variant updated successfully";
      })
      .addCase(updateVariant.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Variant update failed";
      })

      .addCase(deleteVariant.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteVariant.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage =
          action.payload?.message || "Variant deleted successfully";
      })
      .addCase(deleteVariant.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Variant delete failed";
      })

      .addCase(updateVariantStatus.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateVariantStatus.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage =
          action.payload?.message || "Variant status updated successfully";
      })
      .addCase(updateVariantStatus.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Variant status update failed";
      });
  },
});

export const {
  setVariantSearch,
  setVariantPage,
  clearCurrentVariant,
  clearVariantMessages,
  resetVariantState,
} = variantSlice.actions;

export default variantSlice.reducer;