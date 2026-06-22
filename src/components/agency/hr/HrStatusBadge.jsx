const statusStyles = {
  Active: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-orange-100 text-orange-700',
  Inactive: 'bg-gray-100 text-gray-600',
};

export default function HrStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        statusStyles[status] ?? 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  );
}
