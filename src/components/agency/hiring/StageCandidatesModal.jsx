import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, ArrowRight, ArrowLeft, UserCheck, Ban, Loader2, RotateCcw, FileText, ClipboardCheck } from 'lucide-react';
import {
  fetchStageCandidates,
  moveToNextStage,
  moveToPreviousStage,
  rejectCandidate,
  completeCandidateHire,
  undoCandidateHire,
} from '../../../redux/slices/candidatesSlice';
import { confirmAlert } from '../../../utils/swal';
import CandidateFormsPanel from './CandidateFormsPanel';
import InterviewFeedbackDrawer from './InterviewFeedbackDrawer';

function CandidateRow({ application, onAction, loadingId, viewType, onOpenForms, onOpenFeedback }) {
  const candidate = application.candidate || {};
  const info = application.stage_info || {};
  const progress = application.form_progress;
  const feedback = application.interview_feedback;
  const isLoading = loadingId === application.id;
  const canHire = info.can_hire ?? (info.job_hired_count === 0 && info.is_final_stage);
  const finalStageName = info.final_stage?.name || 'Final Stage';
  const hasForms = progress && (progress.total > 0 || progress.documents?.length > 0);

  return (
    <div className="rounded-lg border border-gray-200 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-gray-900">
            {candidate.first_name} {candidate.last_name}
          </p>
          <p className="text-xs text-gray-500">{candidate.email}</p>
          {application.stage?.name && (
            <p className="mt-0.5 text-xs text-gray-400">Stage: {application.stage.name}</p>
          )}
          {hasForms && viewType === 'stage' && (
            <p className="mt-1 text-xs text-gray-500">
              Forms: {progress.required_submitted || 0}/{progress.required_total || 0} required submitted
            </p>
          )}
          {viewType === 'stage' && feedback && (
            <p className="mt-1 text-xs text-gray-500">
              Interview feedback:{' '}
              <span className={feedback.status === 'Submitted' ? 'text-emerald-700' : 'text-amber-700'}>
                {feedback.status}
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {viewType === 'stage' && (
            <button
              type="button"
              onClick={() => onOpenFeedback(application)}
              className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
            >
              <ClipboardCheck size={14} />
              {feedback ? 'Feedback' : 'Add Feedback'}
            </button>
          )}
          {hasForms && viewType === 'stage' && (
            <button
              type="button"
              onClick={() => onOpenForms(application)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileText size={14} />
              Forms
            </button>
          )}
          {application.status === 'Active' && !info.hiring_completed && !info.is_first_stage && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onAction('previous', application)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowLeft size={14} />
              Move to {info.previous_stage?.name || 'Previous Stage'}
            </button>
          )}
          {application.status === 'Active' && !info.hiring_completed && !info.is_final_stage && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onAction('next', application)}
              className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
            >
              <ArrowRight size={14} />
              Move to {info.next_stage?.name || 'Next Stage'}
            </button>
          )}
          {info.is_final_stage && !info.hiring_completed && application.status === 'Active' && canHire && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onAction('hire', application)}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <UserCheck size={14} />
              Complete Hiring
            </button>
          )}
          {info.is_final_stage && !info.hiring_completed && application.status === 'Active' && !canHire && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
              Hire slot filled for this job
            </span>
          )}
          {application.status === 'Active' && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onAction('reject', application)}
              className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Ban size={14} />
              Reject
            </button>
          )}
          {application.status === 'Hired' && !info.hiring_completed && (
            <>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onAction('undoHire', application)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <RotateCcw size={14} />
                Move back to {finalStageName}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onAction('reject', application)}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Ban size={14} />
                Reject
              </button>
            </>
          )}
          {application.status === 'Hired' && info.hiring_completed && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
              Caregiver roster
            </span>
          )}
          {application.status === 'Rejected' && (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
              Rejected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StageCandidatesModal({
  open,
  onClose,
  job,
  stage,
  viewType = 'stage',
  onRefresh,
}) {
  const dispatch = useDispatch();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [hireResult, setHireResult] = useState(null);
  const [formsApplication, setFormsApplication] = useState(null);
  const [feedbackApplication, setFeedbackApplication] = useState(null);

  const loadApplications = async () => {
    const data = await dispatch(
      fetchStageCandidates({ jobId: job.id, stageId: stage?.id, viewType }),
    ).unwrap();
    setApplications(data.applications || data || []);
  };

  useEffect(() => {
    if (!open || !job?.id) return;
    setHireResult(null);
    setLoading(true);
    loadApplications()
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [open, job?.id, stage?.id, viewType, dispatch]);

  if (!open) return null;

  const title = viewType === 'rejected'
    ? `Rejected — ${job?.job_title || job?.jobTitle}`
    : viewType === 'hired'
      ? `Hired — ${job?.job_title || job?.jobTitle}`
      : `${stage?.name || 'Stage'} — ${job?.job_title || job?.jobTitle}`;

  const hiredCount = viewType === 'hired' ? applications.length : 0;

  const handleAction = async (action, application) => {
    setActionId(application.id);
    try {
      if (action === 'next') {
        await dispatch(moveToNextStage(application.id)).unwrap();
      } else if (action === 'previous') {
        await dispatch(moveToPreviousStage(application.id)).unwrap();
      } else if (action === 'reject') {
        const isHired = application.status === 'Hired';
        const name = `${application.candidate?.first_name} ${application.candidate?.last_name}`.trim();
        const confirmed = await confirmAlert({
          title: isHired ? 'Reject hired candidate?' : 'Reject candidate?',
          text: isHired
            ? `Remove ${name} from hired candidates and reject their application?`
            : `Reject ${name}?`,
          confirmText: 'Reject',
          danger: true,
        });
        if (!confirmed) {
          setActionId(null);
          return;
        }
        await dispatch(rejectCandidate(application.id)).unwrap();
      } else if (action === 'hire') {
        const result = await dispatch(completeCandidateHire(application.id)).unwrap();
        setHireResult(result);
      } else if (action === 'undoHire') {
        const name = `${application.candidate?.first_name} ${application.candidate?.last_name}`.trim();
        const confirmed = await confirmAlert({
          title: 'Undo hire?',
          text: `Move ${name} back to the final stage? They will no longer be marked as hired.`,
          confirmText: 'Undo hire',
        });
        if (!confirmed) {
          setActionId(null);
          return;
        }
        await dispatch(undoCandidateHire(application.id)).unwrap();
      }
      onRefresh?.();
      await loadApplications();
    } catch {
      // toast in slice
    }
    setActionId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {viewType === 'hired' && hiredCount > 1 && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Only one candidate can be hired for this job. Use <strong>Move back to final stage</strong> or{' '}
              <strong>Reject</strong> on the extra candidate(s) to free the hire slot.
            </div>
          )}

          {hireResult?.message && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-medium">Candidate marked as hired</p>
              <p className="mt-1">{hireResult.message}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
              <Loader2 size={20} className="animate-spin" />
              Loading candidates...
            </div>
          ) : applications.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No candidates in this stage.</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <CandidateRow
                  key={app.id}
                  application={app}
                  onAction={handleAction}
                  loadingId={actionId}
                  viewType={viewType}
                  onOpenForms={setFormsApplication}
                  onOpenFeedback={setFeedbackApplication}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CandidateFormsPanel
        open={Boolean(formsApplication)}
        onClose={() => setFormsApplication(null)}
        application={formsApplication}
        stageId={stage?.id}
      />

      <InterviewFeedbackDrawer
        open={Boolean(feedbackApplication)}
        onClose={() => setFeedbackApplication(null)}
        application={feedbackApplication}
        stageId={stage?.id || feedbackApplication?.agencyStageId}
        onSaved={loadApplications}
      />
    </div>
  );
}
