'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import Badge from '@/components/Common/Badge';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import ProfessionalTable from '@/components/Common/ProfessionalTable';
import { BiPlus, BiPencil, BiTrash, BiX, BiSearch, BiEdit, BiTime } from 'react-icons/bi';
import { TableSkeleton } from '@/components/Common/Skeleton';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Bank {
  id: number;
  name: string;
  is_active: boolean;
  payment_view_access: 'date_restricted' | 'unrestricted';
  created_at: string;
  access_restricted?: boolean;
  allowed_days?: string;
  access_start_time?: string;
  access_end_time?: string;
  location_restricted?: boolean;
  location_latitude?: number;
  location_longitude?: number;
  location_radius?: number; // in kilometers
}

export default function BanksManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankFormData, setBankFormData] = useState({ name: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingAccessLevel, setEditingAccessLevel] = useState<number | null>(null);
  const [editingAccessValue, setEditingAccessValue] = useState<'date_restricted' | 'unrestricted'>('date_restricted');
  const [updatingAccess, setUpdatingAccess] = useState(false);
  const [showAccessTimeForm, setShowAccessTimeForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [togglingBank, setTogglingBank] = useState<number | null>(null);
  const [bankAccessTimeData, setBankAccessTimeData] = useState({
    access_restricted: false,
    allowed_days: 'Mon,Tue,Wed,Thu,Fri',
    access_start_time: '09:00',
    access_end_time: '17:00',
  });
  const [bankLocationData, setBankLocationData] = useState({
    location_restricted: false,
    location_latitude: 0,
    location_longitude: 0,
    location_radius: 1, // 1 km radius
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    filterBanks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, banks]);

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

  const filterBanks = () => {
    let filtered = banks;

    if (searchQuery) {
      filtered = filtered.filter((bank) =>
        bank.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter((bank) => bank.is_active === isActive);
    }

    setFilteredBanks(filtered);
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankFormData.name.trim()) {
      toast.error('Bank name is required');
      return;
    }
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

  const handleToggleBankStatus = async (id: number, currentStatus: boolean) => {
    try {
      setTogglingBank(id);
      await api.patch(`/banks/${id}/`, { is_active: !currentStatus });
      toast.success(`Bank ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchBanks();
    } catch (error) {
      toast.error('Failed to toggle bank status');
    } finally {
      setTogglingBank(null);
    }
  };

  const handleDeleteBank = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bank?')) return;
    try {
      await api.delete(`/banks/${id}/`);
      toast.success('Bank deleted successfully');
      fetchBanks();
    } catch (error) {
      toast.error('Failed to delete bank');
    }
  };

  const handleUpdateAccessLevel = async (bankId: number) => {
    try {
      setUpdatingAccess(true);
      await api.patch(`/banks/${bankId}/`, {
        payment_view_access: editingAccessValue,
      });
      toast.success('Access level updated successfully');
      setEditingAccessLevel(null);
      fetchBanks();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update access level');
    } finally {
      setUpdatingAccess(false);
    }
  };

  const handleOpenLocationForm = (bank: Bank) => {
    setSelectedBankId(bank.id);
    setBankLocationData({
      location_restricted: bank.location_restricted || false,
      location_latitude: bank.location_latitude || 0,
      location_longitude: bank.location_longitude || 0,
      location_radius: bank.location_radius || 1,
    });
    setShowLocationForm(true);
  };

  const handleSaveLocationRestrictions = async () => {
    if (!selectedBankId) return;
    try {
      await api.patch(`/banks/${selectedBankId}/`, bankLocationData);
      toast.success('Location restrictions updated successfully');
      setShowLocationForm(false);
      setSelectedBankId(null);
      fetchBanks();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update location restrictions');
    }
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBankLocationData({
            ...bankLocationData,
            location_latitude: parseFloat(position.coords.latitude.toFixed(6)),
            location_longitude: parseFloat(position.coords.longitude.toFixed(6)),
          });
          toast.success('Location captured successfully');
        },
        () => {
          toast.error('Unable to get current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Bank Name',
      width: '30%',
      render: (v: string) => <span className="font-medium text-gray-900">{v}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      width: '20%',
      render: (v: boolean) => (
        <Badge variant={v ? 'success' : 'warning'} size="sm">
          {v ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'payment_view_access',
      label: 'Payment Access',
      width: '30%',
      render: (v: string) => (
        <Badge
          variant={v === 'unrestricted' ? 'success' : 'warning'}
          size="sm"
        >
          {v === 'unrestricted' ? '🔓 Unrestricted' : '🔒 Date Filter Only'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      width: '20%',
      render: (v: string) => <span className="text-sm text-gray-600">{new Date(v).toLocaleDateString()}</span>,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Banks</h1>
            <p className="text-gray-600 mt-1">Manage bank accounts for payment processing</p>
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
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200 animate-slideInUp">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Create New Bank</h2>
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
                  <input
                    type="text"
                    value={bankFormData.name}
                    onChange={(e) => setBankFormData({ name: e.target.value })}
                    placeholder="e.g., First Bank, Standard Chartered"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <ProfessionalButton type="submit" variant="primary" size="md">
                    Create Bank
                  </ProfessionalButton>
                  <ProfessionalButton
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setShowBankForm(false);
                      setBankFormData({ name: '' });
                    }}
                  >
                    Cancel
                  </ProfessionalButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <BiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by bank name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white text-sm"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white cursor-pointer text-sm"
            >
              <option value="">All Banks</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Banks Table */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Banks</h2>
              <p className="text-sm text-gray-500 mt-0.5">{filteredBanks.length} bank{filteredBanks.length !== 1 ? 's' : ''} configured</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <TableSkeleton rows={5} columnCount={3} />
            ) : (
              <ProfessionalTable
                columns={columns}
                data={filteredBanks}
                loading={false}
                emptyMessage="No banks found • Click 'Add Bank' to create one"
                actions={(row: Bank) => (
                  <div className="flex gap-2">
                    <ProfessionalButton
                      variant={row.is_active ? 'ghost' : 'danger'}
                      size="sm"
                      onClick={() => handleToggleBankStatus(row.id, row.is_active)}
                      loading={togglingBank === row.id}
                    >
                      {row.is_active ? 'Deactivate' : 'Activate'}
                    </ProfessionalButton>
                    <ProfessionalButton
                      variant="ghost"
                      size="sm"
                      icon={<BiPencil size={14} />}
                      onClick={() => {
                        setEditingAccessLevel(row.id);
                        setEditingAccessValue(row.payment_view_access);
                      }}
                    >
                      Access
                    </ProfessionalButton>
                    <ProfessionalButton
                      variant="ghost"
                      size="sm"
                      icon={<BiTime size={14} />}
                      onClick={() => handleOpenLocationForm(row)}
                    >
                      Location
                    </ProfessionalButton>
                    <ProfessionalButton
                      variant="ghost"
                      size="sm"
                      icon={<BiPencil size={14} />}
                      onClick={() => router.push(`/dashboard/banks/${row.id}`)}
                    >
                      Manage
                    </ProfessionalButton>
                    <button
                      onClick={() => handleDeleteBank(row.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete bank"
                    >
                      <BiTrash size={16} />
                    </button>
                  </div>
                )}
              />
            )}
          </div>
        </div>

        {/* Access Level Modal */}
        {editingAccessLevel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Configure Payment Access Level
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Choose what payment data this bank admin can view
              </p>

              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition" style={{borderColor: editingAccessValue === 'date_restricted' ? '#2563eb' : '#e5e7eb', backgroundColor: editingAccessValue === 'date_restricted' ? '#f0f9ff' : '#f9fafb'}}>
                  <input
                    type="radio"
                    name="access"
                    value="date_restricted"
                    checked={editingAccessValue === 'date_restricted'}
                    onChange={(e) => setEditingAccessValue(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">🔒 Date Filter Only</p>
                    <p className="text-xs text-gray-600">Bank admin can only view payments using date filter - more restrictive</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition" style={{borderColor: editingAccessValue === 'unrestricted' ? '#2563eb' : '#e5e7eb', backgroundColor: editingAccessValue === 'unrestricted' ? '#f0f9ff' : '#f9fafb'}}>
                  <input
                    type="radio"
                    name="access"
                    value="unrestricted"
                    checked={editingAccessValue === 'unrestricted'}
                    onChange={(e) => setEditingAccessValue(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">🔓 Unrestricted</p>
                    <p className="text-xs text-gray-600">Bank admin can view all payments without date filter - less restrictive</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <ProfessionalButton
                  variant="primary"
                  size="md"
                  onClick={() => handleUpdateAccessLevel(editingAccessLevel)}
                  loading={updatingAccess}
                  className="flex-1"
                >
                  Save
                </ProfessionalButton>
                <ProfessionalButton
                  variant="secondary"
                  size="md"
                  onClick={() => setEditingAccessLevel(null)}
                  className="flex-1"
                >
                  Cancel
                </ProfessionalButton>
              </div>
            </div>
          </div>
        )}

        {/* Location Restriction Modal */}
        {showLocationForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Location Settings</h2>
                <button
                  onClick={() => setShowLocationForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <BiX size={24} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Restrict bank portal access to a specific geographic location
              </p>

              <div className="space-y-4 mb-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bankLocationData.location_restricted}
                    onChange={(e) => setBankLocationData({
                      ...bankLocationData,
                      location_restricted: e.target.checked,
                    })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-900">Enable location restrictions</span>
                </label>

                {bankLocationData.location_restricted && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={bankLocationData.location_latitude}
                        onChange={(e) => setBankLocationData({
                          ...bankLocationData,
                          location_latitude: parseFloat(e.target.value),
                        })}
                        placeholder="e.g. 14.6091"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={bankLocationData.location_longitude}
                        onChange={(e) => setBankLocationData({
                          ...bankLocationData,
                          location_longitude: parseFloat(e.target.value),
                        })}
                        placeholder="e.g. -13.1939"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Radius (km)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={bankLocationData.location_radius}
                        onChange={(e) => setBankLocationData({
                          ...bankLocationData,
                          location_radius: parseFloat(e.target.value),
                        })}
                        placeholder="e.g. 1.5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      />
                    </div>

                    <button
                      onClick={handleGetCurrentLocation}
                      className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-lg transition"
                    >
                      📍 Use Current Location
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <ProfessionalButton
                  variant="primary"
                  size="md"
                  onClick={handleSaveLocationRestrictions}
                  className="flex-1"
                >
                  Save
                </ProfessionalButton>
                <ProfessionalButton
                  variant="secondary"
                  size="md"
                  onClick={() => setShowLocationForm(false)}
                  className="flex-1"
                >
                  Cancel
                </ProfessionalButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
