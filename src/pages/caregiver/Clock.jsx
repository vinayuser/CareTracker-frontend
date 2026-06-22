import { useState } from 'react';
import { Clock, Play, Square, MapPin } from 'lucide-react';

export default function CaregiverClock() {
  const [clockedIn, setClockedIn] = useState(false);
  const [elapsed, setElapsed] = useState('00:00:00');

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${clockedIn ? 'bg-emerald-50' : 'bg-gray-100'}`}>
          <Clock size={40} className={clockedIn ? 'text-emerald-600' : 'text-gray-400'} />
        </div>
        <p className="mt-4 text-4xl font-bold tabular-nums text-gray-900">{elapsed}</p>
        <p className="mt-1 text-sm text-gray-500">
          {clockedIn ? 'Shift in progress' : 'Ready to clock in'}
        </p>

        {clockedIn && (
          <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-left text-sm">
            <p className="font-medium text-gray-900">Robert Chen</p>
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} /> 456 Maple Ave · 1:00 PM – 3:00 PM
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setClockedIn(!clockedIn)}
          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white ${
            clockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {clockedIn ? (
            <>
              <Square size={18} /> Clock Out
            </>
          ) : (
            <>
              <Play size={18} /> Clock In
            </>
          )}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900">Recent Shifts</h3>
        <div className="mt-3 space-y-3 text-sm">
          {[
            { client: 'Margaret Thompson', date: 'Jun 18', hours: '2h 05m' },
            { client: 'Eleanor Williams', date: 'Jun 17', hours: '2h 00m' },
          ].map((shift) => (
            <div key={shift.date + shift.client} className="flex justify-between border-b border-gray-50 pb-2 last:border-0">
              <span className="text-gray-900">{shift.client}</span>
              <span className="text-gray-500">{shift.date} · {shift.hours}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
