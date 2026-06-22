export default function AgencyPanelCard({ title, action, children, bodyClassName = '' }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
