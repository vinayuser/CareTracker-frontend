import { MapPin, Briefcase, UserPlus, CheckCircle2, RotateCcw } from 'lucide-react';

function StatCell({ label, count, onClick, variant = 'default', showBorder = true }) {
  const colorClass = {
    default: 'text-primary',
    hired: 'text-emerald-600',
    rejected: 'text-red-500',
    total: 'text-gray-900',
  }[variant];

  const clickable = Boolean(onClick) && count > 0;

  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      className={`flex flex-col items-center justify-center px-6 py-2 ${
        showBorder ? 'border-r border-gray-200' : ''
      } ${clickable ? 'cursor-pointer rounded-lg hover:bg-gray-50' : 'cursor-default'}`}
    >
      <p className={`text-2xl font-bold ${colorClass}`}>{count}</p>
      <p className="max-w-[100px] truncate text-center text-xs font-medium text-gray-500">{label}</p>
    </button>
  );
}

export default function JobCard({
  job,
  stats = {},
  stages = [],
  isOwner = false,
  onAddCandidate,
  onEdit,
  onDelete,
  onStageClick,
  onRejectedClick,
  onHiredClick,
  onCompleteJobHiring,
  onReopenJobHiring,
}) {
  const hired = stats.hired ?? 0;
  const rejected = stats.rejected ?? 0;
  const total = stats.total ?? 0;
  const inPipeline = Math.max(0, total - hired - rejected);
  const hiringStatus = stats.hiring_status || job.hiring_status || job.hiringStatus || 'Open';
  const hiringComplete = hiringStatus === 'Complete';

  const workplaceLabel = {
    onsite: 'On-site',
    hybrid: 'Hybrid',
    remote: 'Remote',
  }[job.job_workplace] || job.job_workplace;

  const stageCounts = stages.length
    ? stages.map((stage) => ({
        id: stage.id,
        name: stage.name,
        count: stats.stages?.[stage.name] ?? 0,
      }))
    : Object.entries(stats.stages || {}).map(([name, count]) => ({ id: name, name, count }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{job.job_title || job.jobTitle}</h3>
            {hiringComplete && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                Hiring Complete
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Briefcase size={14} />
              {workplaceLabel}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {job.job_location || job.jobLocation}
            </span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {job.job_code || job.jobCode}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hiringComplete ? (
            <button
              type="button"
              onClick={() => onReopenJobHiring?.(job)}
              className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
            >
              <RotateCcw size={14} />
              Reopen Hiring Cycle
            </button>
          ) : (
            <>
              {hired > 0 && (
                <button
                  type="button"
                  onClick={() => onCompleteJobHiring?.(job)}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  <CheckCircle2 size={14} />
                  Mark Hiring Complete
                </button>
              )}
              <button
                type="button"
                onClick={() => onAddCandidate?.(job)}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover"
              >
                <UserPlus size={14} />
                Add Candidate
              </button>
              <button
                type="button"
                onClick={() => onEdit?.(job)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            </>
          )}
          {isOwner && (
            <button
              type="button"
              onClick={() => onDelete?.(job)}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto px-5 py-4">
        <div className="flex min-w-max items-stretch gap-0">
          <StatCell label="Total" count={total} variant="total" />
          {stageCounts.map((stage) => (
            <StatCell
              key={stage.id || stage.name}
              label={stage.name}
              count={stage.count}
              onClick={() => onStageClick?.(job, stage)}
              showBorder
            />
          ))}
          <StatCell
            label="Rejected"
            count={rejected}
            variant="rejected"
            onClick={() => onRejectedClick?.(job)}
            showBorder
          />
          <StatCell
            label="Hired"
            count={hired}
            variant="hired"
            onClick={() => onHiredClick?.(job)}
            showBorder={false}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3">
        <p className="text-xs text-gray-500">
          {inPipeline} in pipeline · {rejected} rejected · {hired} hired
          {hiringComplete && ' · Reopen hiring to add candidates or edit this job'}
        </p>
        {!hiringComplete && hired > 0 && (
          <button
            type="button"
            onClick={() => onCompleteJobHiring?.(job)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
          >
            <CheckCircle2 size={13} />
            Mark Hiring Complete
          </button>
        )}
      </div>
    </div>
  );
}
