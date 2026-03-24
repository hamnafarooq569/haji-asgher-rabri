import { createSlice } from "@reduxjs/toolkit";
import {
  fetchUsersThunk,
  searchUsersThunk,
  fetchUserByIdThunk,
  createUserThunk,
  updateUserThunk,
  deleteUserThunk,
  restoreUserThunk,
  exportUsersThunk,
  fetchRolesForUsersThunk,
} from "@/store/thunks/userThunks";

const initialState = {
  users: [],
  loading: false,
  error: null,

  userDetails: null,
  userDetailsLoading: false,

  roles: [],
  rolesLoading: false,

  actionLoading: false,
  actionError: null,
  exportLoading: false,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
      state.actionError = null;
    },
    clearUserDetails: (state) => {
      state.userDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload?.users || action.payload || [];
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to fetch users";
      })

      .addCase(searchUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload?.users || action.payload || [];
      })
      .addCase(searchUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to search users";
      })

      .addCase(fetchUserByIdThunk.pending, (state) => {
        state.userDetailsLoading = true;
      })
      .addCase(fetchUserByIdThunk.fulfilled, (state, action) => {
        state.userDetailsLoading = false;
        state.userDetails = action.payload?.user || action.payload;
      })
      .addCase(fetchUserByIdThunk.rejected, (state, action) => {
        state.userDetailsLoading = false;
        state.actionError = action.payload || "Unable to fetch user details";
      })

      .addCase(createUserThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(createUserThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Unable to create user";
      })

      .addCase(updateUserThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(updateUserThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Unable to update user";
      })

      .addCase(deleteUserThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(deleteUserThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Unable to delete user";
      })

      .addCase(restoreUserThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(restoreUserThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(restoreUserThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Unable to restore user";
      })

      .addCase(exportUsersThunk.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportUsersThunk.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportUsersThunk.rejected, (state, action) => {
        state.exportLoading = false;
        state.actionError = action.payload || "Unable to export users";
      })

      .addCase(fetchRolesForUsersThunk.pending, (state) => {
        state.rolesLoading = true;
      })
      .addCase(fetchRolesForUsersThunk.fulfilled, (state, action) => {
        state.rolesLoading = false;
        state.roles = action.payload?.roles || action.payload || [];
      })
      .addCase(fetchRolesForUsersThunk.rejected, (state) => {
        state.rolesLoading = false;
      });
  },
});

export const { clearUserError, clearUserDetails } = userSlice.actions;
export default userSlice.reducer;