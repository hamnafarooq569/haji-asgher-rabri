import { createAsyncThunk } from "@reduxjs/toolkit";
import customerProfileService from "@/services/customerProfileService";

export const fetchCustomerProfile = createAsyncThunk(
  "customerProfile/fetchCustomerProfile",
  async (_, thunkAPI) => {
    try {
      return await customerProfileService.getProfile();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

export const updateCustomerProfile = createAsyncThunk(
  "customerProfile/updateCustomerProfile",
  async (payload, thunkAPI) => {
    try {
      return await customerProfileService.updateProfile(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);