export const CAREGIVER_KPIS = {
  todayVisits: { total: 3, completed: 2, upcoming: 1 },
  hoursThisWeek: { current: '28h 15m', goal: '40h', percent: 70 },
  upcomingPay: { amount: '$812.40', payDate: 'May 31, 2024' },
  evvCompliance: { percent: 100, period: 'This Week' },
};

export const TODAY_SCHEDULE = [
  {
    id: '1',
    time: '9:00 AM – 10:00 AM',
    client: 'Mary Johnson',
    service: 'Personal Care',
    address: '123 Oak St, Springfield, IL',
    status: 'Completed',
  },
  {
    id: '2',
    time: '11:00 AM – 12:00 PM',
    client: 'Robert Brown',
    service: 'Companion Care',
    address: '456 Maple Ave, Springfield, IL',
    status: 'In Progress',
  },
  {
    id: '3',
    time: '2:00 PM – 3:00 PM',
    client: 'Linda Martinez',
    service: 'Skilled Nursing',
    address: '789 Pine Rd, Springfield, IL',
    status: 'Scheduled',
  },
];

export const EVV_CLOCK = {
  clockedIn: true,
  client: 'Robert Brown',
  since: '10:58 AM',
  service: 'Companion Care',
  duration: '00h 32m',
};

export const CAREGIVER_MESSAGES = [
  { id: '1', from: 'Office', initials: 'OF', color: 'bg-blue-100 text-blue-700', text: 'Please confirm your visit with Robert Brown.', time: '10:45 AM' },
  { id: '2', from: 'Mary Johnson', initials: 'MJ', color: 'bg-emerald-100 text-emerald-700', text: 'Thank you for your help this morning!', time: '9:30 AM' },
  { id: '3', from: 'System', initials: 'SY', color: 'bg-gray-100 text-gray-700', text: 'Your EVV enrollment has been verified.', time: 'Yesterday' },
];

export const CAREGIVER_ALERTS = [
  { id: '1', type: 'Visit Update', text: 'Robert Brown visit started at 10:58 AM', time: '10:58 AM', tone: 'info' },
  { id: '2', type: 'Training Due', text: 'Annual compliance training due in 5 days', time: 'Today', tone: 'warning' },
  { id: '3', type: 'Document Expiring', text: 'CPR certification expires Jun 30, 2024', time: '2 days ago', tone: 'info' },
];

export const WEEKLY_HOURS = [
  { day: 'Mon', hours: 4.5 },
  { day: 'Tue', hours: 5.0 },
  { day: 'Wed', hours: 4.0 },
  { day: 'Thu', hours: 5.5 },
  { day: 'Fri', hours: 4.25 },
  { day: 'Sat', hours: 3.0 },
  { day: 'Sun', hours: 2.0 },
];

export const WEEKLY_SUMMARY = {
  totalHours: '28h 15m',
  totalVisits: 8,
};

export const STATUS_STYLES = {
  Completed: 'bg-emerald-100 text-emerald-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Scheduled: 'bg-orange-100 text-orange-700',
};
