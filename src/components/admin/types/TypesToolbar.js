"use client";

import { useEffect, useState } from "react";

export default function TypesToolbar({
  initialSearch = "",
  onSearch,
  onReset,
  onCreate,
  loading = false,
  canCreate = false,
  viewMode = "active",
  onChangeViewMode,
}) {
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setSearch(initialSearch || "");
  }, [initialSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(search.trim());
  };

  const handleReset = () => {
    setSearch("");
    onReset?.();
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form onSubmit={handleSubmit} className="flex w-full max-w-2xl gap-2">
          <input
            type="text"
            placeholder="Search types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-lg border px-3 text-sm"
          />

          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-lg bg-black px-5 text-sm text-white disabled:opacity-60"
          >
            Search
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="h-11 rounded-lg border px-5 text-sm"
          >
            Reset
          </button>
        </form>

        {canCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="h-11 rounded-lg bg-green-600 px-5 text-sm text-white"
          >
            Create Type
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {["active", "deleted", "all"].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChangeViewMode?.(mode)}
            className={`rounded-lg px-4 py-2 text-sm border ${
              viewMode === mode
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700"
            }`}
          >
            {mode === "active"
              ? "Active Types"
              : mode === "deleted"
              ? "Deleted Types"
              : "All Types"}
          </button>
        ))}
      </div>
    </div>
  );
}