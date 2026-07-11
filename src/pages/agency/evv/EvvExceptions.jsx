import EvvVisitLogsTable from '../../../components/agency/evv/EvvVisitLogsTable';

export default function EvvExceptions() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Exceptions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Late check-ins (after grace) and missed visits that need agency review.
        </p>
      </div>
      <EvvVisitLogsTable
        title="Exception & Missed Visits"
        defaultStatus="Alerts"
        mode="range"
        rangeDays={30}
        showFilters
        showSummary
        alertOnly
      />
    </div>
  );
}
