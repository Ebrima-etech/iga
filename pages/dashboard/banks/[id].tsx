'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import Card from '@/components/Common/Card';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import VoiceInputButton from '@/components/VoiceInputButton';
import { BiArrowBack, BiPlus, BiX, BiTrash } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Bank {
  id: number;
  name: string;
  logo?: string | null;
  is_active: boolean;
  payment_view_access: 'date_restricted' | 'unrestricted';
  access_restricted: boolean;
  allowed_days: string;
  access_start_time: string | null;
  access_end_time: string | null;
  location_restricted: boolean;
  location_latitude: number | null;
  location_longitude: number | null;
  location_radius: number;
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
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessValue, setAccessValue] = useState<'date_restricted' | 'unrestricted'>('date_restricted');
  const [showTimeAccessModal, setShowTimeAccessModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [timeAccessData, setTimeAccessData] = useState({
    access_restricted: false,
    allowed_days: 'Mon,Tue,Wed,Thu,Fri',
    access_start_time: '09:00',
    access_end_time: '17:00',
  });
  const [locationData, setLocationData] = useState({
    location_restricted: false,
    location_latitude: 0,
    location_longitude: 0,
    location_radius: 1,
  });
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
      console.log('Bank data:', response.data);
      console.log('Logo value:', response.data.logo);
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
      const allAdmins = response.data.results || response.data;
      // Filter to ensure only admins for this specific bank are shown
      const filteredAdmins = allAdmins.filter((admin: any) => admin.bank === parseInt(bankId as string) || admin.bank?.id === parseInt(bankId as string));
      setAdmins(filteredAdmins);
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

  const handleToggleStatus = async () => {
    if (!bank) return;
    try {
      setTogglingStatus(true);
      await api.patch(`/banks/${bankId}/`, { is_active: !bank.is_active });
      toast.success(`Bank ${!bank.is_active ? 'activated' : 'deactivated'} successfully`);
      fetchBank();
    } catch (error) {
      toast.error('Failed to toggle bank status');
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleUpdateAccessLevel = async () => {
    try {
      await api.patch(`/banks/${bankId}/`, { payment_view_access: accessValue });
      toast.success('Payment access level updated successfully');
      setShowAccessModal(false);
      fetchBank();
    } catch (error) {
      toast.error('Failed to update access level');
    }
  };

  const handleSaveTimeAccess = async () => {
    try {
      await api.patch(`/banks/${bankId}/`, {
        access_restricted: timeAccessData.access_restricted,
        allowed_days: timeAccessData.allowed_days,
        access_start_time: timeAccessData.access_start_time,
        access_end_time: timeAccessData.access_end_time,
      });
      toast.success('Time-based access updated successfully');
      setShowTimeAccessModal(false);
      fetchBank();
    } catch (error) {
      toast.error('Failed to update time access');
    }
  };

  const handleSaveLocationAccess = async () => {
    try {
      await api.patch(`/banks/${bankId}/`, {
        location_restricted: locationData.location_restricted,
        location_latitude: locationData.location_latitude,
        location_longitude: locationData.location_longitude,
        location_radius: locationData.location_radius,
      });
      toast.success('Location-based access updated successfully');
      setShowLocationModal(false);
      fetchBank();
    } catch (error) {
      toast.error('Failed to update location access');
    }
  };

  const handleGetCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            ...locationData,
            location_latitude: position.coords.latitude,
            location_longitude: position.coords.longitude,
          });
          toast.success('Location captured successfully');
        },
        () => {
          toast.error('Failed to get current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleDeleteBank = async () => {
    if (deleteConfirmText !== bank?.name) {
      toast.error(`Please type "${bank?.name}" to confirm deletion`);
      return;
    }
    try {
      await api.delete(`/banks/${bankId}/`);
      toast.success('Bank deleted successfully');
      router.push('/dashboard/banks');
    } catch (error) {
      toast.error('Failed to delete bank');
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
                    <img
                      src={
                        bank.logo.startsWith('http')
                          ? bank.logo
                          : bank.logo.startsWith('/media')
                          ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.split('/api/v1')[0]}${bank.logo}`
                          : bank.logo.startsWith('/')
                          ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.split('/api/v1')[0]}${bank.logo}`
                          : `${process.env.NEXT_PUBLIC_API_BASE_URL?.split('/api/v1')[0]}/media/${bank.logo}`
                      }
                      alt={bank.name}
                      className="h-28 w-28 object-contain"
                      onError={(e) => {
                        console.log('Image load failed for:', (e.target as HTMLImageElement).src);
                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<span className="text-5xl">🏦</span>';
                      }}
                    />
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

        {/* Settings Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          </div>

          {/* Bank Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Bank Status</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {bank?.is_active ? 'Bank is currently active' : 'Bank is currently inactive'}
                </p>
              </div>
              <button
                onClick={handleToggleStatus}
                disabled={togglingStatus}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  bank?.is_active
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                } disabled:opacity-50`}
              >
                {togglingStatus ? 'Processing...' : bank?.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>

          {/* Payment Access Level */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Payment View Access</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {bank?.payment_view_access === 'date_restricted' ? 'Date-restricted access' : 'Unrestricted access'}
                </p>
              </div>
              <button
                onClick={() => {
                  setAccessValue(bank?.payment_view_access || 'date_restricted');
                  setShowAccessModal(true);
                }}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Configure
              </button>
            </div>
          </div>

          {/* Payment Access Modal */}
          {showAccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Configure Payment Access</h3>
                  <button onClick={() => setShowAccessModal(false)} className="text-gray-400 hover:text-gray-600">
                    <BiX size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Access Type</label>
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="access"
                          value="date_restricted"
                          checked={accessValue === 'date_restricted'}
                          onChange={(e) => setAccessValue(e.target.value as 'date_restricted' | 'unrestricted')}
                          className="w-4 h-4"
                        />
                        <span className="ml-2 text-sm text-gray-700">Date Restricted</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="access"
                          value="unrestricted"
                          checked={accessValue === 'unrestricted'}
                          onChange={(e) => setAccessValue(e.target.value as 'date_restricted' | 'unrestricted')}
                          className="w-4 h-4"
                        />
                        <span className="ml-2 text-sm text-gray-700">Unrestricted</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleUpdateAccessLevel}
                      className="flex-1 px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAccessModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Time-based Access Control */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Time-based Access</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {bank?.access_restricted ? `Active on ${bank?.allowed_days} (${bank?.access_start_time} - ${bank?.access_end_time})` : 'Not restricted'}
                </p>
              </div>
              <button
                onClick={() => {
                  setTimeAccessData({
                    access_restricted: bank?.access_restricted || false,
                    allowed_days: bank?.allowed_days || 'Mon,Tue,Wed,Thu,Fri',
                    access_start_time: bank?.access_start_time || '09:00',
                    access_end_time: bank?.access_end_time || '17:00',
                  });
                  setShowTimeAccessModal(true);
                }}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Configure
              </button>
            </div>
          </div>

          {/* Time Access Modal */}
          {showTimeAccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Configure Time-based Access</h3>
                  <button onClick={() => setShowTimeAccessModal(false)} className="text-gray-400 hover:text-gray-600">
                    <BiX size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timeAccessData.access_restricted}
                      onChange={(e) => setTimeAccessData({ ...timeAccessData, access_restricted: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable time-based restrictions</span>
                  </label>
                  {timeAccessData.access_restricted && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Days</label>
                        <input
                          type="text"
                          value={timeAccessData.allowed_days}
                          onChange={(e) => setTimeAccessData({ ...timeAccessData, allowed_days: e.target.value })}
                          placeholder="Mon,Tue,Wed,Thu,Fri"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Comma-separated day names</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={timeAccessData.access_start_time}
                          onChange={(e) => setTimeAccessData({ ...timeAccessData, access_start_time: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                        <input
                          type="time"
                          value={timeAccessData.access_end_time}
                          onChange={(e) => setTimeAccessData({ ...timeAccessData, access_end_time: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSaveTimeAccess}
                      className="flex-1 px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowTimeAccessModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location-based Access Control */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Location-based Access</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {bank?.location_restricted ? `Restricted (${bank?.location_radius}km radius)` : 'No location restrictions'}
                </p>
              </div>
              <button
                onClick={() => {
                  setLocationData({
                    location_restricted: bank?.location_restricted || false,
                    location_latitude: bank?.location_latitude || 0,
                    location_longitude: bank?.location_longitude || 0,
                    location_radius: bank?.location_radius || 1,
                  });
                  setShowLocationModal(true);
                }}
                className="px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Configure
              </button>
            </div>
          </div>

          {/* Location Modal */}
          {showLocationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Configure Location-based Access</h3>
                  <button onClick={() => setShowLocationModal(false)} className="text-gray-400 hover:text-gray-600">
                    <BiX size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locationData.location_restricted}
                      onChange={(e) => setLocationData({ ...locationData, location_restricted: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable location-based restrictions</span>
                  </label>
                  {locationData.location_restricted && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={locationData.location_latitude}
                          onChange={(e) => setLocationData({ ...locationData, location_latitude: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={locationData.location_longitude}
                          onChange={(e) => setLocationData({ ...locationData, location_longitude: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Radius (km)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={locationData.location_radius}
                          onChange={(e) => setLocationData({ ...locationData, location_radius: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        />
                      </div>
                      <button
                        onClick={handleGetCurrentLocation}
                        className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
                      >
                        Use Current Location
                      </button>
                    </>
                  )}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSaveLocationAccess}
                      className="flex-1 px-4 py-2 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowLocationModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="mb-8">
          <div className="border border-red-200 bg-red-50 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-red-900">Danger Zone</h3>
                <p className="text-sm text-red-700 mt-1">Once you delete a bank, there is no going back. Be certain.</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <BiTrash size={16} /> Delete Bank
              </button>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Delete Bank</h3>
                  <button onClick={() => setShowDeleteConfirm(false)} className="text-gray-400 hover:text-gray-600">
                    <BiX size={24} />
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    This action cannot be undone. Please type the bank name to confirm deletion.
                  </p>
                  <p className="font-semibold text-gray-900 mb-3">Bank: <span className="text-red-600">{bank?.name}</span></p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={`Type "${bank?.name}" to confirm`}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteBank}
                    disabled={deleteConfirmText !== bank?.name}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
