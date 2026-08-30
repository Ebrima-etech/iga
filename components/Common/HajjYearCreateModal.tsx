import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import FormField from './FormField';
import toast from 'react-hot-toast';
import { useHajjYear } from '@/lib/stores/hajjYearStore';
import { HajjYear } from '@/types';
import { BiX } from 'react-icons/bi';

interface HajjYearCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (year: HajjYear) => void;
}

export default function HajjYearCreateModal({ isOpen, onClose, onSuccess }: HajjYearCreateModalProps) {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    name: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(false);
  const { createHajjYear, fetchHajjYears } = useHajjYear();

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.year) {
      toast.error('Year is required');
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      toast.error('Start and end dates are required');
      return;
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      const newYear = await createHajjYear({
        year: formData.year,
        name: formData.name || `Hajj ${formData.year}`,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
      });

      toast.success(`Hajj year ${formData.year} created successfully!`);

      // Refresh the list
      await fetchHajjYears();

      // Reset form
      setFormData({
        year: new Date().getFullYear(),
        name: '',
        description: '',
        start_date: '',
        end_date: '',
      });

      onClose();
      onSuccess?.(newYear);
    } catch (error: any) {
      console.error('Error creating Hajj year:', error);
      toast.error(error.response?.data?.detail || 'Failed to create Hajj year');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Hajj Year">
      <div className="max-w-md w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Year" required>
            <Input
              type="number"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 50}
              value={formData.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value))}
              placeholder="2026"
            />
          </FormField>

          <FormField label="Name" description="Display name for this Hajj year">
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={`Hajj ${formData.year}`}
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              rows={3}
            />
          </FormField>

          <FormField label="Start Date" required>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
            />
          </FormField>

          <FormField label="End Date" required>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
            />
          </FormField>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Hajj Year'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
