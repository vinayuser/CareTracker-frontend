import EvvVisitLogsTable from '../../components/agency/evv/EvvVisitLogsTable';

export default function CaregiverVisitLogs() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Visit Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your completed and scheduled visits. After you clock out, the agency must approve or reject the visit.
        </p>
      </div>
      <EvvVisitLogsTable
        title="My Visit Logs"
        mode="range"
        rangeDays={30}
        audience="caregiver"
        hideCaregiverColumn
        showFilters
        showSummary
      />
    </div>
  );
}
