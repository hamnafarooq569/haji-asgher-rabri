"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/lib/axios";

import CategoriesToolbar from "@/components/admin/categories/CategoriesToolbar";
import CategoriesTable from "@/components/admin/categories/CategoriesTable";
import CreateCategoryDrawer from "@/components/admin/categories/CreateCategoryDrawer";
import EditCategoryDrawer from "@/components/admin/categories/EditCategoryDrawer";
import ViewCategoryDrawer from "@/components/admin/categories/ViewCategoryDrawer";

import {
  fetchCategories,
  fetchAllCategories,
  deleteCategory,
  restoreCategory,
  updateCategoryStatus,
} from "@/store/thunks/categoryThunks";

import {
  setCategorySearch,
  clearCategoryMessages,
} from "@/store/slices/categorySlice";

export default function CategoriesPage() {
  const dispatch = useDispatch();

  const {
    items,
    allItems,
    filters,
    listLoading,
    loading,
    error,
    successMessage,
  } = useSelector((state) => state.categories);

  const authAdmin = useSelector((state) => state.auth.admin);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const canCreate = !!authAdmin || !!isAuthenticated;

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const refreshActiveList = () => {
    dispatch(
      fetchCategories({
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        search: filters?.search || "",
      })
    );
  };

  const refreshAllList = () => {
    dispatch(fetchAllCategories());
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
      dispatch(clearCategoryMessages());
    };
  }, [dispatch]);

  const displayedCategories = useMemo(() => {
    const source =
      Array.isArray(allItems) && allItems.length > 0 ? allItems : items || [];

    const searchValue = (filters?.search || "").trim().toLowerCase();

    if (!searchValue) return source;

    return source.filter((category) => {
      const name = String(category?.name || "").toLowerCase();
      const slug = String(category?.slug || "").toLowerCase();

      return name.includes(searchValue) || slug.includes(searchValue);
    });
  }, [allItems, items, filters?.search]);

  const totalCategories = displayedCategories.length;

  const handleSearch = (value) => {
    dispatch(setCategorySearch(value));
  };

  const handleReset = () => {
    dispatch(setCategorySearch(""));
  };

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };

  const handleOpenView = (category) => {
    setSelectedCategory(category);
    setViewOpen(true);
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setEditOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    dispatch(clearCategoryMessages());
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedCategory(null);
    dispatch(clearCategoryMessages());
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setSelectedCategory(null);
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

      const response = await axiosInstance.get("/categories/export/csv", {
        params: {
          search: filters?.search || "",
        },
        responseType: "blob",
      });

      downloadBlobFile(response.data, `categories-${Date.now()}.csv`);
    } catch (err) {
      alert(await getErrorMessageFromBlob(err, "Failed to export CSV"));
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportXlsx = async () => {
    try {
      setExportLoading(true);

      const response = await axiosInstance.get("/categories/export/xlsx", {
        params: {
          search: filters?.search || "",
        },
        responseType: "blob",
      });

      downloadBlobFile(response.data, `categories-${Date.now()}.xlsx`);
    } catch (err) {
      alert(await getErrorMessageFromBlob(err, "Failed to export XLSX"));
    } finally {
      setExportLoading(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category?.name}"?`
    );
    if (!confirmed) return;

    const resultAction = await dispatch(deleteCategory(category.id));

    if (deleteCategory.fulfilled.match(resultAction)) {
      refreshEverything();
    }
  };

  const handleRestore = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to restore "${category?.name}"?`
    );
    if (!confirmed) return;

    const resultAction = await dispatch(restoreCategory(category.id));

    if (restoreCategory.fulfilled.match(resultAction)) {
      refreshEverything();
    }
  };

  const handleToggleStatus = async (category) => {
    const resultAction = await dispatch(
      updateCategoryStatus({
        id: category.id,
        payload: {
          isActive: !category?.isActive,
        },
      })
    );

    if (updateCategoryStatus.fulfilled.match(resultAction)) {
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
            <h1 className="text-2xl font-bold text-slate-900">All Categories</h1>
            <p className="text-sm text-slate-500">
              View and manage all product categories from one place.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Total Categories:{" "}
            <span className="font-semibold text-slate-700">
              {totalCategories}
            </span>
          </div>
        </div>
      </div>

      <CategoriesToolbar
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

      <CategoriesTable
        categories={displayedCategories}
        loading={tableLoading}
        onViewCategory={handleOpenView}
        onEditCategory={handleOpenEdit}
        onDeleteCategory={handleDelete}
        onRestoreCategory={handleRestore}
        onToggleStatus={handleToggleStatus}
      />

      <CreateCategoryDrawer
        open={createOpen}
        onClose={handleCloseCreate}
        onSuccess={() => {
          handleCloseCreate();
          refreshEverything();
        }}
      />

      <EditCategoryDrawer
        open={editOpen}
        category={selectedCategory}
        onClose={handleCloseEdit}
        onSuccess={() => {
          handleCloseEdit();
          refreshEverything();
        }}
      />

      <ViewCategoryDrawer
        open={viewOpen}
        category={selectedCategory}
        onClose={handleCloseView}
      />
    </div>
  );
}