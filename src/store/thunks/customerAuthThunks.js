import { createAsyncThunk } from "@reduxjs/toolkit";
import customerAuthService from "@/services/customerAuthService";

export const startCustomerAuth = createAsyncThunk(
  "customerAuth/startCustomerAuth",
  async (payload, thunkAPI) => {
    try {
      return await customerAuthService.start(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

export const verifyCustomerOtp = createAsyncThunk(
  "customerAuth/verifyCustomerOtp",
  async (payload, thunkAPI) => {
    try {
      return await customerAuthService.verifyOtp(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to verify OTP"
      );
    }
  }
);

export const resendCustomerOtp = createAsyncThunk(
  "customerAuth/resendCustomerOtp",
  async (payload, thunkAPI) => {
    try {
      return await customerAuthService.resendOtp(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to resend OTP"
      );
    }
  }
);

export const logoutCustomer = createAsyncThunk(
  "customerAuth/logoutCustomer",
  async (_, thunkAPI) => {
    try {
      return await customerAuthService.logout();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to logout customer"
      );
    }
  }
);

export const fetchCustomerMe = createAsyncThunk(
  "customerAuth/fetchCustomerMe",
  async (_, thunkAPI) => {
    try {
      return await customerAuthService.me();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch customer"
      );
    }
  }
);