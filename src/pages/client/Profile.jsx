import { Link } from 'react-router-dom';
import { getAuthUser } from '../../utils/auth';
import { ROUTES } from '../../routes/routes';

export default function ClientProfile() {
  const user = getAuthUser();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Your client portal account details.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-gray-500">Name</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{user?.name || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Email / Login</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{user?.email || user?.userId || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Client code</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{user?.clientCode || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Agency</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{user?.agencyName || '—'}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={ROUTES.CLIENT_DASHBOARD}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to dashboard
          </Link>
          <Link
            to={ROUTES.CLIENT_CARE_PLANS}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            View care plan
          </Link>
        </div>
      </div>
    </div>
  );
}
