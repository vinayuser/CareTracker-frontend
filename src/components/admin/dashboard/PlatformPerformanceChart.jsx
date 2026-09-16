const W = 760;
const H = 280;
const PAD = { l: 52, r: 64, t: 18, b: 32 };

function niceMax(raw, fallback = 4) {
  const v = Number(raw) || 0;
  if (v <= 0) return fallback;
  const exp = 10 ** Math.floor(Math.log10(v));
  const n = v / exp;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * exp;
}

function formatAxisMoney(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K`;
  return `$${Math.round(v)}`;
}

function formatAxisCount(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K`;
  return String(Math.round(v));
}

function xAt(i, count) {
  const inner = W - PAD.l - PAD.r;
  const step = count > 1 ? inner / (count - 1) : inner / 2;
  return PAD.l + i * step;
}

function yAt(value, max) {
  const usable = H - PAD.t - PAD.b;
  return PAD.t + usable - (Math.max(0, value) / Math.max(max, 1)) * usable;
}

function linePath(values, max) {
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i, values.length)} ${yAt(v, max)}`)
    .join(' ');
}

export default function PlatformPerformanceChart({ series = [] }) {
  const data = Array.isArray(series) ? series : [];
  const n = data.length;
  const revenue = data.map((d) => Number(d.revenue) || 0);
  const agencies = data.map((d) => Number(d.agencies) || 0);
  const claims = data.map((d) => Number(d.claims) || 0);
  const revMax = niceMax(Math.max(...revenue, 0), 100);
  const agencyMax = niceMax(Math.max(...agencies, 0), 4);
  const claimsMax = niceMax(Math.max(...claims, 0), 4);
  const inner = W - PAD.l - PAD.r;
  const barW = Math.max(14, n ? (inner / n) * 0.42 : 14);

  if (!n) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-[15px] font-semibold text-gray-900">Platform Performance Overview</h2>
        <p className="px-2 py-16 text-center text-sm text-gray-400">No performance data yet.</p>
      </div>
    );
  }

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
              <span className="h-2 w-4 border-t-2 border-[#22C55E]" /> Visits Completed
            </span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Platform performance combo chart">
        {[0, 1, 2, 3, 4].map((tick) => {
          const y = yAt(tick, 4);
          return (
            <g key={tick}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#EEF2F7" />
              <text x={PAD.l - 8} y={y + 3} textAnchor="end" className="fill-gray-400 text-[10px]">
                {formatAxisMoney((revMax / 4) * tick)}
              </text>
              <text x={W - PAD.r + 8} y={y + 3} className="fill-[#7C5CFC] text-[10px]">
                {formatAxisCount((agencyMax / 4) * tick)}
              </text>
              <text x={W - 8} y={y + 3} textAnchor="end" className="fill-[#22C55E] text-[10px]">
                {formatAxisCount((claimsMax / 4) * tick)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const x = xAt(i, n) - barW / 2;
          const h = (Math.max(0, Number(d.revenue) || 0) / revMax) * (H - PAD.t - PAD.b);
          return (
            <rect
              key={`bar-${d.label}-${i}`}
              x={x}
              y={yAt(Number(d.revenue) || 0, revMax)}
              width={barW}
              height={Math.max(4, h)}
              rx="4"
              fill="#5B7CFA"
            />
          );
        })}

        <path d={linePath(agencies, agencyMax)} fill="none" stroke="#7C5CFC" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={linePath(claims, claimsMax)} fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinejoin="round" />

        {agencies.map((v, i) => (
          <circle key={`a-${i}`} cx={xAt(i, n)} cy={yAt(v, agencyMax)} r="4" fill="#fff" stroke="#7C5CFC" strokeWidth="2.25" />
        ))}
        {claims.map((v, i) => (
          <circle key={`c-${i}`} cx={xAt(i, n)} cy={yAt(v, claimsMax)} r="4" fill="#fff" stroke="#22C55E" strokeWidth="2.25" />
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
