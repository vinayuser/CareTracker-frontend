import { Link } from 'react-router-dom';
import { Briefcase, Clock, CalendarOff, Wallet, MapPin, ChevronRight } from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import { getAuthUser } from '../../utils/auth';

const todayJobs = [
  { client: 'Margaret Thompson', time: '9:00 AM – 11:00 AM', address: '123 Oak Street', status: 'Upcoming' },
  { client: 'Robert Chen', time: '1:00 PM – 3:00 PM', address: '456 Maple Ave', status: 'Scheduled' },
];

const quickLinks = [
  { label: 'Clock In', icon: Clock, route: ROUTES.CAREGIVER_CLOCK, color: 'bg-emerald-50 text-emerald-700' },
  { label: 'My Jobs', icon: Briefcase, route: ROUTES.CAREGIVER_JOBS, color: 'bg-blue-50 text-blue-700' },
  { label: 'Apply Leave', icon: CalendarOff, route: ROUTES.CAREGIVER_LEAVES, color: 'bg-violet-50 text-violet-700' },
  { label: 'Payments', icon: Wallet, route: ROUTES.CAREGIVER_PAYMENTS, color: 'bg-amber-50 text-amber-700' },
];

export default function CaregiverDashboard() {
  const authUser = getAuthUser();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-6">
        <h2 className="text-xl font-bold text-gray-900">Good morning, {authUser?.name?.split(' ')[0] ?? 'Sarah'}!</h2>
        <p className="mt-1 text-sm text-gray-600">You have {todayJobs.length} visits scheduled today.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickLinks.map(({ label, icon: Icon, route, color }) => (
          <Link
            key={label}
            to={route}
            className={`flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 ${color}`}
          >
            <Icon size={22} />
            <span className="text-xs font-semibold">{label}</span>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-900">Today&apos;s Jobs</h3>
          <Link to={ROUTES.CAREGIVER_JOBS} className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {todayJobs.map((job) => (
            <div key={job.client} className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {job.client.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">{job.client}</p>
                <p className="text-xs text-gray-500">{job.time}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={12} /> {job.address}
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
