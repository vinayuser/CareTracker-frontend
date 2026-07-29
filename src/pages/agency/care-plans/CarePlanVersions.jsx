import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, History, Mail, Printer } from 'lucide-react';
import {
  clearCarePlanVersions,
  fetchCarePlanVersions,
  sendCarePlanVersion,
} from '../../../redux/slices/carePlansSlice';
import { AssessorDetailCell } from '../../../components/ui/AssessorPhotoUpload';
import { ROUTES } from '../../../routes/routes';
import { confirmAlert } from '../../../utils/swal';

const actionBtn =
  'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors';
const actionBtnNeutral = `${actionBtn} border-gray-200 bg-white text-gray-700 hover:border-primary/30 hover:bg-gray-50 hover:text-primary`;
const actionBtnPrimary = `${actionBtn} border-primary/20 bg-primary/5 text-primary hover:bg-primary/10`;

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

export default function CarePlanVersions() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { versions, loading } = useSelector((s) => s.carePlans);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    if (!id) return undefined;
    dispatch(fetchCarePlanVersions(id));
    return () => { dispatch(clearCarePlanVersions()); };
  }, [dispatch, id]);

  const handleSend = async (row) => {
    const label = row.isLatest ? `latest (${row.version})` : row.version;
    const ok = await confirmAlert({
      title: 'Send care plan version?',
      text: `Email ${label} to the client and agency owner.`,
      confirmText: 'Send email',
    });
    if (!ok) return;
    setSendingId(row.id);
    try {
      await dispatch(sendCarePlanVersion({ id, historyId: row.isLatest ? null : row.id })).unwrap();
    } catch { /* toast */ }
    setSendingId(null);
  };

  const printUrl = (row) => {
    if (row.isLatest) return ROUTES.AGENCY_CARE_PLANS_PRINT.replace(':id', id);
    return ROUTES.AGENCY_CARE_PLANS_VERSION_PRINT
      .replace(':id', id)
      .replace(':historyId', row.id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.AGENCY_CARE_PLANS)}
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary"
          >
            <ArrowLeft size={14} /> Back to care plans
          </button>
          <h1 className="text-xl font-bold text-gray-900">Care Plan Versions</h1>
          <p className="mt-1 text-sm text-gray-500">
            {versions?.planCode || '—'}
            {versions?.client?.fullName ? ` · ${versions.client.fullName}` : ''}
          </p>
        </div>
        <Link to={ROUTES.AGENCY_CARE_PLANS_EDIT.replace(':id', id)} className={actionBtnPrimary}>
          Edit latest
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading && !versions ? (
          <p className="p-12 text-center text-sm text-gray-500">Loading versions…</p>
        ) : !versions?.versions?.length ? (
          <div className="p-12 text-center">
            <History className="mx-auto text-gray-300" size={36} />
            <p className="mt-3 font-medium text-gray-900">No versions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Version</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Assessor Details</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {versions.versions.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-900">{row.version}</span>
                      {row.isLatest && (
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Latest</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <AssessorDetailCell
                        name={row.client?.name}
                        title={row.client?.code || row.client?.phone || row.client?.email || 'Client'}
                        photo={row.client?.photo}
                        fallbackTitle="Client"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <AssessorDetailCell
                        name={row.assessor?.name}
                        title={row.assessor?.title}
                        photo={row.assessor?.photo}
                      />
                    </td>
                    <td className="px-5 py-4 text-gray-700">{formatDate(row.createdAt)}</td>
                    <td className="px-5 py-4 text-gray-700">{row.status || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={actionBtnNeutral}
                          onClick={() => window.open(printUrl(row), '_blank')}
                        >
                          <Printer size={16} /> Print
                        </button>
                        <button
                          type="button"
                          className={actionBtnNeutral}
                          disabled={sendingId === row.id}
                          onClick={() => handleSend(row)}
                        >
                          <Mail size={16} /> {sendingId === row.id ? 'Sending…' : 'Send email'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
