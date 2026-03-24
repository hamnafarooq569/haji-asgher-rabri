"use client";

export default function AddonFormFields({
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
          Addon Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Enter addon name"
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
        />
        {errors?.name ? (
          <p className="mt-1 text-sm text-rose-600">{errors.name}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Price
        </label>
        <input
          type="number"
          min="0"
          value={form.price}
          onChange={(e) => updateField("price", e.target.value)}
          placeholder="Enter addon price"
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none disabled:bg-slate-50"
        />
        {errors?.price ? (
          <p className="mt-1 text-sm text-rose-600">{errors.price}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="addonIsActive"
          type="checkbox"
          checked={!!form.isActive}
          onChange={(e) => updateField("isActive", e.target.checked)}
          disabled={loading}
          className="h-4 w-4"
        />
        <label
          htmlFor="addonIsActive"
          className="text-sm font-medium text-slate-700"
        >
          Active
        </label>
      </div>
    </div>
  );
}