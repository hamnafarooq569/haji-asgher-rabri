"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/lib/axios";

import AddonsToolbar from "@/components/admin/addons/AddonsToolbar";
import AddonsTable from "@/components/admin/addons/AddonsTable";
import CreateAddonDrawer from "@/components/admin/addons/CreateAddonDrawer";
import EditAddonDrawer from "@/components/admin/addons/EditAddonDrawer";
import ViewAddonDrawer from "@/components/admin/addons/ViewAddonDrawer";

import {
  fetchAddons,
  fetchAllAddons,
  deleteAddon,
  restoreAddon,
  updateAddonStatus,
} from "@/store/thunks/addonThunks";

import {
  setAddonSearch,
  clearAddonMessages,
} from "@/store/slices/addonSlice";

export default function AddonsPage() {
  const dispatch = useDispatch();

  const {
    items,
    allItems,
    filters,
    listLoading,
    loading,
    error,
    successMessage,
  } = useSelector((state) => state.addons);

  const authAdmin = useSelector((state) => state.auth.admin);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const canCreate = !!authAdmin || !!isAuthenticated;

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const refreshActiveList = () => {
    dispatch(
      fetchAddons({
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        search: filters?.search || "",
      })
    );
  };

  const refreshAllList = () => {
    dispatch(fetchAllAddons());
  };

  const refreshEverything = () => {
    refreshActiveList();
    refreshAllList();
  };

  useEffect(() => {
    refreshActiveList();
  }, [dispatch, filters?.page, filters?.limit, filters?.search]);

  useEffect(() => {
    refreshAllList();
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearAddonMessages());
    };
  }, [dispatch]);

  const displayedAddons = useMemo(() => {
    const source =
      Array.isArray(allItems) && allItems.length > 0 ? allItems : items || [];

    const searchValue = (filters?.search || "").trim().toLowerCase();

    if (!searchValue) return source;

    return source.filter((addon) => {
      const name = String(addon?.name || "").toLowerCase();
      return name.includes(searchValue);
    });
  }, [allItems, items, filters?.search]);

  const totalAddons = displayedAddons.length;

  const handleSearch = (value) => {
    dispatch(setAddonSearch(value));
  };

  const handleReset = () => {
    dispatch(setAddonSearch(""));
  };

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };

  const handleOpenView = (addon) => {
    setSelectedAddon(addon);
    setViewOpen(true);
  };

  const handleOpenEdit = (addon) => {
    setSelectedAddon(addon);
    setEditOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    dispatch(clearAddonMessages());
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedAddon(null);
    dispatch(clearAddonMessages());
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setSelectedAddon(null);
  };

  const downloadBlobFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const getErrorMessageFromBlob = async (err, fallbackMessage) => {
    try {
      const data = err?.response?.data;

      if (data instanceof Blob) {
        const text = await data.text();

        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
          return fallbackMessage;
        }

        try {
          const parsed = JSON.parse(text);
          return parsed?.message || fallbackMessage;
        } catch {
          return text || fallbackMessage;
        }
      }

      return err?.response?.data?.message || err?.message || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportLoading(true);

      const response = await axiosInstance.get("/addons/export/csv", {
        params: {
          search: filters?.search || "",
        },
        responseType: "blob",
      });

      downloadBlobFile(response.data, `addons-${Date.now()}.csv`);
    } catch (err) {
      alert(await getErrorMessageFromBlob(err, "Failed to export CSV"));
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportXlsx = async () => {
    try {
      setExportLoading(true);

      const response = await axiosInstance.get("/addons/export/xlsx", {
        params: {
          search: filters?.search || "",
        },
        responseType: "blob",
      });

      downloadBlobFile(response.data, `addons-${Date.now()}.xlsx`);
    } catch (err) {
      alert(await getErrorMessageFromBlob(err, "Failed to export XLSX"));
    } finally {
      setExportLoading(false);
    }
  };

  const handleDelete = async (addon) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${addon?.name}"?`
    );
    if (!confirmed) return;

    const resultAction = await dispatch(deleteAddon(addon.id));

    if (deleteAddon.fulfilled.match(resultAction)) {
      refreshEverything();
    }
  };

  const handleRestore = async (addon) => {
    const confirmed = window.confirm(
      `Are you sure you want to restore "${addon?.name}"?`
    );
    if (!confirmed) return;

    const resultAction = await dispatch(restoreAddon(addon.id));

    if (restoreAddon.fulfilled.match(resultAction)) {
      refreshEverything();
    }
  };

  const handleToggleStatus = async (addon) => {
    const resultAction = await dispatch(
      updateAddonStatus({
        id: addon.id,
        payload: {
          isActive: !addon?.isActive,
        },
      })
    );

    if (updateAddonStatus.fulfilled.match(resultAction)) {
      refreshEverything();
    }
  };

  const tableLoading = listLoading || loading;

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {typeof error === "string"
            ? error
            : error?.message || "Something went wrong"}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Addons</h1>
            <p className="text-sm text-slate-500">
              View and manage all addons from one place.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Total Addons:{" "}
            <span className="font-semibold text-slate-700">{totalAddons}</span>
          </div>
        </div>
      </div>

      <AddonsToolbar
        initialSearch={filters?.search || ""}
        onSearch={handleSearch}
        onReset={handleReset}
        onCreate={handleOpenCreate}
        onExportCsv={handleExportCsv}
        onExportXlsx={handleExportXlsx}
        loading={tableLoading}
        exportLoading={exportLoading}
        canCreate={canCreate}
      />

      <AddonsTable
        addons={displayedAddons}
        loading={tableLoading}
        onViewAddon={handleOpenView}
        onEditAddon={handleOpenEdit}
        onDeleteAddon={handleDelete}
        onRestoreAddon={handleRestore}
        onToggleStatus={handleToggleStatus}
      />

      <CreateAddonDrawer
        open={createOpen}
        onClose={handleCloseCreate}
        onSuccess={() => {
          handleCloseCreate();
          refreshEverything();
        }}
      />

      <EditAddonDrawer
        open={editOpen}
        addon={selectedAddon}
        onClose={handleCloseEdit}
        onSuccess={() => {
          handleCloseEdit();
          refreshEverything();
        }}
      />

      <ViewAddonDrawer
        open={viewOpen}
        addon={selectedAddon}
        onClose={handleCloseView}
      />
    </div>
  );
}