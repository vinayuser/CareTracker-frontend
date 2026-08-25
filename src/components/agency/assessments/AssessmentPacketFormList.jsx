import { CheckCircle2, Circle, CircleDot, ChevronRight, Lock, Printer } from 'lucide-react';
import {
  ASSESSMENT_PACKET_FORMS,
  getPacketFormStatus,
  isPacketFormEditable,
} from '../../../utils/assessmentPacket';

const STATUS = {
  not_started: {
    label: 'Not started',
    className: 'bg-gray-100 text-gray-600',
    Icon: Circle,
    iconClass: 'text-gray-300',
  },
  in_progress: {
    label: 'In progress',
    className: 'bg-amber-50 text-amber-800',
    Icon: CircleDot,
    iconClass: 'text-amber-500',
  },
  saved: {
    label: 'Saved',
    className: 'bg-emerald-50 text-emerald-800',
    Icon: CheckCircle2,
    iconClass: 'text-emerald-600',
  },
};

export default function AssessmentPacketFormList({ formData, onOpenForm, onPrintForm, printingCode }) {
  return (
    <div className="space-y-2">
      {ASSESSMENT_PACKET_FORMS.map((form, index) => {
        const editable = isPacketFormEditable(form.code);
        const statusKey = getPacketFormStatus(form.code, formData);
        const status = STATUS[statusKey];
        const Icon = editable ? status.Icon : Lock;
        const printing = printingCode === form.code;
        return (
          <div
            key={form.code}
            className={`flex w-full items-center gap-2 rounded-xl border px-2 py-2 shadow-sm sm:gap-3 sm:px-3 sm:py-3 ${
              editable
                ? 'border-gray-200 bg-white transition hover:border-primary/30'
                : 'border-gray-100 bg-gray-50/80 opacity-80'
            }`}
          >
            <button
              type="button"
              disabled={!editable}
              onClick={() => editable && onOpenForm(form.code)}
              className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left sm:gap-4 ${
                editable
                  ? 'hover:bg-primary/[0.03] active:bg-primary/5'
                  : 'cursor-not-allowed'
              }`}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ${
                editable
                  ? 'bg-slate-50 text-slate-600 ring-slate-200'
                  : 'bg-gray-100 text-gray-400 ring-gray-200'
              }`}
              >
                {index + 1}
              </div>
              <Icon
                size={22}
                className={`hidden shrink-0 sm:block ${editable ? status.iconClass : 'text-gray-400'}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`text-sm font-semibold ${editable ? 'text-gray-900' : 'text-gray-500'}`}>
                    <span className={editable ? 'text-primary' : 'text-gray-400'}>{form.code}</span>
                    <span className="mx-1.5 text-gray-300">·</span>
                    {form.short}
                  </p>
                  {editable ? (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.className}`}>
                      {status.label}
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-200/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{form.title}</p>
              </div>
              {editable ? (
                <ChevronRight size={18} className="hidden shrink-0 text-gray-400 sm:block" />
              ) : (
                <Lock size={16} className="hidden shrink-0 text-gray-400 sm:block" />
              )}
            </button>
            <button
              type="button"
              title={editable ? `Print form ${form.code}` : 'Form not available yet'}
              disabled={printing || !editable}
              onClick={(e) => {
                e.stopPropagation();
                if (editable) onPrintForm?.(form.code);
              }}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Printer size={16} className={printing ? 'animate-pulse' : ''} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
