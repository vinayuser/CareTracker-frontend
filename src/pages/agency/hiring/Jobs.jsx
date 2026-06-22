import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import JobCard from '../../../components/agency/hiring/JobCard';
import AddCandidateDrawer from '../../../components/agency/hiring/AddCandidateDrawer';
import StageCandidatesModal from '../../../components/agency/hiring/StageCandidatesModal';
import { fetchJobs, fetchJobStats, deleteJob, completeJobHiring, reopenJobHiring } from '../../../redux/slices/jobsSlice';
import { ROUTES } from '../../../routes/routes';
import { isAgencyOwner } from '../../../utils/moduleAccess';
import { confirmAlert } from '../../../utils/swal';

export default function Jobs() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, stats, stagesMetadata, loading } = useSelector((state) => state.jobs);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState(null);
  const [modalViewType, setModalViewType] = useState('stage');
  const [transferResult, setTransferResult] = useState(null);

  const load = () => {
    dispatch(fetchJobs());
    dispatch(fetchJobStats());
  };

  useEffect(() => {
    load();
  }, [dispatch]);

  const isOwner = isAgencyOwner();

  const openJobs = useMemo(
    () => list.filter((j) => (j.hiring_status || j.hiringStatus || 'Open') !== 'Complete'),
    [list],
  );

  const statsByJobId = useMemo(() => {
    const map = {};
    stats.forEach((s) => { map[s.job_id] = s; });
    return map;
  }, [stats]);

  const handleDelete = async (job) => {
    const confirmed = await confirmAlert({
      title: 'Delete job?',
      text: `Delete job "${job.job_title || job.jobTitle}"? This cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    await dispatch(deleteJob(job.id));
    dispatch(fetchJobStats());
  };

  const openStageModal = (job, stage, viewType = 'stage') => {
    setSelectedJob(job);
    setModalStage(stage);
    setModalViewType(viewType);
    setModalOpen(true);
  };

  const handleCompleteJobHiring = async (job) => {
    const confirmed = await confirmAlert({
      title: 'Mark hiring complete?',
      text: 'The hired candidate will be added to your caregiver roster and can sign in to the caregiver portal.',
      confirmText: 'Mark complete',
      icon: 'question',
    });
    if (!confirmed) return;
    const result = await dispatch(completeJobHiring(job.id));
    if (completeJobHiring.fulfilled.match(result)) {
      setTransferResult(result.payload);
    }
    load();
  };

  const handleReopenJobHiring = async (job) => {
    const confirmed = await confirmAlert({
      title: 'Reopen hiring cycle?',
      text: 'You can continue editing this job and hiring more candidates.',
      confirmText: 'Reopen',
    });
    if (!confirmed) return;
    await dispatch(reopenJobHiring(job.id));
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Jobs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage job postings and track candidates through your hiring pipeline.
          </p>
        </div>
        <Link
          to={ROUTES.AGENCY_JOBS_CREATE}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus size={16} />
          Create Job
        </Link>
      </div>

      {loading && list.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
          Loading jobs...
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <h3 className="text-base font-semibold text-gray-900">No jobs yet</h3>
          <p className="mt-2 text-sm text-gray-500">Create your first job posting to start hiring caregivers.</p>
          <Link
            to={ROUTES.AGENCY_JOBS_CREATE}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus size={16} />
            Create Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              stats={statsByJobId[job.id] || {}}
              stages={statsByJobId[job.id]?.stages_metadata || stagesMetadata}
              isOwner={isOwner}
              onAddCandidate={(j) => {
                setSelectedJob(j);
                setDrawerOpen(true);
              }}
              onEdit={(j) => navigate(ROUTES.AGENCY_JOBS_EDIT.replace(':id', j.id))}
              onDelete={handleDelete}
              onStageClick={(j, stage) => openStageModal(j, stage, 'stage')}
              onRejectedClick={(j) => openStageModal(j, null, 'rejected')}
              onHiredClick={(j) => openStageModal(j, null, 'hired')}
              onCompleteJobHiring={handleCompleteJobHiring}
              onReopenJobHiring={handleReopenJobHiring}
            />
          ))}
        </div>
      )}

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

      <StageCandidatesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        job={selectedJob}
        stage={modalStage}
        viewType={modalViewType}
        onRefresh={load}
      />

      {transferResult?.caregivers?.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/50"
            onClick={() => setTransferResult(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Caregiver added to roster</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {transferResult.job_title} — hiring cycle is complete.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTransferResult(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {transferResult.caregivers.map((caregiver) => (
                <div key={caregiver.id} className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <p className="font-medium">{caregiver.fullName}</p>
                  <p className="mt-1">Login ID: {caregiver.userId}</p>
                  {caregiver.isNewAccount && caregiver.tempPassword && (
                    <p className="mt-1">
                      Temporary password: <strong>{caregiver.tempPassword}</strong>
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setTransferResult(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <Link
                to={ROUTES.AGENCY_CAREGIVERS}
                onClick={() => setTransferResult(null)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
              >
                View Caregivers
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
