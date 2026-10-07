import Drawer from '../ui/Drawer';

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-gray-50 py-2.5 last:border-0 sm:grid-cols-3">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 sm:col-span-2">{value || '—'}</dd>
    </div>
  );
}

export default function ViewClientDrawer({ open, onClose, client }) {
  if (!client) {
    return <Drawer open={open} onClose={onClose} title="Client details" width="md" />;
  }

  return (
    <Drawer open={open} onClose={onClose} title="Client details" width="md">
      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          {client.profilePic ? (
            <img
              src={client.profilePic}
              alt={client.name || 'Client'}
              className="h-16 w-16 shrink-0 rounded-full border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-500">
              {(client.name || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-gray-900">{client.name}</p>
            <p className="text-sm text-gray-500">{client.email}</p>
            {client.preferredName ? (
              <p className="text-xs text-gray-400">Preferred: {client.preferredName}</p>
            ) : null}
          </div>
        </div>
        <dl>
          <Row label="Client ID" value={client.clientCode} />
          <Row label="Agency" value={client.agencyName} />
          <Row label="Phone" value={client.phone} />
          <Row label="Home phone" value={client.phoneHome} />
          <Row label="Email" value={client.email} />
          <Row label="Date of birth" value={client.dateOfBirth} />
          <Row label="Gender" value={client.gender} />
          <Row label="Address" value={client.address} />
          <Row label="Status" value={client.status} />
          <Row
            label="Emergency contact"
            value={
              client.emergencyContactName
                ? [
                  client.emergencyContactName,
                  client.emergencyContactRelationship,
                  client.emergencyContactPhone,
                ].filter(Boolean).join(' · ')
                : ''
            }
          />
          <Row
            label="Added"
            value={
              client.createdAt
                ? new Date(client.createdAt).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                })
                : ''
            }
          />
        </dl>
      </div>
    </Drawer>
  );
}
