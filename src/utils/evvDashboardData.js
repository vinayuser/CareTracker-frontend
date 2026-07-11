export const EVV_OVERVIEW = {
  totalVisits: 482,
  verifiedVisits: 445,
  exceptions: 37,
  unverifiedVisits: 23,
  avgDuration: '03h 24m',
  trends: {
    totalVisits: '+18% vs last week',
    exceptions: '-12% vs last week',
    unverified: '-8% vs last week',
    avgDuration: '+6m vs last week',
  },
};

export const VERIFICATION_STATUS_SEGMENTS = [
  { label: 'Verified', pct: 92.3, color: '#22c55e' },
  { label: 'Exceptions', pct: 7.7, color: '#f97316' },
  { label: 'Unverified', pct: 4.8, color: '#ec4899' },
  { label: 'Not Applicable', pct: 1.0, color: '#94a3b8' },
];

export const VERIFICATION_METHOD_SEGMENTS = [
  { label: 'Mobile App (GPS)', pct: 61.8, color: '#3b82f6' },
  { label: 'Telephony (IVR)', pct: 18.5, color: '#8b5cf6' },
  { label: 'Web Portal', pct: 13.9, color: '#14b8a6' },
  { label: 'Manual Entry', pct: 5.8, color: '#64748b' },
];

export const EVV_COMPLIANCE = {
  percent: 92.3,
  goal: 90,
};

export const EVV_VISIT_LOGS = [
  {
    id: 'V-105678',
    date: 'May 22, 2024',
    timeRange: '9:00 AM – 12:00 PM',
    client: 'Mary Johnson',
    caregiver: 'Sarah Williams',
    caregiverInitials: 'SW',
    service: 'Personal Care',
    checkIn: { time: '9:02 AM', address: '123 Oak St, Springfield, IL' },
    checkOut: { time: '12:01 PM', address: '123 Oak St, Springfield, IL' },
    method: 'Mobile App (GPS)',
    methodTone: 'blue',
    duration: '02h 59m',
    status: 'Verified',
  },
  {
    id: 'V-105679',
    date: 'May 22, 2024',
    timeRange: '10:00 AM – 1:00 PM',
    client: 'Robert Chen',
    caregiver: 'Mike Davis',
    caregiverInitials: 'MD',
    service: 'Companion Care',
    checkIn: { time: '10:05 AM', address: '456 Maple Ave, Springfield, IL' },
    checkOut: { time: '12:58 PM', address: '456 Maple Ave, Springfield, IL' },
    method: 'Telephony (IVR)',
    methodTone: 'purple',
    duration: '02h 53m',
    status: 'Verified',
  },
  {
    id: 'V-105680',
    date: 'May 22, 2024',
    timeRange: '1:00 PM – 4:00 PM',
    client: 'Eleanor Williams',
    caregiver: 'Lisa Park',
    caregiverInitials: 'LP',
    service: 'Skilled Nursing',
    checkIn: { time: '1:10 PM', address: '789 Pine Rd, Springfield, IL' },
    checkOut: { time: '3:45 PM', address: '789 Pine Rd, Springfield, IL' },
    method: 'Web Portal',
    methodTone: 'teal',
    duration: '02h 35m',
    status: 'Exception',
  },
  {
    id: 'V-105681',
    date: 'May 22, 2024',
    timeRange: '2:00 PM – 5:00 PM',
    client: 'James Miller',
    caregiver: 'Tom Harris',
    caregiverInitials: 'TH',
    service: 'Personal Care',
    checkIn: { time: '—', address: '—' },
    checkOut: { time: '—', address: '—' },
    method: 'Mobile App (GPS)',
    methodTone: 'blue',
    duration: '—',
    status: 'Unverified',
  },
  {
    id: 'V-105682',
    date: 'May 21, 2024',
    timeRange: '8:00 AM – 11:00 AM',
    client: 'Patricia Adams',
    caregiver: 'Sarah Williams',
    caregiverInitials: 'SW',
    service: 'Personal Care',
    checkIn: { time: '8:01 AM', address: '321 Elm St, Springfield, IL' },
    checkOut: { time: '10:58 AM', address: '321 Elm St, Springfield, IL' },
    method: 'Mobile App (GPS)',
    methodTone: 'blue',
    duration: '02h 57m',
    status: 'Verified',
  },
];

export function filterVisitLogs(logs, { status, search }) {
  return logs.filter((row) => {
    const matchesStatus = !status || status === 'All' || row.status === status;
    const q = (search || '').trim().toLowerCase();
    if (!q) return matchesStatus;
    const haystack = [row.id, row.client, row.caregiver, row.service, row.method].join(' ').toLowerCase();
    return matchesStatus && haystack.includes(q);
  });
}
