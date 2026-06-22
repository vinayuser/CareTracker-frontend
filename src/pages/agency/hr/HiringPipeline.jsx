import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Settings, Plus, Layers, FileText, GripVertical } from 'lucide-react';
import AgencyKpiCard from '../../../components/agency/dashboard/AgencyKpiCard';
import StageConfigurationModal from '../../../components/agency/hr/StageConfigurationModal';
import {
  fetchHiringPipeline,
  saveHiringPipeline,
} from '../../../redux/slices/hiringPipelineSlice';

const typeBadgeClass = {
  hiring: 'bg-primary/10 text-primary',
  onboarding: 'bg-emerald-100 text-emerald-700',
  custom: 'bg-gray-100 text-gray-600',
};

function toLocalStage(stage) {
  return {
    name: stage.name,
    type: stage.type || 'hiring',
    order: stage.order ?? stage.stageOrder,
    documents: (stage.documents || []).map((doc) => ({
      code: doc.code,
      name: doc.name,
      isRequired: doc.isRequired !== false,
      order: doc.order,
    })),
  };
}

export default function HiringPipeline() {
  const dispatch = useDispatch();
  const { stages, availableDocuments, loading, saving } = useSelector((state) => state.hiringPipeline);
  const [modalOpen, setModalOpen] = useState(false);
  const [localStages, setLocalStages] = useState([]);

  useEffect(() => {
    dispatch(fetchHiringPipeline());
  }, [dispatch]);

  const displayStages = useMemo(
    () => stages.map(toLocalStage).sort((a, b) => a.order - b.order),
    [stages],
  );

  const totalDocs = displayStages.reduce((acc, stage) => acc + stage.documents.length, 0);

  const openConfigure = () => {
    setLocalStages(displayStages.length > 0 ? [...displayStages] : []);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const result = await dispatch(saveHiringPipeline(localStages));
    if (saveHiringPipeline.fulfilled.match(result)) {
      setModalOpen(false);
      dispatch(fetchHiringPipeline());
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hiring Pipeline</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure hiring stages and required caregiver documents for your agency.
          </p>
        </div>
        <button
          type="button"
          onClick={openConfigure}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {displayStages.length > 0 ? (
            <>
              <Settings size={16} />
              Configure Pipeline
            </>
          ) : (
            <>
              <Plus size={16} />
              Create Pipeline
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AgencyKpiCard
          label="Pipeline Stages"
          value={String(displayStages.length)}
          icon={Layers}
          iconBg="bg-primary/10 text-primary"
        />
        <AgencyKpiCard
          label="Required Documents"
          value={String(totalDocs)}
          icon={FileText}
          iconBg="bg-emerald-100 text-emerald-600"
        />
        <AgencyKpiCard
          label="Available Forms"
          value={String(availableDocuments.length)}
          icon={FileText}
          iconBg="bg-blue-100 text-blue-600"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Pipeline Stages</h2>
          {displayStages.length > 0 && (
            <button
              type="button"
              onClick={openConfigure}
              className="text-sm font-medium text-primary hover:underline"
            >
              Edit Pipeline
            </button>
          )}
        </div>

        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-gray-500">Loading pipeline...</div>
        ) : displayStages.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Layers size={24} />
            </div>
            <h3 className="mb-2 text-base font-semibold text-gray-900">No pipeline configured yet</h3>
            <p className="mx-auto mb-5 max-w-md text-sm text-gray-500">
              Set up your hiring pipeline with stages like Pre-Hire and Onboarding. Attach required
              forms to each stage so caregivers complete the right documents at the right time.
            </p>
            <button
              type="button"
              onClick={openConfigure}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              <Plus size={16} />
              Create Pipeline
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 p-5">
            {displayStages.map((stage, index) => (
              <div key={`${stage.name}-${stage.order}`} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex shrink-0 items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                    {stage.order}
                  </span>
                  <GripVertical size={16} className="text-gray-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                        typeBadgeClass[stage.type] || typeBadgeClass.custom
                      }`}
                    >
                      {stage.type}
                    </span>
                  </div>
                  {stage.documents.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {stage.documents.map((doc) => (
                        <span
                          key={doc.code}
                          className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {doc.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No documents attached</p>
                  )}
                </div>
                {index < displayStages.length - 1 && (
                  <div className="hidden shrink-0 self-center text-gray-300 sm:block">→</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <StageConfigurationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        stages={localStages}
        setStages={setLocalStages}
        availableDocuments={availableDocuments}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
