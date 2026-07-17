import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, FileText, ClipboardCheck, Mail } from 'lucide-react';
import AddCandidateDrawer from '../../../components/agency/hiring/AddCandidateDrawer';
import CandidateFormsPanel from '../../../components/agency/hiring/CandidateFormsPanel';
import CandidateFeedbackViewPanel from '../../../components/agency/hiring/CandidateFeedbackViewPanel';
import SendCandidateEmailDrawer from '../../../components/agency/hiring/SendCandidateEmailDrawer';
import ActionIconButton from '../../../components/ui/ActionIconButton';
import { fetchJobs } from '../../../redux/slices/jobsSlice';
import { fetchApplications } from '../../../redux/slices/candidatesSlice';

export default function Candidates() {
  const dispatch = useDispatch();
  const { list: jobs } = useSelector((state) => state.jobs);
  const { applications, loading } = useSelector((state) => state.candidates);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [formsOpen, setFormsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  const load = () => {
    dispatch(fetchJobs());
    dispatch(fetchApplications());
  };

  useEffect(() => {
    load();
  }, [dispatch]);

  const openJobs = useMemo(
    () => jobs.filter((j) => (j.hiring_status || j.hiringStatus || 'Open') !== 'Complete'),
    [jobs],
  );

  const openAction = (app, action) => {
    setSelectedApp(app);
    if (action === 'forms') setFormsOpen(true);
    if (action === 'feedback') setFeedbackOpen(true);
    if (action === 'email') setEmailOpen(true);
  };

  const stageIdForApp = (app) => app?.stage?.id || app?.agencyStageId || '';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Candidates</h1>
          <p className="mt-1 text-sm text-gray-500">
            View all candidates across jobs. Use the Jobs page to move candidates through pipeline stages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedJob(null);
            setDrawerOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus size={16} />
          Add Candidate
        </button>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">All Candidates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3">Candidate</th>
                <th className="px-5 py-3">Designation</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Experience</th>
                <th className="px-5 py-3">Job</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Applied</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-gray-500">Loading...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-gray-500">
                    No candidates yet. Add a candidate to a job to get started.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/80">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">
                        {app.candidate?.first_name} {app.candidate?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{app.candidate?.email}</p>
                      <p className="text-xs text-gray-400">{app.candidate?.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{app.candidate?.designation || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {[app.candidate?.location, app.candidate?.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {app.candidate?.experience != null ? `${app.candidate.experience} yrs` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{app.job?.job_title || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-600">{app.stage?.name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        app.status === 'Hired'
                          ? 'bg-emerald-100 text-emerald-700'
                          : app.status === 'Rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-0.5">
                        <ActionIconButton
                          label="View forms"
                          onClick={() => openAction(app, 'forms')}
                          className="text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <FileText size={16} />
                        </ActionIconButton>
                        <ActionIconButton
                          label="Interview feedback"
                          onClick={() => openAction(app, 'feedback')}
                          className="text-gray-500 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <ClipboardCheck size={16} />
                        </ActionIconButton>
                        <ActionIconButton
                          label="Send email"
                          onClick={() => openAction(app, 'email')}
                          className="text-gray-500 hover:bg-primary/10 hover:text-primary"
                        >
                          <Mail size={16} />
                        </ActionIconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AddCandidateDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedJob(null);
        }}
        jobs={openJobs}
        selectedJob={selectedJob}
        onSuccess={load}
      />

      <CandidateFormsPanel
        open={formsOpen}
        onClose={() => {
          setFormsOpen(false);
          setSelectedApp(null);
        }}
        application={selectedApp}
        stageId={stageIdForApp(selectedApp)}
        readOnly
      />

      <CandidateFeedbackViewPanel
        open={feedbackOpen}
        onClose={() => {
          setFeedbackOpen(false);
          setSelectedApp(null);
        }}
        application={selectedApp}
      />

      <SendCandidateEmailDrawer
        open={emailOpen}
        onClose={() => {
          setEmailOpen(false);
          setSelectedApp(null);
        }}
        application={selectedApp}
      />
    </div>
  );
}
