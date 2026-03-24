"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RolesTable from "@/components/admin/roles/RolesTable";
import RoleViewDrawer from "@/components/admin/roles/RoleViewDrawer";
import RoleEditDrawer from "@/components/admin/roles/RoleEditDrawer";
import RolesToolbar from "@/components/admin/roles/RolesToolbar";
import { clearSelectedRole, clearRoleError } from "@/store/slices/roleSlice";
import {
  fetchRolesThunk,
  fetchRoleByIdThunk,
  fetchRolePermissionsThunk,
  fetchGroupedPermissionsThunk,
  createRoleThunk,
  updateRoleThunk,
  deleteRoleThunk,
  restoreRoleThunk,
  exportRolesThunk,
} from "@/store/thunks/roleThunks";

export default function RolesPage() {
  const dispatch = useDispatch();

  const {
    roles,
    loading,
    error,
    selectedRolePermissions,
    roleDetails,
    roleDetailsLoading,
    groupedPermissions,
    actionLoading,
    actionError,
    exportLoading,
    permissionsLoading,
  } = useSelector((state) => state.roles);

  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchRolesThunk());
    dispatch(fetchGroupedPermissionsThunk());

    return () => {
      dispatch(clearSelectedRole());
      dispatch(clearRoleError());
    };
  }, [dispatch]);

  const handleViewRole = async (role) => {
    if (!role?.id) return;

    await dispatch(fetchRoleByIdThunk(role.id));
    await dispatch(fetchRolePermissionsThunk(role.id));
    setViewDrawerOpen(true);
  };

  const handleEditRole = async (role) => {
    if (!role?.id) return;

    await dispatch(fetchRoleByIdThunk(role.id));
    await dispatch(fetchRolePermissionsThunk(role.id));
    setEditDrawerOpen(true);
  };

  const handleCreateRole = async (payload) => {
    const result = await dispatch(createRoleThunk(payload));
    if (!result.error) {
      setCreateDrawerOpen(false);
    }
  };

  const handleSubmitEdit = async (payload) => {
    if (!roleDetails?.id) return;

    const result = await dispatch(
      updateRoleThunk({
        roleId: roleDetails.id,
        payload,
      })
    );

    if (!result.error) {
      setEditDrawerOpen(false);
    }
  };

  const handleDeleteRole = async (role) => {
    if (!role?.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${role.name}"?`
    );
    if (!confirmed) return;

    await dispatch(deleteRoleThunk(role.id));
  };

  const handleRestoreRole = async (role) => {
    if (!role?.id) return;
    await dispatch(restoreRoleThunk(role.id));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Roles</h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage system roles and permission assignments.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Total Roles:{" "}
            <span className="font-semibold text-slate-700">
              {roles?.length || 0}
            </span>
          </div>
        </div>
      </div>

      <RolesToolbar
        exportLoading={exportLoading}
        onExportCsv={() => dispatch(exportRolesThunk("csv"))}
        onExportXlsx={() => dispatch(exportRolesThunk("xlsx"))}
        onCreateRole={() => setCreateDrawerOpen(true)}
      />

      {(error || actionError) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error || actionError}
        </div>
      )}

      <RolesTable
        roles={roles || []}
        loading={loading}
        onViewRole={handleViewRole}
        onEditRole={handleEditRole}
        onDeleteRole={handleDeleteRole}
        onRestoreRole={handleRestoreRole}
      />

      <RoleViewDrawer
        open={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        role={roleDetails}
        permissions={selectedRolePermissions || []}
        loading={roleDetailsLoading || permissionsLoading}
      />

      <RoleEditDrawer
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        onSubmit={handleSubmitEdit}
        loading={actionLoading || roleDetailsLoading}
        role={roleDetails}
        currentPermissions={selectedRolePermissions || []}
        groupedPermissions={groupedPermissions || []}
        mode="edit"
      />

      <RoleEditDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onSubmit={handleCreateRole}
        loading={actionLoading}
        role={null}
        currentPermissions={[]}
        groupedPermissions={groupedPermissions || []}
        mode="create"
      />
    </div>
  );
}