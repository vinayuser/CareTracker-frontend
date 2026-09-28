import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '../../../routes/routes';
import { EmailPreview, StatusPill } from '../../../components/admin/email/EmailMarketingUi';
import { getCampaign } from '../../../services/emailMarketingStore';

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
  const campaign = getCampaign(id);
  if (!campaign) {
    return <p className="text-sm text-gray-500">Campaign not found.</p>;
  }
  const stats = campaign.analytics || { delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, activity: [] };
  const deliveredBase = Math.max(stats.delivered, 1);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to={ROUTES.ADMIN_EMAIL_CAMPAIGNS} className="text-sm font-medium text-primary">Back to campaigns</Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{campaign.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{campaign.type} · {campaign.audienceLabel}</p>
        </div>
        <StatusPill status={campaign.status} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Recipients" value={campaign.recipients} />
        <Metric label="Delivered" value={stats.delivered} />
        <Metric label="Opened" value={`${stats.opened} · ${campaign.openRate == null ? '—' : `${campaign.openRate}%`}`} />
        <Metric label="Clicked" value={`${stats.clicked} · ${campaign.clickRate == null ? '—' : `${campaign.clickRate}%`}`} />
        <Metric label="Bounced" value={stats.bounced} />
        <Metric label="Unsubscribed" value={stats.unsubscribed} />
        <Metric label="Open rate" value={campaign.openRate == null ? '—' : `${Math.round((stats.opened / deliveredBase) * 100)}%`} />
        <Metric label="Click rate" value={campaign.clickRate == null ? '—' : `${campaign.clickRate}%`} />
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
