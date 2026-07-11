import EvvVisitLogsTable from '../../../components/agency/evv/EvvVisitLogsTable';

export default function EvvLogs() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">EVV Logs</h1>
        <p className="mt-1 text-sm text-gray-500">Complete visit verification history for your agency.</p>
      </div>
      <EvvVisitLogsTable />
    </div>
  );
}
