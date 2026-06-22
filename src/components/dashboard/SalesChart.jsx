import { SALES_WEEK_LABELS, SALES_WEEK_DATA } from '../../utils/dashboardData';

const series = [
  { key: 'revenue', label: 'Revenue', color: '#0055d4' },
  { key: 'newAgencies', label: 'New Agencies', color: '#16a34a' },
  { key: 'renewals', label: 'Renewals', color: '#ea580c' },
];

function buildPath(values, width, height, max) {
  const step = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * (height - 8) - 4;
    return `${x},${y}`;
  });
  return points.join(' ');
}

export default function SalesChart() {
  const width = 560;
  const height = 200;
  const max = Math.max(...Object.values(SALES_WEEK_DATA).flat()) * 1.1;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Sales Overview</h2>
          <p className="text-xs text-gray-500">Platform revenue and subscription activity</p>
        </div>
        <select className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 outline-none">
          <option>This Week</option>
          <option>This Month</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="mb-3 flex flex-wrap gap-4">
        {series.map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height + 24}`} className="w-full min-w-[320px]">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={0}
              y1={height * t}
              x2={width}
              y2={height * t}
              stroke="#f3f4f6"
              strokeWidth={1}
            />
          ))}
          {series.map(({ key, color }) => (
            <polyline
              key={key}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={buildPath(SALES_WEEK_DATA[key], width, height, max)}
            />
          ))}
          {SALES_WEEK_LABELS.map((label, i) => (
            <text
              key={label}
              x={(width / (SALES_WEEK_LABELS.length - 1)) * i}
              y={height + 18}
              textAnchor="middle"
              className="fill-gray-400 text-[10px]"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
