import React, { useState, useEffect } from 'react';
import { BiX, BiDownload, BiSearch, BiCalendarAlt, BiChevronDown, BiChevronUp } from 'react-icons/bi';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Receipt, ReceiptSummary } from '@/types';

export default function ReceiptManagement() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [summary, setSummary] = useState<ReceiptSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, [selectedDate]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedDate) {
        params.append('start_date', selectedDate);
        params.append('end_date', selectedDate);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const [receiptsRes, summaryRes] = await Promise.all([
        api.get(`/receipts/?${params.toString()}`),
        api.get('/receipts/summary/'),
      ]);

      setReceipts(receiptsRes.data.results || receiptsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReceipts();
  };

  const exportReceipts = async () => {
    try {
      const response = await api.get('/receipts/?format=csv');
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipts-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Receipts exported successfully');
    } catch (error) {
      console.error('Failed to export receipts:', error);
      toast.error('Failed to export receipts');
    }
  };

  const filteredReceipts = receipts.filter((receipt) =>
    receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Receipt Management</h2>
          <p className="text-sm text-gray-600 mt-1">Track and manage generated payment receipts</p>
        </div>
        <button
          onClick={exportReceipts}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <BiDownload size={18} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-semibold">Total Receipts</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{summary.total_receipts}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-700 font-semibold">Total Amount</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">D {parseFloat(summary.total_amount).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by receipt number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="relative">
          <BiCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Receipts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading receipts...</div>
        ) : filteredReceipts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No receipts found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Receipt #</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment Reference</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Signatory ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created At</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReceipts.map((receipt) => (
                  <React.Fragment key={receipt.id}>
                    <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-sm font-mono text-emerald-600 font-semibold">{receipt.receipt_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{receipt.payment_reference}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">#{receipt.signatory}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(receipt.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setExpandedId(expandedId === receipt.id ? null : receipt.id)}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                        >
                          {expandedId === receipt.id ? (
                            <>
                              <BiChevronUp size={16} /> Hide
                            </>
                          ) : (
                            <>
                              <BiChevronDown size={16} /> View
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedId === receipt.id && (
                      <tr className="bg-gradient-to-r from-gray-50 to-white">
                        <td colSpan={5} className="px-6 py-6">
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-gray-900">Receipt Details</h4>
                            <div className="grid grid-cols-4 gap-6">
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Receipt Number</p>
                                <p className="text-lg font-bold text-emerald-600 mt-2">{receipt.receipt_number}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Payment Reference</p>
                                <p className="text-sm font-medium text-blue-600 mt-2 font-mono">{receipt.payment_reference}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Signatory ID</p>
                                <p className="text-lg font-bold text-purple-600 mt-2">#{receipt.signatory}</p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Created At</p>
                                <p className="text-sm font-medium text-gray-900 mt-2">{new Date(receipt.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
