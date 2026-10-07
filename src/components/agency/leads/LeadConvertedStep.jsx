import { CheckCircle2, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import SubmitButton from '../../ui/SubmitButton';
import { ROUTES } from '../../../routes/routes';
import { formatDateUS } from '../../../utils/dateFormat';
import { joinLeadName } from '../../../utils/leadForm';

export default function LeadConvertedStep({
  form,
  onConvert,
  saving = false,
  readOnly = false,
}) {
  const basic = form.formData?.basicInfo || {};
  const recipient = form.formData?.careRecipient || {};
  const proposal = form.formData?.proposal || {};
  const recipientName = joinLeadName(recipient.firstName, recipient.lastName) || recipient.name || '—';
  const contactName = joinLeadName(basic.firstName, basic.lastName) || basic.fullName || '—';
  const converted = Boolean(form.clientId);

  return (
    <section className={`overflow-hidden rounded-xl border bg-white shadow-sm ${converted ? 'border-emerald-200' : 'border-slate-200'}`}>
      <div className={`border-b px-5 py-4 ${converted ? 'border-emerald-100 bg-emerald-50' : 'border-sky-100 bg-sky-50/90'}`}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className={`mt-0.5 ${converted ? 'text-emerald-600' : 'text-primary'}`} size={22} />
          <div>
            <h3 className={`text-[15px] font-semibold ${converted ? 'text-emerald-900' : 'text-slate-800'}`}>
              {converted ? 'Lead Converted' : 'Convert to Client'}
            </h3>
            <p className={`mt-0.5 text-sm ${converted ? 'text-emerald-700' : 'text-slate-500'}`}>
              {converted
                ? 'This lead is complete. A client record and assessment were created from this lead.'
                : 'Review the summary below, then convert this lead. Completing this step creates the client and assessment automatically.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Care recipient</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{recipientName}</p>
          <p className="mt-1 text-xs text-slate-500">Contact: {contactName}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Proposal</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {proposal.sentDate ? formatDateUS(proposal.sentDate) : '—'}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{proposal.notes || 'No notes'}</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-4">
        {form.assessmentId ? (
          <Link
            to={ROUTES.AGENCY_ASSESSMENTS_EDIT.replace(':id', form.assessmentId)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Open Assessment
          </Link>
        ) : null}
        {converted ? (
          form.clientId ? (
            <Link
              to={ROUTES.AGENCY_CLIENTS_EDIT.replace(':id', form.clientId)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <UserRound size={15} /> Open Client
            </Link>
          ) : null
        ) : !readOnly ? (
          <SubmitButton
            loading={saving}
            onClick={onConvert}
            icon={UserRound}
            loadingLabel="Completing..."
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Convert to Client
          </SubmitButton>
        ) : null}
      </div>
    </section>
  );
}
