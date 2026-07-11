import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, FileText, Loader2 } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { ROUTES } from '../../routes/routes';

const statusStyle = {
  NotStarted: 'bg-gray-100 text-gray-700',
  Draft: 'bg-amber-100 text-amber-800',
  Submitted: 'bg-emerald-100 text-emerald-800',
};

export default function CandidateFormPortal() {
  const { token } = useParams();
  const [portal, setPortal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axiosInstance
      .get(`${API_ROUTES.CANDIDATE_FORMS.PORTAL}/${token}`)
      .then((res) => setPortal(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load forms'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-gray-500">
        <Loader2 className="mr-2 animate-spin" size={20} />
        Loading your forms...
      </div>
    );
  }

  if (error || !portal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">Link unavailable</p>
          <p className="mt-2 text-sm text-gray-600">{error || 'This form link is invalid or expired.'}</p>
        </div>
      </div>
    );
  }

  const progress = portal.form_progress || {};
  const allDone = progress.required_total > 0 && progress.required_submitted >= progress.required_total;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">♥</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">CareTraker</p>
              <p className="text-xs text-gray-500">Home Care Management</p>
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Hiring forms</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {portal.stage?.name || 'Application forms'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {portal.agency_name && <span>{portal.agency_name} · </span>}
            {portal.job?.job_title}
          </p>
          {portal.candidate && (
            <p className="mt-1 text-sm text-gray-500">
              {portal.candidate.first_name} {portal.candidate.last_name} ({portal.candidate.email})
            </p>
          )}

          {allDone && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>All required forms are submitted. HR will review your application.</span>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {(progress.documents || []).map((doc) => (
            <Link
              key={doc.code}
              to={ROUTES.CANDIDATE_FORM_DOCUMENT.replace(':token', token).replace(':documentCode', doc.code)}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:border-primary/40 hover:shadow"
            >
              <div className="flex items-start gap-3">
                <FileText size={20} className="mt-0.5 text-primary" />
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    Code {doc.code}
                    {doc.is_required ? ' · Required' : ' · Optional'}
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[doc.status] || statusStyle.NotStarted}`}>
                {doc.status === 'Submitted' ? 'Submitted' : doc.status === 'Draft' ? 'In progress' : 'Not started'}
              </span>
            </Link>
          ))}
          {(progress.documents || []).length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
              No forms are assigned for this stage.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
