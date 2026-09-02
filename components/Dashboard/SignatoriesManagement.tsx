'use client';

import { useState, useEffect } from 'react';
import { BiPlus, BiEdit, BiTrash, BiSave, BiRefresh, BiCheckCircle, BiX, BiUpload } from 'react-icons/bi';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Signatory {
  id: number;
  signatory_name: string;
  signatory_title: string;
  digital_signature?: string;
  official_stamp?: string;
  stamp_color: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface GlobalSettings {
  bank_contact_email: string;
  bank_contact_phone: string;
}

export default function SignatoriesManagement() {
  const [loading, setLoading] = useState(true);
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    bank_contact_email: 'support@giabanking.gm',
    bank_contact_phone: '+220 XXX XXXX',
  });
  const [editingGlobal, setEditingGlobal] = useState(false);
  const [selectedSignatory, setSelectedSignatory] = useState<Signatory | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [signatariesRes, settingsRes] = await Promise.all([
        api.get('/signatories/'),
        api.get('/settings/signatory/'),
      ]);
      setSignatories(signatariesRes.data);
      setGlobalSettings(settingsRes.data);
    } catch (error) {
      toast.error('Failed to load signatories');
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      await api.put(`/signatories/${id}/`, { is_active: true });
      setSignatories(prev =>
        prev.map(s => ({
          ...s,
          is_active: s.id === id
        }))
      );
      toast.success('Signatory set as active');
    } catch (error) {
      toast.error('Failed to update signatory');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this signatory?')) return;
    try {
      await api.delete(`/signatories/${id}/`);
      setSignatories(prev => prev.filter(s => s.id !== id));
      toast.success('Signatory deleted');
    } catch (error) {
      toast.error('Failed to delete signatory');
    }
  };

  const handleSaveGlobal = async () => {
    try {
      await api.post('/settings/signatory/', globalSettings);
      setEditingGlobal(false);
      toast.success('Global settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <BiRefresh size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Global Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Global Settings</h3>
          <button
            onClick={() => setEditingGlobal(!editingGlobal)}
            className="text-sm px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            {editingGlobal ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editingGlobal ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={globalSettings.bank_contact_email}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, bank_contact_email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={globalSettings.bank_contact_phone}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, bank_contact_phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSaveGlobal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <BiSave size={18} />
              Save
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-mono text-gray-900">{globalSettings.bank_contact_email}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-mono text-gray-900">{globalSettings.bank_contact_phone}</p>
            </div>
          </div>
        )}
      </div>

      {/* Signatories List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Signatories</h3>
          <button
            onClick={() => {
              setIsCreating(true);
              setSelectedSignatory(null);
              setShowDetailModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <BiPlus size={18} />
            Add Signatory
          </button>
        </div>

        {signatories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No signatories yet. Create one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {signatories.map(sig => (
              <div
                key={sig.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  sig.is_active
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {sig.is_active && (
                  <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold mb-2">
                    <BiCheckCircle size={14} />
                    ACTIVE
                  </div>
                )}

                <h4 className="font-bold text-gray-900">{sig.signatory_name}</h4>
                <p className="text-sm text-gray-600">{sig.signatory_title}</p>

                {sig.email && <p className="text-xs text-gray-500 mt-2">{sig.email}</p>}
                {sig.phone && <p className="text-xs text-gray-500">{sig.phone}</p>}

                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  {sig.digital_signature && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">✓ Signature</span>
                  )}
                  {sig.official_stamp && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">✓ Stamp</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  {!sig.is_active && (
                    <button
                      onClick={() => handleSetActive(sig.id)}
                      className="flex-1 text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedSignatory(sig);
                      setIsCreating(false);
                      setShowDetailModal(true);
                    }}
                    className="flex-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <BiEdit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sig.id)}
                    className="flex-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <BiTrash size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <SignatoryDetailModal
          signatory={selectedSignatory}
          isCreating={isCreating}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSignatory(null);
            setIsCreating(false);
          }}
          onSave={() => {
            setShowDetailModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function SignatoryDetailModal({
  signatory,
  isCreating,
  onClose,
  onSave,
}: {
  signatory: Signatory | null;
  isCreating: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [data, setData] = useState<Partial<Signatory>>(
    signatory || {
      signatory_name: '',
      signatory_title: '',
      email: '',
      phone: '',
      stamp_color: '#16a34a',
      digital_signature: undefined,
      official_stamp: undefined,
    }
  );
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ signature?: string; stamp?: string }>({});

  useEffect(() => {
    if (signatory?.digital_signature) {
      setPreview(prev => ({ ...prev, signature: signatory.digital_signature }));
    }
    if (signatory?.official_stamp) {
      setPreview(prev => ({ ...prev, stamp: signatory.official_stamp }));
    }
  }, [signatory]);

  const handleFileChange = (field: 'digital_signature' | 'official_stamp', file: File) => {
    setData(prev => ({ ...prev, [field]: file }));
    const reader = new FileReader();
    reader.onload = (e) => {
      const key = field === 'digital_signature' ? 'signature' : 'stamp';
      setPreview(prev => ({ ...prev, [key]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = data[key as keyof Signatory];
        if (value) {
          if ((value as any) instanceof File) {
            formData.append(key, value as File);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      if (isCreating) {
        await api.post('/signatories/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Signatory created');
      } else {
        await api.put(`/signatories/${signatory?.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Signatory updated');
      }
      onSave();
    } catch (error) {
      toast.error('Failed to save signatory');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isCreating ? 'Add Signatory' : 'Edit Signatory'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <BiX size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={data.signatory_name || ''}
              onChange={(e) => setData(prev => ({ ...prev, signatory_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={data.signatory_title || ''}
              onChange={(e) => setData(prev => ({ ...prev, signatory_title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={data.email || ''}
                onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={data.phone || ''}
                onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Digital Signature</label>
            {preview.signature && <img src={preview.signature} alt="Sig" className="max-w-xs max-h-20 mb-2" />}
            <label className="block cursor-pointer">
              <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded inline-flex items-center gap-2">
                <BiUpload size={16} />
                Upload
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileChange('digital_signature', e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Official Stamp</label>
            {preview.stamp && <img src={preview.stamp} alt="Stamp" className="max-w-xs max-h-24 mb-2" />}
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={data.stamp_color || '#16a34a'}
                onChange={(e) => setData(prev => ({ ...prev, stamp_color: e.target.value }))}
                className="h-10 w-16 rounded cursor-pointer"
              />
              <label className="cursor-pointer">
                <span className="px-3 py-2 bg-purple-100 text-purple-700 rounded inline-flex items-center gap-2">
                  <BiUpload size={16} />
                  Upload
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

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
            >
              <BiSave size={18} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
