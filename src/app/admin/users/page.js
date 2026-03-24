"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UsersTable from "@/components/admin/users/UsersTable";
import UserViewDrawer from "@/components/admin/users/UserViewDrawer";
import UserEditDrawer from "@/components/admin/users/UserEditDrawer";
import UserCreateDrawer from "@/components/admin/users/UserCreateDrawer";
import UsersToolbar from "@/components/admin/users/UsersToolbar";
import { clearUserDetails, clearUserError } from "@/store/slices/userSlice";
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

export default function UsersPage() {
  const dispatch = useDispatch();

  const {
    users,
    loading,
    error,
    userDetails,
    userDetailsLoading,
    roles,
    actionLoading,
    actionError,
    exportLoading,
  } = useSelector((state) => state.users);

  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    dispatch(fetchUsersThunk());
    dispatch(fetchRolesForUsersThunk());

    return () => {
      dispatch(clearUserDetails());
      dispatch(clearUserError());
    };
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue.trim()) {
        dispatch(searchUsersThunk(searchValue.trim()));
      } else {
        dispatch(fetchUsersThunk());
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue, dispatch]);

  const handleViewUser = async (user) => {
    if (!user?.id) return;
    await dispatch(fetchUserByIdThunk(user.id));
    setViewDrawerOpen(true);
  };

  const handleEditUser = async (user) => {
    if (!user?.id) return;
    await dispatch(fetchUserByIdThunk(user.id));
    setEditDrawerOpen(true);
  };

  const handleCreateUser = async (payload) => {
    const result = await dispatch(createUserThunk(payload));
    if (!result.error) {
      setCreateDrawerOpen(false);
    }
  };

  const handleSubmitEdit = async (payload) => {
    if (!userDetails?.id) return;

    const result = await dispatch(
      updateUserThunk({
        userId: userDetails.id,
        payload,
      })
    );

    if (!result.error) {
      setEditDrawerOpen(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!user?.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.name}"?`
    );
    if (!confirmed) return;

    await dispatch(deleteUserThunk(user.id));
  };

  const handleRestoreUser = async (user) => {
    if (!user?.id) return;
    await dispatch(restoreUserThunk(user.id));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Users</h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage user accounts, roles and status.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Total Users:{" "}
            <span className="font-semibold text-slate-700">
              {users?.length || 0}
            </span>
          </div>
        </div>
      </div>

      <UsersToolbar
        exportLoading={exportLoading}
        onExportCsv={() => dispatch(exportUsersThunk("csv"))}
        onExportXlsx={() => dispatch(exportUsersThunk("xlsx"))}
        onCreateUser={() => setCreateDrawerOpen(true)}
        onSearchChange={setSearchValue}
        searchValue={searchValue}
      />

      {(error || actionError) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error || actionError}
        </div>
      )}

      <UsersTable
        users={users || []}
        loading={loading}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onRestoreUser={handleRestoreUser}
      />

      <UserViewDrawer
        open={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        user={userDetails}
        loading={userDetailsLoading}
      />

      <UserEditDrawer
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        onSubmit={handleSubmitEdit}
        loading={actionLoading || userDetailsLoading}
        user={userDetails}
        roles={roles || []}
      />

      <UserCreateDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onSubmit={handleCreateUser}
        loading={actionLoading}
        roles={roles || []}
      />
    </div>
  );
}