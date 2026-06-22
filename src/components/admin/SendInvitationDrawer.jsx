import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, Copy, Link2 } from 'lucide-react';
import Drawer from '../ui/Drawer';
import PlanSelector from '../ui/PlanSelector';
import { sendInvitation } from '../../redux/slices/invitationSlice';
import { fetchActivePlans } from '../../redux/slices/subscriptionPlanSlice';
import { getInviteUrl } from '../../utils/invitationStore';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

const sectionClass = 'space-y-4 border-b border-gray-100 pb-5';

const emptyForm = {
  agencyName: '',
  email: '',
  message: '',
  subscriptionPlanId: '',
};

export default function SendInvitationDrawer({ open, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { activeList: plans } = useSelector((state) => state.subscriptionPlans);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [sentInvitation, setSentInvitation] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormData(emptyForm);
    setSentInvitation(null);
    setCopied(false);
    dispatch(fetchActivePlans()).then((action) => {
      const data = action.payload;
      if (Array.isArray(data) && data.length > 0) {
        setFormData((prev) => ({ ...prev, subscriptionPlanId: data[0].id }));
      }
    });
  }, [open, dispatch]);

  const selectedPlan = plans.find((p) => p.id === formData.subscriptionPlanId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subscriptionPlanId) return;

    setLoading(true);
    try {
      const invitation = await dispatch(sendInvitation(formData)).unwrap();
      setSentInvitation(invitation);
      onSuccess?.();
    } catch {
      // Error toast handled by axios interceptor
    }
    setLoading(false);
  };

  const inviteUrl = sentInvitation?.inviteUrl || (sentInvitation ? getInviteUrl(sentInvitation.token) : '');

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setSentInvitation(null);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={sentInvitation ? 'Invitation Sent' : 'Send Agency Invitation'}
      width="xl"
      footer={
        sentInvitation ? (
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Done
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="invitation-form"
              disabled={loading || !formData.subscriptionPlanId}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        )
      }
    >
      {sentInvitation ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-4">
            <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-success" />
            <div>
              <p className="font-semibold text-gray-900">Invitation email sent (demo)</p>
              <p className="mt-1 text-sm text-gray-600">
                An invitation has been sent to <strong>{sentInvitation.email}</strong> for{' '}
                <strong>{sentInvitation.agencyName}</strong>.
              </p>
            </div>
          </div>

          <div>
            <label className={labelClass}>Registration Link</label>
            <p className="mb-2 text-xs text-gray-500">
              Share this link with the agency owner to complete sign-up. Expires in 7 days.
            </p>
            <div className="flex gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                <Link2 size={16} className="shrink-0 text-gray-400" />
                <span className="truncate text-sm text-gray-700">{inviteUrl}</span>
              </div>
              <button
                type="button"
                onClick={copyLink}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {selectedPlan && (
            <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Assigned plan: <strong>{selectedPlan.name}</strong> — ${selectedPlan.price}/
              {selectedPlan.billingCycle}
            </div>
          )}
        </div>
      ) : (
        <form id="invitation-form" onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-gray-500">
            Invite an agency and assign a subscription plan they will pay after accepting.
          </p>

          <div className={sectionClass}>
            <p className="text-sm font-semibold text-gray-900">Agency Details</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Agency Name *</label>
                <input
                  type="text"
                  required
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  placeholder="Enter agency name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="agency@example.com"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Personalized Message (Optional)</label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Add a personal message to the invitation..."
                className={inputClass}
              />
            </div>
          </div>

          <div className={sectionClass}>
            <p className="text-sm font-semibold text-gray-900">Select Subscription Plan *</p>
            <p className="text-xs text-gray-500">
              The invited agency will pay for this plan after completing registration.
            </p>
            <PlanSelector
              plans={plans}
              selectedId={formData.subscriptionPlanId}
              onSelect={(id) => setFormData({ ...formData, subscriptionPlanId: id })}
            />
          </div>

          {selectedPlan && (
            <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
              The agency will be charged{' '}
              <strong>
                ${selectedPlan.price}/{selectedPlan.billingCycle}
              </strong>{' '}
              for the <strong>{selectedPlan.name}</strong> plan upon completing registration.
            </div>
          )}

          <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
            After sending, a registration link will be generated. The agency owner can use it to
            complete sign-up within 7 days.
          </p>
        </form>
      )}
    </Drawer>
  );
}
