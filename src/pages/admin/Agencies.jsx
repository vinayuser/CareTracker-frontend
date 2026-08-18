import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Info,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Upload,
  User,
  Users,
  UserCheck,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchAgencyOptions,
  getAgencyById,
  updateAgency,
  deleteAgency,
  clearSelectedAgency,
} from '../../redux/slices/agencySlice';
import { fetchPlans } from '../../redux/slices/subscriptionPlanSlice';
import Drawer from '../../components/ui/Drawer';
import AgencyStatusBadge from '../../components/ui/AgencyStatusBadge';
import AgencyFormDrawer, { AgencyFormDrawerFooter } from '../../components/admin/AgencyFormDrawer';
import AgencyCaregiversTab from '../../components/admin/AgencyCaregiversTab';
import AgencyBillingTab from '../../components/admin/AgencyBillingTab';
import AgencyDocumentsTab from '../../components/admin/AgencyDocumentsTab';
import AgencyNotesTab from '../../components/admin/AgencyNotesTab';
import {
  enrichAgencyWithPlan,
  formStateToAgencyPayload,
} from '../../utils/agencyStore';
import { formatPrice, formatBillingCycle } from '../../utils/subscriptionStore';
import { ROUTES } from '../../routes/routes';
import { confirmAlert } from '../../utils/swal';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

const DETAIL_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'caregivers', label: 'Caregivers' },
  { key: 'billing', label: 'Subscription & Billing' },
  { key: 'documents', label: 'Documents' },
  { key: 'activity', label: 'Activity & Logs' },
  { key: 'notes', label: 'Notes' },
];

const AVATAR_TONES = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
];

function formatLongDate(value) {
  if (!value) return '—';
  const raw = String(value);
  const d = raw.includes('T') ? new Date(raw) : new Date(`${raw.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function agencyCode(agency) {
  if (!agency?.id) return '—';
  const digits = String(agency.id).replace(/\D/g, '').slice(-4).padStart(4, '0');
  return `AG-${digits === '0000' ? String(agency.id).slice(-4).toUpperCase() : digits}`;
}

function initials(name = '') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'AG';
}

function addressLine(agency) {
  if (agency.address) return agency.address;
  const parts = [agency.city, agency.state].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

function websiteHref(url = '') {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function websiteLabel(url = '') {
  return String(url).replace(/^https?:\/\//i, '');
}

function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-[118px_1fr] items-start gap-3 py-2.5">
      <dt className="text-[12px] font-medium text-slate-500">{label}</dt>
      <dd className="text-[13px] font-semibold text-slate-900">{children || '—'}</dd>
    </div>
  );
}

function AboutStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-primary">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-[15px] font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const active = status === 'Active';
  const inactive = status === 'Inactive' || status === 'Suspended';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        active
          ? 'bg-emerald-50 text-emerald-700'
          : inactive
            ? 'bg-rose-50 text-rose-700'
            : 'bg-slate-100 text-slate-600'
      }`}
    >
      {status || '—'}
    </span>
  );
}

function CardShell({ title, icon: Icon, action, children, className = '', bodyClassName = 'p-5' }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-primary">
                <Icon size={14} />
              </span>
            ) : null}
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          </div>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

function PlaceholderPanel({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default function Agencies() {
  const dispatch = useDispatch();
  const {
    options,
    optionsStatus,
    agency: selectedAgency,
    detailStatus,
  } = useSelector((state) => state.agencies);
  const { list: plans } = useSelector((state) => state.subscriptionPlans);
  const [selectedId, setSelectedId] = useState('');
  const [detailTab, setDetailTab] = useState('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAgencyOptions());
    dispatch(fetchPlans());
  }, [dispatch]);

  useEffect(() => {
    if (!selectorOpen) return undefined;
    const onPointerDown = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [selectorOpen]);

  useEffect(() => {
    if (!options.length) {
      setSelectedId('');
      dispatch(clearSelectedAgency());
      return;
    }
    if (!selectedId || !options.some((a) => a.id === selectedId)) {
      setSelectedId(options[0].id);
    }
  }, [options, selectedId, dispatch]);

  useEffect(() => {
    if (!selectedId) {
      dispatch(clearSelectedAgency());
      return undefined;
    }
    const request = dispatch(getAgencyById(selectedId));
    return () => {
      request.abort?.();
    };
  }, [selectedId, dispatch]);

  const agency = useMemo(
    () => (selectedAgency ? enrichAgencyWithPlan(selectedAgency, plans) : null),
    [selectedAgency, plans],
  );

  const selectedOption = useMemo(
    () => options.find((item) => item.id === selectedId) || null,
    [options, selectedId],
  );

  const timeline = useMemo(
    () => (Array.isArray(agency?.timeline) ? agency.timeline : []),
    [agency],
  );

  const caregivers = useMemo(
    () => (Array.isArray(agency?.caregivers) ? agency.caregivers : []),
    [agency],
  );

  const caregiverTotal = Number(agency?.caregiverTotal ?? agency?.usage?.caregivers ?? caregivers.length);
  const serviceAreaCount = Array.isArray(agency?.serviceAreas) && agency.serviceAreas.length
    ? agency.serviceAreas.length
    : Number(agency?.usage?.branches || 0);
  const pageCount = caregiverTotal > 0 ? Math.ceil(caregiverTotal / 5) : 1;

  const optionsLoading = optionsStatus === 'loading' && options.length === 0;
  const detailLoading = Boolean(selectedId) && (detailStatus === 'loading' || (detailStatus === 'idle' && !agency));
  const detailFailed = detailStatus === 'failed' && selectedId;

  const openEditDrawer = () => {
    if (!agency) return;
    setDrawerOpen(true);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const handleSubmit = async (formData) => {
    if (!agency) return;
    setLoading(true);
    try {
      const payload = formStateToAgencyPayload(formData);
      await dispatch(updateAgency({ id: agency.id, payload })).unwrap();
      closeDrawer();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!agency) return;
    const confirmed = await confirmAlert({
      title: 'Delete agency?',
      text: `Delete ${agency.name}? This cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    await dispatch(deleteAgency(agency.id)).unwrap();
    setSelectedId('');
  };

  const handleSelectAgency = (id) => {
    setSelectedId(id);
    setSelectorOpen(false);
    setDetailTab('overview');
  };

  const handleClearSelection = () => {
    setSelectedId('');
    setSelectorOpen(false);
    dispatch(clearSelectedAgency());
  };

  const handleExport = async () => {
    if (!options.length) {
      toast.info('No agencies to export');
      return;
    }
    setExporting(true);
    try {
      const response = await axiosInstance.get(API_ROUTES.ADMIN.AGENCY.LIST);
      const agencies = Array.isArray(response.data?.data) ? response.data.data : [];
      if (!agencies.length) {
        toast.info('No agencies to export');
        return;
      }
      const enrichedRows = agencies.map((a) => enrichAgencyWithPlan(a, plans));
      const rows = [
        ['Agency ID', 'Name', 'Email', 'Phone', 'City', 'State', 'Status', 'Plan', 'Clients', 'Caregivers', 'Registered'],
        ...enrichedRows.map((a) => [
          agencyCode(a),
          a.name,
          a.email,
          a.phone || '',
          a.city || '',
          a.state || '',
          a.status,
          a.plan?.name || '',
          a.usage?.clients ?? 0,
          a.usage?.caregivers ?? 0,
          a.registeredAt || '',
        ]),
      ];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'agencies.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to export agencies');
    } finally {
      setExporting(false);
    }
  };

  if (optionsLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-16 text-center text-sm text-slate-500 shadow-sm">
        <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Loading agencies…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title + actions (matches mock header row) */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-slate-900">Agencies</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage all registered agencies on the platform.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <Download size={15} /> {exporting ? 'Exporting…' : 'Export'}
          </button>
          <button
            type="button"
            onClick={() => toast.info('Import will be available in a future release')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Upload size={15} /> Import
          </button>
          <Link
            to={ROUTES.ADMIN_INVITATIONS}
            state={{ openSendDrawer: true }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={15} /> Add New Agency
          </Link>
        </div>
      </div>

      {/* Select Agency control */}
      <div ref={selectorRef} className="relative flex max-w-xl flex-wrap items-center gap-2.5">
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
          Select Agency
          <ChevronDown size={14} className="text-slate-400" />
        </div>
        <div className="relative min-w-[240px] flex-1">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <button
              type="button"
              onClick={() => setSelectorOpen((v) => !v)}
              className="flex min-w-0 flex-1 items-center justify-between px-3 py-2.5 text-left text-sm"
            >
              <span className="truncate font-semibold text-slate-900">
                {selectedOption?.name || 'Choose an agency'}
              </span>
              <ChevronDown size={16} className="ml-2 shrink-0 text-slate-400" />
            </button>
            {selectedId ? (
              <button
                type="button"
                onClick={handleClearSelection}
                className="mr-1.5 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                title="Clear selection"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
          {selectorOpen && (
            <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              {options.length === 0 ? (
                <p className="px-3 py-2.5 text-sm text-slate-500">No agencies yet</p>
              ) : (
                options.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectAgency(item.id)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${
                      item.id === selectedId ? 'bg-primary/5 text-primary' : 'text-slate-800'
                    }`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0055d4] text-[10px] font-bold text-white">
                      {initials(item.name).slice(0, 1)}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                    <StatusPill status={item.status} />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {!selectedId ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
          <Building2 size={32} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-base font-semibold text-slate-900">No agency selected</h3>
          <p className="mt-1 text-sm text-slate-500">
            {options.length
              ? 'Choose an agency from the dropdown to view details.'
              : 'Invite an agency to get started.'}
          </p>
        </div>
      ) : detailLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
          <span className="mx-auto mb-3 block h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <h3 className="text-base font-semibold text-slate-900">Loading agency details…</h3>
          <p className="mt-1 text-sm text-slate-500">
            Fetching data for {selectedOption?.name || 'selected agency'}.
          </p>
        </div>
      ) : detailFailed || !agency ? (
        <div className="rounded-xl border border-dashed border-rose-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Could not load agency</h3>
          <p className="mt-1 text-sm text-slate-500">Something went wrong while fetching this agency.</p>
          <button
            type="button"
            onClick={() => dispatch(getAgencyById(selectedId))}
            className="mt-4 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Agency summary card */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-6 p-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
              <div className="flex min-w-0 flex-1 gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#0055d4] text-2xl font-bold text-white">
                  {initials(agency.name).slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-[22px] font-bold leading-none text-slate-900">{agency.name}</h2>
                    <StatusPill status={agency.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} className="shrink-0 text-slate-400" />
                      {addressLine(agency)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={13} className="shrink-0 text-slate-400" />
                      {agency.email || '—'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Phone size={13} className="shrink-0 text-slate-400" />
                      {agency.phone || '—'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-slate-100 pt-4 sm:grid-cols-3 xl:grid-cols-6">
                    {[
                      { label: 'Agency ID', value: agencyCode(agency) },
                      { label: 'Agency Type', value: agency.agencyType || agency.plan?.name || '—' },
                      {
                        label: 'Status',
                        value: agency.status,
                        className: agency.status === 'Active' ? 'text-emerald-600' : 'text-slate-900',
                      },
                      { label: 'Member Since', value: formatLongDate(agency.registeredAt || agency.createdAt) },
                      { label: 'Total Clients', value: Number(agency.usage?.clients || 0).toLocaleString() },
                      { label: 'Total Caregivers', value: caregiverTotal.toLocaleString() },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[11px] font-medium text-slate-400">{item.label}</p>
                        <p className={`mt-1 text-sm font-semibold ${item.className || 'text-slate-900'}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 gap-0 border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div className="min-w-[150px] pr-8">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Primary Contact</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{agency.ownerName || '—'}</p>
                  <p className="mt-1 text-[13px] text-slate-600">{agency.email || '—'}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] text-slate-600">
                    <Phone size={12} className="text-slate-400" />
                    {agency.phone || '—'}
                  </p>
                </div>
                <div className="min-w-[150px] border-l border-slate-100 pl-8">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Platform Plan</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{agency.plan?.name || 'No plan assigned'}</p>
                  <Link
                    to={ROUTES.ADMIN_SUBSCRIPTION_PLANS}
                    className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                  >
                    View Plan Details <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex gap-0 overflow-x-auto">
              {DETAIL_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDetailTab(key)}
                  className={`shrink-0 border-b-2 px-4 py-3 text-[13px] font-medium transition-colors ${
                    detailTab === key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {detailTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                {/* Agency Details */}
                <CardShell
                  title="Agency Details"
                  action={(
                    <button
                      type="button"
                      onClick={openEditDrawer}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  )}
                  bodyClassName="px-5 py-2"
                >
                  <dl>
                    <DetailRow label="Name">{agency.name}</DetailRow>
                    <DetailRow label="Legal Name">{agency.legalName || '—'}</DetailRow>
                    <DetailRow label="EIN">—</DetailRow>
                    <DetailRow label="Address">{addressLine(agency)}</DetailRow>
                    <DetailRow label="Phone">{agency.phone || '—'}</DetailRow>
                    <DetailRow label="Email">
                      {agency.email ? (
                        <a href={`mailto:${agency.email}`} className="font-semibold text-primary hover:underline">
                          {agency.email}
                        </a>
                      ) : '—'}
                    </DetailRow>
                    <DetailRow label="Website">
                      {agency.website ? (
                        <a
                          href={websiteHref(agency.website)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-primary hover:underline"
                        >
                          {websiteLabel(agency.website)}
                        </a>
                      ) : '—'}
                    </DetailRow>
                    <DetailRow label="Primary Contact">{agency.ownerName || '—'}</DetailRow>
                    <DetailRow label="Service Type">{agency.agencyType || '—'}</DetailRow>
                    <DetailRow label="Timezone">—</DetailRow>
                    <DetailRow label="Status"><StatusPill status={agency.status} /></DetailRow>
                  </dl>
                </CardShell>

                {/* About Agency */}
                <CardShell title="About Agency" icon={Info}>
                  <p className="text-[13px] leading-relaxed text-slate-600">
                    {agency.description?.trim()
                      ? agency.description
                      : 'No description provided for this agency.'}
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <AboutStat
                      icon={User}
                      label="Total Employees"
                      value={Number(agency.usage?.users || 0).toLocaleString()}
                    />
                    <AboutStat
                      icon={Users}
                      label="Total Clients"
                      value={Number(agency.usage?.clients || 0).toLocaleString()}
                    />
                    <AboutStat
                      icon={UserCheck}
                      label="Total Caregivers"
                      value={caregiverTotal.toLocaleString()}
                    />
                  </div>
                  <div className="mt-2.5">
                    <AboutStat
                      icon={MapPin}
                      label="Service Areas"
                      value={
                        serviceAreaCount > 0
                          ? `${serviceAreaCount} Location${serviceAreaCount === 1 ? '' : 's'}`
                          : '—'
                      }
                    />
                  </div>
                </CardShell>

                {/* Subscription & Plan Summary */}
                <CardShell
                  title="Subscription & Plan Summary"
                  icon={CreditCard}
                  action={(
                    <button
                      type="button"
                      onClick={openEditDrawer}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Manage Subscription
                    </button>
                  )}
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">Current Plan</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold text-slate-900">{agency.plan?.name || 'No plan assigned'}</p>
                        {agency.plan ? <StatusPill status={agency.status === 'Active' ? 'Active' : agency.status} /> : null}
                      </div>
                      {agency.plan?.description ? (
                        <p className="mt-1 text-xs text-slate-500">{agency.plan.description}</p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-[11px] text-slate-400">Plan Amount</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">
                          {agency.plan
                            ? `${formatPrice(agency.plan.price)} / ${formatBillingCycle(agency.plan.billingCycle)}`
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400">Billing Cycle</p>
                        <p className="mt-1 text-sm font-bold capitalize text-slate-900">
                          {agency.plan?.billingCycle || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400">Next Billing Date</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">—</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 px-3.5 py-3.5 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] text-slate-400">Subscription Start Date</p>
                        <p className="mt-1 text-[13px] font-semibold text-slate-900">
                          {formatLongDate(agency.registeredAt || agency.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400">Next Renewal Date</p>
                        <p className="mt-1 text-[13px] font-semibold text-slate-900">—</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400">Auto Renewal</p>
                        <p className="mt-1 text-[13px] font-semibold text-slate-500">—</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDetailTab('billing')}
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                    >
                      View Billing History <span aria-hidden>→</span>
                    </button>
                  </div>
                </CardShell>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                {/* Caregivers Top 5 */}
                <CardShell
                  title="Caregivers (Top 5)"
                  className="xl:col-span-2"
                  bodyClassName="p-0"
                  action={(
                    <button
                      type="button"
                      onClick={() => setDetailTab('caregivers')}
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                    >
                      View All Caregivers <span aria-hidden>→</span>
                    </button>
                  )}
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-left text-[11px] font-medium text-slate-400">
                          <th className="px-5 py-3 font-medium">Caregiver Name</th>
                          <th className="py-3 font-medium">Email</th>
                          <th className="py-3 font-medium">Phone</th>
                          <th className="py-3 font-medium">Status</th>
                          <th className="px-5 py-3 font-medium">Joined On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {caregivers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                              No caregivers found for this agency.
                            </td>
                          </tr>
                        ) : (
                          caregivers.map((cg, idx) => (
                            <tr key={cg.id} className="border-b border-slate-50 last:border-0">
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${AVATAR_TONES[idx % AVATAR_TONES.length]}`}>
                                    {initials(cg.name)}
                                  </span>
                                  <span className="font-semibold text-slate-900">{cg.name}</span>
                                </div>
                              </td>
                              <td className="py-3.5 text-slate-500">{cg.email || '—'}</td>
                              <td className="py-3.5 text-slate-500">{cg.phone || '—'}</td>
                              <td className="py-3.5"><StatusPill status={cg.status} /></td>
                              <td className="px-5 py-3.5 text-slate-500">{formatLongDate(cg.joinedOn)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                    <span>
                      {caregivers.length === 0
                        ? `Showing 0 of ${caregiverTotal.toLocaleString()} caregivers`
                        : `Showing 1 to ${caregivers.length} of ${caregiverTotal.toLocaleString()} caregivers`}
                    </span>
                    <div className="flex items-center gap-1">
                      <button type="button" disabled className="rounded p-1 text-slate-300">
                        <ChevronLeft size={14} />
                      </button>
                      <span className="rounded border border-primary/30 bg-primary/5 px-2 py-0.5 font-semibold text-primary">1</span>
                      {pageCount > 1 ? <span className="px-1.5 text-slate-400">2</span> : null}
                      {pageCount > 2 ? <span className="px-1.5 text-slate-400">3</span> : null}
                      {pageCount > 4 ? <span className="px-1 text-slate-400">…</span> : null}
                      {pageCount > 3 ? <span className="px-1.5 text-slate-400">{pageCount}</span> : null}
                      <button type="button" disabled className="rounded p-1 text-slate-300">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </CardShell>

                {/* Subscription Timeline */}
                <CardShell title="Subscription Timeline" icon={ShieldCheck}>
                  {timeline.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-400">No subscription timeline yet.</p>
                  ) : (
                    <ol className="relative space-y-5 border-l border-slate-200 pl-5">
                      {timeline.map((event) => (
                        <li key={event.id} className="relative flex items-start justify-between gap-3">
                          <span
                            className={`absolute -left-[1.4rem] top-1.5 h-3 w-3 rounded-full border-2 ${
                              event.tone === 'upcoming'
                                ? 'border-orange-400 bg-white'
                                : 'border-emerald-500 bg-emerald-500'
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-slate-900">{event.title}</p>
                            {event.detail ? (
                              <p className="mt-0.5 text-xs text-slate-500">{event.detail}</p>
                            ) : null}
                          </div>
                          <p className="shrink-0 text-xs font-medium text-slate-500">
                            {formatLongDate(event.date)}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}
                  <button
                    type="button"
                    onClick={() => setDetailTab('billing')}
                    className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                  >
                    View Full Timeline <span aria-hidden>→</span>
                  </button>
                </CardShell>
              </div>
            </div>
          )}

          {detailTab === 'caregivers' && (
            <AgencyCaregiversTab agencyId={agency.id} agencyName={agency.name} />
          )}

          {detailTab === 'billing' && (
            <AgencyBillingTab agencyId={agency.id} onManageSubscription={openEditDrawer} />
          )}

          {detailTab === 'documents' && (
            <AgencyDocumentsTab agencyId={agency.id} />
          )}
          {detailTab === 'activity' && (
            <PlaceholderPanel title="Activity & Logs" description="Platform activity for this agency will appear here." />
          )}
          {detailTab === 'notes' && (
            <AgencyNotesTab agencyId={agency.id} />
          )}
        </>
      )}

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title="Edit Agency"
        footer={<AgencyFormDrawerFooter onClose={closeDrawer} loading={loading} />}
      >
        <AgencyFormDrawer
          open={drawerOpen}
          editingAgency={agency}
          plans={plans.filter((p) => p.status === 'Active' || p.id === agency?.subscriptionPlanId)}
          onSubmit={handleSubmit}
        />
      </Drawer>
    </div>
  );
}
