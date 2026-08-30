'use client';

import { useState, useEffect } from 'react';
import { BiX, BiSave } from 'react-icons/bi';
import ProfessionalButton from './ProfessionalButton';
import FormField from './FormField';
import Input from './Input';
import TextArea from './TextArea';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { HajjYear } from '@/types';

interface HajjYearDetailModalProps {
  isOpen: boolean;
  year: HajjYear | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HajjYearDetailModal({ isOpen, year, onClose, onSuccess }: HajjYearDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_deposit_amount: '',
    total_package_fee: '',
    notes: '',
  });

  useEffect(() => {
    if (year) {
      setFormData({
        first_deposit_amount: year.first_deposit_amount || '',
        total_package_fee: year.total_package_fee || '',
        notes: year.notes || '',
      });
    }
  }, [year]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!year) return;

    try {
      setLoading(true);
      await api.patch(`/hajj-years/${year.id}/`, {
        first_deposit_amount: formData.first_deposit_amount ? parseFloat(formData.first_deposit_amount) : null,
        total_package_fee: formData.total_package_fee ? parseFloat(formData.total_package_fee) : null,
        notes: formData.notes,
      });
      toast.success('Hajj year details updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating Hajj year:', error);
      toast.error('Failed to update Hajj year details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !year) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Hajj {year.year} Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <BiX size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField label="First Deposit Amount">
            <Input
              type="number"
              step="0.01"
              placeholder="e.g., 5000"
              value={formData.first_deposit_amount}
              onChange={(e) => setFormData({ ...formData, first_deposit_amount: e.target.value })}
            />
          </FormField>

          <FormField label="Total Hajj Package Fee">
            <Input
              type="number"
              step="0.01"
              placeholder="e.g., 25000"
              value={formData.total_package_fee}
              onChange={(e) => setFormData({ ...formData, total_package_fee: e.target.value })}
            />
          </FormField>

          <FormField label="Additional Notes">
            <TextArea
              placeholder="Add any additional information about this Hajj year..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </FormField>

          {/* Footer */}
          <div className="pt-4 flex gap-3 justify-end border-t border-gray-200">
            <ProfessionalButton
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </ProfessionalButton>
            <ProfessionalButton
              variant="primary"
              size="md"
              icon={<BiSave size={16} />}
              onClick={handleSubmit}
              loading={loading}
            >
              Save Details
            </ProfessionalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
