import { useEffect, useState } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';
import { ROUTES } from '../../../routes/routes';

const statusStyle = {
  Submitted: 'bg-emerald-100 text-emerald-800',
  Draft: 'bg-amber-100 text-amber-800',
};

export default function CandidateFeedbackViewPanel({ open, onClose, application }) {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !application?.id) return undefined;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `${API_ROUTES.AGENCY.JOB_APPLICATIONS.INTERVIEW_FEEDBACK}/${application.id}/interview-feedback?all=1`,
        );
        if (cancelled) return;
        setStages(res.data.data?.stages || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load interview feedback');
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [open, application?.id]);

  if (!open) return null;

  const candidate = application?.candidate || {};
  const candidateName = `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim();

  const downloadPdf = (stageId) => {
    if (!application?.id || !stageId) return;
    const url = ROUTES.AGENCY_INTERVIEW_FEEDBACK_PRINT
      .replace(':applicationId', application.id)
      .replace(':stageId', stageId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Interview feedback</h3>
            <p className="text-xs text-gray-500">
              {candidateName || 'Candidate'}
              {application?.job?.job_title ? ` · ${application.job.job_title}` : ''}
              {' · View and download only'}
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
              Loading feedback...
            </div>
          ) : stages.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No interview feedback rounds for this candidate yet.
            </p>
          ) : (
            <div className="space-y-2">
              {stages.map((item) => {
                const stage = item.stage || {};
                const status = item.status || 'Not started';
                const canDownload = status === 'Submitted' || status === 'Draft';
                return (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        Round {item.round} — {stage.name || 'Stage'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.is_current ? 'Current stage' : 'Pipeline round'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusStyle[status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {status}
                      </span>
                      {canDownload && (
                        <button
                          type="button"
                          onClick={() => downloadPdf(stage.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          title="Download PDF"
                        >
                          <Download size={14} />
                          PDF
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
