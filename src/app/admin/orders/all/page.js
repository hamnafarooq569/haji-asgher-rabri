"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import OrdersToolbar from "@/components/admin/orders/OrdersToolbar";
import OrderDetailsDrawer from "@/components/admin/orders/OrderDetailsDrawer";
import OrderCustomerEditDrawer from "@/components/admin/orders/OrderCustomerEditDrawer";
import OrderItemsEditDrawer from "@/components/admin/orders/OrderItemsEditDrawer";
import {
  fetchOrders,
  fetchOrderById,
  restoreOrderThunk,
  changeOrderStatus,
  fetchPublicProducts,
} from "@/store/thunks/orderThunks";
import { clearSelectedOrder } from "@/store/slices/orderSlice";
import axiosInstance from "@/lib/axios";

export default function AllOrdersPage() {
  const dispatch = useDispatch();

  const { orders, loading, error, selectedOrder, detailsLoading } = useSelector(
    (state) => state.orders
  );

  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  const [publicProducts, setPublicProducts] = useState([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isCustomerEditDrawerOpen, setIsCustomerEditDrawerOpen] =
    useState(false);
  const [customerEditOrder, setCustomerEditOrder] = useState(null);
  const [customerEditLoading, setCustomerEditLoading] = useState(false);

  const [isItemsEditDrawerOpen, setIsItemsEditDrawerOpen] = useState(false);
  const [itemsEditOrder, setItemsEditOrder] = useState(null);
  const [itemsEditLoading, setItemsEditLoading] = useState(false);

  const loadOrders = async (customFilters = filters) => {
    const params = {};

    if (customFilters.search) params.search = customFilters.search;
    if (customFilters.status) params.status = customFilters.status;

    await dispatch(fetchOrders(params));
  };

  const loadPublicProducts = async () => {
    try {
      const result = await dispatch(
        fetchPublicProducts({
          page: 1,
          limit: 50,
          sort: "newest",
        })
      ).unwrap();

      console.log("PUBLIC PRODUCTS RESPONSE:", result);

      const products = Array.isArray(result?.products)
        ? result.products
        : [];

      setPublicProducts(products);
    } catch (err) {
      console.error("Failed to load public products", err);
      setPublicProducts([]);
    }
  };

  useEffect(() => {
    loadOrders(filters);
  }, [dispatch, filters]);

  useEffect(() => {
    loadPublicProducts();
  }, [dispatch]);

  const handleSearch = (searchValue) => {
    setFilters((prev) => ({
      ...prev,
      search: searchValue,
    }));
  };

  const handleStatusChangeFilter = (statusValue) => {
    setFilters((prev) => ({
      ...prev,
      status: statusValue,
    }));
  };

  const handleRefresh = () => {
    loadOrders(filters);
  };

  const handleViewOrder = async (order) => {
    if (!order?.id) return;

    setIsDrawerOpen(true);
    await dispatch(fetchOrderById(order.id));
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    dispatch(clearSelectedOrder());
  };

  const handlePrintOrder = async (order) => {
    if (!order?.id) return;

    try {
      const response = await axiosInstance.get(`/orders/${order.id}/print`);
      openOrderDocumentWindow(response.data, "print");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load print data");
    }
  };

  const handleInvoiceOrder = async (order) => {
    if (!order?.id) return;

    try {
      const response = await axiosInstance.get(`/orders/${order.id}/invoice`);
      openOrderDocumentWindow(response.data, "invoice");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load invoice");
    }
  };

  const handleDeleteOrder = async (order) => {
    if (!order?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel/delete this order?"
    );

    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/orders/${order.id}`);
      await loadOrders();

      if (selectedOrder?.id === order.id) {
        handleCloseDrawer();
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleRestoreOrder = async (order) => {
    if (!order?.id) return;

    try {
      await dispatch(restoreOrderThunk(order.id)).unwrap();
      await loadOrders();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to restore order");
    }
  };

  const handleOrderStatusUpdate = async (order, nextStatus) => {
    if (!order?.id || !nextStatus) return;

    const currentStatus = order?.orderStatus || order?.status;
    if (currentStatus === nextStatus) return;

    try {
      await dispatch(
        changeOrderStatus({
          id: order.id,
          status: nextStatus,
        })
      ).unwrap();

      await loadOrders();

      if (selectedOrder?.id === order.id) {
        await dispatch(fetchOrderById(order.id));
      }
    } catch (err) {
      alert(err?.message || "Failed to update order status");
    }
  };

  const handleOpenCustomerEditDrawer = async (order) => {
    if (!order?.id) return;

    const resultAction = await dispatch(fetchOrderById(order.id));
    const fullOrder = resultAction.payload?.order || resultAction.payload || null;

    setCustomerEditOrder(fullOrder);
    setIsCustomerEditDrawerOpen(true);
  };

  const handleCloseCustomerEditDrawer = () => {
    setIsCustomerEditDrawerOpen(false);
    setCustomerEditOrder(null);
  };

const openOrderDocumentWindow = (payload, mode = "invoice") => {
  const data = payload?.invoice || payload?.print || payload || {};
  const customer = data?.customer || {};
  const items = Array.isArray(data?.items) ? data.items : [];
  const totals = data?.totals || {};

  const rowsHtml = items
    .map(
      (item, index) => `
        <tr>
          <td style="padding:10px;border:1px solid #ddd;">${index + 1}</td>
          <td style="padding:10px;border:1px solid #ddd;">${item.productName || "-"}</td>
          <td style="padding:10px;border:1px solid #ddd;">${item.variantName || "-"}</td>
          <td style="padding:10px;border:1px solid #ddd;">${item.quantity || 0}</td>
          <td style="padding:10px;border:1px solid #ddd;">PKR ${Number(item.unitPrice || 0).toLocaleString()}</td>
          <td style="padding:10px;border:1px solid #ddd;">PKR ${Number(item.lineTotal || 0).toLocaleString()}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <html>
      <head>
        <title>${mode === "print" ? "Order Print" : "Invoice"} - ${data.orderNumber || ""}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1,h2,h3,p { margin: 0 0 10px 0; }
          .section { margin-bottom: 24px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .muted { color: #6b7280; }
          .total-box { margin-top: 16px; text-align: right; font-size: 18px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="section">
          <h1>${mode === "print" ? "Order Print" : "Invoice"}</h1>
          <p class="muted">Order # ${data.orderNumber || "-"}</p>
        </div>

        <div class="section grid">
          <div>
            <h3>Customer</h3>
            <p>${customer.customerName || "-"}</p>
            <p>${customer.mobile || "-"}</p>
            <p>${customer.email || "-"}</p>
            <p>${customer.deliveryAddress || "-"}</p>
          </div>

          <div>
            <h3>Order Info</h3>
            <p>Status: ${data.status || "-"}</p>
            <p>Payment Status: ${data.paymentStatus || "-"}</p>
            <p>Payment Method: ${data.paymentMethod || "-"}</p>
            <p>Created At: ${data.createdAt || "-"}</p>
          </div>
        </div>

        <div class="section">
          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th style="padding:10px;border:1px solid #ddd;">#</th>
                <th style="padding:10px;border:1px solid #ddd;">Product</th>
                <th style="padding:10px;border:1px solid #ddd;">Variant</th>
                <th style="padding:10px;border:1px solid #ddd;">Qty</th>
                <th style="padding:10px;border:1px solid #ddd;">Unit Price</th>
                <th style="padding:10px;border:1px solid #ddd;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="total-box">
            Total: PKR ${Number(totals.totalAmount || 0).toLocaleString()}
          </div>
        </div>
      </body>
    </html>
  `;

  const newWindow = window.open("", "_blank");
  if (!newWindow) return;

  newWindow.document.open();
  newWindow.document.write(html);
  newWindow.document.close();

  if (mode === "print") {
    newWindow.focus();
    setTimeout(() => {
      newWindow.print();
    }, 500);
  }
};

  const handleCustomerEditSubmit = async (formData) => {
    if (!customerEditOrder?.id) return;

    try {
      setCustomerEditLoading(true);

      const existingItems =
        customerEditOrder?.items?.map((item) => ({
          productId: item?.productId || item?.product?.id,
          variantId: item?.variantId || item?.variant?.id,
          quantity: Number(item?.quantity || 1),
          addonIds: Array.isArray(item?.addons)
            ? item.addons
                .map((addon) => addon?.addonId || addon?.id)
                .filter(Boolean)
            : [],
        })) || [];

      const payload = {
        customerName: formData.customerName,
        mobile: formData.mobile,
        altMobile: formData.altMobile || "",
        email: formData.email || "",
        nearestLandmark: formData.nearestLandmark || "",
        deliveryAddress: formData.deliveryAddress,
        deliveryNotes: formData.deliveryNotes || "",
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        status: formData.orderStatus,
        items: existingItems,
      };

      await axiosInstance.put(`/orders/${customerEditOrder.id}`, payload);

      await loadOrders();

      if (selectedOrder?.id === customerEditOrder.id) {
        await dispatch(fetchOrderById(customerEditOrder.id));
      }

      setIsCustomerEditDrawerOpen(false);
      setCustomerEditOrder(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update order");
    } finally {
      setCustomerEditLoading(false);
    }
  };

  const handleOpenItemsEditDrawer = async (order) => {
    if (!order?.id) return;

    const resultAction = await dispatch(fetchOrderById(order.id));
    const fullOrder = resultAction.payload?.order || resultAction.payload || null;

    setItemsEditOrder(fullOrder);
    setIsItemsEditDrawerOpen(true);
  };

  const handleCloseItemsEditDrawer = () => {
    setIsItemsEditDrawerOpen(false);
    setItemsEditOrder(null);
  };

  const handleItemsEditSubmit = async (itemsData) => {
    if (!itemsEditOrder?.id) return;

    try {
      setItemsEditLoading(true);

      const payload = {
        customerName: itemsEditOrder.customerName,
        mobile: itemsEditOrder.mobile,
        altMobile: itemsEditOrder.altMobile || "",
        email: itemsEditOrder.email || "",
        nearestLandmark: itemsEditOrder.nearestLandmark || "",
        deliveryAddress: itemsEditOrder.deliveryAddress,
        deliveryNotes: itemsEditOrder.deliveryNotes || "",
        paymentMethod: itemsEditOrder.paymentMethod,
        paymentStatus: itemsEditOrder.paymentStatus,
        status: itemsEditOrder.status || itemsEditOrder.orderStatus,
        items: itemsData,
      };

      await axiosInstance.put(`/orders/${itemsEditOrder.id}`, payload);

      await loadOrders();

      if (selectedOrder?.id === itemsEditOrder.id) {
        await dispatch(fetchOrderById(itemsEditOrder.id));
      }

      setIsItemsEditDrawerOpen(false);
      setItemsEditOrder(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update order items");
    } finally {
      setItemsEditLoading(false);
    }
  };

  

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Orders</h1>
            <p className="text-sm text-slate-500">
              View and manage all customer orders from one place.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Total Orders:{" "}
            <span className="font-semibold text-slate-700">
              {orders?.length || 0}
            </span>
          </div>
        </div>
      </div>

      <OrdersToolbar
        onSearch={handleSearch}
        onStatusChange={handleStatusChangeFilter}
        onRefresh={handleRefresh}
      />

      {error?.message && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error.message}
        </div>
      )}

      <OrdersTable
        orders={orders}
        loading={loading}
        onViewOrder={handleViewOrder}
        onPrintOrder={handlePrintOrder}
        onInvoiceOrder={handleInvoiceOrder}
        onDeleteOrder={handleDeleteOrder}
        onRestoreOrder={handleRestoreOrder}
        onStatusChange={handleOrderStatusUpdate}
        onEditCustomerOrder={handleOpenCustomerEditDrawer}
        onOpenItemsEdit={handleOpenItemsEditDrawer}
        pageType="all"
      />

      <OrderDetailsDrawer
        isOpen={isDrawerOpen}
        order={selectedOrder}
        loading={detailsLoading}
        onClose={handleCloseDrawer}
        onPrint={handlePrintOrder}
        onInvoice={handleInvoiceOrder}
      />

      <OrderCustomerEditDrawer
        isOpen={isCustomerEditDrawerOpen}
        order={customerEditOrder}
        onClose={handleCloseCustomerEditDrawer}
        onSubmit={handleCustomerEditSubmit}
        loading={customerEditLoading}
      />

      <OrderItemsEditDrawer
        isOpen={isItemsEditDrawerOpen}
        order={itemsEditOrder}
        products={publicProducts}
        onClose={handleCloseItemsEditDrawer}
        onSubmit={handleItemsEditSubmit}
        loading={itemsEditLoading}
      />
    </div>
  );
}