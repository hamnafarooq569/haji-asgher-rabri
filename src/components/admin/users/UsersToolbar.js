"use client";

export default function UsersToolbar({
  onExportCsv,
  onExportXlsx,
  onCreateUser,
  onSearchChange,
  searchValue,
  exportLoading,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Users Actions</h3>
        <p className="text-sm text-slate-500">
          Search, export or manage user records.
        </p>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:flex-wrap">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search users from backend..."
          className="h-11 min-w-[260px] rounded-xl border border-slate-300 px-4 outline-none focus:border-slate-400"
        />

        <button
          onClick={onExportCsv}
          disabled={exportLoading}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Export CSV
        </button>

        <button
          onClick={onExportXlsx}
          disabled={exportLoading}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Export XLSX
        </button>

        <button
          onClick={onCreateUser}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create New User
        </button>
      </div>
    </div>
  );
}