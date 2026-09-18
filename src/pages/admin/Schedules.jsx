import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { ROUTES } from '../../routes/routes';

const HOUR_START = 6;
const HOUR_END = 20;
const HOUR_HEIGHT = 64;
const GRID_START_MIN = HOUR_START * 60;
const GRID_END_MIN = HOUR_END * 60;
const GRID_MINUTES = GRID_END_MIN - GRID_START_MIN;

const AVATAR_TONES = [
  'bg-[#dbeafe] text-[#1d4ed8]',
  'bg-[#ede9fe] text-[#6d28d9]',
  'bg-[#d1fae5] text-[#047857]',
  'bg-[#ffedd5] text-[#c2410c]',
  'bg-[#fce7f3] text-[#be185d]',
  'bg-[#e0e7ff] text-[#4338ca]',
  'bg-[#fef3c7] text-[#b45309]',
  'bg-[#ccfbf1] text-[#0f766e]',
];

const VISIT_PALETTE = [
  { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
  { bg: '#fce7f3', border: '#f9a8d4', text: '#9d174d' },
  { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
  { bg: '#ede9fe', border: '#c4b5fd', text: '#5b21b6' },
  { bg: '#ffedd5', border: '#fdba74', text: '#9a3412' },
  { bg: '#e0f2fe', border: '#7dd3fc', text: '#075985' },
  { bg: '#fef9c3', border: '#fde047', text: '#854d0e' },
  { bg: '#f3e8ff', border: '#d8b4fe', text: '#6b21a8' },
];

const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function initials(name = '') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'CG';
}

function hashTone(seed = '') {
  let h = 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateKey(key) {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date, n) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + n);
  return d;
}

function formatRangeLabel(from, to) {
  const a = parseDateKey(from);
  const b = parseDateKey(to);
  const sameYear = a.getFullYear() === b.getFullYear();
  const optsStart = { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) };
  const optsEnd = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${a.toLocaleDateString('en-US', optsStart)} - ${b.toLocaleDateString('en-US', optsEnd)}`;
}

function formatDayHeader(date) {
  const weekday = WEEKDAY_SHORT[(date.getDay() + 6) % 7];
  return `${weekday} ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function hoursList() {
  const list = [];
  for (let h = HOUR_START; h <= HOUR_END; h += 1) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    list.push({ hour: h, label: `${hour12}:00 ${ampm}` });
  }
  return list;
}

function Avatar({ name, src, tone, size = 'h-10 w-10', textClass = 'text-[12px]' }) {
  if (src) return <img src={src} alt="" className={`${size} rounded-full object-cover`} />;
  return (
    <span className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full ${tone} ${textClass} font-bold`}>
      {initials(name)}
    </span>
  );
}

function StatusPill({ status }) {
  const active = String(status || '').toLowerCase() === 'active';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {status || '—'}
    </span>
  );
}

function buildMonthCells(year, month) {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i += 1) {
    const date = new Date(year, month, 1 - startPad + i);
    cells.push({ date, inMonth: false, key: toDateKey(date) });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ date, inMonth: true, key: toDateKey(date) });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: addDays(last, 1), inMonth: false, key: toDateKey(addDays(last, 1)) });
  }
  return cells;
}

function VisitBlock({ visit, style, compact = false }) {
  return (
    <div
      className="absolute left-1 right-1 overflow-hidden rounded-md border px-1.5 py-1 shadow-sm"
      style={style}
      title={`${visit.clientName} · ${visit.startTime} - ${visit.endTime} · ${visit.service}`}
    >
      <p className={`truncate font-semibold leading-tight ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
        Client: {visit.clientName}
      </p>
      {!compact ? (
        <>
          <p className="mt-0.5 truncate text-[10px] opacity-90">
            {visit.startTime} - {visit.endTime}
          </p>
          <p className="truncate text-[10px] font-medium opacity-80">{visit.service}</p>
        </>
      ) : (
        <p className="truncate text-[9px] opacity-80">{visit.startTime}</p>
      )}
    </div>
  );
}

function TimeGrid({ days, visits, colorForClient }) {
  const hours = useMemo(() => hoursList(), []);
  const visitsByDate = useMemo(() => {
    const map = {};
    visits.forEach((v) => {
      const key = v.scheduledDate;
      if (!map[key]) map[key] = [];
      map[key].push(v);
    });
    return map;
  }, [visits]);

  const gridHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}>
          <div className="border-r border-slate-100 bg-slate-50/80" />
          {days.map((day) => (
            <div
              key={toDateKey(day)}
              className="border-r border-slate-100 bg-slate-50/80 px-2 py-2.5 text-center text-[12px] font-semibold text-slate-600 last:border-r-0"
            >
              {formatDayHeader(day)}
            </div>
          ))}
        </div>

        <div className="relative grid" style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))`, height: gridHeight }}>
          <div className="relative border-r border-slate-100">
            {hours.slice(0, -1).map((h) => (
              <div
                key={h.hour}
                className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-slate-400"
                style={{ top: (h.hour - HOUR_START) * HOUR_HEIGHT }}
              >
                {h.label}
              </div>
            ))}
          </div>

          {days.map((day) => {
            const key = toDateKey(day);
            const dayVisits = visitsByDate[key] || [];
            return (
              <div key={key} className="relative border-r border-slate-100 last:border-r-0">
                {hours.slice(0, -1).map((h) => (
                  <div
                    key={h.hour}
                    className="absolute inset-x-0 border-t border-slate-100"
                    style={{ top: (h.hour - HOUR_START) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  />
                ))}
                {dayVisits.map((visit) => {
                  const start = Math.max(visit.startMinutes ?? GRID_START_MIN, GRID_START_MIN);
                  const end = Math.min(visit.endMinutes ?? start + 60, GRID_END_MIN);
                  if (end <= GRID_START_MIN || start >= GRID_END_MIN) return null;
                  const top = ((start - GRID_START_MIN) / GRID_MINUTES) * gridHeight;
                  const height = Math.max(((end - start) / GRID_MINUTES) * gridHeight, 28);
                  const palette = colorForClient(visit.clientId || visit.clientName);
                  const compact = height < 52;
                  return (
                    <VisitBlock
                      key={visit.id}
                      visit={visit}
                      compact={compact}
                      style={{
                        top,
                        height,
                        backgroundColor: palette.bg,
                        borderColor: palette.border,
                        color: palette.text,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthGrid({ year, month, visits, colorForClient }) {
  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);
  const todayKey = toDateKey(new Date());
  const visitsByDate = useMemo(() => {
    const map = {};
    visits.forEach((v) => {
      const key = v.scheduledDate;
      if (!map[key]) map[key] = [];
      map[key].push(v);
    });
    return map;
  }, [visits]);

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
        {WEEKDAY_SHORT.map((label) => (
          <div key={label} className="px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-[minmax(100px,1fr)]">
        {cells.map((cell) => {
          const dayVisits = visitsByDate[cell.key] || [];
          return (
            <div
              key={cell.key}
              className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 ${
                cell.inMonth ? 'bg-white' : 'bg-slate-50/60'
              }`}
            >
              <span
                className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                  cell.key === todayKey
                    ? 'bg-primary text-white'
                    : cell.inMonth
                      ? 'text-slate-700'
                      : 'text-slate-400'
                }`}
              >
                {cell.date.getDate()}
              </span>
              <div className="space-y-1">
                {dayVisits.slice(0, 3).map((visit) => {
                  const palette = colorForClient(visit.clientId || visit.clientName);
                  return (
                    <div
                      key={visit.id}
                      className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: palette.bg, color: palette.text }}
                      title={`${visit.clientName} · ${visit.startTime} - ${visit.endTime}`}
                    >
                      {visit.startTime} {visit.clientName}
                    </div>
                  );
                })}
                {dayVisits.length > 3 ? (
                  <p className="px-1 text-[10px] font-medium text-slate-400">+{dayVisits.length - 3} more</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminSchedules() {
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [agencyId, setAgencyId] = useState('');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef(null);

  const [caregivers, setCaregivers] = useState([]);
  const [caregiverSearch, setCaregiverSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [caregiversLoading, setCaregiversLoading] = useState(false);
  const [selectedCaregiverId, setSelectedCaregiverId] = useState('');

  const [viewMode, setViewMode] = useState('week');
  const [anchorDate, setAnchorDate] = useState(() => startOfWeek(new Date()));
  const [schedule, setSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const selectedAgency = useMemo(
    () => options.find((o) => o.id === agencyId) || null,
    [options, agencyId],
  );

  const selectedCaregiver = useMemo(
    () => caregivers.find((c) => c.id === selectedCaregiverId) || schedule?.caregiver || null,
    [caregivers, selectedCaregiverId, schedule],
  );

  const range = useMemo(() => {
    if (viewMode === 'day') {
      const key = toDateKey(anchorDate);
      return { from: key, to: key };
    }
    if (viewMode === 'month') {
      const y = anchorDate.getFullYear();
      const m = anchorDate.getMonth();
      const from = toDateKey(new Date(y, m, 1));
      const to = toDateKey(new Date(y, m + 1, 0));
      return { from, to };
    }
    const start = startOfWeek(anchorDate);
    const end = addDays(start, 6);
    return { from: toDateKey(start), to: toDateKey(end) };
  }, [anchorDate, viewMode]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(anchorDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [anchorDate]);

  const dayColumns = useMemo(() => {
    if (viewMode === 'day') return [new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate())];
    return weekDays;
  }, [viewMode, anchorDate, weekDays]);

  const visits = schedule?.visits || [];

  const colorForClient = useMemo(() => {
    const cache = new Map();
    return (seed) => {
      const key = String(seed || '');
      if (cache.has(key)) return cache.get(key);
      const palette = VISIT_PALETTE[hashTone(key) % VISIT_PALETTE.length];
      cache.set(key, palette);
      return palette;
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get(API_ROUTES.ADMIN.AGENCY.OPTIONS);
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setOptions(list);
        if (list.length) setAgencyId((prev) => prev || list[0].id);
      } catch {
        toast.error('Failed to load agencies');
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectorOpen) return undefined;
    const onDown = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) setSelectorOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [selectorOpen]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(caregiverSearch.trim()), 300);
    return () => clearTimeout(t);
  }, [caregiverSearch]);

  useEffect(() => {
    setSelectedCaregiverId('');
    setSchedule(null);
  }, [agencyId]);

  useEffect(() => {
    if (!agencyId) {
      setCaregivers([]);
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      setCaregiversLoading(true);
      try {
        const res = await axiosInstance.get(API_ROUTES.ADMIN.CAREGIVERS.LIST, {
          params: {
            agencyId,
            page: 1,
            limit: 50,
            search: debouncedSearch || undefined,
          },
        });
        if (cancelled) return;
        const rows = Array.isArray(res.data?.data?.list) ? res.data.data.list : [];
        setCaregivers(rows);
        setSelectedCaregiverId((prev) => (prev && rows.some((r) => r.id === prev) ? prev : (rows[0]?.id || '')));
      } catch {
        if (!cancelled) {
          setCaregivers([]);
          setSelectedCaregiverId('');
        }
      } finally {
        if (!cancelled) setCaregiversLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [agencyId, debouncedSearch]);

  useEffect(() => {
    if (!agencyId || !selectedCaregiverId) {
      setSchedule(null);
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      setScheduleLoading(true);
      try {
        const res = await axiosInstance.get(API_ROUTES.ADMIN.SCHEDULES.CAREGIVER, {
          params: {
            agencyId,
            caregiverId: selectedCaregiverId,
            from: range.from,
            to: range.to,
          },
        });
        if (!cancelled) setSchedule(res.data?.data || null);
      } catch (err) {
        if (!cancelled) {
          setSchedule(null);
          toast.error(err?.response?.data?.message || 'Failed to load schedule');
        }
      } finally {
        if (!cancelled) setScheduleLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [agencyId, selectedCaregiverId, range.from, range.to]);

  const shiftRange = (delta) => {
    setAnchorDate((prev) => {
      if (viewMode === 'day') return addDays(prev, delta);
      if (viewMode === 'month') return new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
      return addDays(prev, delta * 7);
    });
  };

  const goToday = () => {
    const today = new Date();
    if (viewMode === 'month') setAnchorDate(new Date(today.getFullYear(), today.getMonth(), 1));
    else if (viewMode === 'week') setAnchorDate(startOfWeek(today));
    else setAnchorDate(today);
  };

  const exportSchedule = () => {
    if (!visits.length) {
      toast.info('No visits to export for this range.');
      return;
    }
    const header = ['Date', 'Start', 'End', 'Client', 'Service', 'Status', 'Address'];
    const rows = visits.map((v) => [
      v.scheduledDate,
      v.startTime,
      v.endTime,
      v.clientName,
      v.service,
      v.status,
      v.address,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${selectedCaregiver?.name || 'caregiver'}-${range.from}-${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const caregiverHeader = selectedCaregiver || schedule?.caregiver;
  const agencyLabel = caregiverHeader?.agencyName || selectedAgency?.name || '';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Schedules</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage caregiver schedules by day, week or month.
          </p>
        </div>
        <button
          type="button"
          onClick={exportSchedule}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Download size={15} />
          Export Schedule
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div ref={selectorRef} className="relative max-w-xl">
          <label className="mb-1.5 block text-[12px] font-medium text-slate-500">Select Agency</label>
          <button
            type="button"
            onClick={() => setSelectorOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm shadow-sm"
          >
            <span className="truncate font-semibold text-slate-900">
              {selectedAgency?.name || 'Select an agency'}
            </span>
            <ChevronDown size={16} className="ml-2 shrink-0 text-slate-400" />
          </button>
          {selectorOpen ? (
            <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              {options.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setAgencyId(item.id); setSelectorOpen(false); }}
                  className={`flex w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${
                    item.id === agencyId ? 'bg-primary/5 font-semibold text-primary' : 'text-slate-800'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              {!options.length ? (
                <p className="px-3 py-2.5 text-sm text-slate-400">No agencies found</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="sticky top-0 z-20 flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Caregivers</h2>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={caregiverSearch}
                  onChange={(e) => setCaregiverSearch(e.target.value)}
                  placeholder="Search caregivers..."
                  disabled={!agencyId}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-2 text-[12px] outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-slate-50"
                />
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                title="Filter"
              >
                <Filter size={14} />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {!agencyId ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">Select an agency to view caregivers.</p>
            ) : caregiversLoading ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">Loading caregivers…</p>
            ) : !caregivers.length ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">No caregivers found.</p>
            ) : (
              caregivers.map((cg) => {
                const selected = cg.id === selectedCaregiverId;
                const tone = AVATAR_TONES[hashTone(cg.id || cg.name) % AVATAR_TONES.length];
                return (
                  <button
                    key={cg.id}
                    type="button"
                    onClick={() => setSelectedCaregiverId(cg.id)}
                    className={`relative flex w-full items-center gap-3 border-b border-slate-50 px-3 py-3 text-left transition ${
                      selected ? 'bg-[#eff6ff]' : 'hover:bg-slate-50'
                    }`}
                  >
                    {selected ? <span className="absolute inset-y-0 left-0 w-[3px] rounded-r bg-primary" /> : null}
                    <Avatar name={cg.name} src={cg.profilePic} tone={tone} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-slate-900">{cg.name}</p>
                      <p className="text-[11px] text-slate-500">Caregiver</p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-slate-300" />
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          {!selectedCaregiverId ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-sm text-slate-400 shadow-sm">
              Select a caregiver to view their schedule.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    name={caregiverHeader?.name}
                    src={caregiverHeader?.profilePic}
                    tone="bg-primary text-white"
                    size="h-12 w-12"
                    textClass="text-sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-slate-900">{caregiverHeader?.name || '—'}</p>
                    <p className="truncate text-[12px] text-slate-500">
                      Caregiver{agencyLabel ? ` | ${agencyLabel}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={caregiverHeader?.status || 'Active'} />
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.ADMIN_CAREGIVERS)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View Profile
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <CalendarDays size={16} className="text-primary" />
                    Schedule
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={goToday}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Today
                    </button>
                    <div className="flex items-center rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => shiftRange(-1)}
                        className="px-2 py-1.5 text-slate-500 hover:bg-slate-50"
                        aria-label="Previous"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => shiftRange(1)}
                        className="border-l border-slate-200 px-2 py-1.5 text-slate-500 hover:bg-slate-50"
                        aria-label="Next"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                    <span className="min-w-[160px] text-center text-[12px] font-semibold text-slate-700">
                      {formatRangeLabel(range.from, range.to)}
                    </span>
                    <div className="flex overflow-hidden rounded-lg border border-slate-200">
                      {['day', 'week', 'month'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setViewMode(mode);
                            if (mode === 'month') {
                              setAnchorDate(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1));
                            } else if (mode === 'week') {
                              setAnchorDate(startOfWeek(anchorDate));
                            }
                          }}
                          className={`px-3 py-1.5 text-[12px] font-semibold capitalize ${
                            viewMode === mode
                              ? 'bg-primary text-white'
                              : 'bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative min-h-[420px]">
                  {scheduleLoading ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm text-slate-500">
                      Loading schedule…
                    </div>
                  ) : null}
                  {viewMode === 'month' ? (
                    <MonthGrid
                      year={anchorDate.getFullYear()}
                      month={anchorDate.getMonth()}
                      visits={visits}
                      colorForClient={colorForClient}
                    />
                  ) : (
                    <TimeGrid days={dayColumns} visits={visits} colorForClient={colorForClient} />
                  )}
                  {!scheduleLoading && !visits.length ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <p className="rounded-lg bg-white/90 px-4 py-2 text-sm text-slate-400 shadow-sm">
                        No visits scheduled in this range.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
