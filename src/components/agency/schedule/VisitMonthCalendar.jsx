import { useMemo } from 'react';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const statusColors = {
  Scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  InProgress: 'bg-amber-100 text-amber-800 border-amber-200',
  Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Missed: 'bg-red-100 text-red-800 border-red-200',
  Late: 'bg-orange-100 text-orange-800 border-orange-200',
  Exception: 'bg-red-100 text-red-800 border-red-200',
  Cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(isoOrDate) {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startPad; i += 1) {
    const date = new Date(year, month, -startPad + i + 1);
    cells.push({ date, inMonth: false, key: toDateKey(date) });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ date, inMonth: true, key: toDateKey(date) });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const date = new Date(last);
    date.setDate(date.getDate() + 1);
    cells.push({ date, inMonth: false, key: toDateKey(date) });
  }
  return cells;
}

export default function VisitMonthCalendar({
  year,
  month,
  visits = [],
  selectedDate,
  selectedVisitId,
  onSelectDate,
  onSelectVisit,
}) {
  const todayKey = toDateKey(new Date());
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const visitsByDate = useMemo(() => {
    const map = {};
    visits.forEach((visit) => {
      const key = visit.scheduledDate || toDateKey(new Date(visit.scheduledStartAt));
      if (!map[key]) map[key] = [];
      map[key].push(visit);
    });
    Object.values(map).forEach((list) => {
      list.sort((a, b) => new Date(a.scheduledStartAt) - new Date(b.scheduledStartAt));
    });
    return map;
  }, [visits]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[minmax(110px,1fr)]">
        {cells.map((cell) => {
          const dayVisits = visitsByDate[cell.key] || [];
          const isToday = cell.key === todayKey;
          const isSelected = selectedDate === cell.key;

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDate?.(cell.key, dayVisits)}
              className={`flex min-h-[110px] flex-col border-b border-r border-gray-100 p-1.5 text-left transition hover:bg-primary/5 ${
                !cell.inMonth ? 'bg-gray-50/70' : 'bg-white'
              } ${isSelected ? 'ring-2 ring-inset ring-primary/40' : ''}`}
            >
              <div className="mb-1 flex items-center justify-between px-0.5">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday
                      ? 'bg-primary text-white'
                      : cell.inMonth
                        ? 'text-gray-800'
                        : 'text-gray-400'
                  }`}
                >
                  {cell.date.getDate()}
                </span>
                {dayVisits.length > 0 && (
                  <span className="text-[10px] font-medium text-gray-400">{dayVisits.length}</span>
                )}
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                {dayVisits.slice(0, 3).map((visit) => (
                  <button
                    key={visit.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVisit?.(visit);
                      onSelectDate?.(cell.key, dayVisits);
                    }}
                    className={`truncate rounded border px-1.5 py-0.5 text-[10px] font-medium leading-tight ${
                      statusColors[visit.status] || statusColors.Scheduled
                    } ${selectedVisitId === visit.id ? 'ring-1 ring-primary' : ''}`}
                    title={`${visit.clientName} · ${visit.caregiverName}`}
                  >
                    {formatTime(visit.scheduledStartAt)} {visit.clientName}
                  </button>
                ))}
                {dayVisits.length > 3 && (
                  <span className="px-1 text-[10px] font-medium text-primary">
                    +{dayVisits.length - 3} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
