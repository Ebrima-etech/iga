'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import Loading from '@/components/Common/Loading';
import { TableSkeleton } from '@/components/Common/Skeleton';
import { Payment } from '@/types';
import { useHajjYear } from '@/lib/stores/hajjYearStore';
import api from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import { BiPlus, BiShow, BiHide } from 'react-icons/bi';
import { useTableState } from '@/lib/useTableState';
import { TableSearch, TableFilter, SortableHeader, TablePagination, TableControlsWrapper } from '@/components/Common/TableControls';
import { paymentStatusFilters } from '@/lib/filterConfigs';
import Badge from '@/components/Common/Badge';

type PaymentRecord = Payment & {
  bank_name?: string;
  payer_name?: string;
  payer_contact?: string;
  payer_relationship?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const { selectedHajjYear } = useHajjYear();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set());

  // Use the new table state hook
  const tableState = useTableState<PaymentRecord>(payments, {
    initialPageSize: pageSize,
    searchableFields: ['reference_number', 'pilgrim_name', 'bank_name', 'payer_name'],
  });

  useEffect(() => {
    console.log('Payments page mounted, fetching data...');
    fetchPayments();
    fetchBanks();
  }, [selectedHajjYear]);

  useEffect(() => {
    tableState.handlePageChange(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const fetchPayments = async () => {
    try {
      console.log('Fetching payments from bank submissions...');
      setLoading(true);
      const params = selectedHajjYear ? `?hajj_year=${selectedHajjYear}` : '';
      const response = await api.get(`/bank-payment-submissions/${params}`);
      console.log('Payments response:', response.data);
      // Map bank_payment_submission to Payment type for compatibility
      const submissions = response.data.results || response.data;
      const mappedPayments = submissions.map((sub: any) => ({
        id: sub.id,
        pilgrim_id: sub.pilgrim_id,
        pilgrim_name: `${sub.pilgrim_first_name} ${sub.pilgrim_last_name}`.trim(),
        gender: sub.pilgrim_gender,
        bank: sub.bank,
        bank_name: sub.bank_name,
        amount: sub.amount,
        reference_number: sub.reference_number,
        status: sub.status,
        payment_date: sub.payment_date,
        payer_name: sub.payer_name,
        payer_contact: sub.payer_contact,
        payer_relationship: sub.payer_relationship,
      }));
      setPayments(mappedPayments);
    } catch (error: any) {
      console.error('Failed to fetch payments:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await api.get('/banks/');
      setBanks(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    }
  };

  const toggleFieldVisibility = (fieldId: string) => {
    const newHidden = new Set(hiddenFields);
    if (newHidden.has(fieldId)) {
      newHidden.delete(fieldId);
    } else {
      newHidden.add(fieldId);
    }
    setHiddenFields(newHidden);
  };

  const isFieldHidden = (fieldId: string) => hiddenFields.has(fieldId);

  // Calculate stats from filtered data
  const totalAmount = tableState.filteredData.reduce((sum, p) => sum + parseFloat(String(p.amount)), 0);
  const confirmedAmount = tableState.filteredData
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + parseFloat(String(p.amount)), 0);

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-1">Track all payments from banks</p>
          </div>
          <ProfessionalButton
            variant="primary"
            size="md"
            icon={<BiPlus size={18} />}
            onClick={() => router.push('/dashboard/record-payment')}
            className="hidden"
          >
            Record Payment
          </ProfessionalButton>
        </div>

        <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Filtered Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-2 font-mono">{tableState.totalItems}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <button
                onClick={() => toggleFieldVisibility('payments-total-amount')}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title={isFieldHidden('payments-total-amount') ? 'Show' : 'Hide'}
              >
                {isFieldHidden('payments-total-amount') ? <BiHide size={16} className="text-gray-600" /> : <BiShow size={16} className="text-gray-600" />}
              </button>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2 font-mono">
              {isFieldHidden('payments-total-amount') ? '••••••' : formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Confirmed Amount</p>
              <button
                onClick={() => toggleFieldVisibility('payments-confirmed-amount')}
                className="p-1 hover:bg-emerald-200 rounded transition-colors"
                title={isFieldHidden('payments-confirmed-amount') ? 'Show' : 'Hide'}
              >
                {isFieldHidden('payments-confirmed-amount') ? <BiHide size={16} className="text-emerald-600" /> : <BiShow size={16} className="text-emerald-600" />}
              </button>
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-2 font-mono">
              {isFieldHidden('payments-confirmed-amount') ? '••••••' : formatCurrency(confirmedAmount)}
            </p>
          </div>
        </div>

        {/* Advanced Search, Filters, and Pagination */}
        <TableControlsWrapper
          title="Payment Transactions"
          searchValue={tableState.searchQuery}
          onSearchChange={tableState.handleSearch}
          filters={
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TableFilter
                label="Status"
                value={String(tableState.filters.status || '')}
                options={paymentStatusFilters}
                onChange={(value) => tableState.handleFilter('status', value)}
              />
              <TableFilter
                label="Bank"
                value={String(tableState.filters.bank || '')}
                options={banks.map((b) => ({ label: b.name, value: b.id }))}
                onChange={(value) => tableState.handleFilter('bank', value)}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Results per page</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
            </div>
          }
          onClearFilters={tableState.handleClearFilters}
          hasActiveFilters={
            tableState.searchQuery !== '' ||
            Object.values(tableState.filters).some((v) => v !== null && v !== '')
          }
        >
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {loading ? (
              <TableSkeleton rows={8} columnCount={6} />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <SortableHeader
                          label="Reference"
                          sortKey="reference_number"
                          currentSort={tableState.sortConfig}
                          onSort={tableState.handleSort}
                        />
                        <SortableHeader
                          label="Pilgrim"
                          sortKey="pilgrim_name"
                          currentSort={tableState.sortConfig}
                          onSort={tableState.handleSort}
                        />
                        <SortableHeader
                          label="Bank"
                          sortKey="bank_name"
                          currentSort={tableState.sortConfig}
                          onSort={tableState.handleSort}
                        />
                        <SortableHeader
                          label="Amount"
                          sortKey="amount"
                          currentSort={tableState.sortConfig}
                          onSort={tableState.handleSort}
                        />
                        <SortableHeader
                          label="Status"
                          sortKey="status"
                          currentSort={tableState.sortConfig}
                          onSort={tableState.handleSort}
                        />
                        <SortableHeader
                          label="Date"
                          sortKey="payment_date"
                          currentSort={tableState.sortConfig}
                          onSort={tableState.handleSort}
                        />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tableState.paginatedData.length > 0 ? (
                        tableState.paginatedData.map((payment) => (
                          <tr
                            key={payment.id}
                            onClick={() => router.push(`/dashboard/payments/${payment.id}`)}
                            className="hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{payment.reference_number}</td>
                            <td className="px-4 py-3.5 text-sm text-gray-900 font-medium">
                              {payment.gender === 'M' ? 'Alagie' : payment.gender === 'F' ? 'Aja' : ''} {payment.pilgrim_name}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">{payment.bank_name}</td>
                            <td className="px-4 py-3.5 text-sm font-mono font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-4 py-3.5 text-sm">
                              <Badge
                                variant={
                                  payment.status === 'confirmed'
                                    ? 'success'
                                    : payment.status === 'pending'
                                    ? 'warning'
                                    : 'error'
                                }
                                size="sm"
                              >
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(payment.payment_date)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            No payments found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {tableState.totalItems > 0 && (
                  <TablePagination
                    currentPage={tableState.currentPage}
                    totalPages={tableState.totalPages}
                    pageSize={pageSize}
                    totalItems={tableState.totalItems}
                    onPageChange={tableState.handlePageChange}
                    onPageSizeChange={setPageSize}
                  />
                )}
              </>
            )}
          </div>
        </TableControlsWrapper>

        {/* Stats by Status */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Payment Status Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['pending', 'confirmed', 'failed', 'refunded'].map((status) => {
              const statusPayments = tableState.filteredData.filter((p) => p.status === status);
              const amount = statusPayments.reduce((sum, p) => sum + parseFloat(String(p.amount)), 0);
              return (
                <div key={status} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-600 capitalize">{status}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 font-mono">{statusPayments.length}</p>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{formatCurrency(amount)}</p>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
}
