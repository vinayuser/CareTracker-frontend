import { Check } from 'lucide-react';
import { LEAD_STAGES } from '../../../utils/leadForm';

/** Chevron-style stage stepper — click a stage to open that step’s form */
export default function LeadStageStepper({ stage, activeView, onSelect }) {
  const savedIdx = Math.max(0, LEAD_STAGES.indexOf(stage));
  const viewIdx = Math.max(0, LEAD_STAGES.indexOf(activeView || stage));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex min-w-[640px] items-stretch">
        {LEAD_STAGES.map((s, i) => {
          const done = i < savedIdx;
          const active = i === viewIdx;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onSelect?.(s)}
              className={`relative flex flex-1 items-center justify-center px-3 py-2.5 text-center text-xs font-semibold transition hover:brightness-95 sm:text-[13px] ${
                active
                  ? 'bg-primary text-white'
                  : done
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-500'
              }`}
              style={{
                clipPath:
                  i === 0
                    ? 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)'
                    : i === LEAD_STAGES.length - 1
                      ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%)'
                      : 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)',
                marginLeft: i === 0 ? 0 : -10,
                zIndex: LEAD_STAGES.length - i,
              }}
            >
              <span className="inline-flex items-center gap-1.5 px-1">
                {done && !active ? <Check size={14} strokeWidth={3} /> : null}
                {s}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
