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

export default function EvvDonutChart({ segments, centerValue, centerLabel }) {
  const cx = 70;
  const cy = 70;
  const r = 52;
  let angle = 0;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto shrink-0 sm:mx-0">
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
          <span className="text-xl font-bold text-gray-900">{centerValue}</span>
          {centerLabel && <span className="text-xs text-gray-500">{centerLabel}</span>}
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-gray-600">{seg.label}</span>
            </div>
            <span className="font-medium text-gray-900">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
