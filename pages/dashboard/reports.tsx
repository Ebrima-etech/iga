import { useState } from 'react';
import Layout from '@/components/Layout';
import Button from '@/components/Common/Button';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  const handleGeneratePDF = async () => {
    try {
      setLoading(true);
      toast.success('PDF report generated! (Feature coming soon)');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      toast.success('Excel report exported! (Feature coming soon)');
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
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Export</h1>
          <p className="text-gray-600 mt-1">Generate and export operational reports</p>
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
