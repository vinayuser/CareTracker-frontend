export default function AgenciesPlanChart({ data, total }) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        No agency data available
      </div>
    );
  }

  let gradient = 'conic-gradient(';
  let cursor = 0;
  data.forEach(({ percent, color }, index) => {
    gradient += `${color} ${cursor}% ${cursor + percent}%`;
    cursor += percent;
    if (index < data.length - 1) gradient += ', ';
  });
  gradient += ')';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Agencies by Plan</h2>
        <p className="text-xs text-gray-500">Distribution across subscription tiers</p>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative h-36 w-36 shrink-0">
          <div className="h-full w-full rounded-full" style={{ background: gradient }} />
          <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-2xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-500">Total</span>
          </div>
        </div>

        <ul className="flex-1 space-y-2">
          {data.map(({ name, count, color, percent }) => (
            <li key={name} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="truncate">{name}</span>
              </span>
              <span className="shrink-0 text-gray-500">
                {count} ({percent}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
