import EvvVisitLogsTable from '../../../components/agency/evv/EvvVisitLogsTable';

export default function EvvUnverified() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Unverified Visits</h1>
        <p className="mt-1 text-sm text-gray-500">
          Scheduled or in-progress visits that have not completed on-time verification yet.
        </p>
      </div>
      <EvvVisitLogsTable
        title="Unverified Visits"
        defaultStatus="Unverified"
        mode="range"
        rangeDays={14}
        showFilters={false}
        showSummary={false}
      />
    </div>
  );
}
