"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/lib/axios";

import ProductsToolbar from "@/components/admin/products/ProductsToolbar";
import ProductsTable from "@/components/admin/products/ProductsTable";
import ProductViewDrawer from "@/components/admin/products/ProductViewDrawer";
import ProductCreateDrawer from "@/components/admin/products/ProductCreateDrawer";
import ProductEditDrawer from "@/components/admin/products/ProductEditDrawer";

import {
  fetchProducts,
  fetchAllProducts,
  fetchProductCategories,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  updateProductStatus,
} from "@/store/thunks/productThunks";

import { fetchAllAddons } from "@/store/thunks/addonThunks";

import {
  setProductSearch,
  clearCurrentProduct,
  clearProductMessages,
} from "@/store/slices/productSlice";

export default function ProductsPage() {
  const dispatch = useDispatch();

  const {
    items,
    allItems,
    filters,
    listLoading,
    loading,
    detailsLoading,
    submitLoading,
    categories,
    currentProduct,
    error,
    successMessage,
  } = useSelector((state) => state.products);

  const addonItems = useSelector((state) => state.addons?.allItems || []);
  const authAdmin = useSelector((state) => state.auth.admin);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const canCreate = !!authAdmin || !!isAuthenticated;

  const [viewOpen, setViewOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const refreshActiveList = () => {
    dispatch(
      fetchProducts({
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        search: filters?.search || "",
      })
    );
  };

  const refreshAllList = () => {
    dispatch(fetchAllProducts());
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
    dispatch(fetchAllAddons());
  }, [dispatch]);

  useEffect(() => {
    if (!categories?.length) {
      dispatch(fetchProductCategories());
    }
  }, [dispatch, categories?.length]);

  useEffect(() => {
    return () => {
      dispatch(clearCurrentProduct());
      dispatch(clearProductMessages());
    };
  }, [dispatch]);

  const displayedProducts = useMemo(() => {
    const source =
      Array.isArray(allItems) && allItems.length > 0 ? allItems : items || [];

    const searchValue = (filters?.search || "").trim().toLowerCase();

    if (!searchValue) return source;

    return source.filter((product) => {
      const name = String(product?.name || "").toLowerCase();
      const categoryName = String(product?.category?.name || "").toLowerCase();
      const slug = String(product?.slug || "").toLowerCase();

      return (
        name.includes(searchValue) ||
        categoryName.includes(searchValue) ||
        slug.includes(searchValue)
      );
    });
  }, [allItems, items, filters?.search]);

  const totalProducts = displayedProducts.length;

  const handleSearch = (value) => {
    dispatch(setProductSearch(value));
  };

  const handleReset = () => {
    dispatch(setProductSearch(""));
  };

  const handleOpenView = async (product) => {
    if (!product?.id) return;

    setViewOpen(true);
    dispatch(clearCurrentProduct());
    await dispatch(fetchProductById(product.id));
  };

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };

  const handleOpenEdit = async (product) => {
    if (!product?.id) return;

    setEditOpen(true);
    dispatch(clearCurrentProduct());
    await dispatch(fetchProductById(product.id));
  };

  const handleCloseView = () => {
    setViewOpen(false);
    dispatch(clearCurrentProduct());
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    dispatch(clearProductMessages());
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    dispatch(clearCurrentProduct());
    dispatch(clearProductMessages());
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

      const response = await axiosInstance.get("/products/export/csv", {
        params: {
          search: filters?.search || "",
        },
        responseType: "blob",
      });

      downloadBlobFile(response.data, `products-${Date.now()}.csv`);
    } catch (err) {
      alert(await getErrorMessageFromBlob(err, "Failed to export CSV"));
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportXlsx = async () => {
    try {
      setExportLoading(true);

      const response = await axiosInstance.get("/products/export/xlsx", {
        params: {
          search: filters?.search || "",
        },
        responseType: "blob",
      });

      downloadBlobFile(response.data, `products-${Date.now()}.xlsx`);
    } catch (err) {
      alert(await getErrorMessageFromBlob(err, "Failed to export XLSX"));
    } finally {
      setExportLoading(false);
    }
  };

  const handleCreateSubmit = async (payload) => {
    const resultAction = await dispatch(createProduct(payload));

    if (createProduct.fulfilled.match(resultAction)) {
      handleCloseCreate();
      refreshEverything();
    }
  };

  const handleEditSubmit = async (payload) => {
    if (!currentProduct?.id) return;

    const resultAction = await dispatch(
      updateProduct({
        id: currentProduct.id,
        payload,
      })
    );

    if (updateProduct.fulfilled.match(resultAction)) {
      handleCloseEdit();
      refreshEverything();
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product?.name}"?`
    );
    if (!confirmed) return;

    const resultAction = await dispatch(deleteProduct(product.id));

    if (deleteProduct.fulfilled.match(resultAction)) {
      refreshEverything();
    }
  };

  const handleRestore = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to restore "${product?.name}"?`
    );
    if (!confirmed) return;

    const resultAction = await dispatch(restoreProduct(product.id));

    if (restoreProduct.fulfilled.match(resultAction)) {
      refreshEverything();
    }
  };

  const handleToggleStatus = async (product) => {
    const resultAction = await dispatch(
      updateProductStatus({
        id: product.id,
        payload: {
          isActive: !product?.isActive,
        },
      })
    );

    if (updateProductStatus.fulfilled.match(resultAction)) {
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
            <h1 className="text-2xl font-bold text-slate-900">All Products</h1>
            <p className="text-sm text-slate-500">
              View and manage all products from one place.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Total Products:{" "}
            <span className="font-semibold text-slate-700">
              {totalProducts}
            </span>
          </div>
        </div>
      </div>

      <ProductsToolbar
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

      <ProductsTable
        products={displayedProducts}
        loading={tableLoading}
        onViewProduct={handleOpenView}
        onEditProduct={handleOpenEdit}
        onDeleteProduct={handleDelete}
        onRestoreProduct={handleRestore}
        onToggleStatus={handleToggleStatus}
      />

      <ProductViewDrawer
        open={viewOpen}
        onClose={handleCloseView}
        product={currentProduct}
        loading={detailsLoading}
      />

      <ProductCreateDrawer
        open={createOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreateSubmit}
        categories={categories || []}
        addons={addonItems || []}
        loading={submitLoading}
      />

      <ProductEditDrawer
        open={editOpen}
        onClose={handleCloseEdit}
        product={currentProduct}
        onSubmit={handleEditSubmit}
        categories={categories || []}
        addons={addonItems || []}
        loading={submitLoading || detailsLoading}
      />
    </div>
  );
}