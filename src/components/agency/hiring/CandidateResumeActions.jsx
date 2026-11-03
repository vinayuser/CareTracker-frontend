import { Download, Eye, FileText } from 'lucide-react';
import ActionIconButton from '../../ui/ActionIconButton';
import {
  downloadCandidateResume,
  getCandidateResumeUrl,
  viewCandidateResume,
} from '../../../utils/candidateResume';

export default function CandidateResumeActions({
  candidate,
  variant = 'icon',
  emptyLabel = '—',
}) {
  const url = getCandidateResumeUrl(candidate);
  if (!url) {
    if (variant === 'button') {
      return null;
    }
    return <span className="text-xs text-gray-400">{emptyLabel}</span>;
  }

  if (variant === 'button') {
    return (
      <>
        <button
          type="button"
          onClick={() => viewCandidateResume(candidate)}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Eye size={14} />
          View resume
        </button>
        <button
          type="button"
          onClick={() => downloadCandidateResume(candidate)}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
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
          Current resume
        </span>
        <button
          type="button"
          onClick={() => viewCandidateResume(candidate)}
          className="cursor-pointer font-medium text-primary hover:underline"
        >
          View
        </button>
        <button
          type="button"
          onClick={() => downloadCandidateResume(candidate)}
          className="cursor-pointer font-medium text-gray-600 hover:underline"
        >
          Download
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <ActionIconButton
        label="View resume"
        onClick={() => viewCandidateResume(candidate)}
        className="cursor-pointer text-primary hover:bg-primary/10"
      >
        <Eye size={16} />
      </ActionIconButton>
      <ActionIconButton
        label="Download resume"
        onClick={() => downloadCandidateResume(candidate)}
        className="cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-800"
      >
        <Download size={16} />
      </ActionIconButton>
    </div>
  );
}
