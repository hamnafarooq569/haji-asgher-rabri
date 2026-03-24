"use client";

export default function RolesToolbar({
  onExportCsv,
  onExportXlsx,
  onCreateRole,
  exportLoading,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Roles Actions</h3>
        <p className="text-sm text-slate-500">
          Export roles list or manage role records.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
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
          onClick={onCreateRole}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create New Role
        </button>
      </div>
    </div>
  );
}