'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import Badge from '@/components/Common/Badge';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import ProfessionalTable from '@/components/Common/ProfessionalTable';
import { BiPlus, BiPencil, BiTrash, BiX, BiSearch } from 'react-icons/bi';
import { TableSkeleton } from '@/components/Common/Skeleton';
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
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankFormData, setBankFormData] = useState({ name: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const columns = [
    {
      key: 'name',
      label: 'Bank Name',
      width: '40%',
      render: (v: string) => <span className="font-medium text-gray-900">{v}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      width: '30%',
      render: (v: boolean) => (
        <Badge variant={v ? 'success' : 'warning'} size="sm">
          {v ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      width: '30%',
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
      </div>
    </Layout>
  );
}
