import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ROUTES } from '../../../routes/routes';
import { EmailPreview, StatusPill } from '../../../components/admin/email/EmailMarketingUi';
import { deliverAndSaveCampaign, getCampaign } from '../../../services/emailMarketingStore';

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[12px] text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function CampaignDetail() {
  const { id } = useParams();
  const [version, setVersion] = useState(0);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const campaign = getCampaign(id);
  void version;
  if (!campaign) {
    return <p className="text-sm text-gray-500">Campaign not found.</p>;
  }
  const real = campaign.analytics?.tracked === true;
  const stats = real
    ? campaign.analytics
    : { delivered: '—', opened: null, clicked: null, bounced: '—', unsubscribed: '—', activity: [] };
  const sendNow = async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    try {
      await deliverAndSaveCampaign(campaign);
      toast.success('Campaign emails sent');
      setVersion((n) => n + 1);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Could not send the campaign');
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to={ROUTES.ADMIN_EMAIL_CAMPAIGNS} className="text-sm font-medium text-primary">Back to campaigns</Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{campaign.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{campaign.type} · {campaign.audienceLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" disabled={sending} onClick={sendNow} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {sending ? 'Sending…' : 'Send emails'}
          </button>
          <StatusPill status={campaign.status} />
        </div>
      </div>
      {!real ? <p className="text-sm text-amber-700">This page was showing sample figures. Send emails to deliver this campaign and replace them with the real result.</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Recipients" value={campaign.recipients} />
        <Metric label="Delivered" value={stats.delivered} />
        <Metric label="Opened" value="—" />
        <Metric label="Clicked" value="—" />
        <Metric label="Failed" value={stats.bounced} />
        <Metric label="Unsubscribed" value={real ? stats.unsubscribed : '—'} />
        <Metric label="Open rate" value="—" />
        <Metric label="Click rate" value="—" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">Recipient activity</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(stats.activity || []).length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Activity appears after the campaign is sent.</td></tr>
                ) : stats.activity.map((row) => (
                  <tr key={`${row.email}-${row.status}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600">{row.email}</td>
                    <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                    <td className="px-4 py-3 text-gray-600">{row.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <EmailPreview
          blocks={campaign.content?.blocks?.length ? campaign.content.blocks : undefined}
          backgroundColor={campaign.content?.backgroundColor}
          templateId={campaign.content?.templateId}
          subject={campaign.content?.subject}
          previewText={campaign.content?.previewText}
        />
      </div>
    </div>
  );
}
