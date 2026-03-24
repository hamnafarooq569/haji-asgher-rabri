import { createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "@/services/userService";
import { roleService } from "@/services/roleService";
import { getErrorMessage } from "@/utils/apiError";

export const fetchUsersThunk = createAsyncThunk(
  "users/fetchUsers",
  async (_, thunkAPI) => {
    try {
      return await userService.getUsers();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to fetch users")
      );
    }
  }
);

export const searchUsersThunk = createAsyncThunk(
  "users/searchUsers",
  async (query, thunkAPI) => {
    try {
      if (!query?.trim()) {
        return await userService.getUsers();
      }
      return await userService.searchUsers(query.trim());
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to search users")
      );
    }
  }
);

export const fetchUserByIdThunk = createAsyncThunk(
  "users/fetchUserById",
  async (userId, thunkAPI) => {
    try {
      return await userService.getUserById(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to fetch user details")
      );
    }
  }
);

export const createUserThunk = createAsyncThunk(
  "users/createUser",
  async (payload, thunkAPI) => {
    try {
      const data = await userService.createUser(payload);
      thunkAPI.dispatch(fetchUsersThunk());
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to create user")
      );
    }
  }
);

export const updateUserThunk = createAsyncThunk(
  "users/updateUser",
  async ({ userId, payload }, thunkAPI) => {
    try {
      const data = await userService.updateUser(userId, payload);
      thunkAPI.dispatch(fetchUsersThunk());
      thunkAPI.dispatch(fetchUserByIdThunk(userId));
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to update user")
      );
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  "users/deleteUser",
  async (userId, thunkAPI) => {
    try {
      const data = await userService.deleteUser(userId);
      thunkAPI.dispatch(fetchUsersThunk());
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to delete user")
      );
    }
  }
);

export const restoreUserThunk = createAsyncThunk(
  "users/restoreUser",
  async (userId, thunkAPI) => {
    try {
      const data = await userService.restoreUser(userId);
      thunkAPI.dispatch(fetchUsersThunk());
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to restore user")
      );
    }
  }
);

export const exportUsersThunk = createAsyncThunk(
  "users/exportUsers",
  async (format, thunkAPI) => {
    try {
      const blob = await userService.exportUsers(format);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return format;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to export users")
      );
    }
  }
);

export const fetchRolesForUsersThunk = createAsyncThunk(
  "users/fetchRolesForUsers",
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