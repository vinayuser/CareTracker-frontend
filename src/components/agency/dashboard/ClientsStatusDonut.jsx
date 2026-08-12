function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

const SIZE = 100;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 36;

const EMPTY_SEGMENTS = [
  { label: 'Active', value: 0, pct: 0, color: '#22c55e' },
  { label: 'Pending', value: 0, pct: 0, color: '#3b82f6' },
  { label: 'Inactive', value: 0, pct: 0, color: '#f97316' },
];

export default function ClientsStatusDonut({ segments = EMPTY_SEGMENTS, total = 0 }) {
  const data = segments.length ? segments : EMPTY_SEGMENTS;
  let angle = 0;
  const hasData = data.some((s) => s.value > 0);

  return (
    <div className="flex min-w-0 items-center gap-3 overflow-hidden">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="block">
          {!hasData ? (
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e5e7eb" strokeWidth="14" />
          ) : (
            data.map((seg) => {
              const sweep = Math.max(0.5, (seg.pct / 100) * 360);
              const path = describeArc(CX, CY, R, angle, angle + sweep);
              angle += sweep;
              return (
                <path
                  key={seg.label}
                  d={path}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="14"
                  strokeLinecap="butt"
                />
              );
            })
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold leading-none text-gray-900">{total}</span>
          <span className="mt-0.5 text-[10px] text-gray-500">Total</span>
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        {data.map((seg) => (
          <div key={seg.label} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 text-xs">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="truncate text-gray-600">{seg.label}</span>
            </div>
            <span className="whitespace-nowrap tabular-nums font-medium text-gray-900">
              {seg.value} <span className="font-normal text-gray-400">({seg.pct}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
