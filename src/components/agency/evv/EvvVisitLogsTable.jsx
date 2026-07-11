import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, Check, Download, Search, X } from 'lucide-react';
import {
  approveVisit,
  fetchAgencyVisits,
  fetchCaregiverVisits,
  rejectVisit,
} from '../../../redux/slices/visitSchedulesSlice';

import {
  filterVisitLogs,
  mapVisitToEvvLog,
  summarizeEvvLogs,
  toDateKey,
} from '../../../utils/evvVisitLogs';

const statusStyles = {
  Verified: 'bg-emerald-100 text-emerald-700',
  'Approved (Late)': 'bg-emerald-100 text-emerald-800',
  'Pending Approval': 'bg-amber-100 text-amber-800',
  'Pending (Late)': 'bg-orange-100 text-orange-800',
  Rejected: 'bg-red-100 text-red-800',
  Exception: 'bg-red-100 text-red-700',
  Missed: 'bg-red-100 text-red-800',
  Unverified: 'bg-pink-100 text-pink-700',
  Scheduled: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Cancelled: 'bg-gray-100 text-gray-600',
};

const methodStyles = {
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-violet-100 text-violet-700',
  teal: 'bg-teal-100 text-teal-700',
};

export default function EvvVisitLogsTable({
  title = 'EVV Visit Logs',
  defaultStatus = 'All',
  /** 'day' = track one day (default today); 'range' = from/to window */
  mode = 'day',
  initialDate = toDateKey(new Date()),
  rangeDays = 14,
  showFilters = true,
  showSummary = true,
  alertOnly = false,
  /** agency = approve/reject; caregiver = read-only own logs */
  audience = 'agency',
  hideCaregiverColumn = false,
  /** When set, table uses parent date range (e.g. EVV dashboard). */
  controlledFrom = null,
  controlledTo = null,
  /** Skip network fetch — parent already loaded visits into redux. */
  skipFetch = false,
}) {
  const dispatch = useDispatch();
  const { visits, caregiverVisits, loading } = useSelector((state) => state.visitSchedules);
  const [status, setStatus] = useState(defaultStatus);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(initialDate);
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - (rangeDays - 1));
    return toDateKey(d);
  });
  const [toDate, setToDate] = useState(toDateKey(new Date()));
  const [actionId, setActionId] = useState(null);

  const isCaregiver = audience === 'caregiver';
  const sourceVisits = isCaregiver ? caregiverVisits : visits;
  const effectiveFrom = controlledFrom ?? fromDate;
  const effectiveTo = controlledTo ?? toDate;

  useEffect(() => {
    if (skipFetch) return undefined;
    const params = mode === 'day' ? { date } : { from: effectiveFrom, to: effectiveTo };
    if (isCaregiver) dispatch(fetchCaregiverVisits(params));
    else dispatch(fetchAgencyVisits(params));
    return undefined;
  }, [dispatch, mode, date, effectiveFrom, effectiveTo, isCaregiver, skipFetch]);

  const logs = useMemo(() => (sourceVisits || []).map(mapVisitToEvvLog), [sourceVisits]);

  const filtered = useMemo(
    () => filterVisitLogs(logs, {
      status: defaultStatus === 'Alerts' || alertOnly
        ? (status === 'All' ? 'Alerts' : status)
        : (defaultStatus !== 'All' ? defaultStatus : status),
      search,
      alertOnly,
    }),
    [logs, status, search, defaultStatus, alertOnly],
  );

  const summary = useMemo(() => summarizeEvvLogs(logs), [logs]);

  const handleApprove = async (row) => {
    if (!row.canApprove || actionId) return;
    setActionId(row.visitId);
    try {
      await dispatch(approveVisit({ id: row.visitId })).unwrap();
      if (!skipFetch) {
        if (mode === 'day') dispatch(fetchAgencyVisits({ date }));
        else dispatch(fetchAgencyVisits({ from: effectiveFrom, to: effectiveTo }));
      }
    } catch {
      // toast in slice
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (row) => {
    if (!row.canApprove || actionId) return;
    const reason = window.prompt('Reason for rejecting this visit (required):');
    if (reason == null) return;
    if (!String(reason).trim() || String(reason).trim().length < 3) {
      window.alert('Please enter a rejection reason (at least 3 characters).');
      return;
    }
    setActionId(row.visitId);
    try {
      await dispatch(rejectVisit({ id: row.visitId, payload: { reason: String(reason).trim() } })).unwrap();
      if (!skipFetch) {
        if (mode === 'day') dispatch(fetchAgencyVisits({ date }));
        else dispatch(fetchAgencyVisits({ from: effectiveFrom, to: effectiveTo }));
      }
    } catch {
      // toast in slice
    } finally {
      setActionId(null);
    }
  };

  const exportCsv = () => {
    const headers = [
      'Visit ID', 'Date', 'Scheduled', 'Client', 'Caregiver', 'Service',
      'Check In', 'Check Out', 'Method', 'Duration', 'Status', 'Approval', 'Late', 'Reason',
    ];
    const rows = filtered.map((row) => [
      row.id,
      row.date,
      row.timeRange,
      row.client,
      row.caregiver,
      row.service,
      row.checkIn.time,
      row.checkOut.time,
      row.method,
      row.duration,
      row.status,
      row.approvalStatus,
      row.lateCheckIn ? 'Yes' : 'No',
      row.rejectionReason || row.exceptionReason || '',
    ]);
    const csv = [headers, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evv-visits-${mode === 'day' ? date : `${effectiveFrom}_${effectiveTo}`}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const colSpan = hideCaregiverColumn ? 10 : 11;

  return (
    <div className="space-y-4">
      {showSummary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Visits</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Approved / verified</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-800">{summary.verified}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Pending approval</p>
            <p className="mt-1 text-2xl font-semibold text-amber-800">{summary.pending}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-red-700">Late / missed / rejected</p>
            <p className="mt-1 text-2xl font-semibold text-red-800">
              {summary.exceptions + summary.missed + summary.rejected}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
            {mode === 'day' ? (
              <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
                Date
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-0 bg-transparent text-sm text-gray-800 outline-none"
                />
              </label>
            ) : (
              <>
                <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
                  From
                  <input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setFromDate(e.target.value)}
                    disabled={controlledFrom != null}
                    className="border-0 bg-transparent text-sm text-gray-800 outline-none"
                  />
                </label>
                <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
                  To
                  <input
                    type="date"
                    value={effectiveTo}
                    onChange={(e) => setToDate(e.target.value)}
                    disabled={controlledTo != null}
                    className="border-0 bg-transparent text-sm text-gray-800 outline-none"
                  />
                </label>
              </>
            )}
            <div className="relative min-w-[200px] flex-1">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isCaregiver ? 'Search client, visit…' : 'Search client, caregiver, visit…'}
                className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <button
              type="button"
              onClick={exportCsv}
              className="ml-auto inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <Download size={14} /> Export
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{filtered.length}</span>
          </div>
          {showFilters && (defaultStatus === 'All' || defaultStatus === 'Alerts' || alertOnly) && (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
            >
              {(defaultStatus === 'Alerts' || alertOnly) ? (
                <>
                  <option value="Alerts">Late + Missed</option>
                  <option value="Exception">Late / Exception</option>
                  <option value="Missed">Missed only</option>
                  <option value="Rejected">Rejected</option>
                </>
              ) : (
                <>
                  <option value="All">All statuses</option>
                  <option value="Pending Approval">Pending approval</option>
                  <option value="Verified">Approved / verified</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Exception">Exception (late)</option>
                  <option value="Missed">Missed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Scheduled">Scheduled</option>
                </>
              )}
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
                {!hideCaregiverColumn && <th className="px-5 py-3">Caregiver</th>}
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Check In</th>
                <th className="px-5 py-3">Check Out</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Approval</th>
                {!isCaregiver && <th className="px-5 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-5 py-12 text-center text-gray-500">Loading visits…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-5 py-12 text-center text-gray-500">
                    No visits found for this period.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.visitId || row.id}
                    className={row.alert
                      ? 'bg-red-50 hover:bg-red-100/70'
                      : row.canApprove
                        ? 'bg-amber-50/40 hover:bg-amber-50'
                        : 'hover:bg-gray-50'}
                  >
                    <td className={`px-5 py-4 font-medium ${row.alert ? 'text-red-700' : 'text-primary'}`}>
                      {row.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className={`font-medium ${row.alert ? 'text-red-900' : 'text-gray-900'}`}>{row.date}</div>
                      <div className={`text-xs ${row.alert ? 'text-red-600' : 'text-gray-500'}`}>{row.timeRange}</div>
                    </td>
                    <td className={`px-5 py-4 ${row.alert ? 'text-red-900' : 'text-gray-900'}`}>{row.client}</td>
                    {!hideCaregiverColumn && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                            row.alert ? 'bg-red-200 text-red-800' : 'bg-primary/10 text-primary'
                          }`}>
                            {row.caregiverInitials}
                          </span>
                          <span className={row.alert ? 'text-red-900' : 'text-gray-900'}>{row.caregiver}</span>
                        </div>
                      </td>
                    )}
                    <td className={`px-5 py-4 ${row.alert ? 'text-red-800' : 'text-gray-700'}`}>{row.service}</td>
                    <td className="px-5 py-4">
                      <div className={`font-medium ${row.lateCheckIn ? 'text-red-700' : 'text-gray-900'}`}>
                        {row.checkIn.time}
                        {row.lateCheckIn ? ' · Late' : ''}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">{row.checkOut.time}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{row.duration}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[row.status] || statusStyles.Unverified}`}>
                          {row.status}
                        </span>
                        {row.alert && row.status !== 'Rejected' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700">
                            <AlertTriangle size={11} />
                            {row.status === 'Missed'
                              ? 'No clock-in'
                              : row.exceptionReason || `After ${row.graceMinutes}m grace`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-gray-700">
                        <span className="font-medium">{row.approvalStatus === 'None' ? '—' : row.approvalStatus}</span>
                        {row.approvedByName ? (
                          <p className="mt-0.5 text-gray-500">by {row.approvedByName}</p>
                        ) : null}
                        {row.rejectionReason ? (
                          <p className="mt-0.5 text-red-600">{row.rejectionReason}</p>
                        ) : null}
                      </div>
                    </td>
                    {!isCaregiver && (
                      <td className="px-5 py-4">
                        {row.canApprove ? (
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              disabled={actionId === row.visitId}
                              onClick={() => handleApprove(row)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button
                              type="button"
                              disabled={actionId === row.visitId}
                              onClick={() => handleReject(row)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <X size={12} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-sm text-gray-500">
          <span>
            Showing {filtered.length} visit{filtered.length === 1 ? '' : 's'}
            {mode === 'day' ? ` for ${date}` : ` from ${effectiveFrom} to ${effectiveTo}`}
          </span>
          <p className="text-xs text-gray-500">
            {isCaregiver
              ? 'Ended visits wait for agency approval. Late check-ins stay highlighted in red.'
              : 'Ended visits need Approve or Reject. Late check-ins stay highlighted in red.'}
          </p>
        </div>
      </div>
    </div>
  );
}
