const statusStyles = {
  Active: 'bg-green-50 text-success border-green-200',
  Pending: 'bg-orange-50 text-warning border-orange-200',
  Inactive: 'bg-gray-50 text-gray-500 border-gray-200',
  Suspended: 'bg-red-50 text-danger border-red-200',
};

const dotColors = {
  Active: 'bg-success',
  Pending: 'bg-warning',
  Inactive: 'bg-gray-400',
  Suspended: 'bg-danger',
};

export default function AgencyStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        statusStyles[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[status] ?? 'bg-gray-400'}`} />
      {status}
    </span>
  );
}
