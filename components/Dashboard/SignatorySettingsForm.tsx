'use client';

import { useState, useEffect } from 'react';
import { BiUpload, BiSave, BiRefresh, BiCheckCircle, BiX, BiUser, BiPhone, BiEnvelope } from 'react-icons/bi';
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

      formData.append('signatory_name', data.signatory_name);
      formData.append('signatory_title', data.signatory_title);
      formData.append('stamp_color', data.stamp_color);
      formData.append('bank_contact_email', data.bank_contact_email);
      formData.append('bank_contact_phone', data.bank_contact_phone);
      formData.append('is_active', String(data.is_active));

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
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin">
          <BiRefresh size={32} className="text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Section 1: Signatory Information */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 overflow-hidden shadow-sm">
        <div className="bg-emerald-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <BiUser size={24} className="text-white" />
            <h3 className="text-lg font-bold text-white">Signatory Details</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="signatory_name"
                value={data.signatory_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-emerald-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="e.g., Ahmed Hassan"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title / Position
              </label>
              <input
                type="text"
                name="signatory_title"
                value={data.signatory_title}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-emerald-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="e.g., Bank Administrator"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Digital Signature */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden shadow-sm">
        <div className="bg-blue-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">Digital Signature</h3>
          <p className="text-blue-100 text-sm mt-1">PNG or JPG with transparent background</p>
        </div>
        <div className="p-6">
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-white transition-all hover:border-blue-400">
            {preview.signature ? (
              <div className="space-y-4">
                <div className="inline-block bg-blue-50 p-4 rounded-lg">
                  <img
                    src={preview.signature}
                    alt="Signature Preview"
                    className="max-w-xs max-h-24 object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Signature uploaded</p>
                  <label className="inline-block">
                    <span className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors font-medium">
                      <BiUpload size={18} />
                      Replace Signature
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileChange('digital_signature', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="space-y-3">
                  <div className="inline-block p-3 bg-blue-100 rounded-lg">
                    <BiUpload size={32} className="text-blue-600" />
                  </div>
                  <p className="text-gray-700 font-medium">Drop signature here</p>
                  <p className="text-gray-500 text-sm">
                    or <span className="text-blue-600 font-semibold">click to browse</span>
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
      </div>

      {/* Section 3: Official Stamp */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 overflow-hidden shadow-sm">
        <div className="bg-purple-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">Official Stamp / Seal</h3>
          <p className="text-purple-100 text-sm mt-1">PNG or JPG with transparent background</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Stamp Color
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="stamp_color"
                  value={data.stamp_color}
                  onChange={handleInputChange}
                  className="h-12 w-16 rounded-lg cursor-pointer border-2 border-purple-200 hover:border-purple-300 transition-colors"
                />
                <div className="font-mono text-sm text-gray-600 font-medium">{data.stamp_color}</div>
              </div>
              <div className="flex-1 text-xs text-gray-500">
                Choose the color for your stamp seal
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center bg-white transition-all hover:border-purple-400">
            {preview.stamp ? (
              <div className="space-y-4">
                <div className="inline-block bg-purple-50 p-4 rounded-lg">
                  <img
                    src={preview.stamp}
                    alt="Stamp Preview"
                    className="max-w-xs max-h-32 object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Stamp uploaded</p>
                  <label className="inline-block">
                    <span className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors font-medium">
                      <BiUpload size={18} />
                      Replace Stamp
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileChange('official_stamp', e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="space-y-3">
                  <div className="inline-block p-3 bg-purple-100 rounded-lg">
                    <BiUpload size={32} className="text-purple-600" />
                  </div>
                  <p className="text-gray-700 font-medium">Drop stamp here</p>
                  <p className="text-gray-500 text-sm">
                    or <span className="text-purple-600 font-semibold">click to browse</span>
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
      </div>

      {/* Section 4: Contact Information */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 overflow-hidden shadow-sm">
        <div className="bg-amber-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <BiPhone size={24} className="text-white" />
            <h3 className="text-lg font-bold text-white">Contact Information</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <BiEnvelope size={16} className="text-amber-600" />
                Email Address
              </label>
              <input
                type="email"
                name="bank_contact_email"
                value={data.bank_contact_email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-amber-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="support@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <BiPhone size={16} className="text-amber-600" />
                Phone Number
              </label>
              <input
                type="tel"
                name="bank_contact_phone"
                value={data.bank_contact_phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-amber-200 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="+220 XXX XXXX"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Status & Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={data.is_active}
              onChange={handleInputChange}
              className="w-5 h-5 text-emerald-600 rounded-lg focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
            <div>
              <p className="font-semibold text-gray-900">Activate Settings</p>
              <p className="text-sm text-gray-500">Use for receipt generation</p>
            </div>
            {data.is_active && (
              <BiCheckCircle size={20} className="text-emerald-600 ml-auto" />
            )}
          </label>
        </div>

        <div className="flex justify-end items-end">
          <ProfessionalButton
            onClick={handleSave}
            disabled={saving}
            loading={saving}
            icon={BiSave}
            className="w-full md:w-auto"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </ProfessionalButton>
        </div>
      </div>
    </div>
  );
}
