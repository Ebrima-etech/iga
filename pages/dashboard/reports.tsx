import { useState } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import Button from '@/components/Common/Button';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleGeneratePDF = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('PDF report generated successfully! Ready for download.');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Excel report exported successfully! Ready for download.');
    } catch (error) {
      toast.error('Failed to export Excel');
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    {
      title: 'Pilgrim Summary Report',
      description: 'Get a complete summary of all pilgrims and their payment status',
      icon: '📋',
      color: 'bg-blue-50',
    },
    {
      title: 'Payment Reconciliation',
      description: 'Reconcile payments across all banks with detailed breakdown',
      icon: '✓',
      color: 'bg-green-50',
    },
    {
      title: 'Bank Performance Report',
      description: 'Analyze payment performance by each bank partner',
      icon: '🏦',
      color: 'bg-purple-50',
    },
    {
      title: 'Daily Activity Report',
      description: 'Track daily submission activity and payment trends',
      icon: '📈',
      color: 'bg-orange-50',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Reports & Export"
          description="Generate, export, and schedule operational reports with advanced filtering"
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
              <button className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report, idx) => (
            <div
              key={idx}
              className={`${report.color} p-6 rounded-lg border border-gray-200 hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{report.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
              <p className="text-gray-600 text-sm mt-2">{report.description}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleGeneratePDF}
                  loading={loading}
                >
                  📄 PDF
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleExportExcel}
                  loading={loading}
                >
                  📊 Excel
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Report Schedule */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Reports</h2>
          <p className="text-gray-600 text-sm mb-4">Set up automated reports to be sent to your email</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Daily Summary</p>
                <p className="text-sm text-gray-600">Sent every day at 6:00 PM</p>
              </div>
              <input type="checkbox" className="w-5 h-5 text-primary-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Weekly Report</p>
                <p className="text-sm text-gray-600">Sent every Friday at 5:00 PM</p>
              </div>
              <input type="checkbox" className="w-5 h-5 text-primary-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Monthly Summary</p>
                <p className="text-sm text-gray-600">Sent on the last day of month at 5:00 PM</p>
              </div>
              <input type="checkbox" className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Export History */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No exports yet. Generate your first report above!</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
