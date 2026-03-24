import { createAsyncThunk } from "@reduxjs/toolkit";
import productService from "@/services/productService";

const getErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.details ||
    error?.message ||
    fallback
  );
};

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await productService.getProducts(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch products"));
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getAllProducts();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch all products"));
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      return await productService.getProductById(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch product details"));
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (payload, { rejectWithValue }) => {
    try {
      return await productService.createProduct(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Product create failed"));
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await productService.updateProduct(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Product update failed"));
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      return await productService.deleteProduct(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Product delete failed"));
    }
  }
);

export const restoreProduct = createAsyncThunk(
  "products/restoreProduct",
  async (id, { rejectWithValue }) => {
    try {
      return await productService.restoreProduct(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Product restore failed"));
    }
  }
);

export const updateProductStatus = createAsyncThunk(
  "products/updateProductStatus",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await productService.updateProductStatus(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Product status update failed"));
    }
  }
);

export const fetchProductCategories = createAsyncThunk(
  "products/fetchProductCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await productService.getAllCategories();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch categories"));
    }
  }
);