'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import Card from '@/components/Common/Card';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import { BiArrowBack, BiPlus, BiX } from 'react-icons/bi';
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
  user: {
    id: number;
    username: string;
    email: string;
  };
  role: string;
  is_active: boolean;
}

export default function BankDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bankId = params?.id;

  const [loading, setLoading] = useState(true);
  const [bank, setBank] = useState<Bank | null>(null);
  const [admins, setAdmins] = useState<BankAdmin[]>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (bankId) {
      fetchBank();
      fetchBankAdmins();
    }
  }, [bankId]);

  const fetchBank = async () => {
    try {
      const response = await api.get(`/banks/${bankId}/`);
      setBank(response.data);
    } catch (error) {
      console.error('Error fetching bank:', error);
      toast.error('Failed to load bank');
      router.push('/dashboard/banks');
    }
  };

  const fetchBankAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user-roles/?role=bank_admin&bank=${bankId}`);
      setAdmins(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create user
      const userResponse = await api.post('/users/register/', {
        username: adminFormData.username,
        email: adminFormData.email,
        password: adminFormData.password,
      });

      // Create bank admin role for this bank
      await api.post('/user-roles/', {
        user_id: userResponse.data.id,
        role: 'bank_admin',
        bank_id: bankId,
        is_active: true,
      });

      toast.success('Admin added to bank successfully!');
      setAdminFormData({ username: '', email: '', password: '' });
      setShowAddAdmin(false);
      fetchBankAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add admin');
    }
  };

  if (!bankId) {
    return <Layout><div className="p-8">Invalid bank</div></Layout>;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/banks')}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <BiArrowBack size={24} />
          </button>
          <PageHeader
            title={bank?.name || 'Bank Details'}
            description={`Manage administrators for this bank`}
          />
        </div>

        {/* Bank Info Card */}
        {bank && (
          <Card padding="lg" shadow="md" className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Bank Name</h3>
                <p className="text-lg font-semibold text-gray-900">{bank.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Status</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {bank.is_active ? (
                    <span className="text-green-600">✓ Active</span>
                  ) : (
                    <span className="text-red-600">✗ Inactive</span>
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Created</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(bank.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Admins</h3>
                <p className="text-lg font-semibold text-gray-900">{admins.length}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Add Admin Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Bank Administrators</h2>
            <ProfessionalButton
              variant="primary"
              size="md"
              icon={<BiPlus size={20} />}
              onClick={() => setShowAddAdmin(!showAddAdmin)}
            >
              Add Admin
            </ProfessionalButton>
          </div>

          {showAddAdmin && (
            <Card padding="lg" shadow="md" className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Add New Admin</h3>
                <button onClick={() => setShowAddAdmin(false)}>
                  <BiX size={24} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleAddAdmin} className="space-y-4">
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
                <div className="flex gap-3">
                  <ProfessionalButton type="submit" variant="primary">
                    Add Admin
                  </ProfessionalButton>
                  <ProfessionalButton type="button" variant="secondary" onClick={() => setShowAddAdmin(false)}>
                    Cancel
                  </ProfessionalButton>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* Admins List */}
        {loading ? (
          <div className="text-center py-8">Loading admins...</div>
        ) : admins.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {admins.map((admin) => (
              <Card key={admin.id} padding="lg" className="border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">@{admin.user.username}</p>
                    <p className="text-sm text-gray-600">{admin.user.email}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Role: <span className="font-medium">{admin.role}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Status: {admin.is_active ? (
                        <span className="text-green-600 font-medium">Active</span>
                      ) : (
                        <span className="text-red-600 font-medium">Inactive</span>
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="lg" className="text-center py-12">
            <p className="text-gray-500 mb-4">No administrators assigned to this bank yet</p>
            <ProfessionalButton
              variant="primary"
              icon={<BiPlus size={20} />}
              onClick={() => setShowAddAdmin(true)}
            >
              Add First Admin
            </ProfessionalButton>
          </Card>
        )}
      </div>
    </Layout>
  );
}
