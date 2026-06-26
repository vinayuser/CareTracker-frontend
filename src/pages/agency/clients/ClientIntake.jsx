import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react';
import ClientIntakeStepper from '../../../components/agency/clients/ClientIntakeStepper';
import { ClientIntakeStepOne, ClientIntakeStepTwo } from '../../../components/agency/clients/ClientIntakeSteps';
import { addClient, fetchClient, updateClient } from '../../../redux/slices/clientsSlice';
import { EMPTY_CLIENT_FORM, clientToForm } from '../../../utils/clientForm';
import { ROUTES } from '../../../routes/routes';

function validateStepOne(form) {
  const errors = {};
  if (!form.firstName?.trim()) errors.firstName = 'First name is required';
  if (!form.lastName?.trim()) errors.lastName = 'Last name is required';
  return errors;
}

export default function ClientIntake() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_CLIENT_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      setForm({ ...EMPTY_CLIENT_FORM });
      setStep(1);
      setLoading(false);
      return;
    }

    setLoading(true);
    dispatch(fetchClient(id))
      .unwrap()
      .then((client) => {
        setForm(clientToForm(client));
        setStep(1);
      })
      .catch(() => navigate(ROUTES.AGENCY_CLIENTS))
      .finally(() => setLoading(false));
  }, [dispatch, id, isEdit, navigate]);

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleNext = () => {
    const stepErrors = validateStepOne(form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await dispatch(updateClient({ id, payload: form })).unwrap();
      } else {
        await dispatch(addClient(form)).unwrap();
      }
      navigate(ROUTES.AGENCY_CLIENTS);
    } catch {
      // toast in slice
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-gray-500">Loading intake form...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to={ROUTES.AGENCY_CLIENTS}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to Clients
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit Client Intake' : 'New Client Intake'}
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {isEdit ? 'Update client profile and intake details' : 'Register a new client with the full intake form'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <ClientIntakeStepper currentStep={step} />

        {step === 1 ? (
          <ClientIntakeStepOne form={form} onChange={onChange} errors={errors} />
        ) : (
          <ClientIntakeStepTwo form={form} onChange={onChange} />
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Back
              </button>
            ) : (
              <Link
                to={ROUTES.AGENCY_CLIENTS}
                className="inline-block rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancel
              </Link>
            )}
          </div>
          <div>
            {step < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
              >
                Next: Care & Authorization
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover disabled:opacity-50"
              >
                {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Submit Intake'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
