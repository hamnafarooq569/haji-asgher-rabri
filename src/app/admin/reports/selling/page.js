"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSellingReport } from "@/store/thunks/reportThunks";
import reportService from "@/services/reportService";

const formatCurrency = (amount) =>
  `PKR ${Number(amount || 0).toLocaleString()}`;

export default function SellingReportPage() {
  const dispatch = useDispatch();

  const { sellingRows, sellingSummary, loading, error } = useSelector(
    (state) => state.reports
  );

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    category: "",
    product: "",
    search: "",
  });

  const buildReportParams = () => {
    const params = {
      page: 1,
      limit: 50,
    };

    if (filters.fromDate) params.from = filters.fromDate;
    if (filters.toDate) params.to = filters.toDate;

    if (filters.category?.trim()) params.category = filters.category.trim();
    if (filters.product?.trim()) params.product = filters.product.trim();
    if (filters.search?.trim()) params.search = filters.search.trim();

    return params;
  };

  const loadReport = () => {
    dispatch(fetchSellingReport(buildReportParams()));
  };

  useEffect(() => {
    loadReport();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadReport();
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
      const blob = await reportService.exportSellingReportCsv(buildReportParams());
      downloadBlobFile(blob, `selling-report-${Date.now()}.csv`);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to export CSV");
    }
  };

  const handleExportXlsx = async () => {
    try {
      const blob = await reportService.exportSellingReportXlsx(buildReportParams());
      downloadBlobFile(blob, `selling-report-${Date.now()}.xlsx`);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to export XLSX");
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        title: "Top Selling Product",
        value: sellingSummary?.topSellingProduct || "-",
      },
      {
        title: "Total Items Sold",
        value: sellingSummary?.totalItemsSold || 0,
      },
      {
        title: "Delivered Orders",
        value: sellingSummary?.deliveredOrders || 0,
      },
      {
        title: "Average Order Value",
        value: formatCurrency(sellingSummary?.averageOrderValue || 0),
      },
    ],
    [sellingSummary]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Selling Report</h1>
            <p className="text-sm text-slate-500">
              View product-wise selling performance and delivery trends.
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
              Category
            </label>
            <input
              type="text"
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              placeholder="Category"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Product
            </label>
            <input
              type="text"
              value={filters.product}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, product: e.target.value }))
              }
              placeholder="Product"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
            />
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
                setFilters({
                  fromDate: "",
                  toDate: "",
                  category: "",
                  product: "",
                  search: "",
                });
                dispatch(fetchSellingReport({ page: 1, limit: 50 }));
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
              Selling Records
            </h2>
            <p className="text-sm text-slate-500">
              Product-wise selling breakdown.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") loadReport();
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
                  Product
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Variants Sold
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Qty Sold
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Revenue
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Last Sold
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading && sellingRows?.length > 0 ? (
                sellingRows.map((row, index) => (
                  <tr
                    key={row.id || row.productName || row.name || index}
                    className="border-b border-slate-100"
                  >
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {row.productName || row.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {row.categoryName || row.category || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {row.variantsSold || row.variantCount || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {row.quantitySold || row.qtySold || row.quantity || 0}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {formatCurrency(row.revenue || row.totalRevenue || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {row.lastSoldAt
                        ? new Date(row.lastSoldAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : !loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No selling data available.
                  </td>
                </tr>
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Loading selling report...
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