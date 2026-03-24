import { createAsyncThunk } from "@reduxjs/toolkit";
import addonService from "@/services/addonService";

const getErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.response?.data?.details ||
    error?.message ||
    fallback
  );
};

export const fetchAddons = createAsyncThunk(
  "addons/fetchAddons",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await addonService.getAddons(params);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch addons"));
    }
  }
);

export const fetchAllAddons = createAsyncThunk(
  "addons/fetchAllAddons",
  async (_, { rejectWithValue }) => {
    try {
      return await addonService.getAllAddons();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch all addons"));
    }
  }
);

export const fetchAddonById = createAsyncThunk(
  "addons/fetchAddonById",
  async (id, { rejectWithValue }) => {
    try {
      return await addonService.getAddonById(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch addon details"));
    }
  }
);

export const createAddon = createAsyncThunk(
  "addons/createAddon",
  async (payload, { rejectWithValue }) => {
    try {
      return await addonService.createAddon(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Addon create failed"));
    }
  }
);

export const updateAddon = createAsyncThunk(
  "addons/updateAddon",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await addonService.updateAddon(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Addon update failed"));
    }
  }
);

export const deleteAddon = createAsyncThunk(
  "addons/deleteAddon",
  async (id, { rejectWithValue }) => {
    try {
      return await addonService.deleteAddon(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Addon delete failed"));
    }
  }
);

export const restoreAddon = createAsyncThunk(
  "addons/restoreAddon",
  async (id, { rejectWithValue }) => {
    try {
      return await addonService.restoreAddon(id);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Addon restore failed"));
    }
  }
);

export const updateAddonStatus = createAsyncThunk(
  "addons/updateAddonStatus",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await addonService.updateAddonStatus(id, payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Addon status update failed"));
    }
  }
);