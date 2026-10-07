import { useEffect, useMemo, useState } from 'react';
import { Check, Phone, Save } from 'lucide-react';
import { RELATIONSHIPS, joinLeadName } from '../../../utils/leadForm';
import { formatDateUS, nowInputDateTimeLocal, todayInputDate, toInputDate } from '../../../utils/dateFormat';
import SubmitButton from '../../ui/SubmitButton';

const CONTACT_METHODS = [
  'Mobile Call',
  'Landline Call',
  'Email',
  'SMS',
  'WhatsApp',
  'In Person',
  'Video Call',
];

const CALL_STATUSES = [
  {
    id: 'move_next',
    label: 'Move to Next Level',
    desc: 'Proceed to the next stage in lead process.',
  },
  {
    id: 'cancel',
    label: 'Cancel / Disqualify Lead',
    desc: 'Lead is not interested or not a good fit.',
  },
  {
    id: 'needs_time',
    label: 'Needs More Time',
    desc: 'Follow up later.',
  },
];

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-slate-50';
const labelClass = 'mb-1.5 block text-[13px] font-medium text-slate-600';
const cardClass = 'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm';

function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className={labelClass}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

function buildInitial(lead, authUser) {
  const log = lead?.formData?.contactLog || {};
  const defaultSpokeWith = joinLeadName(
    lead?.formData?.basicInfo?.firstName,
    lead?.formData?.basicInfo?.lastName,
  ) || lead?.formData?.basicInfo?.fullName || lead?.fullName || '';
  const defaultAssignee = lead?.assignedToName || authUser?.fullName || authUser?.name || '';
  let contactedAt = nowInputDateTimeLocal();
  if (log.contactedAt) {
    try {
      const d = new Date(log.contactedAt);
      if (!Number.isNaN(d.getTime())) {
        const pad = (n) => String(n).padStart(2, '0');
        contactedAt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    } catch {
      // keep now
    }
  }
  return {
    contactMethod: log.contactMethod || 'Mobile Call',
    contactedAt,
    spokeWith: log.spokeWith || defaultSpokeWith,
    relationship: log.relationship || lead?.formData?.basicInfo?.relationship || 'Self',
    contactedBy: log.contactedBy || defaultAssignee,
    designation: log.designation || authUser?.title || authUser?.designation || 'Intake Coordinator',
    notes: log.notes || '',
    followUpDate: (() => {
      const today = todayInputDate();
      const saved = log.followUpDate ? toInputDate(log.followUpDate) : '';
      // Never seed a past follow-up date
      if (saved && saved >= today) return saved;
      return today;
    })(),
    followUpTime: log.followUpTime || '11:00',
    callStatus: log.callStatus || 'move_next',
    nextLevel: 'Schedule Home Assessment',
    assignTo: log.assignTo || defaultAssignee,
  };
}

export default function LeadContactedForm({
  lead,
  authUser,
  onSubmit,
  submitting = false,
  readOnly = false,
}) {
  const leadId = lead?.id || '';
  const savedContactKey = [
    lead?.formData?.contactLog?.callStatus || '',
    lead?.formData?.contactLog?.contactedAt || '',
    lead?.formData?.contactLog?.notes || '',
  ].join('|');

  const [form, setForm] = useState(() => buildInitial(lead, authUser));

  // Only re-hydrate from server when the lead or saved contact log changes — not on every parent render.
  useEffect(() => {
    setForm(buildInitial(lead, authUser));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- authUser used for defaults; avoid reset on identity churn
  }, [leadId, savedContactKey]);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const notesLen = form.notes.length;
  const showNextLevel = form.callStatus === 'move_next';

  const contactedAtLabel = useMemo(() => {
    if (!form.contactedAt) return '';
    return formatDateUS(form.contactedAt.split('T')[0]);
  }, [form.contactedAt]);

  const validate = () => {
    if (!form.contactMethod) return 'Contact Method is required';
    if (!form.contactedAt) return 'Contact Date & Time is required';
    if (!form.spokeWith.trim()) return 'Spoke With is required';
    if (!form.contactedBy.trim()) return 'Contacted By is required';
    if (!form.notes.trim()) return 'Call Outcome / Notes is required';
    if (form.notes.length > 500) return 'Notes must be 500 characters or less';
    if (form.callStatus === 'move_next') {
      if (!form.assignTo.trim()) return 'Assign To is required';
    }
    if (form.callStatus === 'needs_time' && !form.followUpDate) {
      return 'Follow-up date is required';
    }
    if (form.followUpDate && form.followUpDate < todayInputDate()) {
      return 'Next Follow-up Date cannot be earlier than today';
    }
    return null;
  };

  const handleSubmit = (forceCancel = false) => {
    if (readOnly) return;
    const payloadForm = forceCancel ? { ...form, callStatus: 'cancel' } : form;
    if (!forceCancel) {
      const err = validate();
      if (err) {
        window.alert(err);
        return;
      }
    } else if (!payloadForm.spokeWith.trim() || !payloadForm.contactedBy.trim()) {
      window.alert('Spoke With and Contacted By are required to cancel a lead.');
      return;
    }
    onSubmit({
      contactMethod: payloadForm.contactMethod,
      contactedAt: payloadForm.contactedAt ? new Date(payloadForm.contactedAt).toISOString() : null,
      spokeWith: payloadForm.spokeWith.trim(),
      relationship: payloadForm.relationship,
      contactedBy: payloadForm.contactedBy.trim(),
      designation: payloadForm.designation.trim(),
      notes: payloadForm.notes.trim() || (forceCancel ? 'Lead cancelled / disqualified.' : ''),
      followUpDate: payloadForm.followUpDate ? toInputDate(payloadForm.followUpDate) : '',
      followUpTime: payloadForm.followUpTime || '',
      callStatus: payloadForm.callStatus,
      nextLevel: payloadForm.nextLevel,
      assignTo: payloadForm.assignTo.trim(),
      addReminder: false,
      reminderTask: '',
    });
  };

  return (
    <div className={cardClass}>
      <div className="border-b border-sky-100 bg-sky-50/90 px-5 py-3">
        <h3 className="text-[15px] font-semibold text-slate-800">Lead Contacted</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Log the contact details and move the lead to the next stage.
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact Method" required>
            <div className="relative">
              <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                disabled={readOnly}
                value={form.contactMethod}
                onChange={(e) => set('contactMethod', e.target.value)}
                className={`${inputClass} pl-9`}
              >
                {CONTACT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </Field>
          <Field label="Contact Date & Time" required>
            <input
              disabled={readOnly}
              type="datetime-local"
              value={form.contactedAt}
              onChange={(e) => set('contactedAt', e.target.value)}
              className={inputClass}
            />
            {contactedAtLabel ? (
              <p className="mt-1 text-[11px] text-slate-400">{contactedAtLabel}</p>
            ) : null}
          </Field>
          <Field label="Spoke With" required>
            <div className="relative">
              <input
                disabled={readOnly}
                value={form.spokeWith}
                onChange={(e) => set('spokeWith', e.target.value)}
                className={`${inputClass} pr-9`}
              />
              {form.spokeWith.trim() ? (
                <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              ) : null}
            </div>
          </Field>
          <Field label="Relationship">
            <select
              disabled={readOnly}
              value={form.relationship}
              onChange={(e) => set('relationship', e.target.value)}
              className={inputClass}
            >
              {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Contacted By (Representative)" required>
            <input
              disabled={readOnly}
              value={form.contactedBy}
              onChange={(e) => set('contactedBy', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Designation">
            <input
              disabled={readOnly}
              value={form.designation}
              onChange={(e) => set('designation', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Call Outcome / Notes" required className="sm:col-span-2">
            <textarea
              disabled={readOnly}
              rows={4}
              maxLength={500}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className={`${inputClass} resize-y`}
              placeholder="Summarize the conversation..."
            />
            <p className="mt-1 text-right text-[11px] text-slate-400">{notesLen}/500</p>
          </Field>
          <Field label="Next Follow-up Date">
            <input
              disabled={readOnly}
              type="date"
              min={todayInputDate()}
              value={form.followUpDate}
              onChange={(e) => {
                const next = e.target.value;
                const today = todayInputDate();
                set('followUpDate', next && next < today ? today : next);
              }}
              className={inputClass}
            />
            {form.followUpDate ? (
              <p className="mt-1 text-[11px] text-slate-400">{formatDateUS(form.followUpDate)}</p>
            ) : null}
          </Field>
          <Field label="Next Follow-up Time">
            <input
              disabled={readOnly}
              type="time"
              value={form.followUpTime}
              onChange={(e) => set('followUpTime', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div>
          <p className={labelClass}>
            Call Status <span className="text-red-500">*</span>
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {CALL_STATUSES.map((opt) => {
              const active = form.callStatus === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={readOnly}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!readOnly) set('callStatus', opt.id);
                  }}
                  className={`rounded-xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    active
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="block text-sm font-semibold text-slate-800">{opt.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {showNextLevel ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Next step">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800">
                Assessment Scheduled
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Submitting moves this lead one step forward — no skipping.
              </p>
            </Field>
            <Field label="Assign To" required>
              <input
                disabled={readOnly}
                value={form.assignTo}
                onChange={(e) => set('assignTo', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        ) : null}

        {!readOnly ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <SubmitButton
              type="button"
              loading={submitting}
              onClick={() => handleSubmit(true)}
              loadingLabel="Saving..."
              className="rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Cancel Lead
            </SubmitButton>
            <SubmitButton
              type="button"
              loading={submitting}
              icon={Save}
              onClick={() => handleSubmit(false)}
              loadingLabel="Saving..."
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              {form.callStatus === 'move_next'
                ? 'Save & Move to Next Level'
                : form.callStatus === 'cancel'
                  ? 'Save & Disqualify'
                  : 'Save Contact'}
            </SubmitButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}
