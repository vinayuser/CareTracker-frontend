import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import SubmitButton from '../../ui/SubmitButton';
import { todayInputDate } from '../../../utils/dateFormat';

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-slate-50';
const inputErrorClass =
  'w-full rounded-lg border border-red-400 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200';
const labelClass = 'mb-1.5 block text-[13px] font-medium text-slate-600';

export default function LeadProposalStep({
  form,
  onChange,
  onContinue,
  saving = false,
  readOnly = false,
  errors = {},
}) {
  const proposal = form.formData?.proposal || {};
  const [local, setLocal] = useState({
    sentDate: proposal.sentDate || todayInputDate(),
    notes: proposal.notes || '',
    amount: proposal.amount || '',
  });

  useEffect(() => {
    setLocal({
      sentDate: proposal.sentDate || todayInputDate(),
      notes: proposal.notes || '',
      amount: proposal.amount || '',
    });
  }, [form.id, proposal.sentDate, proposal.notes, proposal.amount]);

  const set = (key, value) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange?.(next);
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-sky-100 bg-sky-50/90 px-5 py-3">
        <h3 className="text-[15px] font-semibold text-slate-800">Proposal Sent</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Record proposal details, then continue to the final step. The assessment is created automatically when you convert the lead.
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Proposal sent date <span className="text-red-500">*</span></label>
            <input
              type="date"
              disabled={readOnly}
              value={local.sentDate}
              onChange={(e) => set('sentDate', e.target.value)}
              className={errors.sentDate ? inputErrorClass : inputClass}
            />
            {errors.sentDate ? <p className="mt-1 text-xs text-red-600">{errors.sentDate}</p> : null}
          </div>
          <div>
            <label className={labelClass}>Proposed amount (optional)</label>
            <input
              type="text"
              disabled={readOnly}
              value={local.amount}
              onChange={(e) => set('amount', e.target.value)}
              className={inputClass}
              placeholder="e.g. $2,400 / month"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Proposal notes <span className="text-red-500">*</span></label>
            <textarea
              disabled={readOnly}
              rows={4}
              value={local.notes}
              onChange={(e) => set('notes', e.target.value)}
              className={`${errors.notes ? inputErrorClass : inputClass} resize-y`}
              placeholder="Summarize what was proposed to the family..."
            />
            {errors.notes ? <p className="mt-1 text-xs text-red-600">{errors.notes}</p> : null}
          </div>
        </div>

        {!readOnly ? (
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <SubmitButton
              loading={saving}
              onClick={onContinue}
              icon={ArrowRight}
              loadingLabel="Continuing..."
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Continue to Converted
            </SubmitButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}
