import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AlertCircle, Building2, Loader2 } from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import { validateInvitationToken } from '../../redux/slices/invitationSlice';
import { activateInviteSession, validateToken } from '../../utils/invitationStore';
import { updateRegistrationData } from '../../utils/registrationStore';
import { setInvitePlan } from '../../utils/subscriptionStore';

function applyInvite(invitation) {
  activateInviteSession(invitation);
  setInvitePlan(invitation.subscriptionPlanId);
  updateRegistrationData({
    agencyName: invitation.agencyName,
    email: invitation.email,
    userId: invitation.email,
  });
}

export default function RegisterEntry() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('No invitation token found. Please use the link from your invitation email.');
      setLoading(false);
      return;
    }

    const validate = async () => {
      try {
        const result = await dispatch(validateInvitationToken(token)).unwrap();
        applyInvite(result.invitation);
        navigate(ROUTES.REGISTRATION_AGENCY_INFO, { replace: true });
      } catch {
        const result = validateToken(token);
        if (!result.valid) {
          setError(result.error);
          setLoading(false);
          return;
        }
        applyInvite(result.invitation);
        navigate(ROUTES.REGISTRATION_AGENCY_INFO, { replace: true });
      }
    };

    validate();
  }, [dispatch, navigate, searchParams]);

  if (loading && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-bg">
        <div className="text-center">
          <Loader2 size={32} className="mx-auto animate-spin text-primary" />
          <p className="mt-4 text-sm text-gray-600">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page-bg px-6">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={28} className="text-danger" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-gray-900">Invalid Invitation</h1>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.LOGIN)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Building2 size={16} />
          Go to Login
        </button>
      </div>
    </div>
  );
}
