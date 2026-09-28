import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { ROUTES } from '../../../routes/routes';
import { confirmAlert } from '../../../utils/swal';
import { MarketingTabs, PageHeader, StatusPill } from '../../../components/admin/email/EmailMarketingUi';
import {
  deleteCampaign,
  duplicateCampaign,
  listCampaigns,
} from '../../../services/emailMarketingStore';

const FILTERS = ['All', 'Platform Users', 'Leads & Contacts', 'Draft', 'Scheduled', 'Sent'];

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EmailCampaigns() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const campaigns = listCampaigns();
  void version;

  const rows = campaigns.filter((row) => {
    const q = query.trim().toLowerCase();
    if (q && !`${row.name} ${row.audienceLabel}`.toLowerCase().includes(q)) return false;
    if (filter === 'All') return true;
    if (filter === 'Platform Users' || filter === 'Leads & Contacts') return row.type === filter;
    return row.status === filter;
  });

  const refresh = () => setVersion((n) => n + 1);

  const onDelete = async (row) => {
    const confirmed = await confirmAlert({
      title: 'Delete campaign?',
      text: `Remove “${row.name}”? This only deletes the draft record in this browser.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    deleteCampaign(row.id);
    toast.success('Campaign deleted');
    refresh();
  };

  const onDuplicate = (row) => {
    duplicateCampaign(row.id);
    toast.success('Campaign duplicated as a draft');
    refresh();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Email Campaigns"
        description="A campaign is one email you send to a chosen group. A template is only the design you reuse."
        action={(
          <Link
            to={ROUTES.ADMIN_EMAIL_CAMPAIGN_NEW}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus size={16} /> Create Campaign
          </Link>
        )}
      />
      <MarketingTabs />

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campaigns"
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                  filter === item ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Audience</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Recipients</th>
                <th className="px-4 py-3">Open Rate</th>
                <th className="px-4 py-3">Click Rate</th>
                <th className="px-4 py-3">Sent Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">No campaigns match these filters.</td>
                </tr>
              ) : rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3.5 font-medium text-gray-900">{row.name}</td>
                  <td className="px-4 py-3.5 text-gray-600">{row.type}</td>
                  <td className="px-4 py-3.5 text-gray-600">{row.audienceLabel}</td>
                  <td className="px-4 py-3.5"><StatusPill status={row.status} /></td>
                  <td className="px-4 py-3.5 text-gray-700">{row.recipients}</td>
                  <td className="px-4 py-3.5 text-gray-700">{row.openRate == null ? '—' : `${row.openRate}%`}</td>
                  <td className="px-4 py-3.5 text-gray-700">{row.clickRate == null ? '—' : `${row.clickRate}%`}</td>
                  <td className="px-4 py-3.5 text-gray-600">{row.status === 'Scheduled' ? formatDate(row.scheduledAt) : formatDate(row.sentAt)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 text-primary">
                      <button type="button" title="View" onClick={() => navigate(ROUTES.ADMIN_EMAIL_CAMPAIGN_DETAIL.replace(':id', row.id))} className="rounded p-1 hover:bg-primary/10"><Eye size={15} /></button>
                      <button type="button" title="Edit" onClick={() => navigate(ROUTES.ADMIN_EMAIL_CAMPAIGN_EDIT.replace(':id', row.id))} className="rounded p-1 hover:bg-primary/10"><Pencil size={15} /></button>
                      <button type="button" title="Duplicate" onClick={() => onDuplicate(row)} className="rounded p-1 hover:bg-primary/10"><Copy size={15} /></button>
                      <button type="button" title="Delete" onClick={() => onDelete(row)} className="rounded p-1 text-rose-600 hover:bg-rose-50"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
