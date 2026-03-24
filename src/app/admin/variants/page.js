"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/lib/axios";

import VariantsToolbar from "@/components/admin/variants/VariantsToolbar";
import VariantsTable from "@/components/admin/variants/VariantsTable";
import CreateVariantDrawer from "@/components/admin/variants/CreateVariantDrawer";
import EditVariantDrawer from "@/components/admin/variants/EditVariantDrawer";
import ViewVariantDrawer from "@/components/admin/variants/ViewVariantDrawer";
import variantService from "@/services/variantService";

import {
  fetchVariants,
  fetchAllVariants,
  deleteVariant,
  updateVariantStatus,
} from "@/store/thunks/variantThunks";

import {
  setVariantSearch,
  clearVariantMessages,
} from "@/store/slices/variantSlice";

export default function VariantsPage() {
  const dispatch = useDispatch();

  const {
    items,
    allItems,
    filters,
    listLoading,
    loading,
    error,
    successMessage,
  } = useSelector((state) => state.variants);

  const authAdmin = useSelector((state) => state.auth.admin);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const canCreate = !!authAdmin || !!isAuthenticated;

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const refreshActiveList = () => {
    dispatch(
      fetchVariants({
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        search: filters?.search || "",
      })
    );
  };

  const refreshAllList = () => {
    dispatch(fetchAllVariants());
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
      dispatch(clearVariantMessages());
    };
  }, [dispatch]);

  const displayedVariants = useMemo(() => {
    const source =
      Array.isArray(allItems) && allItems.length > 0 ? allItems : items || [];

    const searchValue = (filters?.search || "").trim().toLowerCase();

    if (!searchValue) return source;

    return source.filter((variant) => {
      const name = String(variant?.name || "").toLowerCase();
      const sku = String(variant?.sku || "").toLowerCase();
      const productName = String(variant?.product?.name || "").toLowerCase();

      return (
        name.includes(searchValue) ||
        sku.includes(searchValue) ||
        productName.includes(searchValue)
      );
    });
  }, [allItems, items, filters?.search]);

  const totalVariants = displayedVariants.length;

  const handleSearch = (value) => {
    dispatch(setVariantSearch(value));
  };

  const handleReset = () => {
    dispatch(setVariantSearch(""));
  };

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };

  const handleOpenView = (variant) => {
    setSelectedVariant(variant);
    setViewOpen(true);
  };

  const handleOpenEdit = (variant) => {
    setSelectedVariant(variant);
    setEditOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    dispatch(clearVariantMessages());
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedVariant(null);
    dispatch(clearVariantMessages());
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setSelectedVariant(null);
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
      const blob = await variantService.exportVariants("csv");
      downloadBlobFile(blob, `variants-${Date.now()}.csv`);
    } catch (err) {
      alert("Failed to export CSV");
      console.error(err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportXlsx = async () => {
    try {
      setExportLoading(true);
      const blob = await variantService.exportVariants("xlsx");
      downloadBlobFile(blob, `variants-${Date.now()}.xlsx`);
    } catch (err) {
      alert("Failed to export XLSX");
      console.error(err);
    } finally {
      setExportLoading(false);
    }
  };



  const handleDelete = async (variant) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${variant?.name}"?`
    );
    if (!confirmed) return;

    const resultAction = await dispatch(deleteVariant(variant.id));

    if (deleteVariant.fulfilled.match(resultAction)) {
      refreshEverything();
    }
  };

  const handleToggleStatus = async (variant) => {
    const resultAction = await dispatch(
      updateVariantStatus({
        id: variant.id,
        payload: {
          isActive: !variant?.isActive,
        },
      })
    );

    if (updateVariantStatus.fulfilled.match(resultAction)) {
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
            <h1 className="text-2xl font-bold text-slate-900">All Variants</h1>
            <p className="text-sm text-slate-500">
              View and manage all product variants from one place.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Total Variants:{" "}
            <span className="font-semibold text-slate-700">{totalVariants}</span>
          </div>
        </div>
      </div>

      <VariantsToolbar
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

      <VariantsTable
        variants={displayedVariants}
        loading={tableLoading}
        onViewVariant={handleOpenView}
        onEditVariant={handleOpenEdit}
        onDeleteVariant={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <CreateVariantDrawer
        open={createOpen}
        products={[]}
        onClose={handleCloseCreate}
        onSuccess={() => {
          handleCloseCreate();
          refreshEverything();
        }}
      />

      <EditVariantDrawer
        open={editOpen}
        variant={selectedVariant}
        products={[]}
        onClose={handleCloseEdit}
        onSuccess={() => {
          handleCloseEdit();
          refreshEverything();
        }}
      />

      <ViewVariantDrawer
        open={viewOpen}
        variant={selectedVariant}
        onClose={handleCloseView}
      />
    </div>
  );
}