import { createAsyncThunk } from "@reduxjs/toolkit";
import { roleService } from "@/services/roleService";
import { getErrorMessage } from "@/utils/apiError";

export const fetchRolesThunk = createAsyncThunk(
  "roles/fetchRoles",
  async (_, thunkAPI) => {
    try {
      return await roleService.getRoles();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to fetch roles")
      );
    }
  }
);

export const fetchRoleByIdThunk = createAsyncThunk(
  "roles/fetchRoleById",
  async (roleId, thunkAPI) => {
    try {
      return await roleService.getRoleById(roleId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to fetch role details")
      );
    }
  }
);

export const fetchRolePermissionsThunk = createAsyncThunk(
  "roles/fetchRolePermissions",
  async (roleId, thunkAPI) => {
    try {
      const data = await roleService.getRolePermissions(roleId);
      return { roleId, data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to fetch role permissions")
      );
    }
  }
);

export const fetchGroupedPermissionsThunk = createAsyncThunk(
  "roles/fetchGroupedPermissions",
  async (_, thunkAPI) => {
    try {
      return await roleService.getGroupedPermissions();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to fetch grouped permissions")
      );
    }
  }
);

export const createRoleThunk = createAsyncThunk(
  "roles/createRole",
  async (payload, thunkAPI) => {
    try {
      const data = await roleService.createRole(payload);
      thunkAPI.dispatch(fetchRolesThunk());
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to create role")
      );
    }
  }
);

export const updateRoleThunk = createAsyncThunk(
  "roles/updateRole",
  async ({ roleId, payload }, thunkAPI) => {
    try {
      const data = await roleService.updateRole(roleId, payload);
      thunkAPI.dispatch(fetchRolesThunk());
      thunkAPI.dispatch(fetchRoleByIdThunk(roleId));
      thunkAPI.dispatch(fetchRolePermissionsThunk(roleId));
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to update role")
      );
    }
  }
);

export const deleteRoleThunk = createAsyncThunk(
  "roles/deleteRole",
  async (roleId, thunkAPI) => {
    try {
      const data = await roleService.deleteRole(roleId);
      thunkAPI.dispatch(fetchRolesThunk());
      return { roleId, data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to delete role")
      );
    }
  }
);

export const restoreRoleThunk = createAsyncThunk(
  "roles/restoreRole",
  async (roleId, thunkAPI) => {
    try {
      const data = await roleService.restoreRole(roleId);
      thunkAPI.dispatch(fetchRolesThunk());
      return { roleId, data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to restore role")
      );
    }
  }
);

export const exportRolesThunk = createAsyncThunk(
  "roles/exportRoles",
  async (format, thunkAPI) => {
    try {
      const blob = await roleService.exportRoles(format);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `roles.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return format;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to export roles")
      );
    }
  }
);