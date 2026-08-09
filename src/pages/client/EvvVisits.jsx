import EvvVisitLogsTable from '../../components/agency/evv/EvvVisitLogsTable';

export default function ClientEvvVisits() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Electronic visit verification for your care visits — check-in/out times, status, and agency approval.
      </p>
      <EvvVisitLogsTable
        title="My EVV Visits"
        mode="range"
        rangeDays={30}
        audience="client"
        hideClientColumn
        showFilters
        showSummary
      />
    </div>
  );
}
