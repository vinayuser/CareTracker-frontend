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

const segments = [
  { label: 'Active', value: 92, pct: 71.9, color: '#22c55e' },
  { label: 'Pending', value: 18, pct: 14.1, color: '#3b82f6' },
  { label: 'Inactive', value: 13, pct: 10.2, color: '#f97316' },
  { label: 'Discharged', value: 5, pct: 3.9, color: '#ef4444' },
];

const SIZE = 100;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 36;

export default function ClientsStatusDonut() {
  let angle = 0;

  return (
    <div className="flex min-w-0 items-center gap-3 overflow-hidden">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="block">
          {segments.map((seg) => {
            const sweep = (seg.pct / 100) * 360;
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
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold leading-none text-gray-900">128</span>
          <span className="mt-0.5 text-[10px] text-gray-500">Total</span>
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        {segments.map((seg) => (
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
