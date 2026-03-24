export default function SidebarSection({ title, collapsed = false, children }) {
  return (
    <div className="space-y-2">
      {!collapsed && (
        <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {title}
        </p>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}