import { Flame } from 'lucide-react';
import { LEAD_PRIORITIES, LEAD_STAGES } from '../../../utils/leadForm';
import { canVisitLeadStep } from '../../../utils/leadFormValidation';

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-slate-50';
const labelClass = 'mb-1.5 block text-[13px] font-medium text-slate-600';

export default function LeadStatusPanel({
  form,
  activeView,
  onViewChange,
  onHeaderChange,
  readOnly = false,
}) {
  const hot = form.priority === 'Hot' || form.priority === 'High';
  const savedStage = form.stage || 'New Lead';
  const viewValue = activeView || savedStage;

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-sky-100 bg-sky-50/90 px-5 py-3">
        <h3 className="text-[15px] font-semibold text-slate-800">Lead Status</h3>
        <span className="text-xs font-medium text-slate-500">
          Saved step: <span className="font-semibold text-slate-700">{savedStage}</span>
        </span>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>View step</label>
          <select
            disabled={readOnly}
            value={viewValue}
            onChange={(e) => {
              const next = e.target.value;
              if (!canVisitLeadStep(savedStage, next)) return;
              onViewChange?.(next);
            }}
            className={inputClass}
          >
            {LEAD_STAGES.map((s) => (
              <option key={s} value={s} disabled={!canVisitLeadStep(savedStage, s)}>
                {s}{!canVisitLeadStep(savedStage, s) ? ' (locked)' : ''}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-400">
            Future steps stay locked until the current step is completed and saved.
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
      </div>
    </section>
  );
}
