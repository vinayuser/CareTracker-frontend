import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { ROUTES } from '../../routes/routes';
import { getPdfForm, hasPdfForm } from '../../components/candidate/pdf-forms';
import { resolvePublicDocumentUrl } from '../../components/candidate/pdf-forms/pdfTemplateFetch';

export default function CandidateDocumentForm() {
  const { token, documentCode } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !documentCode) return;
    setLoading(true);
    axiosInstance
      .get(`${API_ROUTES.CANDIDATE_FORMS.PORTAL}/${token}/${documentCode}`)
      .then((res) => setDoc(res.data.data))
      .catch(() => navigate(ROUTES.CANDIDATE_FORM_PORTAL.replace(':token', token)))
      .finally(() => setLoading(false));
  }, [token, documentCode, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-gray-500">
        <Loader2 className="mr-2 animate-spin" size={20} />
        Loading form...
      </div>
    );
  }

  if (!doc) return null;

  if (doc.read_only || doc.status === 'Submitted') {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">Form already submitted</p>
          <p className="mt-2 text-sm text-gray-600">
            {doc.document_name} has been submitted. Contact HR if you need to make changes.
          </p>
          <Link
            to={ROUTES.CANDIDATE_FORM_PORTAL.replace(':token', token)}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Back to all forms
          </Link>
        </div>
      </div>
    );
  }

  const PdfFormComponent = hasPdfForm(documentCode) ? getPdfForm(documentCode) : null;

  const handleSuccess = () => {
    navigate(ROUTES.CANDIDATE_FORM_PORTAL.replace(':token', token));
  };

  if (!PdfFormComponent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center">
          <p className="font-semibold text-gray-900">Online form unavailable</p>
          <p className="mt-2 text-sm text-gray-600">This document does not have a fillable web form yet.</p>
          <Link
            to={ROUTES.CANDIDATE_FORM_PORTAL.replace(':token', token)}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Back to forms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link
            to={ROUTES.CANDIDATE_FORM_PORTAL.replace(':token', token)}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            All forms
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">♥</div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">CareTraker</p>
              <p className="text-xs text-gray-500">Hiring forms</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <PdfFormComponent
          document={{
            ...doc,
            code: doc.document_code || documentCode,
            url: resolvePublicDocumentUrl(doc.template_url || doc.url),
          }}
          token={token}
          onClose={handleSuccess}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
