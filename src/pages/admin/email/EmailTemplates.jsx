import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Copy, Eye, Pencil, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { ROUTES } from '../../../routes/routes';
import { MarketingTabs, PageHeader, StatusPill } from '../../../components/admin/email/EmailMarketingUi';
import { archiveTemplate, duplicateTemplate, listTemplates } from '../../../services/emailMarketingStore';
import { confirmAlert } from '../../../utils/swal';

export default function EmailTemplates() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [previewId, setPreviewId] = useState('');
  const templates = listTemplates();
  void version;
  const categories = ['All', ...new Set(templates.map((t) => t.category).filter(Boolean))];
  const rows = templates.filter((row) => {
    const q = query.trim().toLowerCase();
    if (q && !row.name.toLowerCase().includes(q)) return false;
    if (category !== 'All' && row.category !== category) return false;
    return true;
  });
  const preview = rows.find((row) => row.id === previewId) || templates.find((row) => row.id === previewId);

  const onArchive = async (row) => {
    const confirmed = await confirmAlert({
      title: 'Archive template?',
      text: `${row.name} will be hidden from new campaigns.`,
      confirmText: 'Archive',
      danger: true,
    });
    if (!confirmed) return;
    archiveTemplate(row.id);
    toast.success('Template archived');
    setVersion((n) => n + 1);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Email Templates"
        description="Save the email layout here first. Later, a campaign picks one of these templates and chooses who receives it."
        action={(
          <button type="button" onClick={() => navigate(ROUTES.ADMIN_EMAIL_TEMPLATE_NEW)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white">
            <Plus size={16} /> Create Template
          </button>
        )}
      />
      <MarketingTabs />
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search templates" className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm">
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3">Used In</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600">{row.category}</td>
                  <td className="px-4 py-3 text-gray-600">{row.updatedAt}</td>
                  <td className="px-4 py-3 text-gray-700">{row.usedIn}</td>
                  <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 text-primary">
                      <button type="button" title="Edit" onClick={() => navigate(ROUTES.ADMIN_EMAIL_TEMPLATE_EDIT.replace(':id', row.id))} className="rounded p-1 hover:bg-primary/10"><Pencil size={15} /></button>
                      <button type="button" title="Duplicate" onClick={() => { duplicateTemplate(row.id); toast.success('Template duplicated'); setVersion((n) => n + 1); }} className="rounded p-1 hover:bg-primary/10"><Copy size={15} /></button>
                      <button type="button" title="Preview" onClick={() => setPreviewId(row.id)} className="rounded p-1 hover:bg-primary/10"><Eye size={15} /></button>
                      <button type="button" title="Archive" onClick={() => onArchive(row)} className="rounded p-1 text-gray-500 hover:bg-gray-100"><Archive size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          {preview ? (
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{preview.category}</p>
              <h3 className="mt-1 text-base font-semibold text-gray-900">{preview.subject}</h3>
              {(preview.blocks || []).map((block) => (
                <p key={block.id} className="mt-2">{block.text || block.type}</p>
              ))}
              <p className="mt-4 border-t border-gray-100 pt-3 text-[11px] text-gray-400">Unsubscribe · Manage preferences</p>
            </div>
          ) : <p>Select Preview on a template to see its content.</p>}
        </div>
      </div>
    </div>
  );
}
