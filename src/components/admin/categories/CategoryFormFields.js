"use client";

export default function CategoryFormFields({
  form,
  setForm,
  loading = false,
  errors = {},
}) {
  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Category Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Enter category name"
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
        />
        {errors?.name ? (
          <p className="mt-1 text-sm text-rose-600">{errors.name}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Optional description"
          disabled={loading}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="categoryIsActive"
          type="checkbox"
          checked={!!form.isActive}
          onChange={(e) => updateField("isActive", e.target.checked)}
          disabled={loading}
          className="h-4 w-4"
        />
        <label
          htmlFor="categoryIsActive"
          className="text-sm font-medium text-slate-700"
        >
          Active
        </label>
      </div>
    </div>
  );
}