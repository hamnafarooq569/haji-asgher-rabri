import { createAsyncThunk } from "@reduxjs/toolkit";
import categoryService from "@/services/categoryService";

const getErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.details ||
    error?.message ||
    fallback
  );
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await categoryService.getCategories(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch categories"));
    }
  }
);

export const fetchAllCategories = createAsyncThunk(
  "categories/fetchAllCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await categoryService.getAllCategories();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch all categories"));
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (id, { rejectWithValue }) => {
    try {
      return await categoryService.getCategoryById(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch category details"));
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (payload, { rejectWithValue }) => {
    try {
      return await categoryService.createCategory(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Category create failed"));
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await categoryService.updateCategory(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Category update failed"));
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      return await categoryService.deleteCategory(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Category delete failed"));
    }
  }
);

export const restoreCategory = createAsyncThunk(
  "categories/restoreCategory",
  async (id, { rejectWithValue }) => {
    try {
      return await categoryService.restoreCategory(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Category restore failed"));
    }
  }
);

export const updateCategoryStatus = createAsyncThunk(
  "categories/updateCategoryStatus",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await categoryService.updateCategoryStatus(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Category status update failed"));
    }
  }
);