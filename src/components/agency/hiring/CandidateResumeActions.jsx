import { Download, Eye, FileText } from 'lucide-react';
import ActionIconButton from '../../ui/ActionIconButton';
import {
  downloadCandidateResume,
  hasCandidateResume,
  viewCandidateResume,
} from '../../../utils/candidateResume';

const NO_RESUME_LABEL = 'No resume uploaded';

export default function CandidateResumeActions({
  candidate,
  variant = 'icon',
}) {
  const hasResume = hasCandidateResume(candidate);
  const viewTitle = hasResume ? 'View resume' : NO_RESUME_LABEL;
  const downloadTitle = hasResume ? 'Download resume' : NO_RESUME_LABEL;

  const onView = () => {
    if (!hasResume) return;
    viewCandidateResume(candidate);
  };
  const onDownload = () => {
    if (!hasResume) return;
    downloadCandidateResume(candidate);
  };

  if (variant === 'button') {
    return (
      <>
        <button
          type="button"
          disabled={!hasResume}
          title={viewTitle}
          aria-label={viewTitle}
          onClick={onView}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Eye size={14} />
          View resume
        </button>
        <button
          type="button"
          disabled={!hasResume}
          title={downloadTitle}
          aria-label={downloadTitle}
          onClick={onDownload}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Download size={14} />
          Download
        </button>
      </>
    );
  }

  if (variant === 'link') {
    return (
      <div className="mt-2 flex items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1 text-gray-500">
          <FileText size={13} />
          {hasResume ? 'Current resume' : NO_RESUME_LABEL}
        </span>
        <button
          type="button"
          disabled={!hasResume}
          title={viewTitle}
          aria-label={viewTitle}
          onClick={onView}
          className="cursor-pointer font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
        >
          View
        </button>
        <button
          type="button"
          disabled={!hasResume}
          title={downloadTitle}
          aria-label={downloadTitle}
          onClick={onDownload}
          className="cursor-pointer font-medium text-gray-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
        >
          Download
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <ActionIconButton
        label={viewTitle}
        disabled={!hasResume}
        onClick={onView}
        className="cursor-pointer text-primary hover:bg-primary/10 disabled:text-gray-300 disabled:hover:bg-transparent"
      >
        <Eye size={16} />
      </ActionIconButton>
      <ActionIconButton
        label={downloadTitle}
        disabled={!hasResume}
        onClick={onDownload}
        className="cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:text-gray-300"
      >
        <Download size={16} />
      </ActionIconButton>
    </div>
  );
}
