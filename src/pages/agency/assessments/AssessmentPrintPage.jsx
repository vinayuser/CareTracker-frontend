import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Printer, X } from 'lucide-react';
import { fetchAssessment } from '../../../redux/slices/assessmentsSlice';
import { assessmentToForm } from '../../../utils/assessmentForm';
import { mergePacketForms } from '../../../utils/assessmentPacket';
import {
  fillAssessmentPacketAllPdfs,
  openPdfBytes,
} from '../../../utils/assessmentPacketPdfFill';
import { getAgencyBranding } from '../../../utils/agencyBranding';
import { ROUTES } from '../../../routes/routes';
import { toast } from 'react-toastify';

const DRAFT_KEY = 'caretracker_assessment_print_draft';

/** @deprecated Prefer fillAssessmentPacketPdf — kept for any legacy callers */
export function saveAssessmentPrintDraft(form, agencyName) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form, agencyName }));
}

export default function AssessmentPrintPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isDraft = location.pathname.endsWith('/draft/print');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        let forms = {};
        let label = 'assessment-packet.pdf';
        let assessmentDate = '';

        if (isDraft) {
          const raw = sessionStorage.getItem(DRAFT_KEY);
          if (!raw) throw new Error('No draft assessment to print');
          const parsed = JSON.parse(raw);
          forms = mergePacketForms(parsed.form?.formData?.forms || {});
          assessmentDate = parsed.form?.assessmentDate || '';
        } else {
          if (!id) throw new Error('Missing assessment id');
          const data = await dispatch(fetchAssessment(id)).unwrap();
          const form = assessmentToForm(data);
          forms = mergePacketForms(form.formData?.forms || {});
          assessmentDate = form.assessmentDate || '';
          label = `${data.assessmentCode || 'assessment'}-packet.pdf`;
        }

        const bytes = await fillAssessmentPacketAllPdfs(forms, {
          agencyBranding: getAgencyBranding(authUser),
          assessmentDate,
        });
        if (cancelled) return;
        openPdfBytes(bytes, label);
        // Close helper tab shortly after opening the PDF
        setTimeout(() => {
          try { window.close(); } catch { /* ignore */ }
        }, 800);
      } catch (err) {
        if (cancelled) return;
        const msg = err?.message || 'Could not build assessment PDF';
        setError(msg);
        toast.error(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [authUser?.agencyLogo, authUser?.agencyName, dispatch, id, isDraft, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-sm text-gray-700">
        <p>{error}</p>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold"
          onClick={() => (window.opener ? window.close() : navigate(ROUTES.AGENCY_ASSESSMENTS))}
        >
          <X size={16} /> Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-sm text-gray-600">
      <Printer size={28} className="animate-pulse text-primary" />
      <p>{loading ? 'Filling official PDF templates…' : 'PDF opened in a new tab.'}</p>
    </div>
  );
}
