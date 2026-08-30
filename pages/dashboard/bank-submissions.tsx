'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import Badge from '@/components/Common/Badge';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import ProfessionalTable from '@/components/Common/ProfessionalTable';
import Loading from '@/components/Common/Loading';
import { BankPaymentSubmission, Pilgrim } from '@/types';
import { useHajjYear } from '@/lib/stores/hajjYearStore';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { BiPlus, BiCheck, BiX } from 'react-icons/bi';
import { useTableState } from '@/lib/useTableState';
import { TableSearch, TableFilter, SortableHeader, TablePagination, TableControlsWrapper } from '@/components/Common/TableControls';
import { submissionMethodFilters, verificationStatusFilters } from '@/lib/filterConfigs';

export default function BankSubmissionsPage() {
  const { selectedHajjYear } = useHajjYear();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<BankPaymentSubmission[]>([]);
  const [creatingPilgrim, setCreatingPilgrim] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);

  // Use the new table state hook
  const tableState = useTableState<BankPaymentSubmission>(submissions, {
    initialPageSize: pageSize,
    searchableFields: ['reference_number', 'pilgrim_first_name', 'pilgrim_last_name', 'payer_name', 'bank_name'],
  });

  useEffect(() => {
    fetchSubmissions();
  }, [selectedHajjYear]);

  useEffect(() => {
    tableState.handlePageChange(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = selectedHajjYear ? `?hajj_year=${selectedHajjYear}` : '';
      const response = await api.get(`/bank-payment-submissions/${params}`);
      setSubmissions(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  // Filtering handled by useTableState hook

  const handleCreatePilgrim = async (submission: BankPaymentSubmission) => {
    if (!submission.pilgrim_first_name || !submission.pilgrim_last_name) {
      toast.error('Pilgrim name is incomplete');
      return;
    }

    setCreatingPilgrim(submission.id);

    try {
      const pilgrimData = {
        first_name: submission.pilgrim_first_name,
        last_name: submission.pilgrim_last_name,
        email: submission.pilgrim_email || '',
        phone: submission.pilgrim_phone || '',
        gender: submission.pilgrim_gender || 'M',
        nationality: 'Gambia',
        passport_number: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Gambia',
        date_of_birth: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_email: '',
        total_amount_due: submission.amount,
        hajj_year: selectedHajjYear,
      };

      const pilgrimRes = await api.post('/pilgrims/', pilgrimData);
      const newPilgrim: Pilgrim = pilgrimRes.data;

      // Create payment record linked to the new pilgrim
      const paymentData = {
        pilgrim: newPilgrim.id,
        amount: submission.amount,
        reference_number: submission.reference_number,
        status: 'confirmed',
        payment_date: submission.payment_date,
        description: submission.description || '',
        notes: `Bank: ${submission.bank_name}. Payer: ${submission.payer_name} (${submission.payer_relationship || 'N/A'})`,
        payer_name: submission.payer_name,
        payer_contact: submission.payer_contact,
        payer_relationship: submission.payer_relationship,
        hajj_year: selectedHajjYear,
      };

      await api.post('/payments/', paymentData);

      // Update submission to mark it as verified with created pilgrim
      await api.patch(`/bank-payment-submissions/${submission.id}/`, {
        status: 'verified',
        created_pilgrim_id: newPilgrim.id,
      });

      toast.success(`Pilgrim "${newPilgrim.full_name}" created successfully!`);
      fetchSubmissions();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || 'Failed to create pilgrim';
      toast.error(errorMsg);
    } finally {
      setCreatingPilgrim(null);
    }
  };

  const handleRejectSubmission = async (submission: BankPaymentSubmission) => {
    if (!confirm('Are you sure you want to reject this submission?')) return;

    try {
      await api.patch(`/bank-payment-submissions/${submission.id}/`, {
        status: 'failed',
      });
      toast.success('Submission rejected');
      fetchSubmissions();
    } catch (error) {
      toast.error('Failed to reject submission');
    }
  };

  const columns = [
    {
      key: 'reference_number',
      label: 'Reference',
      width: '15%',
      render: (v: string) => <span className="font-mono text-xs text-gray-500">{v}</span>,
    },
    {
      key: 'pilgrim_first_name',
      label: 'Pilgrim',
      width: '20%',
      render: (v: string, row: BankPaymentSubmission) => (
        <div>
          <p className="font-medium text-gray-900">
            {v} {row.pilgrim_last_name}
          </p>
          <p className="text-xs text-gray-500">{row.pilgrim_gender === 'M' ? 'Alagie' : 'Aja'}</p>
        </div>
      ),
    },
    {
      key: 'payer_name',
      label: 'Payer',
      width: '20%',
      render: (v: string) => (
        <div>
          <p className="font-medium text-gray-900">{v}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      width: '15%',
      render: (v: number) => <span className="font-mono font-medium text-gray-900">{formatCurrency(v)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (v: string) => (
        <Badge
          variant={v === 'pending' ? 'warning' : v === 'verified' ? 'success' : 'error'}
          size="sm"
        >
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'payment_date',
      label: 'Date',
      width: '15%',
      render: (v: string) => <span className="text-sm text-gray-600">{formatDate(v)}</span>,
    },
  ];

  if (loading) return <Layout><Loading /></Layout>;

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const verifiedCount = submissions.filter((s) => s.status === 'verified').length;

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        <PageHeader
          title="Bank Payment Submissions"
          description="Review and process incoming payments from banks. Create pilgrim records from submissions."
        />

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-amber-600 mt-2 font-mono">{pendingCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2 font-mono">{verifiedCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-600">Total Amount (Pending)</p>
              <p className="text-2xl font-bold text-gray-900 mt-2 font-mono">
                {formatCurrency(
                  submissions
                    .filter((s) => s.status === 'pending')
                    .reduce((sum, s) => sum + s.amount, 0)
                )}
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by reference, pilgrim, or payer name..."
              value={tableState.searchQuery}
              onChange={(e) => tableState.handleSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
            <select
              value={String(tableState.filters.status || '')}
              onChange={(e) => tableState.handleFilter('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Submissions Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <ProfessionalTable
              columns={columns}
              data={tableState.paginatedData}
              loading={loading}
              emptyMessage="No submissions found"
              actions={(row: BankPaymentSubmission) => (
                <div className="flex gap-2">
                  {row.status === 'pending' && (
                    <>
                      <ProfessionalButton
                        variant="primary"
                        size="sm"
                        icon={<BiPlus size={14} />}
                        onClick={() => handleCreatePilgrim(row)}
                        loading={creatingPilgrim === row.id}
                      >
                        Create Pilgrim
                      </ProfessionalButton>
                      <button
                        onClick={() => handleRejectSubmission(row)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Reject submission"
                      >
                        <BiX size={16} />
                      </button>
                    </>
                  )}
                  {row.status === 'verified' && (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <BiCheck size={16} />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Info Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-emerald-900 mb-2">💡 How it works:</p>
            <ol className="text-sm text-emerald-700 space-y-1 list-decimal list-inside">
              <li>Bank submits payment with pilgrim information</li>
              <li>Review the submission details above</li>
              <li>Click &quot;Create Pilgrim&quot; to auto-generate the pilgrim record</li>
              <li>Payment is automatically linked to the new pilgrim</li>
              <li>Submission is marked as verified</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
}
