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

export default function ClientsStatusDonut() {
  const cx = 70;
  const cy = 70;
  const r = 52;
  let angle = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140">
          {segments.map((seg) => {
            const sweep = (seg.pct / 100) * 360;
            const path = describeArc(cx, cy, r, angle, angle + sweep);
            angle += sweep;
            return (
              <path
                key={seg.label}
                d={path}
                fill="none"
                stroke={seg.color}
                strokeWidth="18"
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">128</span>
          <span className="text-xs text-gray-500">Total</span>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-gray-600">{seg.label}</span>
            </div>
            <span className="font-medium text-gray-900">
              {seg.value}{' '}
              <span className="font-normal text-gray-400">({seg.pct}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
