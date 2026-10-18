import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  ShieldCheck,
  Users,
} from 'lucide-react';

const EMPTY_FILTERS = {
  agency: '',
  caregiver: '',
  from: '',
  to: '',
  activity: '',
};

const EMPTY_SUMMARY = { total: 0, caregivers: 0, carePlans: 0, schedules: 0, evv: 0 };

function Kpi({ icon: Icon, iconWrap, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#e8eef6] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconWrap}`}>
        <Icon size={18} strokeWidth={2} />
      </span>
      <span>
        <span className="block text-[13px] font-medium text-[#667085]">{label}</span>
        <span className="mt-0.5 block text-[26px] font-bold leading-none text-[#101828]">{value}</span>
      </span>
    </div>
  );
}

function exportExcel(rows) {
  const header = ['Date & Time', 'Caregiver Name', 'Agency', 'Activity Performed', 'Related Client / Care Plan', 'Details', 'Status'];
  const body = rows.map((row) => [row.date, row.caregiver, row.agency, row.activity, row.related, row.detail, row.status]);
  const csv = [header, ...body].map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'caregiver-activity-log.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function AuditLogs() {
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState({ agencies: [], caregivers: [], activityTypes: [] });
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState({ from: 0, to: 0, total: 0, totalPages: 1 });
  const pageSize = 7;

  useEffect(() => {
    const params = {
      page,
      limit: pageSize,
      agency: applied.agency || undefined,
      caregiver: applied.caregiver || undefined,
      activity: applied.activity || undefined,
      from: applied.from || undefined,
      to: applied.to || undefined,
    };
    axiosInstance.get('/admin/audit-logs', { params })
      .then((response) => {
        const data = response.data?.data || {};
        setRows(data.list || []);
        setOptions(data.options || { agencies: [], caregivers: [], activityTypes: [] });
        setSummary(data.summary || EMPTY_SUMMARY);
        setPagination(data.pagination || { from: 0, to: 0, total: 0, totalPages: 1 });
      })
      .catch(() => {
        setRows([]);
        setSummary(EMPTY_SUMMARY);
      });
  }, [applied, page]);

  const total = pagination.total || 0;
  const pages = pagination.totalPages || 1;
  const safePage = Math.min(page, pages);
  const visible = rows;

  const setField = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }));

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f1ff] text-[#2f6fed]">
          <FileText size={20} />
        </span>
        <div>
          <h1 className="text-[22px] font-bold leading-tight text-[#101828]">Log Tracking Report</h1>
          <p className="mt-0.5 text-[13px] text-[#667085]">Track caregiver activity across agencies</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#e8eef6] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_140px_140px_1fr_auto_auto]">
          <label className="block text-[12px] font-medium text-[#344054]">
            Agency Name
            <select value={draft.agency} onChange={setField('agency')} className="mt-1 h-10 w-full rounded-lg border border-[#d0d5dd] bg-white px-3 text-[13px] text-[#344054] outline-none">
              <option value="">Select Agency</option>
              {options.agencies.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label className="block text-[12px] font-medium text-[#344054]">
            Caregiver
            <select value={draft.caregiver} onChange={setField('caregiver')} className="mt-1 h-10 w-full rounded-lg border border-[#d0d5dd] bg-white px-3 text-[13px] text-[#344054] outline-none">
              <option value="">All Caregivers</option>
              {options.caregivers.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label className="block text-[12px] font-medium text-[#344054]">
            Date From
            <input type="date" value={draft.from} onChange={setField('from')} className="mt-1 h-10 w-full rounded-lg border border-[#d0d5dd] px-2 text-[13px] text-[#344054] outline-none" />
          </label>
          <label className="block text-[12px] font-medium text-[#344054]">
            Date To
            <input type="date" value={draft.to} onChange={setField('to')} className="mt-1 h-10 w-full rounded-lg border border-[#d0d5dd] px-2 text-[13px] text-[#344054] outline-none" />
          </label>
          <label className="block text-[12px] font-medium text-[#344054]">
            Activity Type
            <select value={draft.activity} onChange={setField('activity')} className="mt-1 h-10 w-full rounded-lg border border-[#d0d5dd] bg-white px-3 text-[13px] text-[#344054] outline-none">
              <option value="">All Activities</option>
              {options.activityTypes.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <button
            type="button"
            onClick={() => { setApplied(draft); setPage(1); }}
            className="h-10 rounded-lg bg-[#155eef] px-4 text-[13px] font-semibold text-white"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={() => { setDraft(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); setPage(1); }}
            className="h-10 px-2 text-[13px] font-medium text-[#155eef]"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi icon={FileText} iconWrap="bg-[#e8f1ff] text-[#2f6fed]" label="Total Activities" value={summary.total} />
        <Kpi icon={Users} iconWrap="bg-[#f4ebff] text-[#7a5af8]" label="Caregivers" value={summary.caregivers} />
        <Kpi icon={Heart} iconWrap="bg-[#e7f8ef] text-[#12b76a]" label="Care Plans Linked" value={summary.carePlans} />
        <Kpi icon={Calendar} iconWrap="bg-[#e8f1ff] text-[#2f6fed]" label="Schedules Created" value={summary.schedules} />
        <Kpi icon={ShieldCheck} iconWrap="bg-[#f4ebff] text-[#7a5af8]" label="EVV Verified" value={summary.evv} />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e8eef6] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex items-center justify-between border-b border-[#eef2f6] px-5 py-4">
          <h2 className="text-[16px] font-semibold text-[#101828]">Caregiver Activity Log</h2>
          <button
            type="button"
            onClick={() => exportExcel(visible)}
            className="inline-flex h-9 items-center rounded-lg border border-[#abefc6] bg-[#ecfdf3] px-3 text-[13px] font-semibold text-[#067647]"
          >
            Export Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-[#eef2f6] text-[12px] font-semibold text-[#667085]">
                <th className="px-5 py-3 font-semibold">Date &amp; Time</th>
                <th className="px-3 py-3 font-semibold">Caregiver Name</th>
                <th className="px-3 py-3 font-semibold">Agency</th>
                <th className="px-3 py-3 font-semibold">Activity Performed</th>
                <th className="px-3 py-3 font-semibold">Related Client / Care Plan</th>
                <th className="px-3 py-3 font-semibold">Details</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-b border-[#f2f4f7] text-[13px] text-[#344054] last:border-0">
                  <td className="whitespace-nowrap px-5 py-3.5">{row.date}</td>
                  <td className="whitespace-nowrap px-3 py-3.5">{row.caregiver}</td>
                  <td className="whitespace-nowrap px-3 py-3.5">{row.agency}</td>
                  <td className="whitespace-nowrap px-3 py-3.5">{row.activity}</td>
                  <td className="whitespace-nowrap px-3 py-3.5">{row.related}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-[#667085]">{row.detail}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf3] px-2.5 py-0.5 text-[12px] font-semibold text-[#067647]">
                      <span className="text-[10px]">✓</span>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-[#667085]">No activity for these filters</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#eef2f6] px-5 py-3 text-[13px] text-[#667085]">
          <span>Showing {pagination.from || 0}–{pagination.to || 0} of {total} entries</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e4e7ec] text-[#344054]">
              <ChevronLeft size={16} />
            </button>
            <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#155eef] px-2 text-[13px] font-semibold text-white">{safePage}</span>
            <button type="button" onClick={() => setPage((current) => Math.min(pages, current + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e4e7ec] text-[#344054]">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
