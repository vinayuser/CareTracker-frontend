const chartW = 520;
const chartH = 180;
const padX = 24;
const padY = 16;

function toPoints(data, maxY) {
  if (!data.length) return '';
  const step = data.length > 1 ? (chartW - padX * 2) / (data.length - 1) : 0;
  return data
    .map((v, i) => {
      const x = padX + i * step;
      const y = chartH - padY - (v / maxY) * (chartH - padY * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

export default function VisitOverviewChart({ series = [] }) {
  const days = series.map((d) => d.label || d.day || '');
  const completed = series.map((d) => Number(d.completed) || 0);
  const scheduled = series.map((d) => Number(d.scheduled) || 0);
  const missed = series.map((d) => Number(d.missed) || 0);
  const maxVal = Math.max(5, ...completed, ...scheduled, ...missed);
  const maxY = Math.ceil(maxVal / 5) * 5 || 5;
  const ticks = Array.from({ length: 6 }, (_, i) => Math.round((maxY / 5) * i));

  if (!series.length) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-gray-400">
        No visit activity this week.
      </div>
    );
  }

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${chartW} ${chartH + 28}`} className="h-auto w-full">
        {ticks.map((tick) => {
          const y = chartH - padY - (tick / maxY) * (chartH - padY * 2);
          return (
            <g key={tick}>
              <line x1={padX} y1={y} x2={chartW - padX} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={4} y={y + 4} className="fill-gray-400 text-[10px]">
                {tick}
              </text>
            </g>
          );
        })}
        <polyline fill="none" stroke="#22c55e" strokeWidth="2.5" points={toPoints(completed, maxY)} />
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" points={toPoints(scheduled, maxY)} />
        <polyline fill="none" stroke="#ef4444" strokeWidth="2.5" points={toPoints(missed, maxY)} />
        {days.map((day, i) => {
          const step = days.length > 1 ? (chartW - padX * 2) / (days.length - 1) : 0;
          const x = padX + i * step;
          return (
            <text key={`${day}-${i}`} x={x} y={chartH + 20} textAnchor="middle" className="fill-gray-400 text-[10px]">
              {day}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
