import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routes';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

export default function AdditionalDetails() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Additional Details</h1>
      <p className="mt-1 text-sm text-gray-500">
        Provide supplementary information about your agency operations.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate(ROUTES.REGISTRATION_CREATE_ACCOUNT);
        }}
        className="mt-8 space-y-4"
      >
        <div>
          <label className={labelClass}>Number of Employees</label>
          <select className={inputClass}>
            <option value="">Select range</option>
            <option value="1-10">1–10</option>
            <option value="11-50">11–50</option>
            <option value="51-200">51–200</option>
            <option value="200+">200+</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Services Offered</label>
          <textarea rows={3} placeholder="Describe services offered..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Service Areas (Counties / Regions)</label>
          <input type="text" placeholder="e.g. Los Angeles, Orange County" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Insurance Providers Accepted</label>
          <input type="text" placeholder="Medicare, Medicaid, Private Insurance" className={inputClass} />
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.REGISTRATION_OWNER_INFO)}
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
