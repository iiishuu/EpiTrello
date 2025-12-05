import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createLabel, updateLabel, deleteLabel, clearError } from '../../store/labelsSlice';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import type { Label } from '../../services/labelService';

interface LabelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

const PRESET_COLORS = [
  '#61BD4F', // green
  '#F2D600', // yellow
  '#FF9F1A', // orange
  '#EB5A46', // red
  '#C377E0', // purple
  '#0079BF', // blue
  '#00C2E0', // sky
  '#51E898', // lime
  '#FF78CB', // pink
  '#344563', // dark
];

const LabelManager: React.FC<LabelManagerProps> = ({ isOpen, onClose, boardId }) => {
  const dispatch = useAppDispatch();
  const { labels, creating, updating, deleting, error } = useAppSelector(
    (state) => state.labels
  );

  const [isCreating, setIsCreating] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [formData, setFormData] = useState({ name: '', color: PRESET_COLORS[0] });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const result = await dispatch(createLabel({ boardId, data: formData }));
    if (createLabel.fulfilled.match(result)) {
      setFormData({ name: '', color: PRESET_COLORS[0] });
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLabel || !formData.name.trim()) return;

    const result = await dispatch(
      updateLabel({ boardId, labelId: editingLabel.id, data: formData })
    );
    if (updateLabel.fulfilled.match(result)) {
      setEditingLabel(null);
      setFormData({ name: '', color: PRESET_COLORS[0] });
    }
  };

  const handleDelete = async (labelId: string) => {
    if (window.confirm('Delete this label? It will be removed from all cards.')) {
      await dispatch(deleteLabel({ boardId, labelId }));
    }
  };

  const handleEdit = (label: Label) => {
    setEditingLabel(label);
    setFormData({ name: label.name, color: label.color });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingLabel(null);
    setFormData({ name: '', color: PRESET_COLORS[0] });
    dispatch(clearError());
  };

  const handleClose = () => {
    handleCancel();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Manage Labels">
      <div className="space-y-4">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Existing labels */}
        <div className="space-y-2">
          {labels.length === 0 && !isCreating && !editingLabel && (
            <p className="text-sm text-gray-500 text-center py-4">
              No labels yet. Create your first label below.
            </p>
          )}

          {labels.map((label) =>
            editingLabel?.id === label.id ? (
              <form key={label.id} onSubmit={handleUpdate} className="space-y-3 p-3 bg-gray-50 rounded">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Label name"
                  required
                  autoFocus
                />

                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">Color</p>
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`h-8 rounded transition ${
                          formData.color === color
                            ? 'ring-2 ring-blue-500 ring-offset-2'
                            : 'hover:opacity-80'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={updating}>
                    {updating ? 'Updating...' : 'Update'}
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div
                key={label.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 group"
              >
                <div
                  className="flex-1 px-3 py-2 rounded"
                  style={{ backgroundColor: label.color }}
                >
                  <span className="text-white font-medium text-sm">{label.name}</span>
                </div>
                <button
                  onClick={() => handleEdit(label)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition"
                  title="Edit"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(label.id)}
                  disabled={deleting}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition"
                  title="Delete"
                >
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )
          )}
        </div>

        {/* Create new label form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="space-y-3 p-3 bg-gray-50 rounded">
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Label name"
              required
              autoFocus
            />

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Color</p>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`h-8 rounded transition ${
                      formData.color === color
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : 'hover:opacity-80'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Create button */}
        {!isCreating && !editingLabel && (
          <Button
            onClick={() => setIsCreating(true)}
            variant="secondary"
            className="w-full"
            size="sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Label
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default LabelManager;
