import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  UserRound,
} from 'lucide-react';
import VisitMonthCalendar from '../../components/agency/schedule/VisitMonthCalendar';
import { fetchClientVisits } from '../../redux/slices/clientPortalSlice';
import { formatVisitTime, formatTimezoneAbbr } from '../../utils/visitTimezone';

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

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function monthRange(year, month) {
  const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { from, to };
}

function formatTime(iso, timeZone) {
  return formatVisitTime(iso, timeZone);
}

function statusLabel(visit) {
  if (visit.checkOutAt) {
    if (visit.approvalStatus === 'Approved') {
      return visit.lateCheckIn ? 'Approved (Late)' : 'Completed';
    }
    if (visit.approvalStatus === 'Rejected') return 'Rejected';
    return visit.lateCheckIn ? 'Pending (Late)' : 'Pending Approval';
  }
  if (visit.lateCheckIn && visit.checkInAt) return 'Late / In Progress';
  if (visit.checkInAt && !visit.checkOutAt) return 'In Progress';
  return visit.status || 'Scheduled';
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

export default function ClientSchedule() {
  const dispatch = useDispatch();
  const { visits, visitsLoading } = useSelector((state) => state.clientPortal);
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(toDateKey(now));
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    const { from, to } = monthRange(cursor.year, cursor.month);
    dispatch(fetchClientVisits({ from, to }));
  }, [dispatch, cursor.year, cursor.month]);

  const todayKey = toDateKey(new Date());

  const dayVisits = useMemo(
    () => visits
      .filter((visit) => visit.scheduledDate === selectedDate)
      .sort((a, b) => new Date(a.scheduledStartAt) - new Date(b.scheduledStartAt)),
    [visits, selectedDate],
  );

  const monthStats = useMemo(() => {
    const today = visits.filter((v) => v.scheduledDate === todayKey);
    return {
      monthTotal: visits.length,
      today: today.length,
      inProgress: visits.filter((v) => (
        ['InProgress', 'Exception'].includes(v.status) && v.checkInAt && !v.checkOutAt
      )).length,
      completed: visits.filter((v) => v.checkOutAt || v.status === 'Completed').length,
      missed: visits.filter((v) => v.status === 'Missed').length,
    };
  }, [visits, todayKey]);

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

  const selectedLabel = selectedDate
    ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
    : '';

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Your care visits for the month. Select a day to see caregiver, time, and visit details.
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
          {visitsLoading && visits.length === 0 ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-500 shadow-sm">
              Loading calendar...
            </div>
          ) : (
            <VisitMonthCalendar
              year={cursor.year}
              month={cursor.month}
              visits={visits}
              selectedDate={selectedDate}
              selectedVisitId={selectedVisit?.id}
              primaryNameKey="caregiverName"
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
                    Select another day on the calendar, or wait for your agency to schedule care visits.
                  </p>
                </div>
              ) : (
                dayVisits.map((visit) => {
                  const active = selectedVisit?.id === visit.id;
                  const late = Boolean(visit.lateCheckIn) || visit.status === 'Exception' || visit.status === 'Missed';
                  return (
                    <button
                      key={visit.id}
                      type="button"
                      onClick={() => setSelectedVisit(visit)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        late
                          ? 'border-red-300 bg-red-50'
                          : active
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-gray-200 bg-white hover:border-primary/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`flex items-center gap-1.5 text-sm font-semibold ${late ? 'text-red-900' : 'text-gray-900'}`}>
                            <UserRound size={14} className="shrink-0 opacity-70" />
                            {visit.caregiverName || 'Caregiver'}
                          </p>
                          <p className={`mt-0.5 text-xs ${late ? 'text-red-700' : 'text-gray-500'}`}>
                            {formatTime(visit.scheduledStartAt, visit.timezone)}
                            {' – '}
                            {formatTime(visit.scheduledEndAt, visit.timezone)}
                            {formatTimezoneAbbr(visit.scheduledStartAt, visit.timezone)
                              ? ` ${formatTimezoneAbbr(visit.scheduledStartAt, visit.timezone)}`
                              : ''}
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[visit.status] || statusStyles.Scheduled}`}>
                          {statusLabel(visit)}
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
                      {(visit.checkInAt || visit.checkOutAt) && (
                        <p className="mt-2 text-[11px] text-gray-500">
                          {visit.checkInAt ? `In: ${formatTime(visit.checkInAt, visit.timezone)}` : 'Not checked in'}
                          {visit.checkOutAt ? ` · Out: ${formatTime(visit.checkOutAt, visit.timezone)}` : ''}
                        </p>
                      )}
                      {visit.lateCheckIn && (
                        <p className="mt-2 rounded-lg bg-red-100 px-2 py-1.5 text-[11px] font-semibold text-red-800">
                          Late check-in recorded{visit.exceptionReason ? `: ${visit.exceptionReason}` : ''}.
                        </p>
                      )}
                    </button>
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
