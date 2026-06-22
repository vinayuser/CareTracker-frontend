import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routes';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

export default function OwnerInformation() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Owner Information</h1>
      <p className="mt-1 text-sm text-gray-500">
        Provide details about the agency owner or primary contact.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate(ROUTES.REGISTRATION_ADDITIONAL_DETAILS);
        }}
        className="mt-8 space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>First Name *</label>
            <input type="text" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input type="text" required className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Title / Position *</label>
          <input type="text" required placeholder="e.g. Owner, Director" className={inputClass} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Email *</label>
            <input type="email" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone *</label>
            <input type="tel" required className={inputClass} />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.REGISTRATION_AGENCY_INFO)}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
