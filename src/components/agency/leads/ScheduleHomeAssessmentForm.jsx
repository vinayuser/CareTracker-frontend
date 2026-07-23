import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { formatDateUS, todayInputDate } from '../../../utils/dateFormat';

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-slate-50';
const labelClass = 'mb-1.5 block text-[13px] font-medium text-slate-600';

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
  const basic = lead?.formData?.basicInfo || {};
  const home = lead?.formData?.homeAssessment || {};
  return {
    visitDate: home.visitDate || todayInputDate(),
    visitTime: home.visitTime || '11:00',
    location: home.location || basic.zipLocation || lead?.formData?.familyRep?.address || '',
    assessorName: home.assessorName || lead?.assignedToName || authUser?.fullName || authUser?.name || '',
    notes: home.notes || '',
    createAssessmentAfter: !lead?.assessmentId,
  };
}

export default function ScheduleHomeAssessmentForm({
  lead,
  authUser,
  onSubmit,
  submitting = false,
  readOnly = false,
}) {
  const [form, setForm] = useState(() => buildInitial(lead, authUser));

  useEffect(() => {
    setForm(buildInitial(lead, authUser));
  }, [lead?.id, lead?.formData?.homeAssessment, authUser]);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = () => {
    if (readOnly) return;
    if (!form.visitDate) {
      window.alert('Visit date is required');
      return;
    }
    if (!form.visitTime) {
      window.alert('Visit time is required');
      return;
    }
    if (!form.assessorName.trim()) {
      window.alert('Assessor name is required');
      return;
    }
    onSubmit({
      visitDate: form.visitDate,
      visitTime: form.visitTime,
      location: form.location.trim(),
      assessorName: form.assessorName.trim(),
      notes: form.notes.trim(),
      createAssessmentAfter: Boolean(form.createAssessmentAfter),
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-sky-100 bg-sky-50/90 px-5 py-3">
        <h3 className="text-[15px] font-semibold text-slate-800">Schedule Home Assessment</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Add visit details and notes, then create the assessment from this lead.
        </p>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Visit Date" required>
            <div className="relative">
              <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                disabled={readOnly}
                type="date"
                value={form.visitDate}
                onChange={(e) => set('visitDate', e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
            {form.visitDate ? (
              <p className="mt-1 text-[11px] text-slate-400">{formatDateUS(form.visitDate)}</p>
            ) : null}
          </Field>
          <Field label="Visit Time" required>
            <div className="relative">
              <Clock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                disabled={readOnly}
                type="time"
                value={form.visitTime}
                onChange={(e) => set('visitTime', e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </Field>
          <Field label="Location" className="sm:col-span-2">
            <div className="relative">
              <MapPin size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                disabled={readOnly}
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="Home address for assessment"
              />
            </div>
          </Field>
          <Field label="Assessor" required className="sm:col-span-2">
            <input
              disabled={readOnly}
              value={form.assessorName}
              onChange={(e) => set('assessorName', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <textarea
              disabled={readOnly}
              rows={4}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className={`${inputClass} resize-y`}
              placeholder="Visit goals, access notes, family preferences..."
            />
          </Field>
        </div>

        {!lead?.assessmentId ? (
          <label className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={form.createAssessmentAfter}
              onChange={(e) => set('createAssessmentAfter', e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span>
              <span className="font-semibold text-slate-900">Create assessment after saving</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Prefills the assessment with lead, recipient, care, and contact details.
              </span>
            </span>
          </label>
        ) : null}

        {!readOnly ? (
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting
                ? 'Saving…'
                : form.createAssessmentAfter && !lead?.assessmentId
                  ? 'Save & Create Assessment'
                  : 'Save Schedule'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
