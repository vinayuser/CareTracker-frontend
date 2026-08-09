import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, HeartHandshake, Mail, Phone, Star } from 'lucide-react';
import ViewClientCaregiverDrawer from '../../components/client/caregivers/ViewClientCaregiverDrawer';
import {
  fetchClientCaregivers,
  fetchClientCaregiver,
  clearSelectedClientCaregiver,
} from '../../redux/slices/clientPortalSlice';
import { formatVisitTime } from '../../utils/visitTimezone';

function Avatar({ caregiver }) {
  if (caregiver.profilePic) {
    return (
      <img
        src={caregiver.profilePic}
        alt={caregiver.fullName || 'Caregiver'}
        className="h-14 w-14 shrink-0 rounded-full border border-gray-200 object-cover"
      />
    );
  }
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-base font-semibold text-violet-700">
      {caregiver.initials || (caregiver.fullName || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function nextVisitLabel(visit) {
  if (!visit) return 'No upcoming visit';
  const date = visit.scheduledDate
    ? new Date(`${visit.scheduledDate}T12:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    : '';
  const time = formatVisitTime(visit.scheduledStartAt, visit.timezone);
  return [date, time].filter(Boolean).join(' · ') || 'Upcoming visit scheduled';
}

export default function ClientCaregivers() {
  const dispatch = useDispatch();
  const {
    caregivers,
    caregiversLoading,
    selectedCaregiver,
    caregiverDetailLoading,
  } = useSelector((state) => state.clientPortal);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchClientCaregivers());
  }, [dispatch]);

  const openProfile = (id) => {
    setDrawerOpen(true);
    dispatch(fetchClientCaregiver(id));
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    dispatch(clearSelectedClientCaregiver());
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Caregivers assigned to you through your care plan and visit schedule.
      </p>

      {caregiversLoading && caregivers.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500 shadow-sm">
          Loading caregivers…
        </div>
      ) : caregivers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <HeartHandshake className="mx-auto text-gray-300" size={36} />
          <h2 className="mt-3 text-lg font-semibold text-gray-900">No caregivers assigned yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            When your agency assigns caregivers on your care plan or schedule, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {caregivers.map((cg) => (
            <article
              key={cg.id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Avatar caregiver={cg} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-semibold text-gray-900">{cg.fullName}</h2>
                    {cg.primary && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        <Star size={11} /> Primary
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {cg.jobTitle || 'Caregiver'}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-sm text-gray-600">
                {cg.phone ? (
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="shrink-0 text-gray-400" />
                    <a href={`tel:${cg.phone}`} className="hover:text-primary">{cg.phone}</a>
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-gray-400">
                    <Phone size={14} /> Phone not listed
                  </p>
                )}
                {cg.email && (
                  <p className="flex items-center gap-2 truncate">
                    <Mail size={14} className="shrink-0 text-gray-400" />
                    <a href={`mailto:${cg.email}`} className="truncate hover:text-primary">{cg.email}</a>
                  </p>
                )}
              </div>

              {cg.serviceAreas?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cg.serviceAreas.slice(0, 3).map((area) => (
                    <span
                      key={`${cg.id}-${area.areaKey || area.areaLabel}`}
                      className="rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-700"
                    >
                      {area.areaLabel || area.areaKey}
                    </span>
                  ))}
                  {cg.serviceAreas.length > 3 && (
                    <span className="rounded-lg bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-500">
                      +{cg.serviceAreas.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <p className="mt-3 text-xs text-gray-500">
                Next: {nextVisitLabel(cg.nextVisit)}
              </p>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => openProfile(cg.id)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                >
                  <Eye size={16} /> View profile
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ViewClientCaregiverDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        caregiver={selectedCaregiver}
        loading={caregiverDetailLoading}
      />
    </div>
  );
}
