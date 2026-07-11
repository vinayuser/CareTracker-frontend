import { useMemo, useState } from 'react';
import { ChevronDown, Download, Filter, MoreVertical } from 'lucide-react';
import { EVV_VISIT_LOGS, filterVisitLogs } from '../../../utils/evvDashboardData';

const statusStyles = {
  Verified: 'bg-emerald-100 text-emerald-700',
  Exception: 'bg-orange-100 text-orange-700',
  Unverified: 'bg-pink-100 text-pink-700',
};

const methodStyles = {
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-violet-100 text-violet-700',
  teal: 'bg-teal-100 text-teal-700',
};

export default function EvvVisitLogsTable({
  title = 'EVV Visit Logs',
  defaultStatus = 'All',
  logs = EVV_VISIT_LOGS,
  showFilters = true,
}) {
  const [status, setStatus] = useState(defaultStatus);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => filterVisitLogs(logs, { status: defaultStatus !== 'All' ? defaultStatus : status, search }),
    [logs, status, search, defaultStatus],
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
          {['Date Range', 'Client', 'Caregiver', 'Service', 'Verification Status'].map((label) => (
            <button key={label} type="button" className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
              {label} <ChevronDown size={14} />
            </button>
          ))}
          <button type="button" className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <Filter size={14} /> More Filters
          </button>
          <button type="button" className="ml-auto inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <Download size={14} /> Export
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{filtered.length}</span>
        </div>
        {showFilters && defaultStatus === 'All' && (
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700">
            <option value="All">All statuses</option>
            <option value="Verified">Verified</option>
            <option value="Exception">Exception</option>
            <option value="Unverified">Unverified</option>
          </select>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Visit ID</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Caregiver</th>
              <th className="px-5 py-3">Service</th>
              <th className="px-5 py-3">Check In</th>
              <th className="px-5 py-3">Check Out</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-medium text-primary">{row.id}</td>
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-900">{row.date}</div>
                  <div className="text-xs text-gray-500">{row.timeRange}</div>
                </td>
                <td className="px-5 py-4 text-gray-900">{row.client}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {row.caregiverInitials}
                    </span>
                    <span className="text-gray-900">{row.caregiver}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-700">{row.service}</td>
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-900">{row.checkIn.time}</div>
                  <div className="max-w-[140px] truncate text-xs text-gray-500">{row.checkIn.address}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-900">{row.checkOut.time}</div>
                  <div className="max-w-[140px] truncate text-xs text-gray-500">{row.checkOut.address}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${methodStyles[row.methodTone] || methodStyles.blue}`}>
                    {row.method}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-700">{row.duration}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[row.status]}`}>{row.status}</span>
                </td>
                <td className="px-5 py-4">
                  <button type="button" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-sm text-gray-500">
        <span>Showing 1–{Math.min(filtered.length, 10)} of {filtered.length}</span>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-lg border border-gray-200 px-3 py-1 hover:bg-gray-50">Previous</button>
          <button type="button" className="rounded-lg bg-primary px-3 py-1 text-white">1</button>
          <button type="button" className="rounded-lg border border-gray-200 px-3 py-1 hover:bg-gray-50">2</button>
          <button type="button" className="rounded-lg border border-gray-200 px-3 py-1 hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
}
