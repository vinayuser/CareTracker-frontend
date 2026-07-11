import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Clock, Play, Square, MapPin, Loader2 } from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import {
  checkInVisit,
  checkOutVisit,
  fetchCaregiverVisits,
} from '../../redux/slices/visitSchedulesSlice';
import { toDateKey } from '../../utils/evvVisitLogs';

function formatElapsed(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDuration(checkInAt, checkOutAt) {
  if (!checkInAt || !checkOutAt) return '—';
  const ms = new Date(checkOutAt) - new Date(checkInAt);
  if (ms < 0) return '—';
  const mins = Math.round(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

export default function CaregiverClock() {
  const dispatch = useDispatch();
  const { caregiverVisits } = useSelector((state) => state.visitSchedules);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  const todayKey = toDateKey(new Date());

  const reload = () => {
    const from = todayKey;
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 1);
    return dispatch(fetchCaregiverVisits({ from, to: toDateKey(toDate) })).unwrap();
  };

  useEffect(() => {
    setLoading(true);
    reload()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const activeVisit = useMemo(
    () => caregiverVisits.find((v) => v.canCheckOut || (v.checkInAt && !v.checkOutAt && ['InProgress', 'Exception'].includes(v.status))),
    [caregiverVisits],
  );

  const nextVisit = useMemo(
    () => caregiverVisits.find((v) => v.canCheckIn || (['Scheduled', 'Late', 'Missed'].includes(v.status) && !v.checkInAt)),
    [caregiverVisits],
  );

  const recentShifts = useMemo(
    () => caregiverVisits
      .filter((v) => v.checkOutAt)
      .sort((a, b) => new Date(b.checkOutAt) - new Date(a.checkOutAt))
      .slice(0, 5),
    [caregiverVisits],
  );

  const elapsed = activeVisit?.checkInAt
    ? formatElapsed(now - new Date(activeVisit.checkInAt).getTime())
    : '00:00:00';

  const handleClockIn = async () => {
    if (!nextVisit || actionBusy) return;
    setActionBusy(true);
    try {
      await dispatch(checkInVisit({ id: nextVisit.id, payload: { method: 'Mobile App' } })).unwrap();
      await reload();
    } catch {
      // toast in slice
    } finally {
      setActionBusy(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeVisit || actionBusy || activeVisit.checkOutAt) return;
    setActionBusy(true);
    try {
      await dispatch(checkOutVisit({ id: activeVisit.id, payload: { method: 'Mobile App' } })).unwrap();
      await reload();
    } catch {
      // toast in slice
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
        <Loader2 size={18} className="animate-spin" />
        Loading clock…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${activeVisit ? 'bg-emerald-50' : 'bg-gray-100'}`}>
          <Clock size={40} className={activeVisit ? 'text-emerald-600' : 'text-gray-400'} />
        </div>
        <p className="mt-4 text-4xl font-bold tabular-nums text-gray-900">{elapsed}</p>
        <p className="mt-1 text-sm text-gray-500">
          {activeVisit ? (activeVisit.lateCheckIn ? 'Late visit in progress' : 'Visit in progress') : 'Ready to clock in'}
        </p>

        {activeVisit && (
          <div className={`mt-4 rounded-lg px-4 py-3 text-left text-sm ${activeVisit.lateCheckIn ? 'bg-red-50' : 'bg-gray-50'}`}>
            <p className="font-medium text-gray-900">{activeVisit.clientName}</p>
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} />
              {activeVisit.address || 'Address on file'}
              {' · '}
              {formatTime(activeVisit.scheduledStartAt)} – {formatTime(activeVisit.scheduledEndAt)}
            </p>
          </div>
        )}

        {!activeVisit && nextVisit && (
          <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-left text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Next visit</p>
            <p className="mt-1 font-medium text-gray-900">{nextVisit.clientName}</p>
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} />
              {formatTime(nextVisit.scheduledStartAt)} – {formatTime(nextVisit.scheduledEndAt)}
            </p>
          </div>
        )}

        {activeVisit ? (
          <button
            type="button"
            disabled={actionBusy}
            onClick={handleClockOut}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            <Square size={18} /> {actionBusy ? 'Ending…' : 'End Visit / Clock Out'}
          </button>
        ) : nextVisit ? (
          <button
            type="button"
            disabled={actionBusy}
            onClick={handleClockIn}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Play size={18} /> {actionBusy ? 'Starting…' : 'Start Visit / Clock In'}
          </button>
        ) : (
          <Link
            to={ROUTES.CAREGIVER_JOBS}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            View Schedule
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900">Recent Shifts</h3>
        <div className="mt-3 space-y-3 text-sm">
          {recentShifts.length === 0 ? (
            <p className="py-4 text-center text-gray-500">No completed visits yet.</p>
          ) : (
            recentShifts.map((shift) => (
              <div key={shift.id} className="flex justify-between border-b border-gray-50 pb-2 last:border-0">
                <span className="text-gray-900">{shift.clientName}</span>
                <span className="text-gray-500">
                  {shift.scheduledDate} · {formatDuration(shift.checkInAt, shift.checkOutAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
