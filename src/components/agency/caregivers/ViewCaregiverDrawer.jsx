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
  if (!caregiver) {
    return <Drawer open={open} onClose={onClose} title="Caregiver details" width="md" />;
  }

  return (
    <Drawer open={open} onClose={onClose} title="Caregiver details" width="md">
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="font-medium text-gray-900">{caregiver.fullName}</p>
          <p className="text-sm text-gray-500">{caregiver.email}</p>
        </div>
        <dl>
          <Row label="Login ID" value={caregiver.userId} />
          <Row label="Phone" value={caregiver.phone} />
          <Row label="Employee ID" value={caregiver.employeeId} />
          <Row label="Date of birth" value={caregiver.dateOfBirth} />
          <Row label="Status" value={caregiver.status} />
          <Row label="Hired for job" value={caregiver.source_job_title} />
          <Row
            label="Added"
            value={
              caregiver.createdAt
                ? new Date(caregiver.createdAt).toLocaleDateString()
                : ''
            }
          />
        </dl>
      </div>
    </Drawer>
  );
}
