import { createAsyncThunk } from "@reduxjs/toolkit";
import publicProductService from "@/services/publicProductService";

export const fetchAllProducts = createAsyncThunk(
  "publicProducts/fetchAllProducts",
  async (_, thunkAPI) => {
    try {
      return await publicProductService.getAllProducts({
        page: 1,
        limit: 200,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  "publicProducts/fetchProductBySlug",
  async (slug, thunkAPI) => {
    try {
      return await publicProductService.getProductBySlug(slug);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);