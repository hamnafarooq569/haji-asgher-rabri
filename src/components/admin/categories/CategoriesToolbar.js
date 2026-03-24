"use client";

import { useEffect, useRef, useState } from "react";

export default function CategoriesToolbar({
  initialSearch = "",
  onSearch,
  onReset,
  onCreate,
  onExportCsv,
  onExportXlsx,
  loading = false,
  exportLoading = false,
  canCreate = false,
}) {
  const [search, setSearch] = useState(initialSearch || "");
  const debounceRef = useRef(null);

  useEffect(() => {
    setSearch(initialSearch || "");
  }, [initialSearch]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const trimmed = search.trim();

      if (trimmed === "") {
        onReset?.();
      } else {
        onSearch?.(trimmed);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, onSearch, onReset]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Categories Actions
        </h3>
        <p className="text-sm text-slate-500">
          Search, export or manage category records.
        </p>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:flex-wrap">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
          className="h-11 min-w-[260px] rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        <button
          type="button"
          onClick={onExportCsv}
          disabled={exportLoading}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Export CSV
        </button>

        <button
          type="button"
          onClick={onExportXlsx}
          disabled={exportLoading}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Export XLSX
        </button>

        {canCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Create Category
          </button>
        ) : null}
      </div>
    </div>
  );
}