import { createAsyncThunk } from "@reduxjs/toolkit";
import typeService from "@/services/typeService";

const getErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.details ||
    error?.message ||
    fallback
  );
};

export const fetchTypes = createAsyncThunk(
  "types/fetchTypes",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await typeService.getTypes(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch types"));
    }
  }
);

export const fetchAllTypes = createAsyncThunk(
  "types/fetchAllTypes",
  async (_, { rejectWithValue }) => {
    try {
      return await typeService.getAllTypes();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch all types"));
    }
  }
);

export const fetchTypeById = createAsyncThunk(
  "types/fetchTypeById",
  async (id, { rejectWithValue }) => {
    try {
      return await typeService.getTypeById(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch type details"));
    }
  }
);

export const createType = createAsyncThunk(
  "types/createType",
  async (payload, { rejectWithValue }) => {
    try {
      return await typeService.createType(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Type create failed"));
    }
  }
);

export const updateType = createAsyncThunk(
  "types/updateType",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await typeService.updateType(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Type update failed"));
    }
  }
);

export const deleteType = createAsyncThunk(
  "types/deleteType",
  async (id, { rejectWithValue }) => {
    try {
      return await typeService.deleteType(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Type delete failed"));
    }
  }
);

export const restoreType = createAsyncThunk(
  "types/restoreType",
  async (id, { rejectWithValue }) => {
    try {
      return await typeService.restoreType(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Type restore failed"));
    }
  }
);

export const updateTypeStatus = createAsyncThunk(
  "types/updateTypeStatus",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await typeService.updateTypeStatus(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Type status update failed"));
    }
  }
);

export const fetchTypeCategories = createAsyncThunk(
  "types/fetchTypeCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await typeService.getAllCategories();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch categories"));
    }
  }
);