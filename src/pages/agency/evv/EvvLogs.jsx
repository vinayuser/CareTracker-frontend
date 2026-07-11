import EvvVisitLogsTable from '../../../components/agency/evv/EvvVisitLogsTable';

export default function EvvLogs() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">EVV Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Daily visit tracking for all clients. Ended visits need Approve or Reject. Late check-ins appear in red.
        </p>
      </div>
      <EvvVisitLogsTable title="Daily Visit Logs" mode="day" showFilters showSummary />
    </div>
  );
}
