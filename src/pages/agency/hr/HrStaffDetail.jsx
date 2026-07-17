import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Shield, User, Settings, Pencil, KeyRound } from 'lucide-react';
import HrStatusBadge from '../../../components/agency/hr/HrStatusBadge';
import EditHrModuleAccessDrawer from '../../../components/agency/hr/EditHrModuleAccessDrawer';
import EditHrStaffDrawer from '../../../components/agency/hr/EditHrStaffDrawer';
import SetHrPasswordDrawer from '../../../components/agency/hr/SetHrPasswordDrawer';
import SendHrEmailDrawer from '../../../components/agency/hr/SendHrEmailDrawer';
import { ModuleAccessList } from '../../../components/agency/hr/ModulePermissionsFields';
import {
  clearSelectedHrStaff,
  fetchHrStaffMember,
  fetchHrStaffStats,
  setHrStaffStatus,
} from '../../../redux/slices/hrStaffSlice';
import { formatHrDate } from '../../../utils/hrStaffStore';
import { getUserRole } from '../../../utils/auth';
import { ROLES } from '../../../constants/roles';
import { ROUTES } from '../../../routes/routes';

function DetailSection({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-gray-50 py-2.5 last:border-0 sm:grid-cols-3">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 sm:col-span-2">{value || '—'}</dd>
    </div>
  );
}

export default function HrStaffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const member = useSelector((state) => state.hrStaff.selected);
  const isAgencyOwner = getUserRole() === ROLES.AGENCY_OWNER;
  const [moduleDrawerOpen, setModuleDrawerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const reloadMember = () => {
    dispatch(fetchHrStaffMember(id));
    dispatch(fetchHrStaffStats());
  };

  useEffect(() => {
    dispatch(fetchHrStaffMember(id));
    return () => {
      dispatch(clearSelectedHrStaff());
    };
  }, [dispatch, id]);

  if (!member) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
        Loading HR profile...
      </div>
    );
  }

  const handleStatusChange = async (status) => {
    await dispatch(setHrStaffStatus({ id: member.id, status })).unwrap();
    dispatch(fetchHrStaffStats());
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            to={ROUTES.AGENCY_HR_STAFF}
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                {member.firstName} {member.lastName}
              </h1>
              <HrStatusBadge status={member.status} />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {member.jobTitle} · {member.department}
            </p>
          </div>
        </div>

        {isAgencyOwner && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <KeyRound size={14} />
              Password
            </button>
            <button
              type="button"
              onClick={() => setEmailOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Mail size={14} />
              Email
            </button>
            {member.status !== 'Active' && (
              <button
                type="button"
                onClick={() => handleStatusChange('Active')}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
              >
                Activate Account
              </button>
            )}
            {member.status !== 'Inactive' && (
              <button
                type="button"
                onClick={() => handleStatusChange('Inactive')}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Deactivate
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {member.firstName[0]}
              {member.lastName[0]}
            </div>
            <p className="mt-3 text-lg font-semibold text-gray-900">
              {member.firstName} {member.lastName}
            </p>
            <p className="text-sm text-gray-500">{member.jobTitle}</p>
            <div className="mt-4 w-full space-y-2 text-left text-sm">
              <p className="flex items-center gap-2 text-gray-600">
                <Mail size={15} className="text-gray-400" />
                {member.email}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <Phone size={15} className="text-gray-400" />
                {member.phone}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <Briefcase size={15} className="text-gray-400" />
                {member.employeeId}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <User size={15} className="text-gray-400" />
                Login: {member.userId}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <DetailSection title="Personal Information">
            <dl>
              <DetailRow label="Full Name" value={`${member.firstName} ${member.lastName}`} />
              <DetailRow label="Email" value={member.email} />
              <DetailRow label="Phone" value={member.phone} />
              <DetailRow label="Date of Birth" value={formatHrDate(member.dateOfBirth)} />
              <DetailRow label="Gender" value={member.gender} />
            </dl>
          </DetailSection>

          <DetailSection title="Employment Details">
            <dl>
              <DetailRow label="Employee ID" value={member.employeeId} />
              <DetailRow label="Job Title" value={member.jobTitle} />
              <DetailRow label="Department" value={member.department} />
              <DetailRow label="Hire Date" value={formatHrDate(member.hireDate)} />
              <DetailRow label="Employment Type" value={member.employmentType} />
              <DetailRow label="Work Location" value={member.workLocation} />
              <DetailRow label="Reports To" value={member.reportsTo} />
            </dl>
          </DetailSection>

          <DetailSection title="Address">
            <dl>
              <DetailRow
                label="Full Address"
                value={
                  member.streetAddress
                    ? `${member.streetAddress}, ${member.city}, ${member.state} ${member.zipCode}, ${member.country}`
                    : null
                }
              />
            </dl>
            <p className="mt-1 flex items-center gap-2 text-xs text-gray-400">
              <MapPin size={14} />
              Primary residence on file
            </p>
          </DetailSection>

          <DetailSection title="Emergency Contact">
            <dl>
              <DetailRow label="Name" value={member.emergencyContactName} />
              <DetailRow label="Relationship" value={member.emergencyContactRelationship} />
              <DetailRow label="Phone" value={member.emergencyContactPhone} />
              <DetailRow label="Email" value={member.emergencyContactEmail} />
            </dl>
          </DetailSection>

          <DetailSection title="Professional Details">
            <dl>
              <DetailRow label="Education" value={member.educationLevel} />
              <DetailRow label="Years of Experience" value={member.yearsOfExperience} />
              <DetailRow label="Certifications" value={member.certifications} />
              <DetailRow label="Specializations" value={member.specializations} />
            </dl>
          </DetailSection>

          <DetailSection title="Module Access">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <p className="text-sm text-gray-500">
                Portal modules this HR user can view and access.
              </p>
              {isAgencyOwner && (
                <button
                  type="button"
                  onClick={() => setModuleDrawerOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={14} />
                  Edit Access
                </button>
              )}
            </div>
            <ModuleAccessList moduleAccess={member.moduleAccess} />
            <p className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <Shield size={14} />
              Administration modules remain available only to the agency owner.
            </p>
          </DetailSection>

          <DetailSection title="Account Access">
            <dl>
              <DetailRow label="User ID" value={member.userId} />
              <DetailRow label="Role" value="HR Manager" />
              <DetailRow label="Account Status" value={member.status} />
              <DetailRow label="Created On" value={formatHrDate(member.createdAt)} />
              <DetailRow label="Last Updated" value={formatHrDate(member.updatedAt)} />
            </dl>
            <p className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <Shield size={14} />
              Login credentials and account status for the agency portal.
            </p>
          </DetailSection>

          {member.notes && (
            <DetailSection title="Internal Notes">
              <p className="text-sm text-gray-700">{member.notes}</p>
            </DetailSection>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate(ROUTES.AGENCY_HR_STAFF)}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to HR Staff
        </button>
      </div>

      {isAgencyOwner && (
        <>
          <EditHrModuleAccessDrawer
            open={moduleDrawerOpen}
            onClose={() => setModuleDrawerOpen(false)}
            member={member}
            onSuccess={reloadMember}
          />
          <EditHrStaffDrawer
            open={editOpen}
            onClose={() => setEditOpen(false)}
            member={member}
            onSuccess={reloadMember}
          />
          <SetHrPasswordDrawer
            open={passwordOpen}
            onClose={() => setPasswordOpen(false)}
            member={member}
          />
          <SendHrEmailDrawer
            open={emailOpen}
            onClose={() => setEmailOpen(false)}
            member={member}
          />
        </>
      )}
    </div>
  );
}
