import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import { getInvitePlan, LIMIT_FIELDS, formatLimit } from '../../utils/subscriptionStore';

export default function ReviewSubmit() {
  const navigate = useNavigate();
  const invitePlan = getInvitePlan();

  const sections = [
    {
      title: 'Agency Information',
      route: ROUTES.REGISTRATION_AGENCY_INFO,
      fields: ['Agency Legal Name', 'License Number', 'Agency Type', 'Email Address'],
    },
    {
      title: 'Owner Information',
      route: ROUTES.REGISTRATION_OWNER_INFO,
      fields: ['Owner Name', 'Title', 'Contact Email'],
    },
    {
      title: 'Additional Details',
      route: ROUTES.REGISTRATION_ADDITIONAL_DETAILS,
      fields: ['Number of Employees', 'Services Offered', 'Service Areas'],
    },
    {
      title: 'Account',
      route: ROUTES.REGISTRATION_CREATE_ACCOUNT,
      fields: ['User ID (Email)', 'Password Created'],
    },
  ];

  if (invitePlan) {
    const limitFields = LIMIT_FIELDS.map(({ key, singular }) =>
      formatLimit(invitePlan.limits?.[key], singular)
    );
    sections.push({
      title: 'Subscription Plan',
      route: null,
      fields: [
        `${invitePlan.name} — $${invitePlan.price}/${invitePlan.billingCycle}`,
        ...limitFields,
      ],
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Review &amp; Submit</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review all information before submitting your registration.
      </p>

      <div className="mt-8 space-y-4">
        {sections.map(({ title, route, fields }) => (
          <div key={title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              {route && (
                <button
                  type="button"
                  onClick={() => navigate(route)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
            <ul className="mt-3 space-y-1">
              {fields.map((field) => (
                <li key={field} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={14} className="text-success" />
                  {field}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => navigate(ROUTES.REGISTRATION_CREATE_ACCOUNT)}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => navigate(ROUTES.REGISTRATION_PAYMENT)}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
