import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';
import { MarketingTabs, PageHeader, StatusPill, fieldClass, labelClass } from '../../../components/admin/email/EmailMarketingUi';
import { getSettings, saveSettings } from '../../../services/emailMarketingStore';

export default function MarketingSettings() {
  const [form, setForm] = useState(getSettings());
  const [suppressionText, setSuppressionText] = useState((form.suppression || []).join('\n'));
  const [mailchimp, setMailchimp] = useState({ connected: false, health: 'Not checked' });

  useEffect(() => {
    let cancelled = false;
    axiosInstance.get(API_ROUTES.ADMIN.EMAIL_MARKETING.MAILCHIMP)
      .then((response) => {
        if (!cancelled) setMailchimp(response.data?.data || { connected: true, health: 'Connected' });
      })
      .catch((error) => {
        const health = error?.response?.data?.message || 'Not connected';
        if (!cancelled) setMailchimp({ connected: false, health });
      });
    return () => { cancelled = true; };
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="space-y-5">
      <PageHeader title="Marketing Settings" description="Defaults used when you create a campaign. New campaigns can still change the from address on the content step." />
      <MarketingTabs />
      <form
        className="grid gap-4 lg:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          saveSettings({
            ...form,
            suppression: suppressionText.split('\n').map((line) => line.trim()).filter(Boolean),
          });
          toast.success('Marketing settings saved');
        }}
      >
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <label className="block"><span className={labelClass}>From name</span><input className={fieldClass} value={form.fromName} onChange={set('fromName')} /></label>
          <label className="block"><span className={labelClass}>From email</span><input className={fieldClass} value={form.fromEmail} onChange={set('fromEmail')} /></label>
          <label className="block"><span className={labelClass}>Reply-to</span><input className={fieldClass} value={form.replyTo} onChange={set('replyTo')} /></label>
          <label className="block"><span className={labelClass}>Sending domain</span><input className={fieldClass} value={form.domain} onChange={set('domain')} /></label>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <span className="text-sm text-gray-600">Domain verification</span>
            <StatusPill status={form.domainStatus} />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <span className="text-sm text-gray-600">Mailchimp {mailchimp.server ? `(${mailchimp.server})` : ''}</span>
            <StatusPill status={mailchimp.connected ? 'Verified' : 'Pending'} />
          </div>
          {mailchimp.health ? <p className="text-xs text-gray-500">{mailchimp.health}</p> : null}
          <button type="button" className="text-sm font-semibold text-primary" onClick={() => { setForm({ ...form, domainStatus: 'Pending' }); toast.info('Verification stays pending until a mail provider is connected.'); }}>
            Recheck DNS
          </button>
        </div>
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <label className="block"><span className={labelClass}>Unsubscribe URL</span><input className={fieldClass} value={form.unsubscribeUrl} onChange={set('unsubscribeUrl')} /></label>
          <label className="block"><span className={labelClass}>Manage preferences URL</span><input className={fieldClass} value={form.preferencesUrl} onChange={set('preferencesUrl')} /></label>
          <label className="block"><span className={labelClass}>Default email footer</span><textarea className={fieldClass} rows={4} value={form.footer} onChange={set('footer')} /></label>
          <label className="block"><span className={labelClass}>Suppression list</span><textarea className={fieldClass} rows={4} value={suppressionText} onChange={(e) => setSuppressionText(e.target.value)} placeholder="One email per line" /></label>
          <button type="submit" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Save settings</button>
        </div>
      </form>
    </div>
  );
}
