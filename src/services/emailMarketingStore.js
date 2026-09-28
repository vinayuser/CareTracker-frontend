/**
 * Local email-marketing store.
 * Swap these functions for the admin API routes in apiRoutes.ADMIN.EMAIL_MARKETING
 * when the backend is ready. Platform users and leads are never combined.
 */

const KEY = 'caretracker.emailMarketing.v1';

const AGENCIES = ['Sunrise Home Care', 'BrightCare Services', 'HealthOne Agency', 'CarePlus Solutions'];

const PLATFORM_USERS = [
  { id: 'pu1', name: 'Ava Collins', email: 'ava@sunrisehomecare.example', role: 'Agency Owner', agency: 'Sunrise Home Care', status: 'Active', optedOut: false },
  { id: 'pu2', name: 'Noah Bennett', email: 'noah@sunrisehomecare.example', role: 'Office Staff', agency: 'Sunrise Home Care', status: 'Active', optedOut: false },
  { id: 'pu3', name: 'Maria Lopez', email: 'maria.lopez@sunrisehomecare.example', role: 'Caregiver', agency: 'Sunrise Home Care', status: 'Active', optedOut: false },
  { id: 'pu4', name: 'James Carter', email: 'james.carter@brightcare.example', role: 'Caregiver', agency: 'BrightCare Services', status: 'Active', optedOut: false },
  { id: 'pu5', name: 'Aisha Khan', email: 'aisha@healthone.example', role: 'Caregiver', agency: 'HealthOne Agency', status: 'Inactive', optedOut: false },
  { id: 'pu6', name: 'Robert Smith', email: 'robert@careplus.example', role: 'Agency Owner', agency: 'CarePlus Solutions', status: 'Active', optedOut: true },
  { id: 'pu7', name: 'Linda Garcia', email: 'linda@sunrisehomecare.example', role: 'Office Staff', agency: 'Sunrise Home Care', status: 'Invited', optedOut: false },
  { id: 'pu8', name: 'David Wilson', email: 'david@brightcare.example', role: 'Caregiver', agency: 'BrightCare Services', status: 'Active', optedOut: false },
  { id: 'pu9', name: 'Patricia Davis', email: 'patricia@healthone.example', role: 'Office Staff', agency: 'HealthOne Agency', status: 'Active', optedOut: false },
  { id: 'pu10', name: 'Thomas Moore', email: 'thomas@careplus.example', role: 'Caregiver', agency: 'CarePlus Solutions', status: 'Inactive', optedOut: true },
  { id: 'pu11', name: 'Barbara Wilson', email: 'barbara@brightcare.example', role: 'Agency Owner', agency: 'BrightCare Services', status: 'Active', optedOut: false },
  { id: 'pu12', name: 'Kevin Lee', email: 'kevin@healthone.example', role: 'Caregiver', agency: 'HealthOne Agency', status: 'Invited', optedOut: false },
];

function seed() {
  const now = '2026-04-12';
  return {
    settings: {
      fromName: 'CareTracker',
      fromEmail: 'hello@caretraker.com',
      replyTo: 'support@caretraker.com',
      domain: 'caretraker.com',
      domainStatus: 'Pending',
      unsubscribeUrl: 'https://caretraker.com/email/unsubscribe',
      preferencesUrl: 'https://caretraker.com/email/preferences',
      footer: 'CareTracker helps agencies coordinate care. This message is a product or marketing update, not a clinical record.',
      suppression: ['bounce@example.com', 'left@example.com'],
    },
    lists: [
      { id: 'list-website', name: 'Website inquiries', updatedAt: '2026-04-18' },
      { id: 'list-events', name: 'Conference contacts', updatedAt: '2026-03-02' },
      { id: 'list-partners', name: 'Referral partners', updatedAt: '2026-04-01' },
    ],
    tags: ['Website', 'Referral', 'Demo', 'Newsletter'],
    segments: [
      {
        id: 'seg-qualified',
        name: 'Qualified website leads',
        updatedAt: '2026-04-18',
        rules: [
          { field: 'leadStatus', value: 'Qualified' },
          { field: 'consentStatus', value: 'Consented' },
          { field: 'source', value: 'Website' },
        ],
      },
    ],
    contacts: [
      { id: 'c1', firstName: 'Helen', lastName: 'Brooks', email: 'helen.brooks@northside.example', phone: '555-0142', company: 'Northside Family', consentStatus: 'Consented', leadStatus: 'Qualified', source: 'Website', tags: ['Website', 'Demo'], listId: 'list-website' },
      { id: 'c2', firstName: 'Omar', lastName: 'Haddad', email: 'omar@lakeside.example', phone: '555-0177', company: 'Lakeside Care', consentStatus: 'Consented', leadStatus: 'Qualified', source: 'Website', tags: ['Website'], listId: 'list-website' },
      { id: 'c3', firstName: 'Priya', lastName: 'Shah', email: 'priya.shah@harbor.example', phone: '555-0190', company: 'Harbor Home', consentStatus: 'Consented', leadStatus: 'New', source: 'Website', tags: ['Newsletter'], listId: 'list-website' },
      { id: 'c4', firstName: 'Chris', lastName: 'Nguyen', email: 'chris@maple.example', phone: '555-0114', company: 'Maple Partners', consentStatus: 'Unsubscribed', leadStatus: 'Qualified', source: 'Referral', tags: ['Referral'], listId: 'list-partners' },
      { id: 'c5', firstName: 'Dana', lastName: 'Cole', email: 'dana.cole@event.example', phone: '555-0166', company: 'Cole Consulting', consentStatus: 'Consented', leadStatus: 'Nurture', source: 'Event', tags: ['Demo'], listId: 'list-events' },
      { id: 'c6', firstName: 'Evan', lastName: 'Price', email: 'evan.price@bad.example', phone: '555-0101', company: 'Price Group', consentStatus: 'Consented', leadStatus: 'Qualified', source: 'Website', tags: ['Website'], listId: 'list-website', bounced: true },
      { id: 'c7', firstName: 'Gina', lastName: 'Walsh', email: 'gina@oak.example', phone: '555-0188', company: 'Oak Street', consentStatus: 'Consented', leadStatus: 'Qualified', source: 'Referral', tags: ['Referral'], listId: 'list-partners' },
      { id: 'c8', firstName: 'Ian', lastName: 'Foster', email: 'ian.foster@pine.example', phone: '', company: 'Pine Health', consentStatus: 'Unknown', leadStatus: 'New', source: 'Website', tags: ['Website'], listId: 'list-website' },
    ],
    templates: [
      {
        id: 'tpl-welcome',
        name: 'Product update',
        category: 'Product',
        subject: 'What is new in CareTracker',
        status: 'Published',
        updatedAt: now,
        blocks: [
          { id: 'b1', type: 'heading', text: 'A simpler week for your agency' },
          { id: 'b2', type: 'text', text: 'Scheduling, billing, and caregiver updates in one place. This note is about the product, not a client record.' },
          { id: 'b3', type: 'button', text: 'Open CareTracker', url: 'https://caretraker.com' },
        ],
      },
      {
        id: 'tpl-lead',
        name: 'Intro for new leads',
        category: 'Leads',
        subject: 'See how agencies run visits in CareTracker',
        status: 'Published',
        updatedAt: '2026-03-20',
        blocks: [
          { id: 'b4', type: 'heading', text: 'Thanks for your interest' },
          { id: 'b5', type: 'text', text: 'CareTracker is home-care software for scheduling, EVV, and billing. Reply if you would like a walkthrough.' },
          { id: 'b6', type: 'cta', text: 'Book a demo', url: 'https://caretraker.com' },
        ],
      },
      {
        id: 'tpl-draft',
        name: 'April newsletter draft',
        category: 'Newsletter',
        subject: 'April notes from CareTracker',
        status: 'Draft',
        updatedAt: '2026-04-02',
        blocks: [
          { id: 'b7', type: 'heading', text: 'April notes' },
          { id: 'b8', type: 'text', text: 'Draft copy for consented contacts.' },
          { id: 'b9', type: 'divider' },
        ],
      },
    ],
    campaigns: [
      {
        id: 'cmp-1',
        name: 'April product update',
        type: 'Platform Users',
        audienceLabel: 'Agency owners · Active',
        status: 'Sent',
        recipients: 4,
        openRate: 50,
        clickRate: 25,
        sentAt: '2026-04-08',
        scheduledAt: '',
        audience: {
          kind: 'platform',
          roles: ['Agency Owner'],
          agency: 'All',
          statuses: ['Active'],
          respectPreferences: true,
        },
        content: {
          name: 'April product update',
          subject: 'What is new in CareTracker',
          previewText: 'Scheduling and billing updates',
          fromName: 'CareTracker',
          fromEmail: 'hello@caretraker.com',
          replyTo: 'support@caretraker.com',
          templateId: 'tpl-welcome',
        },
        analytics: {
          delivered: 4,
          opened: 2,
          clicked: 1,
          bounced: 0,
          unsubscribed: 0,
          activity: [
            { name: 'Ava Collins', email: 'ava@sunrisehomecare.example', status: 'Clicked', at: 'Apr 8, 2026' },
            { name: 'Barbara Wilson', email: 'barbara@brightcare.example', status: 'Opened', at: 'Apr 8, 2026' },
            { name: 'Robert Smith', email: 'robert@careplus.example', status: 'Excluded', at: 'Apr 8, 2026' },
          ],
        },
      },
      {
        id: 'cmp-2',
        name: 'Qualified lead intro',
        type: 'Leads & Contacts',
        audienceLabel: 'Qualified website leads',
        status: 'Draft',
        recipients: 2,
        openRate: null,
        clickRate: null,
        sentAt: '',
        scheduledAt: '',
        audience: {
          kind: 'leads',
          listId: 'list-website',
          segmentId: 'seg-qualified',
          tags: [],
          leadStatus: 'Qualified',
        },
        content: {
          name: 'Qualified lead intro',
          subject: 'See how agencies run visits in CareTracker',
          previewText: 'A short introduction',
          fromName: 'CareTracker',
          fromEmail: 'hello@caretraker.com',
          replyTo: 'support@caretraker.com',
          templateId: 'tpl-lead',
        },
        analytics: null,
      },
      {
        id: 'cmp-3',
        name: 'Caregiver app reminder',
        type: 'Platform Users',
        audienceLabel: 'Caregivers · Active',
        status: 'Scheduled',
        recipients: 3,
        openRate: null,
        clickRate: null,
        sentAt: '',
        scheduledAt: '2026-05-02',
        audience: {
          kind: 'platform',
          roles: ['Caregiver'],
          agency: 'All',
          statuses: ['Active'],
          respectPreferences: true,
        },
        content: {
          name: 'Caregiver app reminder',
          subject: 'Your CareTracker visit tools',
          previewText: 'Clock-in, schedule, and messages',
          fromName: 'CareTracker',
          fromEmail: 'hello@caretraker.com',
          replyTo: 'support@caretraker.com',
          templateId: 'tpl-welcome',
        },
        analytics: null,
      },
    ],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* use seed */
  }
  const data = seed();
  localStorage.setItem(KEY, JSON.stringify(data));
  return data;
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  return data;
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listAgencies() {
  return AGENCIES;
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

export function previewPlatformAudience(audience = {}) {
  const settings = getSettings();
  const roles = audience.roles?.length ? audience.roles : [];
  const statuses = audience.statuses?.length ? audience.statuses : [];
  let pool = PLATFORM_USERS.filter((user) => {
    if (roles.length && !roles.includes(user.role)) return false;
    if (audience.agency && audience.agency !== 'All' && user.agency !== audience.agency) return false;
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
  const agency = audience?.agency && audience.agency !== 'All' ? audience.agency : 'All agencies';
  return `${roles} · ${agency}`;
}

function buildAnalytics(people) {
  const delivered = people.length;
  const bounced = Math.min(people.length, Math.round(delivered * 0.05));
  const deliveredOk = delivered - bounced;
  const unsubscribed = Math.min(deliveredOk, Math.round(deliveredOk * 0.04));
  const opened = Math.round(deliveredOk * 0.48);
  const clicked = Math.round(opened * 0.3);
  const activity = people.slice(0, 8).map((person, index) => {
    let status = 'Delivered';
    if (index < bounced) status = 'Bounced';
    else if (index < bounced + unsubscribed) status = 'Unsubscribed';
    else if (index < bounced + unsubscribed + clicked) status = 'Clicked';
    else if (index % 2 === 0) status = 'Opened';
    return {
      name: person.name || `${person.firstName || ''} ${person.lastName || ''}`.trim(),
      email: person.email,
      status,
      at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  });
  return {
    delivered: deliveredOk,
    opened,
    clicked,
    bounced,
    unsubscribed,
    activity,
  };
}

export function saveCampaign(input, mode = 'draft') {
  const data = load();
  const preview = input.audience?.kind === 'leads'
    ? previewLeadAudience(input.audience)
    : previewPlatformAudience(input.audience);
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
    analytics = buildAnalytics(input.audience?.kind === 'leads' ? preview.recipients : preview.recipients);
  }
  const row = {
    id: input.id || uid('cmp'),
    name: input.content?.name || input.name || 'Untitled campaign',
    type: input.audience?.kind === 'leads' ? 'Leads & Contacts' : 'Platform Users',
    audienceLabel: audienceSummary(input.audience),
    status,
    recipients: count || 0,
    openRate: analytics ? Math.round((analytics.opened / Math.max(1, analytics.delivered)) * 100) : null,
    clickRate: analytics ? Math.round((analytics.clicked / Math.max(1, analytics.opened || 1)) * 100) : null,
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
