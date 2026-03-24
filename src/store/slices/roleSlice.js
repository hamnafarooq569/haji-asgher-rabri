import { createSlice } from "@reduxjs/toolkit";
import {
  fetchRolesThunk,
  fetchRoleByIdThunk,
  fetchRolePermissionsThunk,
  fetchGroupedPermissionsThunk,
  createRoleThunk,
  updateRoleThunk,
  deleteRoleThunk,
  restoreRoleThunk,
  exportRolesThunk,
} from "@/store/thunks/roleThunks";

const initialState = {
  roles: [],
  loading: false,
  error: null,

  selectedRole: null,
  selectedRolePermissions: [],
  permissionsLoading: false,
  permissionsError: null,

  roleDetails: null,
  roleDetailsLoading: false,

  groupedPermissions: {},
  groupedPermissionsLoading: false,

  actionLoading: false,
  actionError: null,
  exportLoading: false,
};

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    clearRoleError: (state) => {
      state.error = null;
      state.permissionsError = null;
      state.actionError = null;
    },
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
      state.selectedRolePermissions = [];
      state.permissionsError = null;
      state.roleDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload?.roles || action.payload || [];
      })
      .addCase(fetchRolesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to fetch roles";
      })

      .addCase(fetchRoleByIdThunk.pending, (state) => {
        state.roleDetailsLoading = true;
      })
      .addCase(fetchRoleByIdThunk.fulfilled, (state, action) => {
        state.roleDetailsLoading = false;
        state.roleDetails = action.payload?.role || action.payload;
      })
      .addCase(fetchRoleByIdThunk.rejected, (state, action) => {
        state.roleDetailsLoading = false;
        state.actionError = action.payload || "Unable to fetch role details";
      })

      .addCase(fetchRolePermissionsThunk.pending, (state) => {
        state.permissionsLoading = true;
        state.permissionsError = null;
      })
      .addCase(fetchRolePermissionsThunk.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        const payload = action.payload?.data;

        if (payload?.role) {
          state.selectedRole = payload.role;
        }

        state.selectedRolePermissions =
          payload?.permissionKeys ||
          payload?.permissions ||
          payload?.data?.permissionKeys ||
          payload?.data?.permissions ||
          payload?.rolePermissions ||
          payload?.data?.rolePermissions ||
          payload?.items ||
          payload?.data?.items ||
          (Array.isArray(payload) ? payload : []);
      })
      .addCase(fetchRolePermissionsThunk.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.permissionsError =
          action.payload || "Unable to fetch role permissions";
        state.selectedRolePermissions = [];
      })

      .addCase(fetchGroupedPermissionsThunk.pending, (state) => {
        state.groupedPermissionsLoading = true;
      })

      .addCase(fetchGroupedPermissionsThunk.fulfilled, (state, action) => {
        state.groupedPermissionsLoading = false;
        state.groupedPermissions =
          action.payload?.grouped ||
          action.payload?.groupedPermissions ||
          action.payload?.permissions ||
          action.payload ||
          {};
      })

      .addCase(createRoleThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createRoleThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createRoleThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Unable to create role";
      })

      .addCase(updateRoleThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateRoleThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(updateRoleThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Unable to update role";
      })

      .addCase(deleteRoleThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteRoleThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteRoleThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Unable to delete role";
      })

      .addCase(restoreRoleThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(restoreRoleThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(restoreRoleThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Unable to restore role";
      })

      .addCase(exportRolesThunk.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportRolesThunk.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportRolesThunk.rejected, (state, action) => {
        state.exportLoading = false;
        state.actionError = action.payload || "Unable to export roles";
      });
  },
});

export const { clearRoleError, setSelectedRole, clearSelectedRole } =
  roleSlice.actions;

export default roleSlice.reducer;