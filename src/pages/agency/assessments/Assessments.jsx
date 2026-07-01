import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ClipboardList, FileText, UserCheck, DollarSign } from 'lucide-react';
import AgencyKpiCard from '../../../components/agency/dashboard/AgencyKpiCard';
import {
  acceptAssessmentQuote,
  deleteAssessment,
  fetchAssessments,
  fetchAssessmentStats,
  generateAssessmentQuote,
} from '../../../redux/slices/assessmentsSlice';
import { ROUTES } from '../../../routes/routes';
import { confirmAlert } from '../../../utils/swal';

const STATUS_STYLES = {
  Enquiry: 'bg-blue-100 text-blue-700',
  Quoted: 'bg-amber-100 text-amber-700',
  Accepted: 'bg-emerald-100 text-emerald-700',
  Declined: 'bg-gray-100 text-gray-600',
};

function QuoteModal({ open, onClose, onSubmit, loading, defaultHours }) {
  const [hourlyRate, setHourlyRate] = useState('35');
  const [weeklyHours, setWeeklyHours] = useState(defaultHours || '20');
  if (!open) return null;
  const monthly = Math.round(Number(weeklyHours || 0) * Number(hourlyRate || 0) * 4.33 * 100) / 100;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">Generate Care Plan Quote</h3>
        <p className="mt-1 text-sm text-gray-500">Price the recommended care plan for the client to review.</p>
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Hourly rate ($)</label>
            <input type="number" min="0" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Weekly hours</label>
            <input type="number" min="0" value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          </div>
          <div className="rounded-xl bg-primary/5 px-4 py-3 text-sm text-gray-800">
            Estimated monthly quote: <strong>${monthly.toLocaleString()}</strong>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium">Cancel</button>
          <button type="button" disabled={loading} onClick={() => onSubmit({ hourlyRate: Number(hourlyRate), weeklyHours: Number(weeklyHours), quotedMonthlyPrice: monthly })} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50">
            {loading ? 'Generating...' : 'Generate Quote'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Assessments() {
  const dispatch = useDispatch();
  const { list, stats, loading } = useSelector((s) => s.assessments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [quoteTarget, setQuoteTarget] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const load = () => {
    dispatch(fetchAssessments());
    dispatch(fetchAssessmentStats());
  };
  useEffect(() => { load(); }, [dispatch]);

  const filtered = useMemo(() => list.filter((a) => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const q = search.trim().toLowerCase();
    if (!q) return matchStatus;
    return matchStatus && [a.clientName, a.clientPhone, a.assessmentCode, a.assessorName].join(' ').toLowerCase().includes(q);
  }), [list, search, statusFilter]);

  const handleDelete = async (item) => {
    if (!await confirmAlert({ title: 'Delete assessment?', text: `Remove ${item.clientName || item.assessmentCode}?`, confirmText: 'Delete', danger: true })) return;
    await dispatch(deleteAssessment(item.id));
    dispatch(fetchAssessmentStats());
  };

  const handleQuote = async (pricing) => {
    setQuoteLoading(true);
    try {
      await dispatch(generateAssessmentQuote({ id: quoteTarget.id, pricing })).unwrap();
      setQuoteTarget(null);
      load();
    } catch { /* toast */ }
    setQuoteLoading(false);
  };

  const handleAccept = async (item) => {
    if (!await confirmAlert({
      title: 'Client accepted the quote?',
      text: 'This will onboard the client and activate their care plan for service.',
      confirmText: 'Onboard Client',
    })) return;
    await dispatch(acceptAssessmentQuote(item.id));
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Client Assessments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Evaluate enquiries, generate care plan quotes, and onboard clients after agreement.
          </p>
        </div>
        <Link to={ROUTES.AGENCY_ASSESSMENTS_CREATE} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover">
          <Plus size={16} /> New Assessment
        </Link>
      </div>

      <div className="rounded-xl border border-primary/15 bg-primary/5 px-5 py-4 text-sm text-gray-800">
        <strong>Workflow:</strong> New enquiry → Complete assessment → Generate quote → Client agrees → Onboard for service
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AgencyKpiCard label="Total" value={String(stats.total)} icon={ClipboardList} iconBg="bg-blue-100 text-blue-600" />
        <AgencyKpiCard label="Enquiries" value={String(stats.enquiry)} icon={FileText} iconBg="bg-blue-100 text-blue-600" />
        <AgencyKpiCard label="Quoted" value={String(stats.quoted)} icon={DollarSign} iconBg="bg-amber-100 text-amber-600" />
        <AgencyKpiCard label="Onboarded" value={String(stats.accepted)} icon={UserCheck} iconBg="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-3 border-b border-gray-100 px-5 py-4">
          <div className="relative min-w-[200px] flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assessments..." className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option value="All">All statuses</option>
            <option value="Enquiry">Enquiry</option>
            <option value="Quoted">Quoted</option>
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
          </select>
        </div>

        {loading && !list.length ? (
          <p className="p-12 text-center text-sm text-gray-500">Loading...</p>
        ) : !filtered.length ? (
          <div className="p-12 text-center">
            <p className="font-medium text-gray-900">No assessments yet</p>
            <p className="mt-1 text-sm text-gray-500">Start with a new client enquiry assessment.</p>
            <Link to={ROUTES.AGENCY_ASSESSMENTS_CREATE} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover">New Assessment</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Assessment ID</th>
                  <th className="px-5 py-3">Assessor</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{a.clientName || '—'}</p>
                      <p className="text-xs text-gray-500">{a.clientPhone || a.clientEmail || ''}</p>
                    </td>
                    <td className="px-5 py-4">{a.assessmentCode}</td>
                    <td className="px-5 py-4">{a.assessorName || '—'}</td>
                    <td className="px-5 py-4">{a.assessmentDate || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[a.status] || STATUS_STYLES.Enquiry}`}>{a.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={ROUTES.AGENCY_ASSESSMENTS_EDIT.replace(':id', a.id)} className="text-gray-500 hover:text-primary"><Pencil size={15} /></Link>
                        {a.status === 'Enquiry' && (
                          <button type="button" onClick={() => setQuoteTarget(a)} className="text-xs font-medium text-amber-700 hover:underline">Quote</button>
                        )}
                        {a.status === 'Quoted' && (
                          <button type="button" onClick={() => handleAccept(a)} className="text-xs font-medium text-emerald-700 hover:underline">Onboard</button>
                        )}
                        {a.carePlanId && (
                          <Link to={`${ROUTES.AGENCY_CARE_PLANS_EDIT.replace(':id', a.carePlanId)}`} className="text-xs font-medium text-primary hover:underline">View Plan</Link>
                        )}
                        {a.status !== 'Accepted' && (
                          <button type="button" onClick={() => handleDelete(a)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QuoteModal
        open={Boolean(quoteTarget)}
        onClose={() => setQuoteTarget(null)}
        onSubmit={handleQuote}
        loading={quoteLoading}
        defaultHours={quoteTarget?.formData?.carePlanSummary?.recommendedWeeklyHours}
      />
    </div>
  );
}
