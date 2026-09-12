/** Lightweight dashboard mock used as marketing visuals */
export default function ProductMock({ variant = 'dashboard', className = '' }) {
  if (variant === 'map') {
    return (
      <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 ${className}`}>
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">Live Visit Map</div>
        <div className="relative h-56 bg-gradient-to-br from-sky-50 via-emerald-50 to-slate-100">
          <div className="absolute left-[18%] top-[30%] h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
          <div className="absolute left-[42%] top-[48%] h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          <div className="absolute left-[65%] top-[28%] h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
          <div className="absolute left-[55%] top-[68%] h-3 w-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
          <div className="absolute inset-x-6 bottom-4 rounded-xl bg-white/90 p-3 text-xs text-slate-600 shadow-sm backdrop-blur">
            4 caregivers active · GPS verified
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'calendar') {
    return (
      <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 ${className}`}>
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">Visit Schedule</div>
        <div className="grid grid-cols-7 gap-1 p-4 text-center text-[10px] text-slate-500">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
            <div key={d} className="font-semibold">{d}</div>
          ))}
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-md py-2 ${
                [3, 8, 12, 17, 21].includes(i)
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'bg-slate-50 text-slate-600'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 ${className}`}>
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">Visit Notes</div>
        <div className="space-y-3 p-4">
          {['Patient condition', 'Services delivered', 'Caregiver signature'].map((label) => (
            <div key={label}>
              <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
              <div className="h-9 rounded-lg border border-slate-200 bg-slate-50" />
            </div>
          ))}
          <div className="h-16 rounded-lg border border-dashed border-primary/40 bg-primary/5" />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 ${className}`}>
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">Visit Log</div>
        <div className="divide-y divide-slate-100 text-sm">
          {[
            ['Maria Lopez', 'Checked in', '08:02'],
            ['James Carter', 'In progress', '09:15'],
            ['Aisha Khan', 'Completed', '10:40'],
            ['Noah Patel', 'Late', '11:05'],
          ].map(([name, status, time]) => (
            <div key={name} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-slate-800">{name}</p>
                <p className="text-xs text-slate-500">{status}</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">{time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">Agency Dashboard</p>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">Live</span>
      </div>
      <div className="grid grid-cols-3 gap-3 p-4">
        {[
          ['Clients', '128'],
          ['Caregivers', '64'],
          ['Visits', '312'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-[11px] text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 px-4 pb-4">
        <div className="h-24 rounded-xl bg-gradient-to-r from-primary/15 via-sky-100 to-emerald-50" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-16 rounded-xl bg-slate-50" />
          <div className="h-16 rounded-xl bg-slate-50" />
        </div>
      </div>
    </div>
  );
}
