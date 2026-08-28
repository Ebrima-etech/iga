import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Loading from '@/components/Common/Loading';
import { Payment } from '@/types';
import api from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const [banks, setBanks] = useState<any[]>([]);

  useEffect(() => {
    fetchPayments();
    fetchBanks();
  }, []);

  useEffect(() => {
    filterPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, bankFilter, payments]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/');
      setPayments(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
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

  const filterPayments = () => {
    let filtered = payments;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.reference_number.includes(searchQuery) ||
          p.pilgrim_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (bankFilter) {
      filtered = filtered.filter((p) => p.bank.toString() === bankFilter);
    }

    setFilteredPayments(filtered);
  };

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const confirmedAmount = filteredPayments
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Track all payments from banks</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{filteredPayments.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Confirmed Amount</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(confirmedAmount)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by reference or pilgrim name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">All Banks</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Pilgrim</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Bank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm font-semibold text-primary-600">{payment.reference_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payment.pilgrim_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{payment.bank_name}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(payment.payment_date)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats by Status */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['pending', 'confirmed', 'failed', 'refunded'].map((status) => {
              const statusPayments = filteredPayments.filter((p) => p.status === status);
              const amount = statusPayments.reduce((sum, p) => sum + p.amount, 0);
              return (
                <div key={status} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 capitalize">{status}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{statusPayments.length}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(amount)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
