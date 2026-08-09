import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ClipboardList } from 'lucide-react';
import { fetchClientCarePlans } from '../../redux/slices/clientPortalSlice';
import { ROUTES } from '../../routes/routes';

export default function ClientCarePlans() {
  const dispatch = useDispatch();
  const { carePlans, carePlansLoading } = useSelector((state) => state.clientPortal);

  useEffect(() => {
    dispatch(fetchClientCarePlans());
  }, [dispatch]);

  if (carePlansLoading && carePlans.length === 0) {
    return <p className="text-sm text-gray-500">Loading care plan…</p>;
  }

  const latest = carePlans[0];
  if (latest?.id) {
    return <Navigate to={ROUTES.CLIENT_CARE_PLAN_DETAIL.replace(':id', latest.id)} replace />;
  }

  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
      <ClipboardList className="mx-auto text-gray-300" size={36} />
      <h1 className="mt-3 text-xl font-bold text-gray-900">No care plan yet</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        When your agency publishes a care plan, the latest version will appear here.
      </p>
      <Link to={ROUTES.CLIENT_DASHBOARD} className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
