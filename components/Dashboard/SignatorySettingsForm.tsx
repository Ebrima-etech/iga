'use client';

import { useState, useEffect } from 'react';
import { BiUpload, BiSave, BiRefresh, BiCheckCircle, BiX } from 'react-icons/bi';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface SignatoryData {
  signatory_name: string;
  signatory_title: string;
  digital_signature: File | string | null;
  official_stamp: File | string | null;
  stamp_color: string;
  bank_contact_email: string;
  bank_contact_phone: string;
  is_active: boolean;
}

interface SignatorySettingsFormProps {
  onSave?: () => void;
}

export default function SignatorySettingsForm({ onSave }: SignatorySettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SignatoryData>({
    signatory_name: 'GIA Bank Admin',
    signatory_title: 'Bank Administrator',
    digital_signature: null,
    official_stamp: null,
    stamp_color: '#16a34a',
    bank_contact_email: 'support@giabanking.gm',
    bank_contact_phone: '+220 XXX XXXX',
    is_active: true,
  });

  const [preview, setPreview] = useState<{
    signature?: string;
    stamp?: string;
  }>({});

  useEffect(() => {
    loadSignatorySettings();
  }, []);

  const loadSignatorySettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings/signatory/');
      setData(response.data);

      // Load previews
      if (response.data.digital_signature) {
        setPreview(prev => ({
          ...prev,
          signature: response.data.digital_signature
        }));
      }
      if (response.data.official_stamp) {
        setPreview(prev => ({
          ...prev,
          stamp: response.data.official_stamp
        }));
      }
    } catch (error) {
      console.error('Failed to load signatory settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (field: 'digital_signature' | 'official_stamp', file: File) => {
    setData(prev => ({
      ...prev,
      [field]: file
    }));

    const reader = new FileReader();
    reader.onload = (e) => {
      const previewKey = field === 'digital_signature' ? 'signature' : 'stamp';
      setPreview(prev => ({
        ...prev,
        [previewKey]: e.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();

      // Add text fields
      formData.append('signatory_name', data.signatory_name);
      formData.append('signatory_title', data.signatory_title);
      formData.append('stamp_color', data.stamp_color);
      formData.append('bank_contact_email', data.bank_contact_email);
      formData.append('bank_contact_phone', data.bank_contact_phone);
      formData.append('is_active', String(data.is_active));

      // Add files only if they're File objects (newly uploaded)
      if (data.digital_signature instanceof File) {
        formData.append('digital_signature', data.digital_signature);
      }
      if (data.official_stamp instanceof File) {
        formData.append('official_stamp', data.official_stamp);
      }

      const response = await api.post('/settings/signatory/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setData(response.data.data);
      toast.success('Signatory settings saved successfully!');
      onSave?.();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save signatory settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <BiRefresh size={32} className="text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Signatory Information */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Signatory Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signatory Name
            </label>
            <input
              type="text"
              name="signatory_name"
              value={data.signatory_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Name of authorized signatory"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title/Position
            </label>
            <input
              type="text"
              name="signatory_title"
              value={data.signatory_title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Title (e.g., Bank Administrator)"
            />
          </div>
        </div>
      </div>

      {/* Digital Signature Upload */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Digital Signature</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload a digital signature image (PNG or JPG with transparent background recommended)
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {preview.signature ? (
            <div className="space-y-4">
              <img
                src={preview.signature}
                alt="Signature Preview"
                className="mx-auto max-w-xs max-h-24"
              />
              <label className="inline-block">
                <span className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer transition-colors">
                  <BiUpload size={18} />
                  Change Signature
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileChange('digital_signature', e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer">
              <div className="space-y-2">
                <BiUpload size={32} className="mx-auto text-gray-400" />
                <p className="text-gray-600">
                  Drag and drop your signature, or{' '}
                  <span className="text-emerald-600 font-medium">click to browse</span>
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileChange('digital_signature', e.target.files[0])}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Official Stamp Upload */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Official Stamp/Seal</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload an official stamp or seal image (PNG or JPG with transparent background recommended)
        </p>

        <div className="mb-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Stamp Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="stamp_color"
              value={data.stamp_color}
              onChange={handleInputChange}
              className="h-10 w-20 rounded cursor-pointer border border-gray-300"
            />
            <span className="text-sm text-gray-600">{data.stamp_color}</span>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {preview.stamp ? (
            <div className="space-y-4">
              <img
                src={preview.stamp}
                alt="Stamp Preview"
                className="mx-auto max-w-xs max-h-32"
              />
              <label className="inline-block">
                <span className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer transition-colors">
                  <BiUpload size={18} />
                  Change Stamp
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileChange('official_stamp', e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer">
              <div className="space-y-2">
                <BiUpload size={32} className="mx-auto text-gray-400" />
                <p className="text-gray-600">
                  Drag and drop your stamp, or{' '}
                  <span className="text-emerald-600 font-medium">click to browse</span>
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileChange('official_stamp', e.target.files[0])}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="bank_contact_email"
              value={data.bank_contact_email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="bank_contact_phone"
              value={data.bank_contact_phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            checked={data.is_active}
            onChange={handleInputChange}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
          />
          <div>
            <p className="font-medium text-gray-900">Active</p>
            <p className="text-sm text-gray-600">Use these settings for receipt generation</p>
          </div>
        </label>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <ProfessionalButton
          onClick={handleSave}
          disabled={saving}
          loading={saving}
          icon={BiSave}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </ProfessionalButton>
      </div>
    </div>
  );
}
