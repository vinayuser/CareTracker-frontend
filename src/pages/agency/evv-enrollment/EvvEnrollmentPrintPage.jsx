import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Printer, X } from 'lucide-react';
import EvvEnrollmentPrintLayout from '../../../components/agency/evv-enrollment/EvvEnrollmentPrintLayout';
import { fetchEvvEnrollment, fetchCaregiverEvvEnrollment } from '../../../redux/slices/evvEnrollmentsSlice';
import { evvEnrollmentToForm } from '../../../utils/evvEnrollmentForm';
import { ROUTES } from '../../../routes/routes';
import '../../../components/agency/evv-enrollment/evvEnrollmentPrint.css';

const DRAFT_KEY = 'caretracker_evv_enrollment_print_draft';

export function saveEvvEnrollmentPrintDraft(form) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form }));
}

export default function EvvEnrollmentPrintPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDraft = location.pathname.endsWith('/draft/print');
  const isCaregiver = location.pathname.startsWith('/caregiver/');

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
    const fetcher = isCaregiver ? fetchCaregiverEvvEnrollment(id) : fetchEvvEnrollment(id);
    dispatch(fetcher).unwrap()
      .then((data) => setForm(evvEnrollmentToForm(data)))
      .catch(() => navigate(isCaregiver ? ROUTES.CAREGIVER_EVV_ENROLLMENTS : ROUTES.AGENCY_EVV_ENROLLMENTS))
      .finally(() => setLoading(false));
  }, [dispatch, id, isCaregiver, isDraft, navigate]);

  if (loading) return <div className="ev-screen-wrap flex min-h-screen items-center justify-center text-sm text-gray-500">Preparing print view...</div>;

  if (!form) {
    return (
      <div className="ev-screen-wrap flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-600">
        <p>No EVV enrollment data to print.</p>
        <button type="button" className="ev-btn-close" onClick={() => window.close()}>Close</button>
      </div>
    );
  }

  return (
    <div className="ev-screen-wrap">
      <div className="ev-toolbar no-print">
        <button type="button" className="ev-btn-print" onClick={() => window.print()}>
          <Printer size={18} /> Print EVV Enrollment
        </button>
        <button type="button" className="ev-btn-close" onClick={() => window.close()}>
          <X size={18} /> Close
        </button>
      </div>
      <EvvEnrollmentPrintLayout form={form} />
    </div>
  );
}
