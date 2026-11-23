import { useSelector } from 'react-redux';
import Drawer from '../../ui/Drawer';

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-gray-50 py-2.5 last:border-0 sm:grid-cols-3">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 sm:col-span-2">{value || '—'}</dd>
    </div>
  );
}

export default function ViewCaregiverDrawer({ open, onClose, caregiver }) {
  const authUser = useSelector((state) => state.auth.user);
  if (!caregiver) {
    return <Drawer open={open} onClose={onClose} title="Caregiver details" width="md" />;
  }

  const agencyName = caregiver.agencyName || authUser?.agencyName || '';

  return (
    <Drawer open={open} onClose={onClose} title="Caregiver details" width="md">
      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          {caregiver.profilePic ? (
            <img
              src={caregiver.profilePic}
              alt={caregiver.fullName || 'Caregiver'}
              className="h-16 w-16 shrink-0 rounded-full border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-500">
              {(caregiver.fullName || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-gray-900">{caregiver.fullName}</p>
            <p className="text-sm text-gray-500">{caregiver.email}</p>
          </div>
        </div>
        <dl>
          <Row label="Login ID" value={caregiver.userId} />
          <Row label="Phone" value={caregiver.phone} />
          <Row label="Employee ID" value={caregiver.employeeId} />
          <Row label="Agency" value={agencyName} />
          <Row
            label="Regular weekly hours"
            value={
              caregiver.regularWeeklyHours != null
                ? `${caregiver.regularWeeklyHours} hrs / week`
                : ''
            }
          />
          <Row
            label="Hourly pay"
            value={
              caregiver.hourlyPayRate != null && Number(caregiver.hourlyPayRate) > 0
                ? `$${Number(caregiver.hourlyPayRate).toFixed(2)} / hr`
                : ''
            }
          />
          <Row
            label="OT extra"
            value={
              caregiver.overtimeExtraPerHour != null
                ? `$${Number(caregiver.overtimeExtraPerHour || 0).toFixed(2)} / OT hr`
                : ''
            }
          />
          <Row
            label="This week hours"
            value={
              caregiver.weekHours
                ? `${caregiver.weekHours.totalHours ?? 0} total · ${caregiver.weekHours.regularHours ?? 0} regular · ${caregiver.weekHours.overtimeHours ?? 0} OT`
                : ''
            }
          />
          <Row
            label="This week OT pay"
            value={
              caregiver.weekHours && Number(caregiver.weekHours.overtimeHours) > 0
                ? `Extra $${Number(caregiver.weekHours.overtimeExtraPay || 0).toFixed(2)} · Total $${Number(caregiver.weekHours.overtimePay || 0).toFixed(2)}`
                : ''
            }
          />
          <Row label="Date of birth" value={caregiver.dateOfBirth} />
          <Row label="Status" value={caregiver.status} />
          <Row label="Hired for job" value={caregiver.source_job_title} />
          <Row
            label="Assigned clients"
            value={
              Array.isArray(caregiver.clients) && caregiver.clients.length
                ? caregiver.clients.map((client) => client.name || client.fullName).filter(Boolean).join(', ')
                : ''
            }
          />
          <Row
            label="Added"
            value={
              caregiver.createdAt
                ? new Date(caregiver.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                : ''
            }
          />
        </dl>
      </div>
    </Drawer>
  );
}
