import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Printer, X } from 'lucide-react';
import AssessmentPrintLayout from '../../../components/agency/assessments/AssessmentPrintLayout';
import { fetchAssessment } from '../../../redux/slices/assessmentsSlice';
import { assessmentToForm } from '../../../utils/assessmentForm';
import { ROUTES } from '../../../routes/routes';
import '../../../components/agency/assessments/assessmentPrint.css';

const DRAFT_KEY = 'caretracker_assessment_print_draft';

export function saveAssessmentPrintDraft(form, agencyName) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form, agencyName }));
}

export default function AssessmentPrintPage() {
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

    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    dispatch(fetchAssessment(id)).unwrap()
      .then((data) => {
        setForm(assessmentToForm(data));
        setAgencyName(authUser?.agencyName ?? '');
      })
      .catch(() => navigate(ROUTES.AGENCY_ASSESSMENTS))
      .finally(() => setLoading(false));
  }, [authUser?.agencyName, dispatch, id, isDraft, navigate]);

  const handlePrint = () => window.print();

  if (loading) {
    return <div className="ap-screen-wrap flex min-h-screen items-center justify-center text-sm text-gray-500">Preparing print view...</div>;
  }

  if (!form) {
    return (
      <div className="ap-screen-wrap flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-600">
        <p>No assessment data to print.</p>
        <button type="button" className="ap-btn-close" onClick={() => window.close()}>Close</button>
      </div>
    );
  }

  return (
    <div className="ap-screen-wrap">
      <div className="ap-toolbar no-print">
        <button type="button" className="ap-btn-print" onClick={handlePrint}>
          <Printer size={18} /> Print Assessment
        </button>
        <button type="button" className="ap-btn-close" onClick={() => window.close()}>
          <X size={18} /> Close
        </button>
      </div>
      <AssessmentPrintLayout form={form} agencyName={agencyName} />
    </div>
  );
}
