import { MapPin } from 'lucide-react';

const jobs = [
  { id: 1, client: 'Margaret Thompson', date: 'Jun 19, 2026', time: '9:00 AM – 11:00 AM', address: '123 Oak Street', status: 'Completed' },
  { id: 2, client: 'Robert Chen', date: 'Jun 19, 2026', time: '1:00 PM – 3:00 PM', address: '456 Maple Ave', status: 'Scheduled' },
  { id: 3, client: 'Eleanor Williams', date: 'Jun 20, 2026', time: '10:00 AM – 12:00 PM', address: '789 Pine Road', status: 'Scheduled' },
  { id: 4, client: 'James Miller', date: 'Jun 21, 2026', time: '2:00 PM – 4:00 PM', address: '321 Elm Court', status: 'Scheduled' },
];

const statusStyles = {
  Completed: 'bg-emerald-50 text-emerald-700',
  Scheduled: 'bg-blue-50 text-blue-700',
  InProgress: 'bg-amber-50 text-amber-700',
};

export default function CaregiverJobs() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <p className="text-sm text-gray-500">View and manage your assigned care visits.</p>
      {jobs.map((job) => (
        <div key={job.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900">{job.client}</p>
              <p className="mt-1 text-sm text-gray-500">{job.date} · {job.time}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={12} /> {job.address}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[job.status]}`}>
              {job.status}
            </span>
          </div>
          {job.status === 'Scheduled' && (
            <button type="button" className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover">
              Start Visit
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
