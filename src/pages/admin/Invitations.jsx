import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Copy, Plus, MoreVertical } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import SendInvitationDrawer from '../../components/admin/SendInvitationDrawer';
import {
  fetchInvitations,
  fetchInvitationStats,
  resendInvitation,
} from '../../redux/slices/invitationSlice';
import { formatInviteDate, getInviteUrl } from '../../utils/invitationStore';

export default function Invitations() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { list: invitations, stats } = useSelector((state) => state.invitations);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const loadInvitations = () => {
    dispatch(fetchInvitations());
    dispatch(fetchInvitationStats());
  };

  useEffect(() => {
    loadInvitations();
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.openSendDrawer) {
      setDrawerOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleResend = async (id) => {
    await dispatch(resendInvitation(id)).unwrap();
  };

  const copyInviteLink = async (invitation) => {
    const url = invitation.inviteUrl || getInviteUrl(invitation.token);
    await navigator.clipboard.writeText(url);
    setCopiedId(invitation.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agencies Invitation</h1>
          <p className="mt-1 text-sm text-gray-500">
            Send and manage agency invitations with subscription plans.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          <Plus size={16} />
          Send Invitation
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Invitations" value={stats.total} />
        <StatCard label="Accepted" value={stats.accepted} colorClass="text-success" />
        <StatCard label="Pending" value={stats.pending} colorClass="text-warning" />
        <StatCard label="Expired" value={stats.expired} colorClass="text-danger" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Invitations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3">Agency Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Invited On</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Expires On</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No invitations yet. Send your first invitation to get started.
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{inv.agencyName}</td>
                    <td className="px-6 py-4 text-gray-600">{inv.email}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{inv.planName}</span>
                      <span className="block text-xs text-gray-500">${inv.planPrice}/mo</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatInviteDate(inv.invitedOn)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatInviteDate(inv.expiresAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {inv.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => copyInviteLink(inv)}
                              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                            >
                              <Copy size={14} />
                              {copiedId === inv.id ? 'Copied!' : 'Copy Link'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResend(inv.id)}
                              className="text-sm font-medium text-gray-500 hover:underline"
                            >
                              Resend
                            </button>
                          </>
                        )}
                        {inv.status === 'Accepted' && (
                          <span className="text-sm text-success">Registered</span>
                        )}
                        <button type="button" className="text-gray-400 hover:text-gray-600">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SendInvitationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={loadInvitations}
      />
    </div>
  );
}
