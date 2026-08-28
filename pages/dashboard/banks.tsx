'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import Card from '@/components/Common/Card';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import VoiceInputButton from '@/components/VoiceInputButton';
import { BiPlus, BiTrash, BiX, BiChevronRight } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Bank {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

export default function BanksManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankFormData, setBankFormData] = useState({ name: '' });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/banks/');
      setBanks(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast.error('Failed to load banks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/banks/', {
        name: bankFormData.name,
        is_active: true,
      });
      toast.success('Bank created successfully!');
      setBankFormData({ name: '' });
      setShowBankForm(false);
      fetchBanks();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create bank');
    }
  };

  const handleDeleteBank = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bank?')) return;
    try {
      await api.delete(`/banks/${id}/`);
      toast.success('Bank deleted');
      fetchBanks();
    } catch (error) {
      toast.error('Failed to delete bank');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Banks</h1>
            <p className="text-gray-600 mt-1">Create and manage bank accounts for payments</p>
          </div>
          <ProfessionalButton
            variant="primary"
            size="md"
            icon={<BiPlus size={18} />}
            onClick={() => setShowBankForm(!showBankForm)}
          >
            Add Bank
          </ProfessionalButton>
        </div>

        {/* Create Bank Form */}
        {showBankForm && (
          <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200 animate-slideInUp">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create New Bank</h2>
                <p className="text-gray-600 text-sm mt-1">Add a new bank account for processing payments</p>
              </div>
              <button
                onClick={() => setShowBankForm(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded transition"
              >
                <BiX size={24} />
              </button>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <form onSubmit={handleCreateBank} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <div className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={bankFormData.name}
                      onChange={(e) => setBankFormData({ name: e.target.value })}
                      placeholder="e.g., First Bank"
                      required
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-sm"
                    />
                    <VoiceInputButton
                      onTranscript={(text) => setBankFormData({ name: text })}
                      fieldName="Bank Name"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <ProfessionalButton type="submit" variant="primary">
                    Create Bank
                  </ProfessionalButton>
                  <ProfessionalButton type="button" variant="secondary" onClick={() => setShowBankForm(false)}>
                    Cancel
                  </ProfessionalButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Banks Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading banks...</div>
        ) : banks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => router.push(`/dashboard/banks/${bank.id}`)}
                className="text-left transition-transform hover:scale-105 focus:outline-none"
              >
                <Card padding="lg" className="h-full border-t-4 border-t-blue-500 hover:shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-900">{bank.name}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {bank.is_active ? (
                          <span className="text-green-600 font-medium">✓ Active</span>
                        ) : (
                          <span className="text-red-600 font-medium">✗ Inactive</span>
                        )}
                      </p>
                    </div>
                    <BiChevronRight size={24} className="text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(bank.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Click to manage admins →</p>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        ) : (
          <Card padding="lg" className="text-center py-12">
            <p className="text-gray-500 mb-4">No banks created yet</p>
            <ProfessionalButton
              variant="primary"
              icon={<BiPlus size={20} />}
              onClick={() => setShowBankForm(true)}
            >
              Create First Bank
            </ProfessionalButton>
          </Card>
        )}
      </div>
    </Layout>
  );
}
