"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSalesReport } from "@/store/thunks/reportThunks";
import reportService from "@/services/reportService";

const formatCurrency = (amount) =>
  `PKR ${Number(amount || 0).toLocaleString()}`;

export default function SalesReportPage() {
  const dispatch = useDispatch();

  const { salesRows, salesSummary, loading, error } = useSelector(
    (state) => state.reports
  );

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    paymentStatus: "",
    orderStatus: "",
    search: "",
  });

  const buildReportParams = () => {
    const params = {
      page: 1,
      limit: 50,
    };

    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    if (filters.orderStatus) params.orderStatus = filters.orderStatus;
    if (filters.search?.trim()) params.search = filters.search.trim();

    return params;
  };

  const loadReport = () => {
    dispatch(fetchSalesReport(buildReportParams()));
  };

  useEffect(() => {
    loadReport();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(fetchSalesReport(buildReportParams()));
    }, 500);

    return () => clearTimeout(timeout);
  }, [filters.search]);

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

  const handleExportCsv = async () => {
    try {
      const blob = await reportService.exportSalesReportCsv(buildReportParams());
      downloadBlobFile(blob, `sales-report-${Date.now()}.csv`);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to export CSV");
    }
  };

  const handleExportXlsx = async () => {
    try {
      const blob = await reportService.exportSalesReportXlsx(buildReportParams());
      downloadBlobFile(blob, `sales-report-${Date.now()}.xlsx`);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to export XLSX");
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Sales",
        value: formatCurrency(salesSummary?.totalSales || 0),
      },
      {
        title: "Total Orders",
        value: salesSummary?.totalOrders || 0,
      },
      {
        title: "Paid Orders",
        value: salesSummary?.paidOrders || 0,
      },
      {
        title: "Cancelled Orders",
        value: salesSummary?.cancelledOrders || 0,
      },
    ],
    [salesSummary]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sales Report</h1>
            <p className="text-sm text-slate-500">
              View daily sales summary, order totals, and payment insights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={handleExportXlsx}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Export XLSX
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              From Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, fromDate: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              To Date
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, toDate: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Payment Status
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  paymentStatus: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              <option value="">All</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Order Status
            </label>
            <select
              value={filters.orderStatus}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  orderStatus: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            >
              <option value="">All</option>
              <option value="RECEIVED">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COOKING">Cooking</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={loadReport}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Apply Filters
            </button>

            <button
              type="button"
              onClick={() => {
                const resetFilters = {
                  fromDate: "",
                  toDate: "",
                  paymentStatus: "",
                  orderStatus: "",
                  search: "",
                };
                setFilters(resetFilters);
                dispatch(fetchSalesReport({ page: 1, limit: 50 }));
              }}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{card.title}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Sales Records
            </h2>
            <p className="text-sm text-slate-500">
              Detailed breakdown of sales transactions.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search orders..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                loadReport();
              }
            }}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-400 sm:max-w-xs"
          />
        </div>

        {error?.message && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error.message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Order #
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Payment Method
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Payment Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Order Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading && salesRows?.length > 0 ? (
                salesRows.map((row, index) => (
                  <tr
                    key={row.id || row.orderNumber || index}
                    className="border-b border-slate-100"
                  >
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {row.orderNumber || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {row.customerName || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {row.paymentMethod || row.payment_method || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {row.paymentStatus || row.payment_status || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {row.orderStatus || row.order_status || row.status || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {formatCurrency(row.totalAmount || row.total || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : !loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No sales data available.
                  </td>
                </tr>
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Loading sales report...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}