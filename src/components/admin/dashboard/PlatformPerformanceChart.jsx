const W = 760;
const H = 280;
const PAD = { l: 52, r: 64, t: 18, b: 32 };

/** Showcase series matching the Super Admin mock (weekly combo chart). */
export const PERFORMANCE_SERIES = [
  { label: 'Apr 22', revenue: 1.85, agencies: 88, claims: 3100 },
  { label: 'Apr 29', revenue: 2.15, agencies: 96, claims: 3600 },
  { label: 'May 6', revenue: 1.95, agencies: 104, claims: 3900 },
  { label: 'May 13', revenue: 2.45, agencies: 112, claims: 4400 },
  { label: 'May 20', revenue: 2.25, agencies: 118, claims: 4700 },
  { label: 'May 27', revenue: 2.75, agencies: 128, claims: 5200 },
  { label: 'Jun 3', revenue: 2.55, agencies: 136, claims: 5600 },
  { label: 'Jun 10', revenue: 3.15, agencies: 148, claims: 6300 },
  { label: 'Jun 17', revenue: 2.95, agencies: 158, claims: 6800 },
];

const REV_MAX = 4;
const AGENCY_MAX = 200;
const CLAIMS_MAX = 8000;

function xAt(i, count) {
  const inner = W - PAD.l - PAD.r;
  const step = count > 1 ? inner / (count - 1) : inner / 2;
  return PAD.l + i * step;
}

function yAt(value, max) {
  const usable = H - PAD.t - PAD.b;
  return PAD.t + usable - (Math.max(0, value) / max) * usable;
}

function linePath(values, max) {
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i, values.length)} ${yAt(v, max)}`)
    .join(' ');
}

export default function PlatformPerformanceChart({ series = PERFORMANCE_SERIES }) {
  const data = series.length ? series : PERFORMANCE_SERIES;
  const n = data.length;
  const revenue = data.map((d) => d.revenue);
  const agencies = data.map((d) => d.agencies);
  const claims = data.map((d) => d.claims);
  const inner = W - PAD.l - PAD.r;
  const barW = Math.max(14, (inner / n) * 0.42);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-gray-900">Platform Performance Overview</h2>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[3px] bg-[#5B7CFA]" /> Revenue (USD)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 border-t-2 border-[#7C5CFC]" /> Agency Growth
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 border-t-2 border-[#22C55E]" /> Claims Processed
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 outline-none">
            <option>This Month</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
          <button type="button" className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            Compare
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Platform performance combo chart">
        {[0, 1, 2, 3, 4].map((tick) => {
          const y = yAt(tick, REV_MAX);
          return (
            <g key={tick}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#EEF2F7" />
              <text x={PAD.l - 8} y={y + 3} textAnchor="end" className="fill-gray-400 text-[10px]">
                {tick === 0 ? '$0' : `$${tick}M`}
              </text>
              <text x={W - PAD.r + 8} y={y + 3} className="fill-[#7C5CFC] text-[10px]">
                {(AGENCY_MAX / 4) * tick}
              </text>
              <text x={W - 8} y={y + 3} textAnchor="end" className="fill-[#22C55E] text-[10px]">
                {tick === 0 ? '0' : `${(CLAIMS_MAX / 4) * tick / 1000}K`}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const x = xAt(i, n) - barW / 2;
          const h = (d.revenue / REV_MAX) * (H - PAD.t - PAD.b);
          return (
            <rect
              key={`bar-${d.label}`}
              x={x}
              y={yAt(d.revenue, REV_MAX)}
              width={barW}
              height={Math.max(4, h)}
              rx="4"
              fill="#5B7CFA"
            />
          );
        })}

        <path d={linePath(agencies, AGENCY_MAX)} fill="none" stroke="#7C5CFC" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={linePath(claims, CLAIMS_MAX)} fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinejoin="round" />

        {agencies.map((v, i) => (
          <circle key={`a-${i}`} cx={xAt(i, n)} cy={yAt(v, AGENCY_MAX)} r="4" fill="#fff" stroke="#7C5CFC" strokeWidth="2.25" />
        ))}
        {claims.map((v, i) => (
          <circle key={`c-${i}`} cx={xAt(i, n)} cy={yAt(v, CLAIMS_MAX)} r="4" fill="#fff" stroke="#22C55E" strokeWidth="2.25" />
        ))}

        {data.map((d, i) => (
          <text key={`x-${d.label}`} x={xAt(i, n)} y={H - 8} textAnchor="middle" className="fill-gray-400 text-[10px]">
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
