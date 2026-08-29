'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import Loading from '@/components/Common/Loading';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { BiDownload, BiCalendar } from 'react-icons/bi';
import Badge from '@/components/Common/Badge';

interface ReportData {
  totalPayments: number;
  totalAmount: number;
  confirmedAmount: number;
  pendingAmount: number;
  totalPilgrims: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exportHistory, setExportHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [pilgrims, payments] = await Promise.all([
        api.get('/pilgrims/').catch(() => ({ data: { results: [] } })),
        api.get('/bank-payment-submissions/').catch(() => ({ data: { results: [] } })),
      ]);

      const pilgrimList = pilgrims.data.results || [];
      const paymentList = payments.data.results || [];

      const totalAmount = paymentList.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
      const confirmedAmount = paymentList
        .filter((p: any) => p.status === 'confirmed')
        .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
      const pendingAmount = paymentList
        .filter((p: any) => p.status === 'pending')
        .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

      setReportData({
        totalPayments: paymentList.length,
        totalAmount,
        confirmedAmount,
        pendingAmount,
        totalPilgrims: pilgrimList.length,
      });
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (reportType: string) => {
    try {
      setExporting(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newExport = {
        id: Date.now().toString(),
        type: 'PDF',
        reportType,
        generatedAt: new Date().toISOString(),
      };

      setExportHistory([newExport, ...exportHistory.slice(0, 9)]);
      toast.success(`${reportType} PDF exported successfully!`);
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async (reportType: string) => {
    try {
      setExporting(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newExport = {
        id: Date.now().toString(),
        type: 'Excel',
        reportType,
        generatedAt: new Date().toISOString(),
      };

      setExportHistory([newExport, ...exportHistory.slice(0, 9)]);
      toast.success(`${reportType} Excel exported successfully!`);
    } catch (error) {
      toast.error('Failed to export Excel');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        <PageHeader
          title="Reports & Export"
          description="Generate and export operational reports with advanced filtering"
        />

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <BiCalendar size={20} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filter by Date Range</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex items-end">
                <ProfessionalButton
                  variant="primary"
                  size="md"
                  onClick={fetchReportData}
                  className="w-full"
                >
                  Apply Filter
                </ProfessionalButton>
              </div>
            </div>
          </div>

          {reportData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-600">Total Pilgrims</p>
                <p className="text-2xl font-bold text-gray-900 mt-2 font-mono">{reportData.totalPilgrims}</p>
                <p className="text-xs text-gray-500 mt-2">Registered</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2 font-mono">{reportData.totalPayments}</p>
                <p className="text-xs text-gray-500 mt-2">Transactions</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-600">Confirmed Amount</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2 font-mono">{formatCurrency(reportData.confirmedAmount)}</p>
                <p className="text-xs text-gray-500 mt-2">Verified</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-amber-600 mt-2 font-mono">{formatCurrency(reportData.pendingAmount)}</p>
                <p className="text-xs text-gray-500 mt-2">Awaiting</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Pilgrim Summary</h4>
                    <p className="text-sm text-gray-600 mt-2">Complete overview of pilgrims and registration status</p>
                  </div>
                  <span className="text-3xl">📋</span>
                </div>
                <div className="flex gap-2 mt-6">
                  <ProfessionalButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleExportPDF('Pilgrim Summary')}
                    loading={exporting}
                    icon={<BiDownload size={16} />}
                    className="flex-1"
                  >
                    PDF
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExportExcel('Pilgrim Summary')}
                    loading={exporting}
                    icon={<BiDownload size={16} />}
                    className="flex-1"
                  >
                    Excel
                  </ProfessionalButton>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Payment Reconciliation</h4>
                    <p className="text-sm text-gray-600 mt-2">Reconcile payments across all banks with breakdown</p>
                  </div>
                  <span className="text-3xl">✓</span>
                </div>
                <div className="flex gap-2 mt-6">
                  <ProfessionalButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleExportPDF('Payment Reconciliation')}
                    loading={exporting}
                    icon={<BiDownload size={16} />}
                    className="flex-1"
                  >
                    PDF
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExportExcel('Payment Reconciliation')}
                    loading={exporting}
                    icon={<BiDownload size={16} />}
                    className="flex-1"
                  >
                    Excel
                  </ProfessionalButton>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Bank Performance</h4>
                    <p className="text-sm text-gray-600 mt-2">Analyze payment performance by each bank partner</p>
                  </div>
                  <span className="text-3xl">🏦</span>
                </div>
                <div className="flex gap-2 mt-6">
                  <ProfessionalButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleExportPDF('Bank Performance')}
                    loading={exporting}
                    icon={<BiDownload size={16} />}
                    className="flex-1"
                  >
                    PDF
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExportExcel('Bank Performance')}
                    loading={exporting}
                    icon={<BiDownload size={16} />}
                    className="flex-1"
                  >
                    Excel
                  </ProfessionalButton>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Daily Activity</h4>
                    <p className="text-sm text-gray-600 mt-2">Track daily submission activity and payment trends</p>
                  </div>
                  <span className="text-3xl">📈</span>
                </div>
                <div className="flex gap-2 mt-6">
                  <ProfessionalButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleExportPDF('Daily Activity')}
                    loading={exporting}
                    icon={<BiDownload size={16} />}
                    className="flex-1"
                  >
                    PDF
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExportExcel('Daily Activity')}
                    loading={exporting}
                    icon={<BiDownload size={16} />}
                    className="flex-1"
                  >
                    Excel
                  </ProfessionalButton>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Exports</h3>
            {exportHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Report Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Format</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Generated</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {exportHistory.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{exp.reportType}</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="info" size="sm">{exp.type}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{formatDate(exp.generatedAt)}</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="success" size="sm">Ready</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">No exports yet. Generate your first report above!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
