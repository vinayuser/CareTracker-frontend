import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import LegalRichTextEditor from '../../components/admin/LegalRichTextEditor';
import { ROUTES } from '../../routes/routes';
import { plainTextToHtml } from '../../utils/legalContent';

const TABS = [
  { slug: 'privacy', label: 'Privacy Policy', publicPath: ROUTES.PRIVACY },
  { slug: 'terms', label: 'Terms & Conditions', publicPath: ROUTES.TERMS },
];

const fieldClass = 'mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary';
const labelClass = 'text-sm font-medium text-gray-700';

export default function LegalPages() {
  const [tab, setTab] = useState('privacy');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', updatedAt: null });
  const active = TABS.find((item) => item.slug === tab) || TABS[0];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axiosInstance.get(API_ROUTES.ADMIN.LEGAL.DETAIL(tab))
      .then((response) => {
        if (cancelled) return;
        const data = response.data?.data || {};
        setForm({
          title: data.title || '',
          content: plainTextToHtml(data.content || ''),
          updatedAt: data.updatedAt || null,
        });
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err.response?.data?.message || 'Could not load legal page');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tab]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await axiosInstance.put(API_ROUTES.ADMIN.LEGAL.DETAIL(tab), {
        title: form.title.trim(),
        content: form.content,
      });
      const data = response.data?.data || {};
      setForm({
        title: data.title || form.title,
        content: plainTextToHtml(data.content ?? form.content),
        updatedAt: data.updatedAt || form.updatedAt,
      });
      toast.success('Legal page saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save legal page');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Legal Pages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Edit the public Privacy Policy and Terms &amp; Conditions shown on the website.
          </p>
        </div>
        <Link
          to={active.publicPath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-primary hover:bg-gray-50"
        >
          <ExternalLink size={15} />
          View public page
        </Link>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        {TABS.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => setTab(item.slug)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium ${
              tab === item.slug ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <form onSubmit={save} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-500">
              Public URL:{' '}
              <Link to={active.publicPath} className="font-medium text-primary hover:underline">
                {active.publicPath}
              </Link>
            </p>
            {form.updatedAt ? (
              <p className="text-xs text-gray-400">
                Last updated {new Date(form.updatedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
          <label className="block">
            <span className={labelClass}>Page title</span>
            <input
              className={fieldClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <div>
            <span className={labelClass}>Page content</span>
            <LegalRichTextEditor
              value={form.content}
              onChange={(content) => setForm({ ...form, content })}
              placeholder="Write headings, lists, and links for this legal page…"
            />
            <span className="mt-1 block text-xs text-gray-400">
              Use the toolbar for headings, bold, lists, and links. Saved content appears on the public page.
            </span>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save page'}
          </button>
        </form>
      )}
    </div>
  );
}
