import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, User, BriefcaseMedical, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchCarePlans } from '../../../redux/slices/carePlansSlice';
import {
  createVisitSchedule,
  fetchCarePlanScheduleSources,
  fetchVisitScheduleOptions,
  updateVisitSchedule,
} from '../../../redux/slices/visitSchedulesSlice';
import { detectBrowserTimezone, DEFAULT_TIMEZONE, FALLBACK_TIMEZONES } from '../../../utils/visitTimezone';

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500';
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function inferRecurrence(frequency = '') {
  const f = String(frequency).toLowerCase();
  if (f.includes('daily') || f.includes('day')) return 'Daily';
  if (f.includes('month')) return 'Monthly';
  return 'Weekly';
}

function buildCardFromNeed(need, clientAddress, timezone) {
  return {
    enabled: true,
    care_need_area_key: need.area_key || '',
    service_area: need.area_label || '',
    caregiver_account_id: need.caregiver_account_id || '',
    caregiver_name: need.caregiver_name || '',
    frequency_hint: need.frequency || '',
    recurrence_type: inferRecurrence(need.frequency),
    days_of_week: need.schedule_days?.length ? need.schedule_days : ['Mon', 'Wed', 'Fri'],
    day_of_month: 1,
    start_time: need.start_time || '09:00',
    end_time: need.end_time || '11:00',
    grace_minutes: need.grace_minutes || 15,
    timezone: timezone || detectBrowserTimezone(),
    effective_from: new Date().toISOString().slice(0, 10),
    effective_to: '',
    notes: '',
    address: clientAddress || '',
  };
}

function CaregiverScheduleCard({
  card,
  index,
  recurrenceOptions,
  graceOptions,
  timezoneOptions,
  onChange,
  onToggleDay,
}) {
  return (
    <div className={`rounded-2xl border bg-white shadow-sm transition ${card.enabled ? 'border-primary/25' : 'border-gray-200 opacity-60'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onChange(index, { enabled: !card.enabled })}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
              card.enabled ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'
            }`}
            aria-label={card.enabled ? 'Include caregiver' : 'Exclude caregiver'}
          >
            {card.enabled ? <Check size={12} strokeWidth={3} /> : null}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User size={18} />
              </span>
              <div>
                <p className="text-base font-semibold text-gray-900">{card.caregiver_name || 'Caregiver'}</p>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <BriefcaseMedical size={12} />
                  {card.service_area || 'Service'}
                  {card.frequency_hint ? ` · Plan: ${card.frequency_hint}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${card.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
          {card.enabled ? 'Included' : 'Skipped'}
        </span>
      </div>

      <div className={`space-y-4 px-5 py-5 ${card.enabled ? '' : 'pointer-events-none'}`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Service area">
            <input
              className={inputClass}
              value={card.service_area}
              onChange={(e) => onChange(index, { service_area: e.target.value })}
            />
          </Field>
          <Field label="Recurrence">
            <select
              className={inputClass}
              value={card.recurrence_type}
              onChange={(e) => onChange(index, { recurrence_type: e.target.value })}
            >
              {recurrenceOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </Field>
          <Field label="Clock-in grace">
            <select
              className={inputClass}
              value={card.grace_minutes}
              onChange={(e) => onChange(index, { grace_minutes: Number(e.target.value) })}
            >
              {graceOptions.map((mins) => (
                <option key={mins} value={mins}>{mins} minutes</option>
              ))}
            </select>
          </Field>
          <Field label="Caregiver">
            <input className={`${inputClass} bg-gray-50`} value={card.caregiver_name} readOnly />
          </Field>
        </div>

        {card.recurrence_type === 'Weekly' && (
          <div>
            <p className={labelClass}>Days of week</p>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => {
                const active = card.days_of_week.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onToggleDay(index, day)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      active
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {card.recurrence_type === 'Monthly' && (
          <Field label="Day of month" className="max-w-[180px]">
            <input
              type="number"
              min={1}
              max={31}
              className={inputClass}
              value={card.day_of_month}
              onChange={(e) => onChange(index, { day_of_month: e.target.value })}
            />
          </Field>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Field label="Timezone" className="sm:col-span-2 xl:col-span-2">
            <select
              className={inputClass}
              value={card.timezone || DEFAULT_TIMEZONE}
              onChange={(e) => onChange(index, { timezone: e.target.value })}
            >
              {timezoneOptions.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Start time (local)">
            <input
              type="time"
              className={inputClass}
              value={card.start_time}
              onChange={(e) => onChange(index, { start_time: e.target.value })}
            />
          </Field>
          <Field label="End time (local)">
            <input
              type="time"
              className={inputClass}
              value={card.end_time}
              onChange={(e) => onChange(index, { end_time: e.target.value })}
            />
          </Field>
          <Field label="Effective from">
            <input
              type="date"
              className={inputClass}
              value={card.effective_from}
              onChange={(e) => onChange(index, { effective_from: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Effective to (optional)">
            <input
              type="date"
              className={inputClass}
              value={card.effective_to}
              onChange={(e) => onChange(index, { effective_to: e.target.value })}
            />
          </Field>
        </div>
        <p className="text-xs text-gray-500">
          Start/end times are wall-clock times in the selected timezone and are stored as UTC so clock-in windows stay correct on the server.
        </p>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Field label="Visit address">
            <input
              className={inputClass}
              value={card.address}
              onChange={(e) => onChange(index, { address: e.target.value })}
            />
          </Field>
          <Field label="Notes">
            <textarea
              rows={2}
              className={inputClass}
              value={card.notes}
              onChange={(e) => onChange(index, { notes: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

export default function VisitScheduleModal({ open, onClose, schedule, onSaved }) {
  const dispatch = useDispatch();
  const { list: carePlans } = useSelector((state) => state.carePlans);
  const { options } = useSelector((state) => state.visitSchedules);
  const [clientId, setClientId] = useState('');
  const [carePlanId, setCarePlanId] = useState('');
  const [sources, setSources] = useState(null);
  const [cards, setCards] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [loadingSources, setLoadingSources] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(schedule?.id);

  const activePlans = useMemo(
    () => (carePlans || []).filter((plan) => !plan.status || plan.status === 'Active'),
    [carePlans],
  );

  const clients = useMemo(() => {
    const map = new Map();
    activePlans.forEach((plan) => {
      const id = plan.clientId || plan.client?.id;
      if (!id || map.has(String(id))) return;
      const name = plan.client
        ? `${plan.client.firstName || plan.client.first_name || ''} ${plan.client.lastName || plan.client.last_name || ''}`.trim()
        : 'Client';
      map.set(String(id), { id: String(id), name: name || 'Client' });
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [activePlans]);

  const plansForClient = useMemo(
    () => activePlans.filter((plan) => String(plan.clientId || plan.client?.id || '') === String(clientId)),
    [activePlans, clientId],
  );

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    dispatch(fetchCarePlans({ status: 'Active' }));
    dispatch(fetchVisitScheduleOptions());
    return () => { document.body.style.overflow = ''; };
  }, [open, dispatch]);

  useEffect(() => {
    if (!open) return;
    if (schedule) {
      setEditForm({
        care_plan_id: schedule.carePlanId || '',
        caregiver_account_id: schedule.caregiverAccountId || '',
        caregiver_name: schedule.caregiverName || '',
        service_area: schedule.serviceArea || '',
        care_need_area_key: schedule.careNeedAreaKey || '',
        recurrence_type: schedule.recurrenceType || 'Weekly',
        days_of_week: schedule.daysOfWeek || [],
        day_of_month: schedule.dayOfMonth || 1,
        start_time: schedule.startTime || '09:00',
        end_time: schedule.endTime || '11:00',
        grace_minutes: schedule.graceMinutes || 15,
        timezone: schedule.timezone || detectBrowserTimezone(),
        effective_from: schedule.effectiveFrom || new Date().toISOString().slice(0, 10),
        effective_to: schedule.effectiveTo || '',
        notes: schedule.notes || '',
        address: schedule.address || '',
        status: schedule.status || 'Active',
      });
      setClientId('');
      setCarePlanId(schedule.carePlanId || '');
      setCards([]);
      setSources(null);
    } else {
      setEditForm(null);
      setClientId('');
      setCarePlanId('');
      setCards([]);
      setSources(null);
    }
  }, [open, schedule]);

  useEffect(() => {
    if (!open || isEdit || !clientId) return;
    if (plansForClient.length === 1) {
      setCarePlanId(plansForClient[0].id);
    } else if (!plansForClient.some((p) => p.id === carePlanId)) {
      setCarePlanId(plansForClient[0]?.id || '');
    }
  }, [open, isEdit, clientId, plansForClient]);

  useEffect(() => {
    if (!open || isEdit || !carePlanId) {
      if (!isEdit) {
        setSources(null);
        setCards([]);
      }
      return undefined;
    }

    let cancelled = false;
    setLoadingSources(true);
    dispatch(fetchCarePlanScheduleSources(carePlanId))
      .unwrap()
      .then((data) => {
        if (cancelled) return;
        setSources(data);
        const needs = (data.care_needs || []).filter((need) => need.caregiver_account_id);
        const defaultTz = detectBrowserTimezone();
        setCards(needs.map((need) => buildCardFromNeed(need, data.client?.address || '', defaultTz)));
      })
      .catch(() => {
        if (!cancelled) {
          setSources(null);
          setCards([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSources(false);
      });

    return () => { cancelled = true; };
  }, [open, isEdit, carePlanId, dispatch]);

  const recurrenceOptions = options?.recurrence_types || ['Daily', 'Weekly', 'Monthly'];
  const graceOptions = options?.grace_minutes || [15, 30];
  const timezoneOptions = useMemo(() => {
    const list = options?.timezones?.length ? options.timezones : FALLBACK_TIMEZONES;
    const browserTz = detectBrowserTimezone();
    if (list.some((tz) => tz.value === browserTz)) return list;
    return [{ value: browserTz, label: `${browserTz} (detected)` }, ...list];
  }, [options?.timezones]);

  const updateCard = (index, patch) => {
    setCards((prev) => prev.map((card, i) => (i === index ? { ...card, ...patch } : card)));
  };

  const toggleDay = (index, day) => {
    setCards((prev) => prev.map((card, i) => {
      if (i !== index) return card;
      const days = card.days_of_week.includes(day)
        ? card.days_of_week.filter((d) => d !== day)
        : [...card.days_of_week, day];
      return { ...card, days_of_week: days };
    }));
  };

  const enabledCards = cards.filter((card) => card.enabled && card.caregiver_account_id);

  const saveCreate = async () => {
    if (!carePlanId) {
      toast.error('Select a client / care plan');
      return;
    }
    if (enabledCards.length === 0) {
      toast.error('Include at least one caregiver schedule');
      return;
    }

    setSaving(true);
    try {
      let created = 0;
      for (const card of enabledCards) {
        if (card.recurrence_type === 'Weekly' && (!card.days_of_week || card.days_of_week.length === 0)) {
          toast.error(`Select days for ${card.caregiver_name || 'caregiver'}`);
          setSaving(false);
          return;
        }
        const result = await dispatch(createVisitSchedule({
          care_plan_id: carePlanId,
          caregiver_account_id: card.caregiver_account_id,
          service_area: card.service_area,
          care_need_area_key: card.care_need_area_key,
          recurrence_type: card.recurrence_type,
          days_of_week: card.recurrence_type === 'Weekly' ? card.days_of_week : [],
          day_of_month: card.recurrence_type === 'Monthly' ? Number(card.day_of_month) || 1 : null,
          start_time: card.start_time,
          end_time: card.end_time,
          grace_minutes: card.grace_minutes,
          timezone: card.timezone || detectBrowserTimezone(),
          effective_from: card.effective_from,
          effective_to: card.effective_to || '',
          notes: card.notes,
          address: card.address,
          status: 'Active',
        })).unwrap();
        created += Number(result?.created_count || result?.schedules?.length || 1);
      }
      toast.success(`Created ${created} day schedule${created === 1 ? '' : 's'}`);
      onSaved?.();
      onClose();
    } catch {
      // toast in slice
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      await dispatch(updateVisitSchedule({
        id: schedule.id,
        payload: {
          caregiver_account_id: editForm.caregiver_account_id,
          service_area: editForm.service_area,
          recurrence_type: editForm.recurrence_type,
          days_of_week: editForm.recurrence_type === 'Weekly' ? editForm.days_of_week : [],
          day_of_month: editForm.recurrence_type === 'Monthly' ? Number(editForm.day_of_month) || 1 : null,
          start_time: editForm.start_time,
          end_time: editForm.end_time,
          grace_minutes: editForm.grace_minutes,
          timezone: editForm.timezone,
          effective_from: editForm.effective_from,
          effective_to: editForm.effective_to || '',
          notes: editForm.notes,
          address: editForm.address,
          status: editForm.status,
        },
      })).unwrap();
      onSaved?.();
      onClose();
    } catch {
      // toast in slice
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center bg-black/50 p-0 sm:p-4">
      <div className="flex h-full w-full max-w-7xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[96vh] sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit ? 'Edit Visit Schedule' : 'New Visit Schedules'}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {isEdit
                ? 'Update this caregiver schedule.'
                : 'Select a client to load all pre-assigned caregivers and set each schedule.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#f5f7fa] px-5 py-5 sm:px-6">
          {isEdit && editForm ? (
            <div className="mx-auto max-w-4xl">
              <CaregiverScheduleCard
                card={{
                  ...editForm,
                  enabled: true,
                  caregiver_name: editForm.caregiver_name,
                  frequency_hint: '',
                }}
                index={0}
                recurrenceOptions={recurrenceOptions}
                graceOptions={graceOptions}
                timezoneOptions={timezoneOptions}
                onChange={(_, patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
                onToggleDay={(_, day) => {
                  setEditForm((prev) => {
                    const days = prev.days_of_week.includes(day)
                      ? prev.days_of_week.filter((d) => d !== day)
                      : [...prev.days_of_week, day];
                    return { ...prev, days_of_week: days };
                  });
                }}
              />
              <div className="mt-4">
                <Field label="Status" className="max-w-xs">
                  <select
                    className={inputClass}
                    value={editForm.status}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    {(options?.schedule_statuses || ['Active', 'Paused', 'Ended']).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-6xl space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Client">
                    <select
                      className={inputClass}
                      value={clientId}
                      onChange={(e) => {
                        setClientId(e.target.value);
                        setCarePlanId('');
                        setCards([]);
                        setSources(null);
                      }}
                    >
                      <option value="">Select client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Care plan">
                    <select
                      className={inputClass}
                      value={carePlanId}
                      disabled={!clientId || plansForClient.length === 0}
                      onChange={(e) => setCarePlanId(e.target.value)}
                    >
                      <option value="">
                        {!clientId ? 'Select client first' : plansForClient.length ? 'Select care plan' : 'No active care plan'}
                      </option>
                      {plansForClient.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.planCode || plan.id}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {sources?.client && (
                  <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-gray-700">
                    Scheduling for <strong className="text-gray-900">{sources.client.name}</strong>
                    {sources.client.address ? ` · ${sources.client.address}` : ''}
                    {sources.client.care_frequency ? ` · Prefers ${sources.client.care_frequency}` : ''}
                  </div>
                )}
              </div>

              {loadingSources ? (
                <div className="rounded-2xl border border-gray-200 bg-white px-5 py-16 text-center text-sm text-gray-500 shadow-sm">
                  Loading assigned caregivers...
                </div>
              ) : !carePlanId ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center shadow-sm">
                  <p className="text-sm font-medium text-gray-900">Select a client to begin</p>
                  <p className="mt-1 text-sm text-gray-500">
                    All caregivers assigned on the care plan services will appear below as separate schedule cards.
                  </p>
                </div>
              ) : cards.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-5 py-12 text-center">
                  <p className="text-sm font-medium text-amber-900">No caregivers assigned on this care plan</p>
                  <p className="mt-1 text-sm text-amber-800">
                    Assign responsible staff on care plan care needs first, then create schedules.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-700">
                      {cards.length} caregiver{cards.length === 1 ? '' : 's'} from care plan services
                    </p>
                    <p className="text-xs text-gray-500">
                      {enabledCards.length} selected to create
                    </p>
                  </div>
                  {cards.map((card, index) => (
                    <CaregiverScheduleCard
                      key={`${card.caregiver_account_id}-${card.care_need_area_key}-${index}`}
                      card={card}
                      index={index}
                      recurrenceOptions={recurrenceOptions}
                      graceOptions={graceOptions}
                      timezoneOptions={timezoneOptions}
                      onChange={updateCard}
                      onToggleDay={toggleDay}
                    />
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500">
                Each selected day in the date range is saved as its own schedule record, so you can edit or delete one day without affecting the others.
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-gray-200 bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || (isEdit ? !editForm : enabledCards.length === 0)}
            onClick={isEdit ? saveEdit : saveCreate}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {saving
              ? 'Saving…'
              : isEdit
                ? 'Save Changes'
                : `Create ${enabledCards.length || ''} Schedule${enabledCards.length === 1 ? '' : 's'}`.replace(/\s+/g, ' ').trim()}
          </button>
        </div>
      </div>
    </div>
  );
}
