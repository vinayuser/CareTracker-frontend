import { useEffect, useState } from 'react';
import {
  Plus,
  Settings,
  X,
  ArrowUp,
  ArrowDown,
  Trash2,
  GripVertical,
  FileText,
  Layers,
} from 'lucide-react';

const STAGE_TYPES = [
  { label: 'Hiring Process', value: 'hiring' },
  { label: 'Onboarding', value: 'onboarding' },
  { label: 'Custom', value: 'custom' },
];

const typeBadgeClass = {
  hiring: 'bg-primary/10 text-primary',
  onboarding: 'bg-emerald-100 text-emerald-700',
  custom: 'bg-gray-100 text-gray-600',
};

function emptyStage() {
  return { name: '', type: 'hiring', order: 1, documents: [] };
}

export default function StageConfigurationModal({
  open,
  onClose,
  stages,
  setStages,
  availableDocuments,
  onSave,
  saving = false,
}) {
  const [showStageForm, setShowStageForm] = useState(false);
  const [currentStage, setCurrentStage] = useState(emptyStage());
  const [showSaveWarning, setShowSaveWarning] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowStageForm(false);
      setCurrentStage(emptyStage());
      setShowSaveWarning(false);
    }
  }, [open]);

  if (!open) return null;

  const handleCancel = () => {
    setShowStageForm(false);
    setCurrentStage(emptyStage());
    setShowSaveWarning(false);
    onClose();
  };

  const handleSave = () => {
    if (showStageForm && (currentStage.name.trim() || currentStage.documents.length > 0)) {
      setShowSaveWarning(true);
      return;
    }
    setShowStageForm(false);
    setCurrentStage(emptyStage());
    setShowSaveWarning(false);
    onSave();
  };

  const addStage = () => {
    if (!currentStage.name.trim()) return;
    const newStage = {
      ...currentStage,
      order: stages.length + 1,
      documents: currentStage.documents.map((doc, index) => ({
        ...doc,
        order: index + 1,
      })),
    };
    setStages([...stages, newStage]);
    setCurrentStage(emptyStage());
    setShowStageForm(false);
    setShowSaveWarning(false);
  };

  const removeStage = (index) => {
    const updated = stages
      .filter((_, i) => i !== index)
      .map((stage, i) => ({ ...stage, order: i + 1 }));
    setStages(updated);
  };

  const moveStage = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === stages.length - 1)) return;
    const updated = [...stages];
    const temp = updated[index];
    updated[index] = updated[index + direction];
    updated[index + direction] = temp;
    setStages(updated.map((stage, i) => ({ ...stage, order: i + 1 })));
  };

  const toggleDocument = (documentCode, documentName) => {
    const isSelected = currentStage.documents.some((doc) => doc.code === documentCode);
    if (isSelected) {
      setCurrentStage((prev) => ({
        ...prev,
        documents: prev.documents.filter((doc) => doc.code !== documentCode),
      }));
    } else {
      setCurrentStage((prev) => ({
        ...prev,
        documents: [
          ...prev.documents,
          {
            code: documentCode,
            name: documentName,
            isRequired: true,
            order: prev.documents.length + 1,
          },
        ],
      }));
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (sourceIndex === targetIndex) return;
    const updated = [...stages];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setStages(updated.map((stage, index) => ({ ...stage, order: index + 1 })));
  };

  const totalDocs = stages.reduce((acc, stage) => acc + stage.documents.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary-hover px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Hiring Pipeline Setup</h2>
              <p className="text-sm text-white/80">Configure stages and document requirements</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                {stages.length}
              </div>
              <p className="text-sm font-medium text-gray-600">Total Stages</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-lg font-bold text-emerald-600">
                {totalDocs}
              </div>
              <p className="text-sm font-medium text-gray-600">Documents Required</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-600">
                {availableDocuments.length}
              </div>
              <p className="text-sm font-medium text-gray-600">Available Docs</p>
            </div>
          </div>

          {showStageForm && (
            <div
              className={`mb-5 rounded-xl border bg-white p-5 shadow-sm ${
                showSaveWarning ? 'border-red-300' : 'border-primary/30'
              }`}
            >
              {showSaveWarning && (
                <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  Please save or cancel the current stage before saving the pipeline.
                </p>
              )}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Create New Stage</h3>
                  <p className="text-sm text-gray-500">Define stage details and document requirements</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowStageForm(false);
                    setShowSaveWarning(false);
                  }}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
                >
                  Close
                </button>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Stage Name *</label>
                  <input
                    type="text"
                    value={currentStage.name}
                    onChange={(e) => setCurrentStage((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Phone Screen, Technical Interview"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Stage Type</label>
                  <select
                    value={currentStage.type}
                    onChange={(e) => setCurrentStage((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {STAGE_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Document Requirements</label>
                <div className="max-h-36 overflow-y-auto rounded-lg border border-gray-200 p-3">
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {availableDocuments.map((doc) => (
                      <label
                        key={doc.code}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={currentStage.documents.some((d) => d.code === doc.code)}
                          onChange={() => toggleDocument(doc.code, doc.name)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">{doc.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {currentStage.documents.length > 0 && (
                <div className="mb-4 rounded-lg bg-primary/5 p-3">
                  <p className="mb-2 text-sm font-medium text-primary">
                    Selected Documents ({currentStage.documents.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentStage.documents.map((doc) => (
                      <span
                        key={doc.code}
                        className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-white px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {doc.name}
                        <button
                          type="button"
                          onClick={() => toggleDocument(doc.code, doc.name)}
                          className="text-primary/60 hover:text-primary"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addStage}
                  disabled={!currentStage.name.trim()}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <Plus size={16} />
                  Create Stage
                </button>
              </div>
            </div>
          )}

          {!showStageForm && stages.length > 0 && (
            <div className="mb-5 flex justify-center">
              <button
                type="button"
                onClick={() => setShowStageForm(true)}
                disabled={stages.length >= 10}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <Plus size={16} />
                Add New Stage
              </button>
            </div>
          )}

          {!showStageForm && stages.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                <Plus size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Build Your Hiring Pipeline</h3>
              <p className="mx-auto mb-5 max-w-md text-sm text-gray-500">
                Create your first stage to design a seamless hiring journey. Add documents and
                requirements for each step to streamline your process.
              </p>
              <button
                type="button"
                onClick={() => setShowStageForm(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
              >
                <Plus size={16} />
                Create First Stage
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {stages.map((stage, index) => (
                <div
                  key={`${stage.name}-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                        {stage.order}
                      </span>
                      <GripVertical size={16} className="text-gray-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{stage.name}</h4>
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                            typeBadgeClass[stage.type] || typeBadgeClass.custom
                          }`}
                        >
                          {stage.type}
                        </span>
                      </div>

                      {stage.documents.length > 0 ? (
                        <div>
                          <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-500">
                            <FileText size={12} />
                            {stage.documents.length} Required Documents
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {stage.documents.map((doc) => (
                              <span
                                key={doc.code}
                                className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                              >
                                {doc.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm italic text-gray-400">No documents required for this stage</p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveStage(index, -1)}
                        disabled={index === 0}
                        className="rounded-lg p-1.5 text-primary hover:bg-primary/10 disabled:text-gray-300"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStage(index, 1)}
                        disabled={index === stages.length - 1}
                        className="rounded-lg p-1.5 text-primary hover:bg-primary/10 disabled:text-gray-300"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStage(index)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={stages.length === 0 || saving}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {saving ? 'Saving...' : 'Save Pipeline'}
          </button>
        </div>
      </div>
    </div>
  );
}
