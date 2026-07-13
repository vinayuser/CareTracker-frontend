import { useEffect, useState } from 'react';
import { Copy, ExternalLink, Loader2, Mail, Printer, RotateCcw, X } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';
import { ROUTES } from '../../../routes/routes';
import { confirmAlert } from '../../../utils/swal';
import { toCurrentAppOrigin, toApiUploadUrl } from '../../../utils/appUrl';
import SelectFormsToSendModal from './SelectFormsToSendModal';

const statusStyle = {
  NotStarted: 'bg-gray-100 text-gray-700',
  Draft: 'bg-amber-100 text-amber-800',
  Submitted: 'bg-emerald-100 text-emerald-800',
};

export default function CandidateFormsPanel({ open, onClose, application, stageId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resettingCode, setResettingCode] = useState(null);
  const [showResendPicker, setShowResendPicker] = useState(false);

  const load = async () => {
    if (!application?.id) return;
    setLoading(true);
    try {
      const query = stageId ? `?stage_id=${stageId}` : '';
      const res = await axiosInstance.get(
        `${API_ROUTES.AGENCY.JOB_APPLICATIONS.FORM_SUBMISSIONS}/${application.id}/form-submissions${query}`,
      );
      setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    load();
  }, [open, application?.id, stageId]);

  if (!open) return null;

  const candidate = application?.candidate || {};
  const progress = data?.form_progress || application?.form_progress || {};
  const rawFormUrl = data?.access?.form_url || progress.form_url;
  // Always use the host you're on now (local → local, production → production)
  const formUrl = toCurrentAppOrigin(rawFormUrl);
  const availableDocuments = data?.available_documents?.length
    ? data.available_documents
    : (progress.documents || []).map((d) => ({
      code: d.code,
      name: d.name,
      is_required: d.is_required,
    }));

  const copyLink = async () => {
    if (!formUrl) {
      toast.error('No form link available');
      return;
    }
    await navigator.clipboard.writeText(formUrl);
    toast.success('Form link copied');
  };

  const resendEmail = async (documentCodes) => {
    setResending(true);
    try {
      await axiosInstance.post(
        `${API_ROUTES.AGENCY.JOB_APPLICATIONS.RESEND_FORM_EMAIL}/${application.id}/resend-form-email`,
        { document_codes: documentCodes },
      );
      toast.success('Form email sent');
      setShowResendPicker(false);
      await load();
    } finally {
      setResending(false);
    }
  };

  const openPrint = (submissionId, filledPdfUrl) => {
    if (filledPdfUrl) {
      window.open(toApiUploadUrl(filledPdfUrl), '_blank', 'noopener,noreferrer');
      return;
    }
    const url = ROUTES.AGENCY_CANDIDATE_FORM_PRINT
      .replace(':applicationId', application.id)
      .replace(':submissionId', submissionId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const resetForm = async (doc) => {
    const confirmed = await confirmAlert({
      title: 'Reset this form?',
      text: `Allow ${candidate.first_name} ${candidate.last_name} to fill "${doc.name}" again? Their previous submission will be cleared.`,
      confirmText: 'Reset form',
      danger: true,
    });
    if (!confirmed) return;

    setResettingCode(doc.code);
    try {
      await axiosInstance.post(
        `${API_ROUTES.AGENCY.JOB_APPLICATIONS.RESET_FORM}/${application.id}/form-submissions/${encodeURIComponent(doc.code)}/reset`,
      );
      toast.success('Form reset — candidate can fill again');
      await load();
    } finally {
      setResettingCode(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Stage forms</h3>
            <p className="text-xs text-gray-500">
              {candidate.first_name} {candidate.last_name}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
              <Loader2 size={18} className="animate-spin" />
              Loading forms...
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                {formUrl && (
                  <>
                    <button
                      type="button"
                      onClick={copyLink}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Copy size={14} />
                      Copy link
                    </button>
                    <a
                      href={formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <ExternalLink size={14} />
                      Open portal
                    </a>
                  </>
                )}
                <button
                  type="button"
                  disabled={resending || availableDocuments.length === 0}
                  onClick={() => setShowResendPicker(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
                >
                  <Mail size={14} />
                  Resend email
                </button>
              </div>

              {progress.required_total > 0 && (
                <p className="mb-4 text-sm text-gray-600">
                  {progress.required_submitted || 0} of {progress.required_total} required forms submitted
                </p>
              )}

              <div className="space-y-2">
                {(progress.documents || []).map((doc) => (
                  <div
                    key={doc.code}
                    className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.is_required ? 'Required' : 'Optional'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[doc.status] || statusStyle.NotStarted}`}>
                        {doc.status}
                      </span>
                      {doc.status === 'Submitted' && doc.submission_id && (
                        <button
                          type="button"
                          onClick={() => openPrint(
                            doc.submission_id,
                            data?.submissions?.find((s) => s.id === doc.submission_id)?.filled_pdf_url,
                          )}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-primary"
                          title="Print / PDF"
                        >
                          <Printer size={16} />
                        </button>
                      )}
                      {(doc.status === 'Submitted' || doc.status === 'Draft') && (
                        <button
                          type="button"
                          disabled={resettingCode === doc.code}
                          onClick={() => resetForm(doc)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
                          title="Reset — allow candidate to refill"
                        >
                          {resettingCode === doc.code ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <RotateCcw size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {(progress.documents || []).length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-500">No forms issued for this candidate yet.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <SelectFormsToSendModal
        open={showResendPicker}
        onClose={() => !resending && setShowResendPicker(false)}
        onConfirm={resendEmail}
        title="Resend form email"
        stageName={data?.stage?.name || ''}
        candidateName={`${candidate.first_name || ''} ${candidate.last_name || ''}`.trim()}
        documents={availableDocuments}
        confirmLabel="Send selected forms"
        allowSkip={false}
        submitting={resending}
      />
    </div>
  );
}
