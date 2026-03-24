import { createAsyncThunk } from "@reduxjs/toolkit";
import customerAuthService from "@/services/customerAuthService";

export const loginCustomer = createAsyncThunk(
  "customerAuth/loginCustomer",
  async (payload, thunkAPI) => {
    try {
      return await customerAuthService.login(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to login"
      );
    }
  }
);

export const registerCustomer = createAsyncThunk(
  "customerAuth/registerCustomer",
  async (payload, thunkAPI) => {
    try {
      return await customerAuthService.register(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to register"
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