import { createAsyncThunk } from "@reduxjs/toolkit";
import reportService from "@/services/reportService";

export const fetchSalesReport = createAsyncThunk(
  "reports/fetchSalesReport",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reportService.getSalesReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch sales report",
        }
      );
    }
  }
);

export const fetchSellingReport = createAsyncThunk(
  "reports/fetchSellingReport",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reportService.getSellingReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch selling report",
        }
      );
    }
  }
);

export const fetchCustomerReport = createAsyncThunk(
  "reports/fetchCustomerReport",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reportService.getCustomerReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch customer report",
        }
      );
    }
  }
);

export const fetchMarginReport = createAsyncThunk(
  "reports/fetchMarginReport",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reportService.getMarginReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch margin report",
        }
      );
    }
  }
);