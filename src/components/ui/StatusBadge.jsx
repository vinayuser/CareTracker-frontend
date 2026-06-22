const statusStyles = {
  Accepted: 'bg-green-50 text-success border-green-200',
  Pending: 'bg-orange-50 text-warning border-orange-200',
  Expired: 'bg-red-50 text-danger border-red-200',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        statusStyles[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'
      }`}
    >
      {status}
    </span>
  );
}
