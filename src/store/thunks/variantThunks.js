import { createAsyncThunk } from "@reduxjs/toolkit";
import variantService from "@/services/variantService";

const getErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.details ||
    error?.message ||
    fallback
  );
};

export const fetchVariants = createAsyncThunk(
  "variants/fetchVariants",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await variantService.getVariants(params);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch variants")
      );
    }
  }
);

export const fetchAllVariants = createAsyncThunk(
  "variants/fetchAllVariants",
  async (_, { rejectWithValue }) => {
    try {
      return await variantService.getAllVariants();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch all variants")
      );
    }
  }
);

export const fetchVariantById = createAsyncThunk(
  "variants/fetchVariantById",
  async (id, { rejectWithValue }) => {
    try {
      return await variantService.getVariantById(id);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch variant details")
      );
    }
  }
);

export const createVariant = createAsyncThunk(
  "variants/createVariant",
  async (payload, { rejectWithValue }) => {
    try {
      return await variantService.createVariant(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Variant create failed"));
    }
  }
);

export const updateVariant = createAsyncThunk(
  "variants/updateVariant",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await variantService.updateVariant(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Variant update failed"));
    }
  }
);

export const deleteVariant = createAsyncThunk(
  "variants/deleteVariant",
  async (id, { rejectWithValue }) => {
    try {
      return await variantService.deleteVariant(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Variant delete failed"));
    }
  }
);

export const updateVariantStatus = createAsyncThunk(
  "variants/updateVariantStatus",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await variantService.updateVariantStatus(id, payload);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Variant status update failed")
      );
    }
  }
);