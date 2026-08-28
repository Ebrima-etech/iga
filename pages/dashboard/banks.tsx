'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import Card from '@/components/Common/Card';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import { BiPlus, BiTrash, BiPencil, BiX } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Bank {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface BankAdmin {
  id: number;
  username: string;
  email: string;
  bank?: number;
  bank_name?: string;
}

export default function BanksManagementPage() {
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankAdmins, setBankAdmins] = useState<BankAdmin[]>([]);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [bankFormData, setBankFormData] = useState({ name: '' });
  const [adminFormData, setAdminFormData] = useState({
    username: '',
    email: '',
    password: '',
    bank_id: '',
  });

  useEffect(() => {
    fetchBanks();
    fetchBankAdmins();
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

  const fetchBankAdmins = async () => {
    try {
      const response = await api.get('/user-roles/?role=bank_admin');
      setBankAdmins(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching bank admins:', error);
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

  const handleCreateBankAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create user
      const userResponse = await api.post('/users/register/', {
        username: adminFormData.username,
        email: adminFormData.email,
        password: adminFormData.password,
      });

      // Create bank admin role
      await api.post('/user-roles/', {
        user_id: userResponse.data.id,
        role: 'bank_admin',
        bank_id: parseInt(adminFormData.bank_id),
        is_active: true,
      });

      toast.success('Bank admin created successfully!');
      setAdminFormData({ username: '', email: '', password: '', bank_id: '' });
      setShowAdminForm(false);
      fetchBankAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create bank admin');
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
        <PageHeader
          title="Banks Management"
          description="Create and manage bank accounts and administrators"
          action={
            <div className="flex gap-3">
              <ProfessionalButton
                variant="primary"
                size="md"
                icon={<BiPlus size={20} />}
                onClick={() => setShowBankForm(!showBankForm)}
              >
                Add Bank
              </ProfessionalButton>
              <ProfessionalButton
                variant="secondary"
                size="md"
                icon={<BiPlus size={20} />}
                onClick={() => setShowAdminForm(!showAdminForm)}
              >
                Add Bank Admin
              </ProfessionalButton>
            </div>
          }
        />

        {/* Create Bank Form */}
        {showBankForm && (
          <Card padding="lg" shadow="md" className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Create New Bank</h2>
              <button onClick={() => setShowBankForm(false)}>
                <BiX size={24} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleCreateBank} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankFormData.name}
                  onChange={(e) => setBankFormData({ name: e.target.value })}
                  placeholder="e.g., First Bank"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <ProfessionalButton type="submit" variant="primary">
                  Create Bank
                </ProfessionalButton>
                <ProfessionalButton type="button" variant="secondary" onClick={() => setShowBankForm(false)}>
                  Cancel
                </ProfessionalButton>
              </div>
            </form>
          </Card>
        )}

        {/* Create Bank Admin Form */}
        {showAdminForm && (
          <Card padding="lg" shadow="md" className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Create Bank Admin</h2>
              <button onClick={() => setShowAdminForm(false)}>
                <BiX size={24} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleCreateBankAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={adminFormData.username}
                  onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                  placeholder="Admin username"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                  placeholder="admin@bank.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={adminFormData.password}
                  onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                  placeholder="Secure password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank</label>
                <select
                  value={adminFormData.bank_id}
                  onChange={(e) => setAdminFormData({ ...adminFormData, bank_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a bank...</option>
                  {banks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <ProfessionalButton type="submit" variant="primary">
                  Create Admin
                </ProfessionalButton>
                <ProfessionalButton type="button" variant="secondary" onClick={() => setShowAdminForm(false)}>
                  Cancel
                </ProfessionalButton>
              </div>
            </form>
          </Card>
        )}

        {/* Banks List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Banks Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Banks</h2>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : banks.length > 0 ? (
              <div className="space-y-3">
                {banks.map((bank) => (
                  <Card key={bank.id} padding="md" className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{bank.name}</p>
                      <p className="text-sm text-gray-500">
                        {bank.is_active ? '✓ Active' : '✗ Inactive'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteBank(bank.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <BiTrash size={18} />
                    </button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card padding="lg" className="text-center py-8">
                <p className="text-gray-500">No banks created yet</p>
              </Card>
            )}
          </div>

          {/* Bank Admins Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bank Admins</h2>
            {bankAdmins.length > 0 ? (
              <div className="space-y-3">
                {bankAdmins.map((admin: any) => (
                  <Card key={admin.id} padding="md">
                    <p className="font-semibold text-gray-900">@{admin.user?.username || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{admin.user?.email || 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Bank: {admin.bank?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Role: {admin.role}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card padding="lg" className="text-center py-8">
                <p className="text-gray-500">No bank admins created yet</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
