import EvvVisitLogsTable from '../../../components/agency/evv/EvvVisitLogsTable';

export default function EvvUnverified() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Unverified Visits</h1>
        <p className="mt-1 text-sm text-gray-500">Visits missing check-in, check-out, or required verification data.</p>
      </div>
      <EvvVisitLogsTable title="Unverified Visits" defaultStatus="Unverified" showFilters={false} />
    </div>
  );
}
