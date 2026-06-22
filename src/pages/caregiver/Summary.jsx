import { BarChart3, Clock, CheckCircle2, Star } from 'lucide-react';

const weeklyStats = [
  { label: 'Hours Worked', value: '38.5', icon: Clock },
  { label: 'Visits Completed', value: '14', icon: CheckCircle2 },
  { label: 'On-Time Rate', value: '96%', icon: Star },
  { label: 'Avg. Visit Duration', value: '2h 15m', icon: BarChart3 },
];

const dailyBreakdown = [
  { day: 'Mon', hours: 8 },
  { day: 'Tue', hours: 7.5 },
  { day: 'Wed', hours: 8 },
  { day: 'Thu', hours: 7 },
  { day: 'Fri', hours: 8 },
  { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0 },
];

export default function CaregiverSummary() {
  const maxHours = Math.max(...dailyBreakdown.map((d) => d.hours));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-gray-500">Your work performance for the current week.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {weeklyStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <Icon size={18} className="text-primary" />
            <p className="mt-2 text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900">Daily Hours</h3>
        <div className="mt-6 flex h-40 items-end justify-between gap-2">
          {dailyBreakdown.map(({ day, hours }) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-medium text-gray-600">{hours}h</span>
              <div
                className="w-full rounded-t-lg bg-primary/80"
                style={{ height: maxHours ? `${(hours / maxHours) * 100}px` : '0' }}
              />
              <span className="text-xs text-gray-400">{day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
