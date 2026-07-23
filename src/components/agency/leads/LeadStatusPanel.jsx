import { Calendar, ClipboardList, Flame, Plus } from 'lucide-react';
import { LEAD_PRIORITIES, LEAD_STAGES } from '../../../utils/leadForm';
import { formatDateUS } from '../../../utils/dateFormat';

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-slate-50';
const labelClass = 'mb-1.5 block text-[13px] font-medium text-slate-600';

export default function LeadStatusPanel({
  form,
  onHeaderChange,
  readOnly = false,
  preferredStartDate = '',
}) {
  const hot = form.priority === 'Hot' || form.priority === 'High';

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-sky-100 bg-sky-50/90 px-5 py-3">
        <h3 className="text-[15px] font-semibold text-slate-800">Lead Status & Next Action</h3>
        <span className="text-xs font-medium text-slate-500">Visible on every step</span>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={labelClass}>Lead Status</label>
          <select
            disabled={readOnly}
            value={form.stage || 'New Lead'}
            onChange={(e) => onHeaderChange('stage', e.target.value)}
            className={inputClass}
          >
            {LEAD_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-400">
            Changing status opens that step’s form below.
          </p>
        </div>

        <div>
          <label className={labelClass}>Lead Priority</label>
          <div className="relative">
            {hot ? (
              <Flame size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
            ) : null}
            <select
              disabled={readOnly}
              value={form.priority || 'Medium'}
              onChange={(e) => onHeaderChange('priority', e.target.value)}
              className={`${inputClass} ${hot ? 'pl-9' : ''}`}
            >
              {LEAD_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Next Action</label>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-3">
            {readOnly ? (
              <>
                <p className="flex items-start gap-2 text-sm font-semibold text-slate-800">
                  <ClipboardList size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  {form.nextAction || 'No next action set'}
                </p>
                {preferredStartDate ? (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={15} className="text-emerald-600" />
                    {formatDateUS(preferredStartDate)}
                  </p>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="lead-next-action-input"
                  value={form.nextAction || ''}
                  onChange={(e) => onHeaderChange('nextAction', e.target.value)}
                  className={inputClass}
                  placeholder="Schedule Home Assessment"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('lead-next-action-input')?.focus()}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-white px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
                >
                  <Plus size={15} /> Add Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
