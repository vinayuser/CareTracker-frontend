import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, CheckCircle, Clock, PenLine, Smartphone } from 'lucide-react';
import { fetchClientEvvEnrollments } from '../../redux/slices/clientPortalSlice';
import { ROUTES } from '../../routes/routes';

function StatusBadge({ status }) {
  const styles = {
    Verified: 'bg-emerald-100 text-emerald-700',
    Submitted: 'bg-blue-100 text-blue-700',
    Pending: 'bg-amber-100 text-amber-700',
    Rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
}

function hasClientSignature(item) {
  const sig = item?.formData?.authorization?.clientSignature;
  return Boolean(sig && String(sig).startsWith('data:image'));
}

export default function ClientEvvEnrollments() {
  const dispatch = useDispatch();
  const { evvEnrollments, evvEnrollmentsLoading } = useSelector((state) => state.clientPortal);

  useEffect(() => {
    dispatch(fetchClientEvvEnrollments());
  }, [dispatch]);

  const needsSignature = useMemo(
    () => evvEnrollments.filter((i) => !hasClientSignature(i) && i.status !== 'Verified'),
    [evvEnrollments],
  );
  const signed = useMemo(
    () => evvEnrollments.filter((i) => hasClientSignature(i) || i.status === 'Verified'),
    [evvEnrollments],
  );

  const renderCard = (item) => {
    const clientSigned = hasClientSignature(item);
    return (
      <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-gray-900">{item.caregiverName || 'Caregiver'}</h3>
              <StatusBadge status={item.status} />
              {clientSigned ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle size={11} /> You signed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  <Clock size={11} /> Signature needed
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {item.enrollmentCode}
              {item.serviceAreas?.length ? ` · ${item.serviceAreas.join(', ')}` : ''}
            </p>
          </div>
          <Link
            to={ROUTES.CLIENT_EVV_ENROLLMENT_DETAIL.replace(':id', item.id)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
          >
            {clientSigned ? 'View' : 'Sign'} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        EVV enrollment forms for your care. Sign Authorization & Consent so your agency can verify enrollment.
      </p>

      {evvEnrollmentsLoading && evvEnrollments.length === 0 ? (
        <p className="text-sm text-gray-500">Loading enrollments…</p>
      ) : evvEnrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <Smartphone className="mx-auto text-gray-300" size={36} />
          <h2 className="mt-3 text-lg font-semibold text-gray-900">No EVV enrollments yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            When your agency assigns caregivers on your care plan, enrollment forms will appear here for your signature.
          </p>
        </div>
      ) : (
        <>
          {needsSignature.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <PenLine size={16} /> Needs your signature
              </h2>
              <div className="space-y-3">{needsSignature.map(renderCard)}</div>
            </section>
          )}
          {signed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">Signed / completed</h2>
              <div className="space-y-3">{signed.map(renderCard)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
