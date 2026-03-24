import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAddons,
  fetchAllAddons,
  fetchAddonById,
  createAddon,
  updateAddon,
  deleteAddon,
  restoreAddon,
  updateAddonStatus,
} from "@/store/thunks/addonThunks";

const initialState = {
  items: [],
  allItems: [],
  currentAddon: null,

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

  if (payload?.addons && Array.isArray(payload.addons)) {
    return {
      items: payload.addons,
      meta: {
        total: payload.total || payload.addons.length || 0,
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
  if (payload?.addon) return payload.addon;
  if (payload?.data) return payload.data;
  return payload;
};

const addonSlice = createSlice({
  name: "addons",
  initialState,
  reducers: {
    setAddonSearch: (state, action) => {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },

    setAddonPage: (state, action) => {
      state.filters.page = action.payload;
    },

    clearCurrentAddon: (state) => {
      state.currentAddon = null;
    },

    clearAddonMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },

    resetAddonState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddons.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchAddons.fulfilled, (state, action) => {
        state.listLoading = false;
        const { items, meta } = normalizeList(action.payload);
        state.items = items;
        state.meta = meta;
      })
      .addCase(fetchAddons.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload || "Failed to fetch addons";
      })

      .addCase(fetchAllAddons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAddons.fulfilled, (state, action) => {
        state.loading = false;
        const normalized = normalizeList(action.payload);
        state.allItems = normalized.items;
      })
      .addCase(fetchAllAddons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch all addons";
      })

      .addCase(fetchAddonById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchAddonById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentAddon = normalizeSingle(action.payload);
      })
      .addCase(fetchAddonById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || "Failed to fetch addon details";
      })

      .addCase(createAddon.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createAddon.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Addon created successfully";
      })
      .addCase(createAddon.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Addon create failed";
      })

      .addCase(updateAddon.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateAddon.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Addon updated successfully";
      })
      .addCase(updateAddon.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Addon update failed";
      })

      .addCase(deleteAddon.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteAddon.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Addon deleted successfully";
      })
      .addCase(deleteAddon.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Addon delete failed";
      })

      .addCase(restoreAddon.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(restoreAddon.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Addon restored successfully";
      })
      .addCase(restoreAddon.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Addon restore failed";
      })

      .addCase(updateAddonStatus.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateAddonStatus.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.successMessage = action.payload?.message || "Addon status updated successfully";
      })
      .addCase(updateAddonStatus.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload || "Addon status update failed";
      });
  },
});

export const {
  setAddonSearch,
  setAddonPage,
  clearCurrentAddon,
  clearAddonMessages,
  resetAddonState,
} = addonSlice.actions;

export default addonSlice.reducer;