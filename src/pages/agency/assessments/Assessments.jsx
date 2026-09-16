import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ClipboardList, FileText, UserCheck, DollarSign, Download, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import AgencyKpiCard from '../../../components/agency/dashboard/AgencyKpiCard';
import AssessmentFormsDownloadModal from '../../../components/agency/assessments/AssessmentFormsDownloadModal';
import ActionIconButton from '../../../components/ui/ActionIconButton';
import SubmitButton from '../../../components/ui/SubmitButton';
import {
  acceptAssessmentQuote,
  deleteAssessment,
  fetchAssessments,
  fetchAssessmentStats,
  generateAssessmentQuote,
  updateAssessmentQuote,
} from '../../../redux/slices/assessmentsSlice';
import { ROUTES } from '../../../routes/routes';
import { confirmAlert } from '../../../utils/swal';
import { AssessorDetailCell } from '../../../components/ui/AssessorPhotoUpload';
import useSubmitLock from '../../../hooks/useSubmitLock';

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  Enquiry: 'bg-blue-100 text-blue-700',
  Quoted: 'bg-amber-100 text-amber-700',
  Accepted: 'bg-emerald-100 text-emerald-700',
  Declined: 'bg-gray-100 text-gray-600',
};

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

function FormsProgressCell({ packetProgress }) {
  const progress = packetProgress || { total: 15, saved: 0, started: 0 };
  const pct = Math.round((progress.saved / Math.max(progress.total, 1)) * 100);
  const complete = progress.saved >= progress.total;
  return (
    <div className="min-w-[140px]">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={`font-semibold ${complete ? 'text-emerald-700' : 'text-gray-800'}`}>
          {progress.saved}/{progress.total} forms
        </span>
        <span className="text-gray-400">{pct}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${complete ? 'bg-emerald-500' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {progress.started > 0 && progress.saved < progress.total ? (
        <p className="mt-1 text-[10px] text-amber-700">{progress.started} in progress</p>
      ) : null}
    </div>
  );
}

function QuoteModal({ open, onClose, onSubmit, loading, defaults, isEdit }) {
  const [hourlyRate, setHourlyRate] = useState('35');
  const [weeklyHours, setWeeklyHours] = useState('20');

  useEffect(() => {
    if (!open) return;
    setHourlyRate(String(defaults?.hourlyRate ?? 35));
    setWeeklyHours(String(defaults?.weeklyHours ?? 20));
  }, [open, defaults?.hourlyRate, defaults?.weeklyHours]);

  if (!open) return null;
  const monthly = Math.round(Number(weeklyHours || 0) * Number(hourlyRate || 0) * 4.33 * 100) / 100;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">{isEdit ? 'Update Care Plan Quote' : 'Generate Care Plan Quote'}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit ? 'Update pricing and resend the quote email to the client and agency owner.' : 'Price the recommended care plan for the client to review.'}
        </p>
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
          <button type="button" onClick={onClose} disabled={loading} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium disabled:opacity-50">Cancel</button>
          <SubmitButton
            type="button"
            loading={loading}
            icon={Save}
            loadingLabel="Saving..."
            onClick={() => onSubmit({ hourlyRate: Number(hourlyRate), weeklyHours: Number(weeklyHours), quotedMonthlyPrice: monthly })}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            {isEdit ? 'Update & Email' : 'Generate Quote'}
          </SubmitButton>
        </div>
      </div>
    </div>
  );
}

export default function Assessments() {
  const dispatch = useDispatch();
  const { list, stats, pagination, loading } = useSelector((s) => s.assessments);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [quoteTarget, setQuoteTarget] = useState(null);
  const [downloadTarget, setDownloadTarget] = useState(null);
  const [quoteLoading, runLocked] = useSubmitLock();
  const isEditQuote = Boolean(quoteTarget?.carePlanId);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    dispatch(fetchAssessments({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: statusFilter === 'All' ? undefined : statusFilter,
    }));
  }, [dispatch, page, debouncedSearch, statusFilter]);

  useEffect(() => {
    dispatch(fetchAssessmentStats());
  }, [dispatch]);

  const load = () => {
    dispatch(fetchAssessments({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: statusFilter === 'All' ? undefined : statusFilter,
    }));
    dispatch(fetchAssessmentStats());
  };

  useEffect(() => {
    if (!loading && list.length === 0 && page > 1 && pagination.total > 0) {
      setPage((p) => Math.max(1, p - 1));
    }
  }, [loading, list.length, page, pagination.total]);

  const pages = useMemo(
    () => pageNumbers(pagination.page || page, pagination.totalPages || 1),
    [pagination.page, pagination.totalPages, page],
  );

  const handleDelete = async (item) => {
    if (!await confirmAlert({ title: 'Delete assessment?', text: `Remove ${item.clientName || item.assessmentCode}?`, confirmText: 'Delete', danger: true })) return;
    await dispatch(deleteAssessment(item.id));
    load();
  };

  const handleQuote = (pricing) => runLocked(async () => {
    try {
      const action = isEditQuote ? updateAssessmentQuote : generateAssessmentQuote;
      await dispatch(action({ id: quoteTarget.id, pricing })).unwrap();
      setQuoteTarget(null);
      load();
    } catch { /* toast */ }
  });

  const handleAccept = async (item) => {
    if (!await confirmAlert({
      title: 'Client accepted the quote?',
      text: 'This will onboard the client and activate their care plan for service.',
      confirmText: 'Onboard Client',
    })) return;
    await dispatch(acceptAssessmentQuote(item.id));
    load();
  };

  const quoteDefaults = quoteTarget
    ? {
      hourlyRate: quoteTarget.hourlyRate ?? 35,
      weeklyHours: quoteTarget.weeklyHours
        ?? quoteTarget.recommendedWeeklyHours
        ?? 20,
    }
    : null;

  const emptyHint = debouncedSearch || statusFilter !== 'All'
    ? { title: 'No matching assessments', text: 'Try a different search or status filter.' }
    : { title: 'No assessments yet', text: 'Start with a new client enquiry assessment.' };

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
        ) : !list.length ? (
          <div className="p-12 text-center">
            <p className="font-medium text-gray-900">{emptyHint.title}</p>
            <p className="mt-1 text-sm text-gray-500">{emptyHint.text}</p>
            {emptyHint.title === 'No assessments yet' ? (
              <Link to={ROUTES.AGENCY_ASSESSMENTS_CREATE} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover">New Assessment</Link>
            ) : null}
          </div>
        ) : (
          <>
          <div className={`overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Assessment ID</th>
                  <th className="px-5 py-3">Forms</th>
                  <th className="px-5 py-3">Assessor Details</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <AssessorDetailCell
                        name={a.clientName || '—'}
                        title={a.clientPhone || a.clientEmail || ''}
                        photo={a.clientPhoto || a.client?.profilePic}
                        fallbackTitle=""
                      />
                    </td>
                    <td className="px-5 py-4">{a.assessmentCode}</td>
                    <td className="px-5 py-4">
                      <FormsProgressCell packetProgress={a.packetProgress} />
                    </td>
                    <td className="px-5 py-4">
                      <AssessorDetailCell
                        name={a.assessorName}
                        title={a.assessorTitle}
                        photo={a.assessorPhoto}
                      />
                    </td>
                    <td className="px-5 py-4">{a.assessmentDate || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[a.status] || STATUS_STYLES.Enquiry}`}>{a.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-0.5">
                        <ActionIconButton
                          label="Download all forms"
                          onClick={() => setDownloadTarget(a)}
                          className="text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Download size={16} />
                        </ActionIconButton>
                        <ActionIconButton
                          label="Edit"
                          to={ROUTES.AGENCY_ASSESSMENTS_EDIT.replace(':id', a.id)}
                          as={Link}
                          className="text-gray-500 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Pencil size={16} />
                        </ActionIconButton>
                        {/* <ActionIconButton
                          label="Print"
                          onClick={() => window.open(ROUTES.AGENCY_ASSESSMENTS_PRINT.replace(':id', a.id), '_blank')}
                          className="text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Printer size={16} />
                        </ActionIconButton> */}
                        {a.status === 'Enquiry' && (
                          <ActionIconButton
                            label="Quote"
                            onClick={() => setQuoteTarget(a)}
                            className="text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                          >
                            <DollarSign size={16} />
                          </ActionIconButton>
                        )}
                        {a.carePlanId && (a.status === 'Quoted' || a.status === 'Accepted') && (
                          <ActionIconButton
                            label="Edit Quote"
                            onClick={() => setQuoteTarget(a)}
                            className="text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                          >
                            <DollarSign size={16} />
                          </ActionIconButton>
                        )}
                        {a.status === 'Quoted' && (
                          <ActionIconButton
                            label="Onboard"
                            onClick={() => handleAccept(a)}
                            className="text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <UserCheck size={16} />
                          </ActionIconButton>
                        )}
                        {a.carePlanId && (
                          <ActionIconButton
                            label="View Plan"
                            to={ROUTES.AGENCY_CARE_PLANS_EDIT.replace(':id', a.carePlanId)}
                            as={Link}
                            className="text-gray-500 hover:bg-primary/10 hover:text-primary"
                          >
                            <FileText size={16} />
                          </ActionIconButton>
                        )}
                        {a.status !== 'Accepted' && (
                          <ActionIconButton
                            label="Delete"
                            onClick={() => handleDelete(a)}
                            className="text-gray-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </ActionIconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
            <p className="text-sm text-gray-500">
              Showing {pagination.from || 0}-{pagination.to || 0} of {pagination.total || 0}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {pages.map((p, idx) => (
                p === '…' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`min-w-[34px] rounded-lg px-2 py-1.5 text-sm font-medium ${
                      p === page ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              ))}
              <button
                type="button"
                disabled={page >= (pagination.totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          </>
        )}
      </div>

      <QuoteModal
        open={Boolean(quoteTarget)}
        onClose={() => setQuoteTarget(null)}
        onSubmit={handleQuote}
        loading={quoteLoading}
        defaults={quoteDefaults}
        isEdit={isEditQuote}
      />

      <AssessmentFormsDownloadModal
        open={Boolean(downloadTarget)}
        onClose={() => setDownloadTarget(null)}
        assessment={downloadTarget}
      />
    </div>
  );
}
