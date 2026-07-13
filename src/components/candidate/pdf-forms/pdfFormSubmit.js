import API_ROUTES from '../../../api/apiRoutes';
import axiosInstance from '../../../api/axiosInstance';

const getApiBase = () => {
  const fromAxios = String(axiosInstance.defaults.baseURL || '').replace(/\/+$/, '');
  if (fromAxios) return fromAxios;
  return (import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api/api`).replace(/\/+$/, '');
};

export async function submitFilledPdfForm({
  token,
  documentCode,
  formData,
  pdfBlob,
  fileName,
}) {
  if (!token || !documentCode) {
    throw new Error('Form session is invalid. Please reopen the link from your email.');
  }
  if (!pdfBlob || pdfBlob.size === 0) {
    throw new Error('Could not generate the filled PDF. Please check required fields and try again.');
  }

  const body = new FormData();
  body.append('filled_document', pdfBlob, fileName || 'filled-form.pdf');
  body.append('form_data', JSON.stringify(formData || {}));

  const url = `${getApiBase()}${API_ROUTES.CANDIDATE_FORMS.PORTAL}/${encodeURIComponent(token)}/${encodeURIComponent(documentCode)}/submit-pdf`;

  const response = await fetch(url, {
    method: 'POST',
    body,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const message = payload?.message || `Submission failed (HTTP ${response.status})`;
    throw new Error(message);
  }

  return payload;
}
