import { CheckCircle2 } from 'lucide-react';

export default function EvvComplianceGauge({ percent, goal }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const meetingGoal = percent >= goal;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
          <circle cx="75" cy="75" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke={meetingGoal ? '#22c55e' : '#f97316'}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{percent}%</span>
          <span className="text-xs text-gray-500">Compliance</span>
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-500">Agency Goal: {goal}%</p>
      {meetingGoal ? (
        <p className="mt-1 flex items-center gap-1 text-sm font-medium text-emerald-600">
          <CheckCircle2 size={16} /> You are meeting your goal
        </p>
      ) : (
        <p className="mt-1 text-sm font-medium text-amber-600">Below agency goal</p>
      )}
    </div>
  );
}
