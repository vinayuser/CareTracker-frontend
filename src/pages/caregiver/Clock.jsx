import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Clock, Play, Square, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import {
  checkInVisit,
  checkOutVisit,
  fetchActiveVisit,
  fetchCaregiverVisits,
  fetchVisitTimer,
} from '../../redux/slices/visitSchedulesSlice';
import { toDateKey } from '../../utils/evvVisitLogs';

function formatElapsedSeconds(totalSeconds) {
  const total = Math.max(0, Math.floor(Number(totalSeconds) || 0));
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

function formatDuration(checkInAt, checkOutAt, billableMinutes) {
  if (billableMinutes != null) {
    const h = Math.floor(billableMinutes / 60);
    const m = billableMinutes % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  }
  if (!checkInAt || !checkOutAt) return '—';
  const ms = new Date(checkOutAt) - new Date(checkInAt);
  if (ms < 0) return '—';
  const mins = Math.round(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

function visitLabel(visit) {
  if (!visit) return '';
  return `${visit.clientName || 'Client'} · ${visit.serviceArea || 'Visit'} · ${formatTime(visit.scheduledStartAt)}`;
}

async function readGeo() {
  if (!navigator.geolocation) return {};
  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      });
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return {};
  }
}

export default function CaregiverClock() {
  const dispatch = useDispatch();
  const { caregiverVisits, activeVisit } = useSelector((state) => state.visitSchedules);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [geoWarning, setGeoWarning] = useState('');

  const todayKey = toDateKey(new Date());

  const reload = async () => {
    const from = todayKey;
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 1);
    const [visits] = await Promise.all([
      dispatch(fetchCaregiverVisits({ from, to: toDateKey(toDate) })).unwrap(),
      dispatch(fetchActiveVisit()).unwrap().catch(() => null),
    ]);
    return visits;
  };

  const syncTimer = async (visitId) => {
    if (!visitId) return;
    try {
      const status = await dispatch(fetchVisitTimer(visitId)).unwrap();
      setElapsedSeconds(status.elapsedSeconds || 0);
      setIsRunning(Boolean(status.isTimerRunning));
      setBlockReason(status.clockBlockReason || '');
      if (status.visit?.geoWarning) setGeoWarning(status.visit.geoWarning);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    reload()
      .then(async (visits) => {
        if (cancelled) return;
        const running = (visits || []).find((v) => v.isTimerRunning || (v.checkInAt && !v.checkOutAt));
        const firstEligible = (visits || []).find((v) => v.canCheckIn || v.clockAllowed);
        const pick = running?.id || firstEligible?.id || '';
        setSelectedId(pick);
        if (pick) await syncTimer(pick);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [dispatch]);

  useEffect(() => {
    if (!selectedId) return undefined;
    syncTimer(selectedId);
    const syncId = setInterval(() => syncTimer(selectedId), 30000);
    return () => clearInterval(syncId);
  }, [selectedId]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const todaysVisits = useMemo(
    () => (caregiverVisits || []).filter((v) => v.scheduledDate === todayKey
      || v.isTimerRunning
      || (v.checkInAt && !v.checkOutAt)),
    [caregiverVisits, todayKey],
  );

  const selectedVisit = useMemo(
    () => todaysVisits.find((v) => v.id === selectedId)
      || caregiverVisits.find((v) => v.id === selectedId)
      || activeVisit,
    [todaysVisits, caregiverVisits, selectedId, activeVisit],
  );

  const recentShifts = useMemo(
    () => caregiverVisits
      .filter((v) => v.checkOutAt)
      .sort((a, b) => new Date(b.checkOutAt) - new Date(a.checkOutAt))
      .slice(0, 5),
    [caregiverVisits],
  );

  const handleClockIn = async () => {
    if (!selectedVisit || actionBusy || !selectedVisit.canCheckIn) return;
    setActionBusy(true);
    setGeoWarning('');
    try {
      const geo = await readGeo();
      const visit = await dispatch(checkInVisit({
        id: selectedVisit.id,
        payload: { method: 'Mobile App', ...geo },
      })).unwrap();
      if (visit.geoWarning) setGeoWarning(visit.geoWarning);
      setIsRunning(true);
      setElapsedSeconds(visit.liveElapsedSeconds || 0);
      await reload();
      await syncTimer(visit.id);
    } catch {
      // toast in slice
    } finally {
      setActionBusy(false);
    }
  };

  const handleClockOut = async () => {
    if (!selectedVisit || actionBusy || !selectedVisit.canCheckOut) return;
    setActionBusy(true);
    try {
      const geo = await readGeo();
      await dispatch(checkOutVisit({
        id: selectedVisit.id,
        payload: { method: 'Mobile App', ...geo },
      })).unwrap();
      setIsRunning(false);
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

  const running = Boolean(selectedVisit?.isTimerRunning || (selectedVisit?.canCheckOut && isRunning));

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${running ? 'bg-emerald-50' : 'bg-gray-100'}`}>
          <Clock size={40} className={running ? 'text-emerald-600' : 'text-gray-400'} />
        </div>
        <p className="mt-4 text-4xl font-bold tabular-nums text-gray-900">
          {formatElapsedSeconds(elapsedSeconds)}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {running
            ? (selectedVisit?.lateCheckIn ? 'Late visit in progress' : 'Visit in progress')
            : 'Select a visit and clock in'}
        </p>

        <div className="mt-4 text-left">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
            Today&apos;s visit / job
          </label>
          <select
            value={selectedId}
            disabled={running}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setBlockReason('');
              setGeoWarning('');
            }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-gray-50"
          >
            <option value="">Select visit…</option>
            {todaysVisits.map((visit) => (
              <option key={visit.id} value={visit.id}>
                {visitLabel(visit)}
                {visit.isTimerRunning ? ' (active)' : ''}
                {visit.checkOutAt ? ' (ended)' : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedVisit && (
          <div className={`mt-4 rounded-lg px-4 py-3 text-left text-sm ${selectedVisit.lateCheckIn ? 'bg-red-50' : 'bg-gray-50'}`}>
            <p className="font-medium text-gray-900">{selectedVisit.clientName}</p>
            <p className="text-xs text-gray-500">{selectedVisit.serviceArea || 'Service visit'}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} />
              {selectedVisit.address || 'Address on file'}
              {' · '}
              {formatTime(selectedVisit.scheduledStartAt)} – {formatTime(selectedVisit.scheduledEndAt)}
            </p>
            {selectedVisit.graceMinutes != null && (
              <p className="mt-1 text-xs text-gray-400">
                Grace window: {selectedVisit.graceMinutes} minutes
              </p>
            )}
          </div>
        )}

        {(blockReason || selectedVisit?.clockBlockReason) && !running && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs text-amber-800">
            {blockReason || selectedVisit.clockBlockReason}
          </p>
        )}
        {geoWarning && (
          <p className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-left text-xs text-orange-800">
            {geoWarning}
          </p>
        )}

        {running ? (
          <button
            type="button"
            disabled={actionBusy}
            onClick={handleClockOut}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            <Square size={18} /> {actionBusy ? 'Ending…' : 'End Visit / Clock Out'}
          </button>
        ) : selectedVisit?.canCheckIn ? (
          <button
            type="button"
            disabled={actionBusy || (selectedVisit.clockAllowed === false)}
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

        <button
          type="button"
          onClick={() => selectedId && syncTimer(selectedId)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
        >
          <RefreshCw size={12} /> Sync timer from server
        </button>
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
                  {shift.scheduledDate} · {formatDuration(shift.checkInAt, shift.checkOutAt, shift.billableMinutes)}
                  {shift.amountSnapshot != null ? ` · $${Number(shift.amountSnapshot).toFixed(2)}` : ''}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
