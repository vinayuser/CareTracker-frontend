import { Mail, MapPin, Phone, Star } from 'lucide-react';
import Drawer from '../../ui/Drawer';
import { formatVisitTime, formatTimezoneAbbr } from '../../../utils/visitTimezone';

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-gray-50 py-2.5 last:border-0 sm:grid-cols-3">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 sm:col-span-2">{value || '—'}</dd>
    </div>
  );
}

function Avatar({ caregiver, size = 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-lg' : 'h-12 w-12 text-base';
  if (caregiver?.profilePic) {
    return (
      <img
        src={caregiver.profilePic}
        alt={caregiver.fullName || 'Caregiver'}
        className={`${sizeClass} shrink-0 rounded-full border border-gray-200 object-cover`}
      />
    );
  }
  return (
    <div className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700`}>
      {caregiver?.initials || (caregiver?.fullName || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function formatVisitWhen(visit) {
  if (!visit) return '—';
  const date = visit.scheduledDate
    ? new Date(`${visit.scheduledDate}T12:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    : '';
  const time = formatVisitTime(visit.scheduledStartAt, visit.timezone);
  const tz = formatTimezoneAbbr(visit.scheduledStartAt, visit.timezone);
  return [date, time ? `${time}${tz ? ` ${tz}` : ''}` : ''].filter(Boolean).join(' · ') || '—';
}

export default function ViewClientCaregiverDrawer({ open, onClose, caregiver, loading = false }) {
  if (!caregiver && !loading) {
    return <Drawer open={open} onClose={onClose} title="Caregiver profile" width="lg" />;
  }

  return (
    <Drawer open={open} onClose={onClose} title="Caregiver profile" width="lg">
      {loading || !caregiver ? (
        <p className="py-10 text-center text-sm text-gray-500">Loading profile…</p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
            <Avatar caregiver={caregiver} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-gray-900">{caregiver.fullName}</p>
                {caregiver.primary && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    <Star size={11} /> Primary
                  </span>
                )}
              </div>
              {caregiver.jobTitle && (
                <p className="mt-0.5 text-sm text-gray-600">{caregiver.jobTitle}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                {caregiver.phone && (
                  <a href={`tel:${caregiver.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                    <Phone size={14} /> {caregiver.phone}
                  </a>
                )}
                {caregiver.email && (
                  <a href={`mailto:${caregiver.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                    <Mail size={14} /> {caregiver.email}
                  </a>
                )}
              </div>
            </div>
          </div>

          <dl>
            <Row
              label="Experience"
              value={
                caregiver.experience != null && caregiver.experience !== ''
                  ? `${caregiver.experience} year${Number(caregiver.experience) === 1 ? '' : 's'}`
                  : ''
              }
            />
            <Row
              label="Service areas"
              value={
                caregiver.serviceAreas?.length
                  ? caregiver.serviceAreas
                    .map((a) => [a.areaLabel || a.areaKey, a.frequency].filter(Boolean).join(' · '))
                    .join(', ')
                  : ''
              }
            />
            <Row
              label="Skills"
              value={caregiver.skills?.length ? caregiver.skills.join(', ') : ''}
            />
            <Row label="Next visit" value={formatVisitWhen(caregiver.nextVisit)} />
          </dl>

          {caregiver.summary && (
            <div>
              <p className="mb-1.5 text-sm font-medium text-gray-700">About</p>
              <p className="rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-sm text-gray-700 whitespace-pre-wrap">
                {caregiver.summary}
              </p>
            </div>
          )}

          {Array.isArray(caregiver.upcomingVisits) && caregiver.upcomingVisits.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Upcoming visits</p>
              <ul className="space-y-2">
                {caregiver.upcomingVisits.map((visit) => (
                  <li
                    key={visit.id}
                    className="rounded-xl border border-gray-100 bg-white px-3 py-2.5"
                  >
                    <p className="text-sm font-medium text-gray-900">{formatVisitWhen(visit)}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                      {visit.serviceArea && <span>{visit.serviceArea}</span>}
                      {visit.status && <span>{visit.status}</span>}
                      {visit.address && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} /> {visit.address}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
