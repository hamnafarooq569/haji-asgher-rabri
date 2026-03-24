"use client";

import { useEffect, useRef, useState } from "react";

export default function AddonsToolbar({
  initialSearch = "",
  onSearch,
  onReset,
  onCreate,
  onExportCsv,
  onExportXlsx,
  loading = false,
  canCreate = false,
}) {
  const [search, setSearch] = useState(initialSearch || "");
  const debounceRef = useRef(null);

  useEffect(() => {
    setSearch(initialSearch || "");
  }, [initialSearch]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const trimmed = search.trim();

      if (trimmed === "") {
        onReset?.();
      } else {
        onSearch?.(trimmed);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [search, onSearch, onReset]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4">

      <div className="flex w-full max-w-[500px] gap-2">
        <input
          type="text"
          placeholder="Search addons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-2 flex-wrap">

        <button
          onClick={onExportCsv}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Export CSV
        </button>

        <button
          onClick={onExportXlsx}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Export XLSX
        </button>

        {canCreate && (
          <button
            onClick={onCreate}
            className="rounded-md bg-[#22c55e] px-4 py-2 text-sm text-white"
          >
            Create Addon
          </button>
        )}

      </div>
    </div>
  );
}