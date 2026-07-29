import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, X } from 'lucide-react';
import CarePlanPrintLayout from '../../../components/agency/care-plans/CarePlanPrintLayout';
import { fetchCarePlanVersion } from '../../../redux/slices/carePlansSlice';
import { carePlanToForm } from '../../../utils/carePlanForm';
import { ROUTES } from '../../../routes/routes';
import '../../../components/agency/care-plans/carePlanPrint.css';

export default function CarePlanVersionPrintPage() {
  const { id, historyId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const [form, setForm] = useState(null);
  const [agencyName, setAgencyName] = useState(authUser?.agencyName ?? '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !historyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    dispatch(fetchCarePlanVersion({ id, historyId })).unwrap()
      .then((data) => {
        setForm(carePlanToForm(data, data.client));
        setAgencyName(authUser?.agencyName ?? '');
      })
      .catch(() => navigate(ROUTES.AGENCY_CARE_PLANS_VERSIONS.replace(':id', id)))
      .finally(() => setLoading(false));
  }, [authUser?.agencyName, dispatch, historyId, id, navigate]);

  if (loading) {
    return <div className="cp-screen-wrap flex min-h-screen items-center justify-center text-sm text-gray-500">Preparing print view...</div>;
  }

  if (!form) {
    return (
      <div className="cp-screen-wrap flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-600">
        <p>No care plan version to print.</p>
        <button type="button" className="cp-btn-close" onClick={() => window.close()}>Close</button>
      </div>
    );
  }

  return (
    <div className="cp-screen-wrap">
      <div className="cp-toolbar no-print">
        <button type="button" className="cp-btn-print" onClick={() => window.print()}>
          <Printer size={18} /> Print Care Plan {form.version ? `(${form.version})` : ''}
        </button>
        <button type="button" className="cp-btn-close" onClick={() => window.close()}>
          <X size={18} /> Close
        </button>
      </div>
      <CarePlanPrintLayout form={form} agencyName={agencyName} />
    </div>
  );
}
