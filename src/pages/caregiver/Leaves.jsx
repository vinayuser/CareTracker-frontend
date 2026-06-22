import { useState } from 'react';
import { CalendarOff, Plus } from 'lucide-react';

const leaveBalances = [
  { type: 'Annual Leave', available: 12, used: 3, total: 15 },
  { type: 'Sick Leave', available: 5, used: 1, total: 6 },
  { type: 'Personal Leave', available: 2, used: 0, total: 2 },
];

const leaveHistory = [
  { type: 'Annual Leave', dates: 'Jun 10 – Jun 12, 2026', days: 3, status: 'Approved' },
  { type: 'Sick Leave', dates: 'May 22, 2026', days: 1, status: 'Approved' },
  { type: 'Annual Leave', dates: 'Jul 1 – Jul 5, 2026', days: 5, status: 'Pending' },
];

export default function CaregiverLeaves() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Check balances and apply for leave.</p>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus size={16} /> Apply Leave
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">New Leave Request</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Leave Type</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option>Annual Leave</option>
                <option>Sick Leave</option>
                <option>Personal Leave</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
              <textarea rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Optional note..." />
            </div>
          </div>
          <button type="button" className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white">
            Submit Request
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {leaveBalances.map(({ type, available, used, total }) => (
          <div key={type} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <CalendarOff size={20} className="text-primary" />
            <p className="mt-2 text-sm font-medium text-gray-900">{type}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{available}</p>
            <p className="text-xs text-gray-500">{used} used of {total} days</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-900">Leave History</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {leaveHistory.map((item) => (
            <div key={item.dates} className="flex items-center justify-between px-5 py-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.type}</p>
                <p className="text-gray-500">{item.dates} · {item.days} day(s)</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
