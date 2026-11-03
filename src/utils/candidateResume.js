import { toApiUploadUrl } from './appUrl';

export function getCandidateResumeUrl(candidate) {
  const raw = candidate?.resume || candidate?.resumePath || '';
  if (!raw) return '';
  return toApiUploadUrl(raw);
}

export function resumeDownloadName(candidate) {
  const first = candidate?.first_name || candidate?.firstName || 'candidate';
  const last = candidate?.last_name || candidate?.lastName || 'resume';
  const safe = `${first}-${last}`.trim().replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').toLowerCase();
  return `${safe || 'candidate'}-resume.pdf`;
}

export function viewCandidateResume(candidate) {
  const url = getCandidateResumeUrl(candidate);
  if (!url) return false;
  window.open(url, '_blank', 'noopener');
  return true;
}

export async function downloadCandidateResume(candidate) {
  const url = getCandidateResumeUrl(candidate);
  if (!url) return false;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('download failed');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = resumeDownloadName(candidate);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch {
    window.open(url, '_blank', 'noopener');
    return true;
  }
}
