import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ROUTES } from '../../../routes/routes';
import EmailDesigner from '../../../components/admin/email/EmailDesigner';
import { EmailPreview, fieldClass, labelClass } from '../../../components/admin/email/EmailMarketingUi';
import {
  getCampaign,
  getSettings,
  getTemplate,
  listAgencies,
  listLists,
  listSegments,
  listTags,
  listTemplates,
  previewLeadAudience,
  previewPlatformAudience,
  saveCampaign,
} from '../../../services/emailMarketingStore';

const ROLES = ['Agency Owner', 'Caregiver', 'Office Staff'];
const STATUSES = ['Active', 'Inactive', 'Invited'];
const STEPS = ['Audience', 'Content', 'Review & Send'];

function emptyAudience(kind) {
  if (kind === 'leads') {
    return { kind: 'leads', listId: '', segmentId: '', tags: [], leadStatus: 'All' };
  }
  return { kind: 'platform', roles: ['Agency Owner'], agency: 'All', statuses: ['Active'], respectPreferences: true };
}

function fromCampaign(campaign) {
  const settings = getSettings();
  if (!campaign) {
    return {
      audience: emptyAudience('platform'),
      content: {
        name: '',
        subject: '',
        previewText: '',
        fromName: settings.fromName,
        fromEmail: settings.fromEmail,
        replyTo: settings.replyTo,
        templateId: '',
      },
      scheduledAt: '',
    };
  }
  return {
    audience: campaign.audience?.kind === 'leads' ? { ...emptyAudience('leads'), ...campaign.audience } : { ...emptyAudience('platform'), ...campaign.audience },
        content: {
          blocks: [],
          backgroundColor: '#ffffff',
          ...campaign.content,
        },
    scheduledAt: campaign.scheduledAt || '',
  };
}

export default function CampaignWizard() {
  const { id } = useParams();
  return <CampaignWizardForm key={id || 'new'} campaignId={id} />;
}

function CampaignWizardForm({ campaignId }) {
  const navigate = useNavigate();
  const existing = campaignId ? getCampaign(campaignId) : null;
  const [step, setStep] = useState(0);
  const initial = fromCampaign(existing);
  const [audience, setAudience] = useState(initial.audience);
  const [content, setContent] = useState(initial.content);
  const [selectedBlockId, setSelectedBlockId] = useState(initial.content.blocks?.[0]?.id || '');
  const [scheduledAt, setScheduledAt] = useState(initial.scheduledAt);

  const templates = listTemplates().filter((t) => t.status === 'Published' || t.id === content.templateId);
  const lists = listLists();
  const segments = listSegments();
  const tags = listTags();
  const agencies = listAgencies();
  const preview = audience.kind === 'leads' ? previewLeadAudience(audience) : previewPlatformAudience(audience);
  const recipientCount = audience.kind === 'leads' ? preview.valid : preview.estimated;

  const setKind = (kind) => {
    if (audience.kind === kind) return;
    setAudience(emptyAudience(kind));
  };

  const toggle = (list, value) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const checklist = [
    { ok: Boolean(content.name.trim()), label: 'Campaign name' },
    { ok: Boolean(content.subject.trim()), label: 'Subject line' },
    { ok: Boolean(content.templateId) || (content.blocks || []).length > 0, label: 'Email design' },
    { ok: recipientCount > 0, label: 'At least one eligible recipient' },
    { ok: audience.kind !== 'leads' || preview.valid === recipientCount, label: 'Leads include only consented contacts' },
    { ok: true, label: 'Unsubscribe footer is included' },
  ];
  const ready = checklist.every((item) => item.ok);

  const persist = (mode) => {
    if ((mode === 'send' || mode === 'schedule') && !ready) {
      toast.error('Complete the checklist before sending');
      return;
    }
    if (mode === 'schedule' && !scheduledAt) {
      toast.error('Choose a date to schedule');
      return;
    }
    const row = saveCampaign({ id: existing?.id, audience, content, scheduledAt }, mode);
    toast.success(mode === 'send' ? 'Campaign sent' : mode === 'schedule' ? 'Campaign scheduled' : 'Draft saved');
    navigate(mode === 'draft' ? ROUTES.ADMIN_EMAIL_CAMPAIGNS : ROUTES.ADMIN_EMAIL_CAMPAIGN_DETAIL.replace(':id', row.id));
  };

  return (
    <div className="space-y-5">
      <div>
        <Link to={ROUTES.ADMIN_EMAIL_CAMPAIGNS} className="text-sm font-medium text-primary">Back to campaigns</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{existing ? 'Edit campaign' : 'Create campaign'}</h1>
        <p className="mt-1 text-sm text-gray-500">Do this in order: pick who gets the email, write it, then send or save. You can only pick one audience type.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(index)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${step === index ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      {step === 0 ? (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <AudienceCard
                title="Platform Users"
                text="People with a CareTracker login. Example: tell agency owners about a new billing screen. Do not use this for a sales list."
                active={audience.kind === 'platform'}
                onClick={() => setKind('platform')}
              />
              <AudienceCard
                title="Leads & Contacts"
                text="People who are not users yet, such as a website inquiry. Only contacts who said yes to marketing email can be included."
                active={audience.kind === 'leads'}
                onClick={() => setKind('leads')}
              />
            </div>

            {audience.kind === 'platform' ? (
              <div className="space-y-4">
                <CheckGroup label="Roles" options={ROLES} selected={audience.roles} onToggle={(value) => setAudience({ ...audience, roles: toggle(audience.roles, value) })} />
                <label className="block">
                  <span className={labelClass}>Agency</span>
                  <select className={fieldClass} value={audience.agency} onChange={(e) => setAudience({ ...audience, agency: e.target.value })}>
                    <option value="All">All Agencies</option>
                    {agencies.map((name) => <option key={name}>{name}</option>)}
                  </select>
                </label>
                <CheckGroup label="Status" options={STATUSES} selected={audience.statuses} onToggle={(value) => setAudience({ ...audience, statuses: toggle(audience.statuses, value) })} />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={audience.respectPreferences} onChange={(e) => setAudience({ ...audience, respectPreferences: e.target.checked })} />
                  Respect communication preferences and the suppression list
                </label>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Contact list</span>
                  <select className={fieldClass} value={audience.listId} onChange={(e) => setAudience({ ...audience, listId: e.target.value })}>
                    <option value="">All lists</option>
                    {lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}
                  </select>
                </label>
                <label>
                  <span className={labelClass}>Segment</span>
                  <select className={fieldClass} value={audience.segmentId} onChange={(e) => setAudience({ ...audience, segmentId: e.target.value })}>
                    <option value="">No segment</option>
                    {segments.map((seg) => <option key={seg.id} value={seg.id}>{seg.name}</option>)}
                  </select>
                </label>
                <label>
                  <span className={labelClass}>Lead status</span>
                  <select className={fieldClass} value={audience.leadStatus} onChange={(e) => setAudience({ ...audience, leadStatus: e.target.value })}>
                    {['All', 'New', 'Qualified', 'Nurture'].map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
                <div>
                  <span className={labelClass}>Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const on = audience.tags.includes(tag.name);
                      return (
                        <button key={tag.name} type="button" onClick={() => setAudience({ ...audience, tags: toggle(audience.tags, tag.name) })} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${on ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Only contacts with consent status Consented can be selected.</p>
                </div>
              </div>
            )}
          </div>
          <SummaryCard preview={preview} kind={audience.kind} />
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-3">
            {[
              ['name', 'Campaign name'],
              ['subject', 'Subject'],
              ['previewText', 'Preview text'],
              ['fromName', 'From name'],
              ['fromEmail', 'From email'],
              ['replyTo', 'Reply-to'],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className={labelClass}>{label}</span>
                <input className={fieldClass} value={content[key] || ''} onChange={(e) => setContent({ ...content, [key]: e.target.value })} />
              </label>
            ))}
            <label className="block md:col-span-2">
              <span className={labelClass}>Start from a template</span>
              <select className={fieldClass} value={content.templateId || ''} onChange={(e) => {
                const templateId = e.target.value;
                const template = templateId ? getTemplate(templateId) : null;
                const blocks = (template?.blocks || []).map((block) => ({ ...block, id: `${block.id}-${Date.now()}` }));
                setContent({
                  ...content,
                  templateId,
                  subject: content.subject || template?.subject || '',
                  blocks,
                  backgroundColor: template?.backgroundColor || content.backgroundColor || '#ffffff',
                });
                setSelectedBlockId(blocks[0]?.id || '');
              }}
              >
                <option value="">Blank email</option>
                {templates.map((tpl) => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
              </select>
            </label>
            <Link to={ROUTES.ADMIN_EMAIL_TEMPLATE_NEW} className="self-end text-sm font-semibold text-primary">Open the full template editor</Link>
          </div>
          <EmailDesigner
            blocks={content.blocks || []}
            backgroundColor={content.backgroundColor || '#ffffff'}
            selectedId={selectedBlockId}
            onChange={({ blocks, backgroundColor, selectedId }) => {
              setContent({ ...content, blocks, backgroundColor });
              setSelectedBlockId(selectedId);
            }}
          />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <SummaryCard preview={preview} kind={audience.kind} />
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Validation</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {checklist.map((item) => (
                  <li key={item.label} className={item.ok ? 'text-emerald-700' : 'text-rose-600'}>
                    {item.ok ? 'Ready' : 'Missing'} · {item.label}
                  </li>
                ))}
              </ul>
              <label className="mt-4 block">
                <span className={labelClass}>Schedule for later</span>
                <input type="date" className={fieldClass} value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => persist('draft')} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">Save Draft</button>
                <button type="button" onClick={() => persist('schedule')} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">Schedule for Later</button>
                <button type="button" onClick={() => persist('send')} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">Send Now</button>
              </div>
            </div>
          </div>
          <EmailPreview
            blocks={content.blocks?.length ? content.blocks : undefined}
            backgroundColor={content.backgroundColor}
            templateId={content.templateId}
            subject={content.subject}
            previewText={content.previewText}
          />
        </div>
      ) : null}

      <div className="flex justify-between">
        <button type="button" disabled={step === 0} onClick={() => setStep((n) => n - 1)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-40">Back</button>
        {step < 2 ? (
          <button type="button" onClick={() => setStep((n) => n + 1)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Continue</button>
        ) : null}
      </div>
    </div>
  );
}

function AudienceCard({ title, text, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-xl border p-4 text-left ${active ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{text}</p>
    </button>
  );
}

function CheckGroup({ label, options, selected, onToggle }) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => onToggle(option)} className={`rounded-full px-3 py-1 text-xs font-semibold ${selected.includes(option) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ preview, kind }) {
  if (kind === 'leads') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Leads & contacts</h3>
        <dl className="mt-3 space-y-2 text-sm text-gray-600">
          <Row label="Valid consented" value={preview.valid} />
          <Row label="Unsubscribed" value={preview.unsubscribed} />
          <Row label="Bounced" value={preview.bounced} />
          <Row label="Excluded" value={preview.excluded} />
        </dl>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Platform users</h3>
      <dl className="mt-3 space-y-2 text-sm text-gray-600">
        <Row label="Estimated recipients" value={preview.estimated} />
        <Row label="Exclusions" value={preview.exclusions} />
        <Row label="Opted out" value={preview.optedOut} />
        <Row label="Suppressed" value={preview.suppressed} />
      </dl>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt>{label}</dt>
      <dd className="font-semibold text-gray-900">{value}</dd>
    </div>
  );
}
