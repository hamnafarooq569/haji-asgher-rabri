import { createSlice } from "@reduxjs/toolkit";
import {
  fetchTypes,
  fetchAllTypes,
  fetchTypeById,
  createType,
  updateType,
  deleteType,
  restoreType,
  updateTypeStatus,
  fetchTypeCategories,
} from "@/store/thunks/typeThunks";

const initialState = {
  items: [],
  allItems: [],
  currentType: null,
  categories: [],

  listLoading: false,
  loading: false,
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

  if (payload?.types && Array.isArray(payload.types)) {
    return {
      items: payload.types,
      meta: {
        total: payload.total || payload.types.length || 0,
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
    meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
  };
};

const normalizeSingle = (payload) => {
  if (payload?.type) return payload.type;
  if (payload?.data) return payload.data;
  return payload;
};

const normalizeCategories = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload?.categories && Array.isArray(payload.categories)) return payload.categories;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  return [];
};

const typeSlice = createSlice({
  name: "types",
  initialState,
  reducers: {
    setTypeSearch: (state, action) => {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setTypePage: (state, action) => {
      state.filters.page = action.payload;
    },
    clearCurrentType: (state) => {
      state.currentType = null;
    },
    clearTypeMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetTypeState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTypes.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchTypes.fulfilled, (state, action) => {
        state.listLoading = false;
        const { items, meta } = normalizeList(action.payload);
        state.items = items;
        state.meta = meta;
      })
      .addCase(fetchTypes.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload || "Failed to fetch types";
      })

      .addCase(fetchAllTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTypes.fulfilled, (state, action) => {
        state.loading = false;
        const normalized = normalizeList(action.payload);
        state.allItems = normalized.items;
      })
      .addCase(fetchAllTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch all types";
      })

      .addCase(fetchTypeById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchTypeById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentType = normalizeSingle(action.payload);
      })
      .addCase(fetchTypeById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || "Failed to fetch type details";
      })

      .addCase(createType.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createType.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Type created successfully";
      })
      .addCase(createType.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Type create failed";
      })

      .addCase(updateType.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateType.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Type updated successfully";
      })
      .addCase(updateType.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Type update failed";
      })

      .addCase(deleteType.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteType.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Type deleted successfully";
      })
      .addCase(deleteType.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Type delete failed";
      })

      .addCase(restoreType.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(restoreType.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Type restored successfully";
      })
      .addCase(restoreType.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Type restore failed";
      })

      .addCase(updateTypeStatus.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateTypeStatus.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Type status updated successfully";
      })
      .addCase(updateTypeStatus.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Type status update failed";
      })

      .addCase(fetchTypeCategories.pending, (state) => {
        state.categoryLoading = true;
        state.error = null;
      })
      .addCase(fetchTypeCategories.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.categories = normalizeCategories(action.payload);
      })
      .addCase(fetchTypeCategories.rejected, (state, action) => {
        state.categoryLoading = false;
        state.error = action.payload || "Failed to fetch categories";
      });
  },
});

export const {
  setTypeSearch,
  setTypePage,
  clearCurrentType,
  clearTypeMessages,
  resetTypeState,
} = typeSlice.actions;

export default typeSlice.reducer;