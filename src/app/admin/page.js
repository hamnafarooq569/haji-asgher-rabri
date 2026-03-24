"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  Wallet,
  Clock3,
  Users,
  Package,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function formatCurrency(value) {
  return `PKR ${Number(value || 0).toLocaleString()}`;
}

function StatCard({ title, value, icon, subtitle = "" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
          {subtitle ? (
            <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });

  const [sales, setSales] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, salesRes, recentOrdersRes, topProductsRes] =
        await Promise.all([
          fetch("/api/dashboard/stats", { cache: "no-store" }),
          fetch("/api/dashboard/sales", { cache: "no-store" }),
          fetch("/api/dashboard/recent-orders", { cache: "no-store" }),
          fetch("/api/dashboard/top-products", { cache: "no-store" }),
        ]);

      const [statsData, salesData, recentOrdersData, topProductsData] =
        await Promise.all([
          statsRes.json(),
          salesRes.json(),
          recentOrdersRes.json(),
          topProductsRes.json(),
        ]);

      if (!statsRes.ok) throw new Error(statsData?.error || "Failed to load stats");
      if (!salesRes.ok) throw new Error(salesData?.error || "Failed to load sales");
      if (!recentOrdersRes.ok) {
        throw new Error(recentOrdersData?.error || "Failed to load recent orders");
      }
      if (!topProductsRes.ok) {
        throw new Error(topProductsData?.error || "Failed to load top products");
      }

      setStats(statsData || {});
      setSales(Array.isArray(salesData) ? salesData : []);
      setRecentOrders(Array.isArray(recentOrdersData) ? recentOrdersData : []);
      setTopProducts(Array.isArray(topProductsData) ? topProductsData : []);
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const salesChartData = useMemo(() => {
    return sales.map((item) => ({
      ...item,
      day: item?.date
        ? new Date(item.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })
        : "-",
      total: Number(item?.total || 0),
    }));
  }, [sales]);

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Welcome to the restaurant admin panel.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboardData}
            className="rounded-md border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Today's Orders"
          value={loading ? "..." : stats.ordersToday}
          icon={<ShoppingBag size={20} />}
        />

        <StatCard
          title="Today's Revenue"
          value={loading ? "..." : formatCurrency(stats.revenueToday)}
          icon={<Wallet size={20} />}
        />

        <StatCard
          title="Pending Orders"
          value={loading ? "..." : stats.pendingOrders}
          icon={<Clock3 size={20} />}
        />

        <StatCard
          title="Customers"
          value={loading ? "..." : stats.totalCustomers}
          icon={<Users size={20} />}
        />

        <StatCard
          title="Products"
          value={loading ? "..." : stats.totalProducts}
          icon={<Package size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">
              Sales Overview
            </h2>
          </div>

          <div className="h-[320px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading sales chart...
              </div>
            ) : salesChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No sales data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Top Selling Products
          </h2>

          {loading ? (
            <div className="text-sm text-slate-500">Loading top products...</div>
          ) : topProducts.length === 0 ? (
            <div className="text-sm text-slate-500">No top products found.</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.productId || index}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {product?.name || "Unknown Product"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Product ID: {product?.productId || "-"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {product?.orders || 0}
                    </p>
                    <p className="text-xs text-slate-500">Qty Sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Orders
          </h2>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Loading recent orders...</div>
        ) : recentOrders.length === 0 ? (
          <div className="text-sm text-slate-500">No recent orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-3 py-3 font-medium text-slate-600">Order ID</th>
                  <th className="px-3 py-3 font-medium text-slate-600">Customer</th>
                  <th className="px-3 py-3 font-medium text-slate-600">Email</th>
                  <th className="px-3 py-3 font-medium text-slate-600">Total</th>
                  <th className="px-3 py-3 font-medium text-slate-600">Payment</th>
                  <th className="px-3 py-3 font-medium text-slate-600">Status</th>
                  <th className="px-3 py-3 font-medium text-slate-600">Created</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-3 py-3 text-slate-800">
                      #{order?.id}
                    </td>

                    <td className="px-3 py-3 font-medium text-slate-800">
                      {order?.user?.name || order?.customerName || "-"}
                    </td>

                    <td className="px-3 py-3 text-slate-500">
                      {order?.user?.email || order?.email || "-"}
                    </td>

                    <td className="px-3 py-3 text-slate-800">
                      {formatCurrency(order?.total || order?.totalAmount || 0)}
                    </td>

                    <td className="px-3 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {order?.paymentStatus || "-"}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {order?.status || "-"}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-slate-500">
                      {order?.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}