const days = ['12', '13', '14', '15', '16', '17', '18'];
const completed = [28, 35, 32, 40, 38, 34, 42];
const scheduled = [14, 16, 18, 15, 17, 20, 19];
const missed = [3, 2, 4, 2, 3, 2, 1];

const chartW = 520;
const chartH = 180;
const padX = 24;
const padY = 16;
const maxY = 50;

function toPoints(data) {
  const step = (chartW - padX * 2) / (data.length - 1);
  return data
    .map((v, i) => {
      const x = padX + i * step;
      const y = chartH - padY - (v / maxY) * (chartH - padY * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

export default function VisitOverviewChart() {
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${chartW} ${chartH + 28}`} className="h-auto w-full">
        {[0, 10, 20, 30, 40, 50].map((tick) => {
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
        <polyline fill="none" stroke="#22c55e" strokeWidth="2.5" points={toPoints(completed)} />
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" points={toPoints(scheduled)} />
        <polyline fill="none" stroke="#ef4444" strokeWidth="2.5" points={toPoints(missed)} />
        {days.map((day, i) => {
          const step = (chartW - padX * 2) / (days.length - 1);
          const x = padX + i * step;
          return (
            <text key={day} x={x} y={chartH + 20} textAnchor="middle" className="fill-gray-400 text-[10px]">
              May {day}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
