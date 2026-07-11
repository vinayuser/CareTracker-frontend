import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Smartphone, ArrowRight, Clock, CheckCircle, XCircle, Printer } from 'lucide-react';
import { fetchCaregiverEvvEnrollments } from '../../redux/slices/evvEnrollmentsSlice';
import { ROUTES } from '../../routes/routes';

function StatusBadge({ status }) {
  const styles = {
    Verified: 'bg-emerald-100 text-emerald-700',
    Submitted: 'bg-blue-100 text-blue-700',
    Pending: 'bg-amber-100 text-amber-700',
    Rejected: 'bg-red-100 text-red-700',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.Pending}`}>{status}</span>;
}

export default function CaregiverEvvEnrollments() {
  const dispatch = useDispatch();
  const { caregiverList } = useSelector((state) => state.evvEnrollments);

  useEffect(() => {
    dispatch(fetchCaregiverEvvEnrollments());
  }, [dispatch]);

  const pending = useMemo(() => caregiverList.filter((i) => ['Pending', 'Rejected'].includes(i.status)), [caregiverList]);
  const completed = useMemo(() => caregiverList.filter((i) => ['Submitted', 'Verified'].includes(i.status)), [caregiverList]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">EVV Enrollment</h1>
        <p className="mt-1 text-sm text-gray-500">Complete EVV enrollment forms for clients assigned to you from care plans.</p>
      </div>

      {caregiverList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Smartphone className="mx-auto text-gray-300" size={40} />
          <h3 className="mt-4 text-base font-semibold text-gray-900">No EVV enrollments yet</h3>
          <p className="mt-2 text-sm text-gray-500">When you are assigned to a client care plan, an enrollment form will appear here.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700">Action Required</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {pending.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{item.clientName}</p>
                        <p className="text-sm text-gray-500">Plan {item.planCode} · {item.enrollmentCode}</p>
                        <p className="mt-1 text-xs text-gray-500">{(item.serviceAreas || []).join(', ')}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link to={ROUTES.CAREGIVER_EVV_ENROLLMENT_FORM.replace(':id', item.id)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
                        Complete Form <ArrowRight size={16} />
                      </Link>
                      <button type="button" onClick={() => window.open(ROUTES.CAREGIVER_EVV_ENROLLMENT_PRINT.replace(':id', item.id), '_blank')} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        <Printer size={16} /> Print
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Submitted & Verified</h2>
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="divide-y divide-gray-100">
                  {completed.map((item) => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.clientName}</p>
                        <p className="text-sm text-gray-500">{item.planCode} · {item.enrollmentCode}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={item.status} />
                        {item.status === 'Verified' ? <CheckCircle size={18} className="text-emerald-500" /> : <Clock size={18} className="text-blue-500" />}
                        <Link to={ROUTES.CAREGIVER_EVV_ENROLLMENT_FORM.replace(':id', item.id)} className="text-sm font-medium text-primary hover:underline">View</Link>
                        <button type="button" onClick={() => window.open(ROUTES.CAREGIVER_EVV_ENROLLMENT_PRINT.replace(':id', item.id), '_blank')} className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary">
                          <Printer size={14} /> Print
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
