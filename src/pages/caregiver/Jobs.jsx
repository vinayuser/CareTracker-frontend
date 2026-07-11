import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CalendarClock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import VisitMonthCalendar from '../../components/agency/schedule/VisitMonthCalendar';
import {
  checkInVisit,
  checkOutVisit,
  fetchCaregiverVisits,
} from '../../redux/slices/visitSchedulesSlice';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const statusStyles = {
  Scheduled: 'bg-blue-100 text-blue-700',
  InProgress: 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Missed: 'bg-red-100 text-red-700',
  Late: 'bg-orange-100 text-orange-700',
  Exception: 'bg-red-100 text-red-800',
  Cancelled: 'bg-gray-100 text-gray-600',
};

function isPastGrace(visit) {
  if (!visit?.latestCheckInAt || visit.checkInAt) return false;
  return new Date() > new Date(visit.latestCheckInAt);
}

function resolveLateUntil(visit) {
  if (visit?.lateCheckInUntil) return new Date(visit.lateCheckInUntil);
  if (visit?.latestCheckInAt) {
    return new Date(new Date(visit.latestCheckInAt).getTime() + 60 * 60 * 1000);
  }
  return null;
}

function isCheckInClosed(visit) {
  if (!visit || visit.checkInAt) return false;
  const until = resolveLateUntil(visit);
  return Boolean(until && new Date() > until);
}

function isTooEarly(visit) {
  if (!visit?.earliestCheckInAt || visit.checkInAt) return false;
  return new Date() < new Date(visit.earliestCheckInAt);
}

function isLateVisit(visit) {
  return Boolean(visit?.lateCheckIn) || visit?.status === 'Exception' || visit?.status === 'Missed';
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function monthRange(year, month) {
  const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { from, to };
}

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={18} />
        </span>
      </div>
    </div>
  );
}

export default function CaregiverJobs() {
  const dispatch = useDispatch();
  const { caregiverVisits } = useSelector((state) => state.visitSchedules);
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(toDateKey(now));
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const loadMonth = (year = cursor.year, month = cursor.month) => {
    const { from, to } = monthRange(year, month);
    setLoading(true);
    return dispatch(fetchCaregiverVisits({ from, to }))
      .unwrap()
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMonth();
  }, [dispatch, cursor.year, cursor.month]);

  const todayKey = toDateKey(new Date());

  const dayVisits = useMemo(
    () => caregiverVisits
      .filter((visit) => visit.scheduledDate === selectedDate)
      .sort((a, b) => new Date(a.scheduledStartAt) - new Date(b.scheduledStartAt)),
    [caregiverVisits, selectedDate],
  );

  const monthStats = useMemo(() => {
    const today = caregiverVisits.filter((v) => v.scheduledDate === todayKey);
    return {
      monthTotal: caregiverVisits.length,
      today: today.length,
      inProgress: caregiverVisits.filter((v) => (v.canCheckOut || (['InProgress', 'Exception'].includes(v.status) && v.checkInAt && !v.checkOutAt))).length,
      completed: caregiverVisits.filter((v) => v.checkOutAt || v.status === 'Completed').length,
      missed: caregiverVisits.filter((v) => v.status === 'Missed').length,
    };
  }, [caregiverVisits, todayKey]);

  const shiftMonth = (delta) => {
    setCursor((prev) => {
      const date = new Date(prev.year, prev.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
    setSelectedVisit(null);
  };

  const goToday = () => {
    const today = new Date();
    setCursor({ year: today.getFullYear(), month: today.getMonth() });
    setSelectedDate(toDateKey(today));
    setSelectedVisit(null);
  };

  const handleCheckIn = async (visit) => {
    setActionId(visit.id);
    try {
      const updated = await dispatch(checkInVisit({ id: visit.id, payload: { method: 'Mobile App' } })).unwrap();
      setSelectedVisit(updated);
      await loadMonth();
    } catch {
      // toast in slice
    } finally {
      setActionId(null);
    }
  };

  const handleCheckOut = async (visit) => {
    setActionId(visit.id);
    try {
      const updated = await dispatch(checkOutVisit({ id: visit.id, payload: { method: 'Mobile App' } })).unwrap();
      setSelectedVisit(updated);
      await loadMonth();
    } catch {
      // toast in slice
    } finally {
      setActionId(null);
    }
  };

  const selectedLabel = selectedDate
    ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Your assigned care visits for the month. Clock in within the grace window around the scheduled start.
      </p>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="This month" value={String(monthStats.monthTotal)} icon={CalendarClock} tone="bg-blue-100 text-blue-600" />
        <StatCard label="Today" value={String(monthStats.today)} icon={Clock} tone="bg-amber-100 text-amber-600" />
        <StatCard label="In progress" value={String(monthStats.inProgress)} icon={CheckCircle} tone="bg-emerald-100 text-emerald-600" />
        <StatCard label="Missed" value={String(monthStats.missed)} icon={AlertTriangle} tone="bg-red-100 text-red-600" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="min-w-[180px] text-center text-base font-semibold text-gray-900">
            {MONTH_NAMES[cursor.month]} {cursor.year}
          </h2>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          type="button"
          onClick={goToday}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Today
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          {loading && caregiverVisits.length === 0 ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-500 shadow-sm">
              Loading calendar...
            </div>
          ) : (
            <VisitMonthCalendar
              year={cursor.year}
              month={cursor.month}
              visits={caregiverVisits}
              selectedDate={selectedDate}
              selectedVisitId={selectedVisit?.id}
              onSelectDate={(dateKey) => {
                setSelectedDate(dateKey);
                setSelectedVisit(null);
              }}
              onSelectVisit={setSelectedVisit}
            />
          )}
        </div>

        <div className="xl:col-span-4">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">{selectedLabel || 'Select a day'}</h3>
              <p className="mt-0.5 text-xs text-gray-500">
                {dayVisits.length} visit{dayVisits.length === 1 ? '' : 's'} scheduled
              </p>
            </div>

            <div className="max-h-[560px] space-y-3 overflow-y-auto p-4">
              {dayVisits.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-gray-900">No visits this day</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Select another day on the calendar, or wait for your agency to assign schedules.
                  </p>
                </div>
              ) : (
                dayVisits.map((visit) => {
                  const active = selectedVisit?.id === visit.id;
                  const busy = actionId === visit.id;
                  const canStart = visit.canCheckIn ?? (['Scheduled', 'Missed', 'Late'].includes(visit.status) && !visit.checkInAt);
                  const canFinish = visit.canCheckOut ?? (
                    ['InProgress', 'Exception'].includes(visit.status) && visit.checkInAt && !visit.checkOutAt
                  );
                  const pastGrace = isPastGrace(visit);
                  const tooEarly = isTooEarly(visit);
                  const checkInClosed = isCheckInClosed(visit);
                  const late = isLateVisit(visit);
                  const lateUntil = resolveLateUntil(visit);
                  const statusLabel = visit.checkOutAt
                    ? (visit.approvalStatus === 'Approved'
                      ? (visit.lateCheckIn ? 'Approved (Late)' : 'Verified')
                      : visit.approvalStatus === 'Rejected'
                        ? 'Rejected'
                        : (visit.lateCheckIn ? 'Pending (Late)' : 'Pending Approval'))
                    : (visit.lateCheckIn && visit.checkInAt ? 'Late / In Progress' : visit.status);

                  return (
                    <div
                      key={visit.id}
                      className={`rounded-xl border p-3 transition ${
                        late || pastGrace
                          ? 'border-red-300 bg-red-50'
                          : active
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-gray-200 bg-white hover:border-primary/20'
                      }`}
                    >
                      <button type="button" className="w-full text-left" onClick={() => setSelectedVisit(visit)}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-sm font-semibold ${late || pastGrace ? 'text-red-900' : 'text-gray-900'}`}>
                              {visit.clientName}
                            </p>
                            <p className={`mt-0.5 text-xs ${late || pastGrace ? 'text-red-700' : 'text-gray-500'}`}>
                              {formatTime(visit.scheduledStartAt)} – {formatTime(visit.scheduledEndAt)}
                            </p>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[visit.status] || statusStyles.Scheduled}`}>
                            {statusLabel}
                          </span>
                        </div>
                        {visit.serviceArea && (
                          <p className="mt-2 text-xs text-gray-500">{visit.serviceArea}</p>
                        )}
                        {visit.address && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={12} /> {visit.address}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Grace: ±{visit.graceMinutes || 15} min
                          {visit.latestCheckInAt ? ` · On-time until ${formatTime(visit.latestCheckInAt)}` : ''}
                          {lateUntil ? ` · Late allowed until ${formatTime(lateUntil)}` : ''}
                        </p>
                        {tooEarly && (
                          <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] font-medium text-amber-800">
                            Too early to clock in. Window opens at {formatTime(visit.earliestCheckInAt)}.
                          </p>
                        )}
                        {pastGrace && !checkInClosed && canStart && (
                          <p className="mt-2 rounded-lg bg-red-100 px-2 py-1.5 text-[11px] font-semibold text-red-800">
                            Past grace. You can still clock in until {formatTime(lateUntil)} — it will be marked late (red) for the agency.
                          </p>
                        )}
                        {checkInClosed && !visit.checkInAt && (
                          <p className="mt-2 rounded-lg bg-red-100 px-2 py-1.5 text-[11px] font-semibold text-red-800">
                            Check-in window closed (grace + 1 hour). This visit cannot be started.
                          </p>
                        )}
                        {visit.lateCheckIn && (
                          <p className="mt-2 rounded-lg bg-red-100 px-2 py-1.5 text-[11px] font-semibold text-red-800">
                            Late check-in recorded{visit.exceptionReason ? `: ${visit.exceptionReason}` : ''}.
                          </p>
                        )}
                      </button>

                      {(canStart || canFinish) && (
                        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                          {canStart && (
                            <button
                              type="button"
                              disabled={busy || tooEarly || checkInClosed}
                              onClick={() => handleCheckIn(visit)}
                              className={`w-full rounded-lg py-2 text-xs font-semibold text-white disabled:opacity-50 ${
                                pastGrace || checkInClosed
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-primary hover:bg-primary-hover'
                              }`}
                            >
                              {busy
                                ? 'Starting…'
                                : tooEarly
                                  ? 'Wait for grace window'
                                  : checkInClosed
                                    ? 'Check-in window closed'
                                    : pastGrace
                                      ? 'Clock In Late (Exception)'
                                      : 'Start Visit / Clock In'}
                            </button>
                          )}
                          {canFinish && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleCheckOut(visit)}
                              className="w-full rounded-lg border border-primary bg-primary/5 py-2 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-50"
                            >
                              {busy ? 'Ending…' : 'End Visit / Clock Out'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
