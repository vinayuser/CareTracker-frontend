import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ROUTES } from '../routes/routes';
import API_ROUTES from '../api/apiRoutes';
import * as adminStore from './emailMarketingStore';
import * as agencyStore from './agencyEmailMarketingStore';

const MarketingContext = createContext(null);

const adminValue = {
  store: adminStore,
  routes: {
    campaigns: ROUTES.ADMIN_EMAIL_CAMPAIGNS,
    campaignNew: ROUTES.ADMIN_EMAIL_CAMPAIGN_NEW,
    campaignEdit: ROUTES.ADMIN_EMAIL_CAMPAIGN_EDIT,
    campaignDetail: ROUTES.ADMIN_EMAIL_CAMPAIGN_DETAIL,
    templates: ROUTES.ADMIN_EMAIL_TEMPLATES,
    templateNew: ROUTES.ADMIN_EMAIL_TEMPLATE_NEW,
    templateEdit: ROUTES.ADMIN_EMAIL_TEMPLATE_EDIT,
    lists: ROUTES.ADMIN_EMAIL_LISTS,
    import: ROUTES.ADMIN_EMAIL_IMPORT,
    settings: ROUTES.ADMIN_EMAIL_SETTINGS,
  },
  links: [
    { to: ROUTES.ADMIN_EMAIL_CAMPAIGNS, label: 'Email Campaigns' },
    { to: ROUTES.ADMIN_EMAIL_TEMPLATES, label: 'Email Templates' },
    { to: ROUTES.ADMIN_EMAIL_LISTS, label: 'Lists & Segments' },
    { to: ROUTES.ADMIN_EMAIL_IMPORT, label: 'Import Contacts' },
    { to: ROUTES.ADMIN_EMAIL_SETTINGS, label: 'Settings' },
  ],
  labels: {
    userAudienceTitle: 'Platform Users',
    userAudienceText: 'People with a CareTracker login. Example: tell agency owners about a new billing screen. Do not use this for a sales list.',
    userFilter: 'Platform Users',
    userSummaryTitle: 'Platform users',
    deleteHint: 'This deletes the campaign for every admin on the platform.',
  },
  showAgencyFilter: true,
  mailchimpPath: API_ROUTES.ADMIN.EMAIL_MARKETING.MAILCHIMP,
  roles: ['Agency Owner', 'Caregiver', 'Office Staff'],
};

const agencyValue = {
  store: agencyStore,
  routes: {
    campaigns: ROUTES.AGENCY_EMAIL_CAMPAIGNS,
    campaignNew: ROUTES.AGENCY_EMAIL_CAMPAIGN_NEW,
    campaignEdit: ROUTES.AGENCY_EMAIL_CAMPAIGN_EDIT,
    campaignDetail: ROUTES.AGENCY_EMAIL_CAMPAIGN_DETAIL,
    templates: ROUTES.AGENCY_EMAIL_TEMPLATES,
    templateNew: ROUTES.AGENCY_EMAIL_TEMPLATE_NEW,
    templateEdit: ROUTES.AGENCY_EMAIL_TEMPLATE_EDIT,
    lists: ROUTES.AGENCY_EMAIL_LISTS,
    import: ROUTES.AGENCY_EMAIL_IMPORT,
    settings: ROUTES.AGENCY_EMAIL_SETTINGS,
  },
  links: [
    { to: ROUTES.AGENCY_EMAIL_CAMPAIGNS, label: 'Email Campaigns' },
    { to: ROUTES.AGENCY_EMAIL_TEMPLATES, label: 'Email Templates' },
    { to: ROUTES.AGENCY_EMAIL_LISTS, label: 'Lists & Segments' },
    { to: ROUTES.AGENCY_EMAIL_IMPORT, label: 'Import Contacts' },
    { to: ROUTES.AGENCY_EMAIL_SETTINGS, label: 'Settings' },
  ],
  labels: {
    userAudienceTitle: 'Agency Users',
    userAudienceText: 'Staff, caregivers, and clients who belong to this agency only. Other agencies never see this list.',
    userFilter: 'Agency Users',
    userSummaryTitle: 'Agency users',
    deleteHint: 'This deletes the campaign for this agency only.',
  },
  showAgencyFilter: false,
  mailchimpPath: API_ROUTES.AGENCY.EMAIL_MARKETING.MAILCHIMP,
  roles: ['Agency Owner', 'Caregiver', 'Office Staff', 'Client'],
};

export function useMarketing() {
  const value = useContext(MarketingContext);
  if (!value) {
    throw new Error('Marketing pages must be wrapped in a marketing provider');
  }
  return value;
}

export function AdminMarketingProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    adminStore.hydrateAdminMarketing()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || 'Could not load marketing');
        setReady(true);
      });
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(() => adminValue, []);

  if (!ready) {
    return <p className="text-sm text-gray-500">Loading marketing…</p>;
  }
  if (error) {
    return <p className="text-sm text-rose-600">{error}</p>;
  }
  return <MarketingContext.Provider value={value}>{children ?? <Outlet />}</MarketingContext.Provider>;
}

export function AgencyMarketingProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    agencyStore.hydrateAgencyMarketing()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || 'Could not load marketing');
        setReady(true);
      });
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(() => agencyValue, []);

  if (!ready) {
    return <p className="text-sm text-gray-500">Loading marketing…</p>;
  }
  if (error) {
    return <p className="text-sm text-rose-600">{error}</p>;
  }
  return <MarketingContext.Provider value={value}>{children ?? <Outlet />}</MarketingContext.Provider>;
}
