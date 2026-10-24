import axiosInstance from '../api/axiosInstance';
import API_ROUTES from '../api/apiRoutes';

/**
 * Agency-scoped email marketing store.
 * Persists to Mongo via /agency/marketing/state — never shares platform
 * marketing data or another agency's lists/campaigns.
 */

let cache = null;
let persistQueue = Promise.resolve();

function emptyAgencySeed() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    settings: {
      fromName: '',
      fromEmail: '',
      replyTo: '',
      domain: '',
      domainStatus: 'Pending',
      unsubscribeUrl: '/email/unsubscribe',
      preferencesUrl: '/email/preferences',
      footer: 'This message is a marketing update from your care agency, not a clinical record.',
      suppression: [],
    },
    lists: [{ id: 'list-agency', name: 'Agency contacts', updatedAt: today }],
    tags: [],
    segments: [],
    contacts: [],
    templates: [],
    campaigns: [],
  };
}

export async function hydrateAgencyMarketing() {
  cache = null;
  const response = await axiosInstance.get(API_ROUTES.AGENCY.EMAIL_MARKETING.STATE);
  cache = response.data?.data || emptyAgencySeed();
  return cache;
}

function persistRemote(data) {
  persistQueue = persistQueue
    .then(() => axiosInstance.put(API_ROUTES.AGENCY.EMAIL_MARKETING.STATE, data))
    .catch((err) => console.error('[agency-marketing]', err?.response?.data?.message || err.message));
  return persistQueue;
}

function load() {
  if (cache) return cache;
  cache = emptyAgencySeed();
  return cache;
}

function save(data) {
  cache = data;
  persistRemote(data);
  return data;
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listAgencies() {
  return [];
}

/** Load this agency's login users only (never other agencies or admin lists). */
export async function fetchPlatformAudience() {
  const response = await axiosInstance.get(API_ROUTES.AGENCY.EMAIL_MARKETING.AUDIENCE);
  const data = response.data?.data || {};
  return {
    agencies: Array.isArray(data.agencies) ? data.agencies : [],
    users: Array.isArray(data.users) ? data.users : [],
  };
}

export function getSettings() {
  return load().settings;
}

export function saveSettings(next) {
  const data = load();
  data.settings = { ...data.settings, ...next };
  save(data);
  return data.settings;
}

function templateUsage(data, templateId) {
  return data.campaigns.filter((c) => c.content?.templateId === templateId).length;
}

export function listTemplates() {
  const data = load();
  return data.templates
    .filter((t) => t.status !== 'Archived')
    .map((t) => ({ ...t, usedIn: templateUsage(data, t.id) }));
}

export function getTemplate(id) {
  const data = load();
  const tpl = data.templates.find((t) => t.id === id);
  return tpl ? { ...tpl, usedIn: templateUsage(data, id) } : null;
}

export function saveTemplate(input, status = 'Published') {
  const data = load();
  const updatedAt = new Date().toISOString().slice(0, 10);
  const row = {
    ...input,
    id: input.id || uid('tpl'),
    status,
    updatedAt,
    blocks: input.blocks || [],
  };
  if (input.id) data.templates = data.templates.map((t) => (t.id === input.id ? { ...t, ...row } : t));
  else data.templates.unshift(row);
  save(data);
  return row;
}

export function duplicateTemplate(id) {
  const data = load();
  const tpl = data.templates.find((t) => t.id === id);
  if (!tpl) return null;
  const copy = {
    ...tpl,
    id: uid('tpl'),
    name: `${tpl.name} copy`,
    status: 'Draft',
    updatedAt: new Date().toISOString().slice(0, 10),
    blocks: (tpl.blocks || []).map((b) => ({ ...b, id: uid('b') })),
  };
  data.templates.unshift(copy);
  save(data);
  return copy;
}

export function archiveTemplate(id) {
  const data = load();
  data.templates = data.templates.map((t) => (t.id === id ? { ...t, status: 'Archived' } : t));
  save(data);
}

export function listContacts() {
  return load().contacts;
}

export function deleteContact(id) {
  const data = load();
  data.contacts = data.contacts.filter((contact) => contact.id !== id);
  save(data);
}

export function contactsInList(listId) {
  return load().contacts.filter((contact) => contact.listId === listId);
}

export function contactsInSegment(segmentId) {
  const data = load();
  const segment = data.segments.find((item) => item.id === segmentId);
  if (!segment) return [];
  return data.contacts.filter((contact) => matchesSegment(contact, segment));
}

export function listLists() {
  const data = load();
  return data.lists.map((list) => {
    const people = data.contacts.filter((c) => c.listId === list.id);
    return {
      ...list,
      contactCount: people.length,
      consented: people.filter((c) => c.consentStatus === 'Consented' && !c.bounced).length,
      unsubscribed: people.filter((c) => c.consentStatus === 'Unsubscribed').length,
    };
  });
}

export function listSegments() {
  const data = load();
  return data.segments.map((seg) => ({
    ...seg,
    contactCount: data.contacts.filter((c) => matchesSegment(c, seg)).length,
  }));
}

export function saveSegment(input) {
  const data = load();
  const row = {
    id: input.id || uid('seg'),
    name: input.name,
    rules: input.rules || [],
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  if (input.id) data.segments = data.segments.map((s) => (s.id === input.id ? row : s));
  else data.segments.unshift(row);
  save(data);
  return row;
}

export function deleteSegment(id) {
  const data = load();
  data.segments = data.segments.filter((s) => s.id !== id);
  data.campaigns = data.campaigns.map((campaign) => (
    campaign.audience?.segmentId === id
      ? { ...campaign, audience: { ...campaign.audience, segmentId: '' } }
      : campaign
  ));
  save(data);
}

export function saveList(input) {
  const data = load();
  const name = String(input?.name || '').trim();
  if (!name) throw new Error('List name is required');
  const row = {
    id: input.id || uid('list'),
    name,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  if (input.id) data.lists = data.lists.map((list) => (list.id === input.id ? { ...list, ...row } : list));
  else data.lists.unshift(row);
  save(data);
  return row;
}

export function deleteList(id) {
  const data = load();
  data.lists = data.lists.filter((list) => list.id !== id);
  data.contacts = data.contacts.map((contact) => (
    contact.listId === id ? { ...contact, listId: '' } : contact
  ));
  data.campaigns = data.campaigns.map((campaign) => (
    campaign.audience?.listId === id
      ? { ...campaign, audience: { ...campaign.audience, listId: '' } }
      : campaign
  ));
  save(data);
}

export function listTags() {
  const data = load();
  const names = new Set(data.tags);
  data.contacts.forEach((c) => (c.tags || []).forEach((t) => names.add(t)));
  return [...names].map((name) => ({
    name,
    count: data.contacts.filter((c) => (c.tags || []).includes(name)).length,
  }));
}

export function addTag(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return;
  const data = load();
  if (!data.tags.includes(trimmed)) data.tags.push(trimmed);
  save(data);
}

export function deleteTag(name) {
  const data = load();
  data.tags = data.tags.filter((tag) => tag !== name);
  data.contacts = data.contacts.map((contact) => ({
    ...contact,
    tags: (contact.tags || []).filter((tag) => tag !== name),
  }));
  data.segments = data.segments.map((segment) => ({
    ...segment,
    rules: (segment.rules || []).filter((rule) => !(rule.field === 'tags' && rule.value === name)),
  }));
  data.campaigns = data.campaigns.map((campaign) => (
    campaign.audience?.tags
      ? { ...campaign, audience: { ...campaign.audience, tags: campaign.audience.tags.filter((tag) => tag !== name) } }
      : campaign
  ));
  save(data);
}

function matchesSegment(contact, segment) {
  if (!segment?.rules?.length) return true;
  return segment.rules.every((rule) => {
    if (rule.field === 'tags') return (contact.tags || []).includes(rule.value);
    return String(contact[rule.field] || '') === String(rule.value || '');
  });
}

function isSuppressed(email, settings) {
  return (settings.suppression || []).map((e) => e.toLowerCase()).includes(String(email || '').toLowerCase());
}

export function previewPlatformAudience(audience = {}, users = null) {
  const settings = getSettings();
  const roles = audience.roles?.length ? audience.roles : [];
  const statuses = audience.statuses?.length ? audience.statuses : [];
  const source = Array.isArray(users) ? users : [];
  const pool = source.filter((user) => {
    if (roles.length && !roles.includes(user.role)) return false;
    if (audience.agency && audience.agency !== 'All') {
      const agencyMatch = user.agency === audience.agency || user.agencyId === audience.agency;
      if (!agencyMatch) return false;
    }
    if (statuses.length && !statuses.includes(user.status)) return false;
    return true;
  });
  const suppressed = pool.filter((user) => isSuppressed(user.email, settings));
  const optedOut = pool.filter((user) => user.optedOut);
  const respect = audience.respectPreferences !== false;
  const excluded = new Set([
    ...suppressed.map((u) => u.id),
    ...(respect ? optedOut.map((u) => u.id) : []),
  ]);
  const recipients = pool.filter((u) => !excluded.has(u.id));
  return {
    kind: 'platform',
    recipients,
    estimated: recipients.length,
    exclusions: excluded.size,
    optedOut: optedOut.length,
    suppressed: suppressed.length,
  };
}

export function previewLeadAudience(audience = {}) {
  const data = load();
  const settings = data.settings;
  let pool = data.contacts.filter((c) => !audience.listId || c.listId === audience.listId);
  if (audience.segmentId) {
    const segment = data.segments.find((s) => s.id === audience.segmentId);
    pool = pool.filter((c) => matchesSegment(c, segment));
  }
  if (audience.tags?.length) {
    pool = pool.filter((c) => audience.tags.every((tag) => (c.tags || []).includes(tag)));
  }
  if (audience.leadStatus && audience.leadStatus !== 'All') {
    pool = pool.filter((c) => c.leadStatus === audience.leadStatus);
  }
  const unsubscribed = pool.filter((c) => c.consentStatus === 'Unsubscribed');
  const bounced = pool.filter((c) => c.bounced);
  const missingConsent = pool.filter((c) => c.consentStatus !== 'Consented');
  const suppressed = pool.filter((c) => isSuppressed(c.email, settings));
  const recipients = pool.filter((c) => (
    c.consentStatus === 'Consented'
    && !c.bounced
    && !isSuppressed(c.email, settings)
  ));
  return {
    kind: 'leads',
    recipients,
    valid: recipients.length,
    unsubscribed: unsubscribed.length,
    bounced: bounced.length,
    excluded: missingConsent.length + bounced.filter((c) => c.consentStatus === 'Consented').length + suppressed.length,
    suppressed: suppressed.length,
  };
}

export function listCampaigns() {
  return load().campaigns;
}

export function getCampaign(id) {
  return load().campaigns.find((c) => c.id === id) || null;
}

function audienceSummary(audience) {
  if (audience?.kind === 'leads') {
    const data = load();
    const list = data.lists.find((l) => l.id === audience.listId);
    const segment = data.segments.find((s) => s.id === audience.segmentId);
    return [list?.name || 'All lists', segment?.name].filter(Boolean).join(' · ');
  }
  const roles = audience?.roles?.length ? audience.roles.join(', ') : 'All roles';
  return roles;
}

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const hexColor = (value, fallback) => {
  const raw = String(value || '').trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return raw;
  return fallback;
};

const contrastOn = (background) => {
  const hex = hexColor(background, '#2563eb').replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return '#ffffff';
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#0f172a' : '#ffffff';
};

const absoluteUrl = (url, fallbackPath = '') => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://caretraker.com';
  let href = String(url || fallbackPath || '').trim() || fallbackPath;
  if (!href) return '';
  if (href.startsWith('/')) href = `${origin}${href}`;
  if (!/^https?:\/\//i.test(href) && !href.startsWith('data:') && !href.startsWith('mailto:')) {
    href = `${origin}/${href.replace(/^\/+/, '')}`;
  }
  return href;
};

const withEmailParam = (url, fallbackPath) => {
  const href = absoluteUrl(url, fallbackPath);
  if (!href || href.startsWith('data:') || /[?&]email=/i.test(href)) return href;
  const joiner = href.includes('?') ? '&' : '?';
  return `${href}${joiner}email=*|EMAIL|*`;
};

export function audienceRecipients(audience, platformUsers = null) {
  const preview = audience?.kind === 'leads'
    ? previewLeadAudience(audience)
    : previewPlatformAudience(audience, platformUsers);
  return preview.recipients || [];
}

export function campaignHtml(content = {}) {
  const settings = getSettings();
  const blocks = content.blocks || [];
  const canvas = hexColor(content.backgroundColor, '#ffffff');
  const body = blocks.map((block) => {
    const color = hexColor(block.color, '#0f172a');
    const align = ['center', 'right'].includes(block.align) ? block.align : 'left';
    if (block.type === 'heading') {
      return `<h1 style="margin:0 0 16px;font-size:24px;line-height:30px;font-family:Arial,Helvetica,sans-serif;color:${color};text-align:${align}">${escapeHtml(block.text || '')}</h1>`;
    }
    if (block.type === 'text' || block.type === 'footer') {
      return `<p style="margin:0 0 16px;font-size:15px;line-height:22px;font-family:Arial,Helvetica,sans-serif;color:${color};text-align:${align}">${escapeHtml(block.text || '')}</p>`;
    }
    if (block.type === 'image') {
      const src = String(block.url || block.src || block.imageUrl || '');
      if (!src) return '';
      const safeSrc = src.startsWith('data:') ? src : escapeHtml(absoluteUrl(src));
      const alt = escapeHtml(block.alt || block.text || 'Image');
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 16px"><tr><td align="${align}"><img src="${safeSrc}" alt="${alt}" width="560" style="display:block;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;border-radius:8px" /></td></tr></table>`;
    }
    if (block.type === 'divider') {
      return '<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0" />';
    }
    if (block.type === 'button' || block.type === 'cta') {
      const href = escapeHtml(absoluteUrl(block.url, 'https://caretraker.com') || 'https://caretraker.com');
      const label = escapeHtml(block.text || block.label || block.buttonText || 'Open');
      const btnBg = hexColor(block.buttonColor, '#2563eb');
      const btnText = contrastOn(btnBg);
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="margin:0 0 16px"><tr><td align="center" bgcolor="${btnBg}" style="background-color:${btnBg};border-radius:8px"><a href="${href}" target="_blank" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;font-weight:700;color:${btnText};text-decoration:none">${label}</a></td></tr></table>`;
    }
    return '';
  }).join('');
  const footer = `<p style="margin-top:28px;font-size:12px;line-height:18px;font-family:Arial,Helvetica,sans-serif;color:#64748b">${escapeHtml(settings.footer || '')}<br/><a href="${escapeHtml(withEmailParam(settings.unsubscribeUrl, '/email/unsubscribe'))}" style="color:#2563eb">Unsubscribe</a> · <a href="${escapeHtml(withEmailParam(settings.preferencesUrl, '/email/preferences'))}" style="color:#2563eb">Manage preferences</a></p>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:${canvas}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${canvas}"><tr><td align="center" style="padding:24px"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">${body}${footer}</table></td></tr></table></body></html>`;
}

export function saveCampaign(input, mode = 'draft', delivery = null, platformUsers = null) {
  const data = load();
  const preview = input.audience?.kind === 'leads'
    ? previewLeadAudience(input.audience)
    : previewPlatformAudience(input.audience, platformUsers);
  const count = input.audience?.kind === 'leads' ? preview.valid : preview.estimated;
  const existing = input.id ? data.campaigns.find((c) => c.id === input.id) : null;
  let status = existing?.status || 'Draft';
  let sentAt = existing?.sentAt || '';
  let scheduledAt = input.scheduledAt || existing?.scheduledAt || '';
  let analytics = existing?.analytics || null;
  if (mode === 'draft') status = 'Draft';
  if (mode === 'schedule') {
    status = 'Scheduled';
    scheduledAt = input.scheduledAt;
  }
  if (mode === 'send') {
    status = 'Sent';
    sentAt = new Date().toISOString().slice(0, 10);
    scheduledAt = '';
    analytics = {
      tracked: true,
      delivered: Number(delivery?.sent || 0),
      opened: null,
      clicked: null,
      bounced: Number(delivery?.failed || 0),
      unsubscribed: 0,
      activity: delivery?.activity || [],
    };
  }
  const row = {
    id: input.id || uid('cmp'),
    name: input.content?.name || input.name || 'Untitled campaign',
    type: input.audience?.kind === 'leads' ? 'Leads & Contacts' : 'Agency Users',
    audienceLabel: audienceSummary(input.audience),
    status,
    recipients: mode === 'send' ? Number(delivery?.sent || 0) + Number(delivery?.failed || 0) : (count || 0),
    openRate: null,
    clickRate: null,
    sentAt,
    scheduledAt,
    audience: input.audience,
    content: input.content,
    analytics,
  };
  if (input.id) data.campaigns = data.campaigns.map((c) => (c.id === input.id ? row : c));
  else data.campaigns.unshift(row);
  save(data);
  return row;
}

export async function deliverAndSaveCampaign(input, platformUsers = null) {
  let users = platformUsers;
  if (input.audience?.kind === 'platform' && !users) {
    const audience = await fetchPlatformAudience();
    users = audience.users;
  }
  const people = audienceRecipients(input.audience, users).map((person) => ({
    name: person.name || `${person.firstName || ''} ${person.lastName || ''}`.trim(),
    email: person.email,
  })).filter((person) => person.email && !/\.example$/i.test(person.email));
  if (!people.length) {
    throw new Error(
      input.audience?.kind === 'platform'
        ? 'No eligible agency users match this audience.'
        : 'These recipients are sample addresses and cannot receive mail. Use a leads list with real emails.',
    );
  }
  const response = await axiosInstance.post(API_ROUTES.AGENCY.EMAIL_MARKETING.SEND, {
    subject: input.content?.subject,
    fromName: input.content?.fromName,
    fromEmail: input.content?.fromEmail || input.content?.replyTo,
    html: campaignHtml(input.content || {}),
    recipients: people,
  });
  return saveCampaign(input, 'send', response.data?.data || {}, users);
}

export function duplicateCampaign(id) {
  const data = load();
  const current = data.campaigns.find((c) => c.id === id);
  if (!current) return null;
  const copy = {
    ...current,
    id: uid('cmp'),
    name: `${current.name} copy`,
    status: 'Draft',
    sentAt: '',
    scheduledAt: '',
    openRate: null,
    clickRate: null,
    analytics: null,
    content: { ...current.content, name: `${current.name} copy` },
  };
  data.campaigns.unshift(copy);
  save(data);
  return copy;
}

export function deleteCampaign(id) {
  const data = load();
  data.campaigns = data.campaigns.filter((c) => c.id !== id);
  save(data);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function importContacts({ rows, listId, duplicateMode }) {
  const data = load();
  let added = 0;
  let updated = 0;
  let skipped = 0;
  rows.forEach((row) => {
    if (!row.eligible) {
      skipped += 1;
      return;
    }
    const email = row.email.toLowerCase();
    const existing = data.contacts.find((c) => c.email.toLowerCase() === email);
    if (existing) {
      if (duplicateMode === 'update') {
        Object.assign(existing, {
          firstName: row.firstName || existing.firstName,
          lastName: row.lastName || existing.lastName,
          phone: row.phone || existing.phone,
          company: row.company || existing.company,
          consentStatus: row.consentStatus,
          leadStatus: row.leadStatus || existing.leadStatus,
          source: row.source || existing.source,
          tags: row.tags?.length ? row.tags : existing.tags,
          listId: listId || existing.listId,
        });
        updated += 1;
      } else skipped += 1;
      return;
    }
    data.contacts.push({
      id: uid('c'),
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone,
      company: row.company,
      consentStatus: row.consentStatus,
      leadStatus: row.leadStatus || 'New',
      source: row.source || 'Import',
      tags: row.tags || [],
      listId: listId || data.lists[0]?.id,
      bounced: false,
    });
    added += 1;
  });
  const list = data.lists.find((l) => l.id === listId);
  if (list) list.updatedAt = new Date().toISOString().slice(0, 10);
  save(data);
  return { added, updated, skipped };
}

export function validateImportRows(rows) {
  const existing = new Set(load().contacts.map((c) => c.email.toLowerCase()));
  return rows.map((row) => {
    const email = String(row.email || '').trim();
    const validEmail = EMAIL_RE.test(email);
    const consent = row.consentStatus || '';
    const duplicate = validEmail && existing.has(email.toLowerCase());
    const missingConsent = !consent || consent === 'Unknown';
    const eligible = validEmail && consent === 'Consented';
    let issue = '';
    if (!validEmail) issue = 'Invalid email';
    else if (missingConsent) issue = 'Missing consent';
    else if (consent !== 'Consented') issue = 'Not consented';
    else if (duplicate) issue = 'Duplicate';
    return { ...row, email, validEmail, duplicate, missingConsent, eligible, issue };
  });
}

export { EMAIL_RE };
