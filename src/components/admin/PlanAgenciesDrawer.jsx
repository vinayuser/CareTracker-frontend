import AgencyStatusBadge from '../ui/AgencyStatusBadge';
import { formatAgencyDate } from '../../utils/agencyStore';

export default function PlanAgenciesDrawer({ open, onClose, plan, agencies }) {
  if (!open || !plan) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Close agencies list"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <aside className="drawer-panel relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="shrink-0 border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Agencies on {plan.name}</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {agencies.length} {agencies.length === 1 ? 'agency' : 'agencies'} purchased this plan
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {agencies.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
              No agencies have purchased this plan yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {agencies.map((agency) => (
                <li
                  key={agency.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{agency.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{agency.email}</p>
                    </div>
                    <AgencyStatusBadge status={agency.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <span>Owner: {agency.ownerName || '—'}</span>
                    <span>Location: {[agency.city, agency.state].filter(Boolean).join(', ') || '—'}</span>
                    <span>Registered: {formatAgencyDate(agency.registeredAt)}</span>
                    <span>
                      Usage: {agency.usage.clients} clients, {agency.usage.caregivers} caregivers
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}
