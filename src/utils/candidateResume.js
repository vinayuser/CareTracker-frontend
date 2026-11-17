import { toast } from 'react-toastify';
import { toApiUploadUrl } from './appUrl';

function isUsableResumeValue(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false;
  let pathOnly = trimmed;
  try {
    pathOnly = new URL(trimmed, 'http://local.invalid').pathname;
  } catch {
    pathOnly = trimmed;
  }
  const clean = pathOnly
    .replace(/^\/+/, '')
    .replace(/^(api\/)?uploads\/?/i, '')
    .replace(/^\/+/, '');
  return Boolean(clean);
}

export function hasCandidateResume(candidate) {
  return isUsableResumeValue(candidate?.resume)
    || isUsableResumeValue(candidate?.resumePath);
}

export function getCandidateResumeUrl(candidate) {
  if (!hasCandidateResume(candidate)) return '';
  const raw = candidate?.resume || candidate?.resumePath || '';
  return toApiUploadUrl(raw) || '';
}

export function resumeDownloadName(candidate) {
  const first = candidate?.first_name || candidate?.firstName || 'candidate';
  const last = candidate?.last_name || candidate?.lastName || 'resume';
  const safe = `${first}-${last}`.trim().replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').toLowerCase();
  return `${safe || 'candidate'}-resume.pdf`;
}

function isFileResponse(res) {
  if (!res?.ok) return false;
  const type = String(res.headers.get('content-type') || '').toLowerCase();
  if (!type || type.includes('application/json') || type.includes('text/html')) return false;
  return true;
}

export async function viewCandidateResume(candidate) {
  const url = getCandidateResumeUrl(candidate);
  if (!url) {
    toast.error('No resume uploaded for this candidate');
    return false;
  }
  try {
    const res = await fetch(url);
    if (!isFileResponse(res)) {
      toast.error('No resume uploaded for this candidate');
      return false;
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    return true;
  } catch {
    toast.error('Could not open resume');
    return false;
  }
}

export async function downloadCandidateResume(candidate) {
  const url = getCandidateResumeUrl(candidate);
  if (!url) {
    toast.error('No resume uploaded for this candidate');
    return false;
  }
  try {
    const res = await fetch(url);
    if (!isFileResponse(res)) {
      toast.error('No resume uploaded for this candidate');
      return false;
    }
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
    toast.error('Could not download resume');
    return false;
  }
}
