import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Printer, X } from 'lucide-react';
import InsuranceIntakePrintLayout from '../../../components/agency/insurance-intake/InsuranceIntakePrintLayout';
import { fetchInsuranceIntake } from '../../../redux/slices/insuranceIntakesSlice';
import { insuranceIntakeToForm } from '../../../utils/insuranceIntakeForm';
import { ROUTES } from '../../../routes/routes';
import '../../../components/agency/insurance-intake/insuranceIntakePrint.css';

const DRAFT_KEY = 'caretracker_insurance_intake_print_draft';

export function saveInsuranceIntakePrintDraft(form) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form }));
}

export default function InsuranceIntakePrintPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDraft = location.pathname.endsWith('/draft/print');

  useEffect(() => {
    if (isDraft) {
      try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (raw) setForm(JSON.parse(raw).form);
      } catch { /* ignore */ }
      setLoading(false);
      return;
    }
    if (!id) { setLoading(false); return; }
    setLoading(true);
    dispatch(fetchInsuranceIntake(id)).unwrap()
      .then((data) => setForm(insuranceIntakeToForm(data, data.client)))
      .catch(() => navigate(ROUTES.AGENCY_INSURANCE_INTAKE))
      .finally(() => setLoading(false));
  }, [dispatch, id, isDraft, navigate]);

  if (loading) return <div className="ii-screen-wrap flex min-h-screen items-center justify-center text-sm text-gray-500">Preparing print view...</div>;

  if (!form) {
    return (
      <div className="ii-screen-wrap flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-600">
        <p>No insurance intake data to print.</p>
        <button type="button" className="ii-btn-close" onClick={() => window.close()}>Close</button>
      </div>
    );
  }

  return (
    <div className="ii-screen-wrap">
      <div className="ii-toolbar no-print">
        <button type="button" className="ii-btn-print" onClick={() => window.print()}>
          <Printer size={18} /> Print Insurance Intake
        </button>
        <button type="button" className="ii-btn-close" onClick={() => window.close()}>
          <X size={18} /> Close
        </button>
      </div>
      <InsuranceIntakePrintLayout form={form} />
    </div>
  );
}
