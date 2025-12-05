import { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import type { CreateBoardData } from '../../services/boardService';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBoardData & { useTemplate?: boolean }) => void;
  loading?: boolean;
  error?: string | null;
}

const PRESET_COLORS = [
  { name: 'Blue', value: '#0079BF' },
  { name: 'Green', value: '#61BD4F' },
  { name: 'Orange', value: '#FF9F1A' },
  { name: 'Red', value: '#EB5A46' },
  { name: 'Purple', value: '#C377E0' },
  { name: 'Pink', value: '#FF78CB' },
  { name: 'Lime', value: '#51E898' },
  { name: 'Sky', value: '#00C2E0' },
  { name: 'Grey', value: '#838C91' },
];

export default function CreateBoardModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  error = null,
}: CreateBoardModalProps) {
  const [formData, setFormData] = useState<CreateBoardData & { useTemplate?: boolean }>({
    name: '',
    color: '#0079BF',
    description: '',
    useTemplate: false,
  });

  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { name?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Board name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      name: '',
      color: '#0079BF',
      description: '',
      useTemplate: false,
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Board"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Board Name */}
        <Input
          label="Board Name"
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            setErrors({ ...errors, name: undefined });
          }}
          error={errors.name}
          placeholder="e.g., Project Planning"
          required
          disabled={loading}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What is this board about?"
            rows={3}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          />
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Board Color
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.value })}
                disabled={loading}
                className={`
                  h-12 rounded-lg transition-all
                  ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-primary' : 'hover:opacity-80'}
                  disabled:cursor-not-allowed
                `}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {formData.color === color.value && (
                  <svg className="w-6 h-6 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Template Option */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.useTemplate}
              onChange={(e) => setFormData({ ...formData, useTemplate: e.target.checked })}
              disabled={loading}
              className="mt-1 w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
            />
            <div className="flex-1">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Start with a template
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Create a board with pre-filled lists (To Do, In Progress, Done) and sample cards to get started quickly
              </p>
            </div>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Board'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
