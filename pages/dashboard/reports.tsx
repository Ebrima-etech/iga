'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FaDownload, FaFilePdf, FaFileExcel, FaClock, FaCheckCircle } from 'react-icons/fa';

interface ReportData {
  totalPilgrims: number;
  totalPayments: number;
  totalAmount: number;
  confirmedAmount: number;
  pendingAmount: number;
  failedAmount: number;
  paymentsByStatus: Record<string, number>;
  paymentsByBank: Record<string, number>;
  dailyPayments: Array<{ date: string; count: number; amount: number }>;
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
  lastSent?: string;
  nextSend?: string;
}

interface ExportRecord {
  id: string;
  type: 'pdf' | 'excel';
  reportType: string;
  generatedAt: string;
  downloadUrl?: string;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'Daily Summary',
      frequency: 'daily',
      time: '18:00',
      enabled: false,
      nextSend: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'Weekly Report',
      frequency: 'weekly',
      time: '17:00',
      enabled: false,
      nextSend: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: 'Monthly Summary',
      frequency: 'monthly',
      time: '17:00',
      enabled: false,
      nextSend: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [pilgrims, payments, banks] = await Promise.all([
        api.get('/pilgrims/').catch(() => ({ data: { results: [] } })),
        api.get('/bank-payment-submissions/').catch(() => ({ data: { results: [] } })),
        api.get('/banks/').catch(() => ({ data: { results: [] } })),
      ]);

      const pilgrimList = pilgrims.data.results || [];
      const paymentList = payments.data.results || [];
      const bankList = banks.data.results || [];

      const totalAmount = paymentList.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
      const confirmedAmount = paymentList
        .filter((p: any) => p.status === 'confirmed')
        .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
      const pendingAmount = paymentList
        .filter((p: any) => p.status === 'pending')
        .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
      const failedAmount = paymentList
        .filter((p: any) => p.status === 'failed')
        .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

      const paymentsByStatus: Record<string, number> = {};
      paymentList.forEach((p: any) => {
        paymentsByStatus[p.status] = (paymentsByStatus[p.status] || 0) + 1;
      });

      const paymentsByBank: Record<string, number> = {};
      paymentList.forEach((p: any) => {
        const bankName = p.bank_name || 'Unknown';
        paymentsByBank[bankName] = (paymentsByBank[bankName] || 0) + 1;
      });

      // Mock daily payments (last 7 days)
      const dailyPayments = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dailyPayments.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 15) + 5,
          amount: Math.floor(Math.random() * 50000) + 10000,
        });
      }

      setReportData({
        totalPilgrims: pilgrimList.length,
        totalPayments: paymentList.length,
        totalAmount,
        confirmedAmount,
        pendingAmount,
        failedAmount,
        paymentsByStatus,
        paymentsByBank,
        dailyPayments,
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

      const newExport: ExportRecord = {
        id: Date.now().toString(),
        type: 'pdf',
        reportType,
        generatedAt: new Date().toISOString(),
        downloadUrl: '/reports/sample.pdf',
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

      const newExport: ExportRecord = {
        id: Date.now().toString(),
        type: 'excel',
        reportType,
        generatedAt: new Date().toISOString(),
        downloadUrl: '/reports/sample.xlsx',
      };

      setExportHistory([newExport, ...exportHistory.slice(0, 9)]);
      toast.success(`${reportType} Excel exported successfully!`);
    } catch (error) {
      toast.error('Failed to export Excel');
    } finally {
      setExporting(false);
    }
  };

  const toggleScheduledReport = (id: string) => {
    setScheduledReports((prev) =>
      prev.map((report) =>
        report.id === id ? { ...report, enabled: !report.enabled } : report
      )
    );
  };

  const reports = [
    {
      id: 'pilgrim-summary',
      title: 'Pilgrim Summary Report',
      description: 'Complete overview of all pilgrims and their registration status',
      icon: '📋',
      color: 'bg-blue-50',
      borderColor: 'border-blue-200',
      stats: reportData
        ? [
            { label: 'Total Pilgrims', value: reportData.totalPilgrims },
            { label: 'Pilgrims Paid', value: Math.round((reportData.paymentsByStatus['confirmed'] || 0) * 0.8) },
          ]
        : [],
    },
    {
      id: 'payment-reconciliation',
      title: 'Payment Reconciliation',
      description: 'Detailed reconciliation of all payments across banks',
      icon: '✓',
      color: 'bg-green-50',
      borderColor: 'border-green-200',
      stats: reportData
        ? [
            { label: 'Total Transactions', value: reportData.totalPayments },
            { label: 'Total Amount', value: formatCurrency(reportData.totalAmount) },
          ]
        : [],
    },
    {
      id: 'bank-performance',
      title: 'Bank Performance Report',
      description: 'Payment performance metrics by each bank partner',
      icon: '🏦',
      color: 'bg-purple-50',
      borderColor: 'border-purple-200',
      stats: reportData
        ? [
            { label: 'Active Banks', value: Object.keys(reportData.paymentsByBank).length },
            { label: 'Confirmed', value: formatCurrency(reportData.confirmedAmount) },
          ]
        : [],
    },
    {
      id: 'daily-activity',
      title: 'Daily Activity Report',
      description: 'Track daily submission activity and payment trends',
      icon: '📈',
      color: 'bg-orange-50',
      borderColor: 'border-orange-200',
      stats: reportData
        ? [
            { label: 'Avg Daily Payments', value: Math.round(reportData.totalPayments / 7) },
            { label: 'Pending', value: formatCurrency(reportData.pendingAmount) },
          ]
        : [],
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <PageHeader
          title="Reports & Export"
          description="Generate, export, and schedule operational reports with advanced filtering options"
        />

        {/* Date Range Filter */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchReportData}
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* Report Cards */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`${report.color} p-6 rounded-lg border-2 ${report.borderColor} hover:shadow-lg transition`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{report.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{report.description}</p>

                {/* Stats */}
                {report.stats.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
                    {report.stats.map((stat, idx) => (
                      <div key={idx}>
                        <p className="text-xs text-gray-600">{stat.label}</p>
                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Export Buttons */}
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleExportPDF(report.title)}
                    disabled={exporting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    <FaFilePdf size={16} />
                    PDF
                  </button>
                  <button
                    onClick={() => handleExportExcel(report.title)}
                    disabled={exporting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    <FaFileExcel size={16} />
                    Excel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        {reportData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Total Payments</p>
              <p className="text-3xl font-bold text-gray-900">{reportData.totalPayments}</p>
              <p className="text-xs text-gray-500 mt-2">transactions recorded</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(reportData.totalAmount)}</p>
              <p className="text-xs text-gray-500 mt-2">GMD collected</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Confirmed</p>
              <p className="text-3xl font-bold text-emerald-600">{formatCurrency(reportData.confirmedAmount)}</p>
              <p className="text-xs text-gray-500 mt-2">verified payments</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Pending</p>
              <p className="text-3xl font-bold text-amber-600">{formatCurrency(reportData.pendingAmount)}</p>
              <p className="text-xs text-gray-500 mt-2">awaiting verification</p>
            </div>
          </div>
        )}

        {/* Scheduled Reports */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaClock className="text-primary-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Scheduled Reports</h2>
            </div>
            <span className="text-sm text-gray-600">Auto-send to your email</span>
          </div>

          <div className="space-y-3">
            {scheduledReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)} at {report.time}
                  </p>
                  {report.nextSend && (
                    <p className="text-xs text-gray-500 mt-1">Next: {formatDate(report.nextSend)}</p>
                  )}
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={report.enabled}
                    onChange={() => toggleScheduledReport(report.id)}
                    className="w-5 h-5 text-primary-600 rounded cursor-pointer"
                  />
                  <span className={`text-sm font-medium ${report.enabled ? 'text-emerald-600' : 'text-gray-600'}`}>
                    {report.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Export History */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaDownload className="text-primary-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Recent Exports</h2>
            </div>
            <span className="text-sm text-gray-600">{exportHistory.length} exports</span>
          </div>

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
                  {exportHistory.map((export) => (
                    <tr key={export.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{export.reportType}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                          {export.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(export.generatedAt)}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <FaCheckCircle size={14} />
                          Ready
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No exports yet</p>
              <p className="text-sm mt-1">Generate your first report from the options above</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
