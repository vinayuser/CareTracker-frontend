import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../routes/routes';
import { getSettings, getTemplate } from '../../../services/emailMarketingStore';

const LINKS = [
  { to: ROUTES.ADMIN_EMAIL_CAMPAIGNS, label: 'Email Campaigns' },
  { to: ROUTES.ADMIN_EMAIL_TEMPLATES, label: 'Email Templates' },
  { to: ROUTES.ADMIN_EMAIL_LISTS, label: 'Lists & Segments' },
  { to: ROUTES.ADMIN_EMAIL_IMPORT, label: 'Import Contacts' },
  { to: ROUTES.ADMIN_EMAIL_SETTINGS, label: 'Settings' },
];

export function MarketingTabs() {
  const { pathname } = useLocation();
  return (
    <div className="flex gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
      {LINKS.map((link) => {
        const active = pathname === link.to || pathname.startsWith(`${link.to}/`);
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium ${
              active ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

const STATUS = {
  Draft: 'bg-gray-100 text-gray-700',
  Scheduled: 'bg-blue-50 text-blue-700',
  Sent: 'bg-emerald-50 text-emerald-700',
  Published: 'bg-emerald-50 text-emerald-700',
  Archived: 'bg-slate-100 text-slate-500',
  Pending: 'bg-amber-50 text-amber-700',
  Verified: 'bg-emerald-50 text-emerald-700',
  Active: 'bg-emerald-50 text-emerald-700',
  Opened: 'bg-blue-50 text-blue-700',
  Clicked: 'bg-emerald-50 text-emerald-700',
  Delivered: 'bg-slate-100 text-slate-600',
  Bounced: 'bg-rose-50 text-rose-700',
  Unsubscribed: 'bg-amber-50 text-amber-700',
  Excluded: 'bg-slate-100 text-slate-500',
};

export function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS[status] || 'bg-slate-100 text-slate-600'}`}>
      {status || '—'}
    </span>
  );
}

export function EmailPreview({ templateId, subject, previewText, blocks: blockOverride, backgroundColor }) {
  const template = templateId ? getTemplate(templateId) : null;
  const settings = getSettings();
  const blocks = blockOverride || template?.blocks || [];
  const canvas = backgroundColor || template?.backgroundColor || '#ffffff';
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">{subject || template?.subject || 'Subject'}</p>
        <p className="text-xs text-gray-500">{previewText || 'Preview text'}</p>
      </div>
      <div className="space-y-3 px-5 py-5 text-sm" style={{ backgroundColor: canvas, color: '#334155' }}>
        {blocks.length === 0 ? <p className="text-gray-400">Add content to preview the message.</p> : null}
        {blocks.map((block) => (
          <BlockView key={block.id} block={block} />
        ))}
        <div className="mt-4 border-t border-gray-100 pt-3 text-[11px] leading-relaxed text-gray-400">
          <p>{settings.footer}</p>
          <p className="mt-1">
            <span className="text-primary">Unsubscribe</span>
            <span> · </span>
            <span className="text-primary">Manage preferences</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function BlockView({ block }) {
  const style = {
    color: block.color || undefined,
    backgroundColor: block.backgroundColor || undefined,
    textAlign: block.align || undefined,
    borderRadius: block.backgroundColor ? 8 : undefined,
    padding: block.backgroundColor ? '8px 10px' : undefined,
  };
  if (block.type === 'heading') return <h3 className="text-lg font-semibold" style={style}>{block.text}</h3>;
  if (block.type === 'text' || block.type === 'footer') return <p className="whitespace-pre-wrap" style={style}>{block.text}</p>;
  if (block.type === 'image') {
    return block.url
      ? <img src={block.url} alt="" className="max-h-40 w-full rounded-lg object-cover" style={{ backgroundColor: block.backgroundColor }} />
      : <p className="text-xs text-gray-400" style={style}>Image</p>;
  }
  if (block.type === 'divider') return <hr style={{ borderColor: block.color || '#e2e8f0' }} />;
  if (block.type === 'button' || block.type === 'cta') {
    return (
      <span className="inline-flex rounded-lg px-3 py-2 text-sm font-semibold" style={{ backgroundColor: block.buttonColor || '#2563eb', color: block.color || '#ffffff', textAlign: block.align }}>
        {block.text || 'Button'}
      </span>
    );
  }
  return null;
}

export const fieldClass = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-primary';
export const labelClass = 'mb-1.5 block text-[12px] font-medium text-gray-500';
