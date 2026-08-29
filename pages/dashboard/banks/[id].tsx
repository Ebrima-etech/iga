'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import Card from '@/components/Common/Card';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import VoiceInputButton from '@/components/VoiceInputButton';
import { BiArrowBack, BiPlus, BiX } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Bank {
  id: number;
  name: string;
  logo?: string | null;
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.patch(`/banks/${bankId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setBank(response.data);
      toast.success('Bank logo uploaded successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
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
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/dashboard/banks')}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
            >
              <BiArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{bank?.name || 'Bank Details'}</h1>
              <p className="text-sm text-gray-600 mt-1">Manage bank information and administrators</p>
            </div>
          </div>
        </div>

        {/* Bank Info Card */}
        {bank && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo Section */}
              <div className="flex flex-col items-center justify-start">
                <div className="w-32 h-32 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                  {bank.logo ? (
                    <img src={bank.logo.startsWith('http') ? bank.logo : `https://igaa.onrender.com${bank.logo}`} alt={bank.name} className="h-28 w-28 object-contain" />
                  ) : (
                    <span className="text-5xl">🏦</span>
                  )}
                </div>
                <label className="w-full px-3 py-2 bg-black hover:bg-gray-900 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors text-center">
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Bank Info Grid */}
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Bank Name</p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">{bank.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bank.is_active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {bank.is_active ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Created</p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    {new Date(bank.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Admins</p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">{admins.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Administrators Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bank Administrators</h2>
              <p className="text-sm text-gray-600 mt-1">{admins.length} administrator{admins.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => setShowAddAdmin(!showAddAdmin)}
              className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <BiPlus size={18} /> Add Admin
            </button>
          </div>

          {/* Add Admin Form */}
          {showAddAdmin && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add New Administrator</h3>
                <button onClick={() => setShowAddAdmin(false)} className="text-gray-400 hover:text-gray-600">
                  <BiX size={24} />
                </button>
              </div>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={adminFormData.username}
                      onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                      placeholder="Enter username"
                      required
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    />
                    <VoiceInputButton
                      onTranscript={(text) => setAdminFormData({ ...adminFormData, username: text })}
                      fieldName="Username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                      placeholder="admin@bank.com"
                      required
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    />
                    <VoiceInputButton
                      onTranscript={(text) => setAdminFormData({ ...adminFormData, email: text })}
                      fieldName="Email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={adminFormData.password}
                    onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                    placeholder="Secure password"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Add Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAdmin(false)}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Admins List */}
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">Loading administrators...</p>
            </div>
          ) : admins.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">@{admin.user.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{admin.user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{admin.role}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}>
                          {admin.is_active ? '● Active' : '● Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-600 mb-6">No administrators assigned to this bank yet</p>
              <button
                onClick={() => setShowAddAdmin(true)}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <BiPlus size={18} /> Add First Admin
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
