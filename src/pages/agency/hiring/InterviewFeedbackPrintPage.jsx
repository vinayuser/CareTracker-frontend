import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, X } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';
import InterviewFeedbackPrintLayout from '../../../components/agency/hiring/InterviewFeedbackPrintLayout';
import { ROUTES } from '../../../routes/routes';
import '../../../components/agency/hiring/interviewFeedbackPrint.css';

export default function InterviewFeedbackPrintPage() {
  const { applicationId, stageId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicationId || !stageId) return;
    setLoading(true);
    axiosInstance
      .get(
        `${API_ROUTES.AGENCY.JOB_APPLICATIONS.INTERVIEW_FEEDBACK}/${applicationId}/interview-feedback/${stageId}/print`,
      )
      .then((res) => setData(res.data.data))
      .catch(() => navigate(ROUTES.AGENCY_JOBS))
      .finally(() => setLoading(false));
  }, [applicationId, stageId, navigate]);

  if (loading) {
    return (
      <div className="if-screen-wrap flex min-h-screen items-center justify-center text-sm text-gray-500">
        Preparing print view...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="if-screen-wrap flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-600">
        <p>No interview feedback to print.</p>
        <button type="button" className="if-btn-close" onClick={() => window.close()}>Close</button>
      </div>
    );
  }

  return (
    <div className="if-screen-wrap">
      <div className="if-toolbar no-print">
        <button type="button" className="if-btn-print" onClick={() => window.print()}>
          <Printer size={18} />
          Print / Save as PDF
        </button>
        <button type="button" className="if-btn-close" onClick={() => window.close()}>
          <X size={18} />
          Close
        </button>
      </div>
      <InterviewFeedbackPrintLayout data={data} />
    </div>
  );
}
