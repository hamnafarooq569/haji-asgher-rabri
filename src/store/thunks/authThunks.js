import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/utils/apiError";

export const loginAdminThunk = createAsyncThunk(
  "auth/loginAdmin",
  async (payload, thunkAPI) => {
    try {
      const data = await authService.login(payload);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Login failed")
      );
    }
  }
);

export const fetchAdminProfileThunk = createAsyncThunk(
  "auth/fetchAdminProfile",
  async (_, thunkAPI) => {
    try {
      const data = await authService.me();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Unable to fetch admin profile")
      );
    }
  }
);

export const logoutAdminThunk = createAsyncThunk(
  "auth/logoutAdmin",
  async (_, thunkAPI) => {
    try {
      const data = await authService.logout();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Logout failed")
      );
    }
  }
);