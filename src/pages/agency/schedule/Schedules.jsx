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
  Pencil,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import AgencyKpiCard from '../../../components/agency/dashboard/AgencyKpiCard';
import VisitScheduleModal from '../../../components/agency/schedule/VisitScheduleModal';
import VisitMonthCalendar from '../../../components/agency/schedule/VisitMonthCalendar';
import {
  deleteVisitSchedule,
  fetchAgencyVisits,
  fetchVisitScheduleStats,
  fetchVisitSchedules,
} from '../../../redux/slices/visitSchedulesSlice';
import { confirmAlert } from '../../../utils/swal';

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

export default function Schedules() {
  const dispatch = useDispatch();
  const { list, visits, stats, loading } = useSelector((state) => state.visitSchedules);
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(toDateKey(now));
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadMonth = (year = cursor.year, month = cursor.month) => {
    const { from, to } = monthRange(year, month);
    dispatch(fetchAgencyVisits({ from, to }));
    dispatch(fetchVisitScheduleStats());
    dispatch(fetchVisitSchedules());
  };

  useEffect(() => {
    loadMonth();
  }, [dispatch, cursor.year, cursor.month]);

  const dayVisits = useMemo(
    () => visits
      .filter((visit) => visit.scheduledDate === selectedDate)
      .sort((a, b) => new Date(a.scheduledStartAt) - new Date(b.scheduledStartAt)),
    [visits, selectedDate],
  );

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

  const openCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEditFromVisit = (visit) => {
    const schedule = list.find((item) => item.id === visit.scheduleId);
    if (!schedule) return;
    setEditing(schedule);
    setDrawerOpen(true);
  };

  const handleDeleteFromVisit = async (visit) => {
    const schedule = list.find((item) => item.id === visit.scheduleId);
    if (!schedule) return;
    const confirmed = await confirmAlert({
      title: 'Delete schedule?',
      text: `Delete ${schedule.scheduleCode}? Future scheduled visits will be removed.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    await dispatch(deleteVisitSchedule(schedule.id));
    loadMonth();
    setSelectedVisit(null);
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Visit Schedules</h1>
          <p className="mt-1 text-sm text-gray-500">
            Calendar of running caregiver visits generated from care plan schedules.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus size={16} /> New Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AgencyKpiCard label="Active Schedules" value={String(stats.schedules_active)} icon={CalendarClock} iconBg="bg-blue-100 text-blue-600" />
        <AgencyKpiCard label="Visits Today" value={String(stats.visits_today)} icon={Clock} iconBg="bg-amber-100 text-amber-600" />
        <AgencyKpiCard label="In Progress" value={String(stats.visits_in_progress)} icon={CheckCircle} iconBg="bg-emerald-100 text-emerald-600" />
        <AgencyKpiCard label="Missed" value={String(stats.visits_missed)} icon={AlertTriangle} iconBg="bg-red-100 text-red-600" />
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
          {loading && visits.length === 0 ? (
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
                <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-gray-900">No visits this day</p>
                  <p className="mt-1 text-xs text-gray-500">Create a schedule to generate recurring visits.</p>
                  <button
                    type="button"
                    onClick={openCreate}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
                  >
                    <Plus size={14} /> New Schedule
                  </button>
                </div>
              ) : (
                dayVisits.map((visit) => {
                  const active = selectedVisit?.id === visit.id;
                  const alert = Boolean(visit.lateCheckIn) || visit.status === 'Exception' || visit.status === 'Missed';
                  return (
                    <div
                      key={visit.id}
                      className={`rounded-xl border p-3 transition ${
                        alert
                          ? 'border-red-300 bg-red-50'
                          : active
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-gray-200 bg-white hover:border-primary/20'
                      }`}
                    >
                      <button type="button" className="w-full text-left" onClick={() => setSelectedVisit(visit)}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-sm font-semibold ${alert ? 'text-red-900' : 'text-gray-900'}`}>{visit.clientName}</p>
                            <p className={`mt-0.5 text-xs ${alert ? 'text-red-700' : 'text-gray-500'}`}>
                              {formatTime(visit.scheduledStartAt)} – {formatTime(visit.scheduledEndAt)}
                            </p>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[visit.status] || statusStyles.Scheduled}`}>
                            {visit.lateCheckIn ? 'Late' : visit.status}
                          </span>
                        </div>
                        <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                          <User size={12} /> {visit.caregiverName}
                        </p>
                        {visit.serviceArea && (
                          <p className="mt-1 text-xs text-gray-400">{visit.serviceArea}</p>
                        )}
                        {visit.address && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                            <MapPin size={12} /> {visit.address}
                          </p>
                        )}
                        <p className={`mt-1 text-xs ${alert ? 'font-medium text-red-700' : 'text-gray-400'}`}>
                          Grace: {visit.graceMinutes || 15} min
                          {visit.lateCheckIn ? ' · Checked in after grace' : ''}
                        </p>
                      </button>

                      {active && (
                        <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                          <button
                            type="button"
                            onClick={() => openEditFromVisit(visit)}
                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil size={13} /> Edit schedule
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFromVisit(visit)}
                            className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                          </button>
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

      <VisitScheduleModal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        schedule={editing}
        onSaved={loadMonth}
      />
    </div>
  );
}
