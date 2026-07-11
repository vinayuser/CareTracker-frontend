import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Printer, X } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';
import CandidateFormPrintLayout from '../../../components/agency/hiring/CandidateFormPrintLayout';
import { ROUTES } from '../../../routes/routes';
import '../../../components/agency/hiring/candidateFormPrint.css';

export default function CandidateFormPrintPage() {
  const { applicationId, submissionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicationId || !submissionId) return;
    setLoading(true);
    axiosInstance
      .get(`${API_ROUTES.AGENCY.JOB_APPLICATIONS.FORM_PRINT}/${applicationId}/form-submissions/${submissionId}/print`)
      .then((res) => setData(res.data.data))
      .catch(() => navigate(ROUTES.AGENCY_CANDIDATES))
      .finally(() => setLoading(false));
  }, [applicationId, submissionId, navigate]);

  if (loading) {
    return (
      <div className="cf-screen-wrap flex min-h-screen items-center justify-center text-sm text-gray-500">
        Preparing print view...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="cf-screen-wrap flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-600">
        <p>No form data to print.</p>
        <button type="button" className="cf-btn-close" onClick={() => window.close()}>Close</button>
      </div>
    );
  }

  if (data.pdf_url) {
    return (
      <div className="cf-screen-wrap">
        <div className="cf-toolbar no-print">
          <a href={data.pdf_url} download className="cf-btn-close">
            <Download size={18} />
            Download PDF
          </a>
          <button type="button" className="cf-btn-print" onClick={() => {
            const w = window.open(data.pdf_url, '_blank');
            w?.addEventListener('load', () => w.print());
          }}
          >
            <Printer size={18} />
            Print
          </button>
          <button type="button" className="cf-btn-close" onClick={() => window.close()}>
            <X size={18} />
            Close
          </button>
        </div>
        <iframe
          title="Filled form PDF"
          src={data.pdf_url}
          className="h-[calc(100vh-64px)] w-full border-0 bg-white"
        />
      </div>
    );
  }

  return (
    <div className="cf-screen-wrap">
      <div className="cf-toolbar no-print">
        <button type="button" className="cf-btn-print" onClick={() => window.print()}>
          <Printer size={18} />
          Print / Save as PDF
        </button>
        <button type="button" className="cf-btn-close" onClick={() => window.close()}>
          <X size={18} />
          Close
        </button>
      </div>
      <CandidateFormPrintLayout data={data} />
    </div>
  );
}
