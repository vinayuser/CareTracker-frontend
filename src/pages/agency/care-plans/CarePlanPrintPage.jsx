import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Printer, X } from 'lucide-react';
import CarePlanPrintLayout from '../../../components/agency/care-plans/CarePlanPrintLayout';
import { fetchCarePlan } from '../../../redux/slices/carePlansSlice';
import { carePlanToForm } from '../../../utils/carePlanForm';
import { ROUTES } from '../../../routes/routes';
import '../../../components/agency/care-plans/carePlanPrint.css';

const DRAFT_KEY = 'caretracker_care_plan_print_draft';

export function saveCarePlanPrintDraft(form, agencyName) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form, agencyName }));
}

export default function CarePlanPrintPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const [form, setForm] = useState(null);
  const [agencyName, setAgencyName] = useState(authUser?.agencyName ?? '');
  const [loading, setLoading] = useState(true);
  const isDraft = location.pathname.endsWith('/draft/print');

  useEffect(() => {
    if (isDraft) {
      try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setForm(parsed.form);
          setAgencyName(parsed.agencyName || authUser?.agencyName || '');
        }
      } catch { /* ignore */ }
      setLoading(false);
      return;
    }
    if (!id) { setLoading(false); return; }
    setLoading(true);
    dispatch(fetchCarePlan(id)).unwrap()
      .then((data) => {
        setForm(carePlanToForm(data, data.client));
        setAgencyName(authUser?.agencyName ?? '');
      })
      .catch(() => navigate(ROUTES.AGENCY_CARE_PLANS))
      .finally(() => setLoading(false));
  }, [authUser?.agencyName, dispatch, id, isDraft, navigate]);

  if (loading) return <div className="cp-screen-wrap flex min-h-screen items-center justify-center text-sm text-gray-500">Preparing print view...</div>;

  if (!form) {
    return (
      <div className="cp-screen-wrap flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-600">
        <p>No care plan data to print.</p>
        <button type="button" className="cp-btn-close" onClick={() => window.close()}>Close</button>
      </div>
    );
  }

  return (
    <div className="cp-screen-wrap">
      <div className="cp-toolbar no-print">
        <button type="button" className="cp-btn-print" onClick={() => window.print()}>
          <Printer size={18} /> Print Care Plan
        </button>
        <button type="button" className="cp-btn-close" onClick={() => window.close()}>
          <X size={18} /> Close
        </button>
      </div>
      <CarePlanPrintLayout form={form} agencyName={agencyName} />
    </div>
  );
}
