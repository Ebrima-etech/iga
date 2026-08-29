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

interface BankData {
  id: string;
  name: string;
  totalPayments: number;
  totalAmount: number;
  confirmedAmount: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [bankData, setBankData] = useState<BankData[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exportHistory, setExportHistory] = useState<any[]>([]);

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

      // Calculate bank-specific data
      const bankStats: BankData[] = bankList.map((bank: any) => {
        const bankPayments = paymentList.filter((p: any) => p.bank === bank.id);
        const bankTotal = bankPayments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
        const bankConfirmed = bankPayments
          .filter((p: any) => p.status === 'confirmed')
          .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

        return {
          id: bank.id,
          name: bank.name,
          totalPayments: bankPayments.length,
          totalAmount: bankTotal,
          confirmedAmount: bankConfirmed,
        };
      });

      setReportData({
        totalPayments: paymentList.length,
        totalAmount,
        confirmedAmount,
        pendingAmount,
        totalPilgrims: pilgrimList.length,
      });

      setBankData(bankStats);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = (reportType: string, data: any[]) => {
    let csv = '';
    if (reportType.includes('Pilgrim')) {
      csv = 'Pilgrim ID,Name,Status,Registration Date\n';
      data.forEach(p => csv += `${p.id},${p.full_name},${p.status},${p.created_at}\n`);
    } else if (reportType.includes('Payment')) {
      csv = 'Transaction ID,Pilgrim,Amount,Status,Date\n';
      data.forEach(p => csv += `${p.id},${p.pilgrim_name || p.pilgrim_first_name},${p.amount},${p.status},${p.payment_date}\n`);
    } else {
      csv = 'Report Data\n' + JSON.stringify(data);
    }
    return csv;
  };

  const generateExcel = async (reportType: string, data: any[]) => {
    const csv = generateCSV(reportType, data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const generatePDF = async (reportType: string) => {
    try {
      const html = `
        <html>
          <head>
            <title>${reportType} Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
              .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
              .stat-box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
              .stat-label { color: #666; font-size: 12px; }
              .stat-value { font-size: 24px; font-weight: bold; color: #0ea5e9; }
              .footer { margin-top: 30px; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>${reportType} - Generated ${new Date().toLocaleDateString()}</h1>
            <div class="stats">
              <div class="stat-box">
                <div class="stat-label">Total Records</div>
                <div class="stat-value">${reportData?.totalPayments || reportData?.totalPilgrims || 0}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Total Amount</div>
                <div class="stat-value">${formatCurrency(reportData?.totalAmount || 0)}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Confirmed</div>
                <div class="stat-value">${formatCurrency(reportData?.confirmedAmount || 0)}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Pending</div>
                <div class="stat-value">${formatCurrency(reportData?.pendingAmount || 0)}</div>
              </div>
            </div>
            <div class="footer">Generated by GIA Hajj Operations System</div>
          </body>
        </html>
      `;
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  };

  const generateImage = async (reportType: string) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#333333';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(`${reportType} Report`, 40, 50);

      ctx.font = '14px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, 40, 90);

      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(40, 120, 1120, 2);

      const stats = [
        { label: 'Total Records', value: reportData?.totalPayments || reportData?.totalPilgrims || 0 },
        { label: 'Total Amount', value: formatCurrency(reportData?.totalAmount || 0) },
        { label: 'Confirmed', value: formatCurrency(reportData?.confirmedAmount || 0) },
        { label: 'Pending', value: formatCurrency(reportData?.pendingAmount || 0) },
      ];

      let y = 180;
      stats.forEach((stat, idx) => {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText(stat.label + ':', 60, y);

        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#0ea5e9';
        ctx.fillText(stat.value.toString(), 60, y + 30);

        y += 120;
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${reportType.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      });
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  };

  const handleExport = async (reportType: string, format: string) => {
    try {
      setExporting(true);
      let data: any[] = [];

      if (reportType.includes('Pilgrim')) {
        const res = await api.get('/pilgrims/').catch(() => ({ data: { results: [] } }));
        data = res.data.results || [];
      } else if (reportType.includes('Payment')) {
        const res = await api.get('/bank-payment-submissions/').catch(() => ({ data: { results: [] } }));
        data = res.data.results || [];
      }

      switch (format) {
        case 'CSV':
          await generateExcel(reportType, data);
          break;
        case 'PDF':
          await generatePDF(reportType);
          break;
        case 'Excel':
          await generateExcel(reportType, data);
          break;
        case 'Image':
          await generateImage(reportType);
          break;
      }

      const newExport = {
        id: Date.now().toString(),
        type: format,
        reportType,
        generatedAt: new Date().toISOString(),
      };

      setExportHistory([newExport, ...exportHistory.slice(0, 9)]);
      toast.success(`${reportType} exported as ${format} successfully!`);
    } catch (error) {
      console.error(`Export error (${format}):`, error);
      toast.error(`Failed to export as ${format}`);
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

          {/* Bank Selection Dropdown */}
          {bankData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Bank for Detailed Report</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="all">All Banks</option>
                {bankData.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bank-Specific Stats */}
          {selectedBank !== 'all' && bankData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {bankData.find((b) => b.id === selectedBank)?.name} - Performance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {bankData.find((b) => b.id === selectedBank)?.totalPayments || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <p className="text-sm font-medium text-gray-600">Confirmed Amount</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {formatCurrency(bankData.find((b) => b.id === selectedBank)?.confirmedAmount || 0)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    {formatCurrency(bankData.find((b) => b.id === selectedBank)?.totalAmount || 0)}
                  </p>
                </div>
              </div>

              {/* Bank-Specific Export */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-4">Export Bank Report</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['PDF', 'Excel', 'CSV', 'Image'].map((format) => (
                    <ProfessionalButton
                      key={format}
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        handleExport(
                          `${bankData.find((b) => b.id === selectedBank)?.name} Report`,
                          format
                        )
                      }
                      loading={exporting}
                      className="w-full"
                    >
                      {format}
                    </ProfessionalButton>
                  ))}
                </div>
              </div>
            </div>
          )}

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
                <div className="grid grid-cols-2 gap-2 mt-6">
                  <ProfessionalButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleExport('Pilgrim Summary', 'PDF')}
                    loading={exporting}
                    className="flex-1"
                  >
                    PDF
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('Pilgrim Summary', 'Excel')}
                    loading={exporting}
                    className="flex-1"
                  >
                    Excel
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('Pilgrim Summary', 'CSV')}
                    loading={exporting}
                    className="flex-1"
                  >
                    CSV
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('Pilgrim Summary', 'Image')}
                    loading={exporting}
                    className="flex-1"
                  >
                    Image
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
                <div className="grid grid-cols-2 gap-2 mt-6">
                  <ProfessionalButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleExport('Payment Reconciliation', 'PDF')}
                    loading={exporting}
                    className="flex-1"
                  >
                    PDF
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('Payment Reconciliation', 'Excel')}
                    loading={exporting}
                    className="flex-1"
                  >
                    Excel
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('Payment Reconciliation', 'CSV')}
                    loading={exporting}
                    className="flex-1"
                  >
                    CSV
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('Payment Reconciliation', 'Image')}
                    loading={exporting}
                    className="flex-1"
                  >
                    Image
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
                <div className="grid grid-cols-2 gap-2 mt-6">
                  <ProfessionalButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleExport('Bank Performance', 'PDF')}
                    loading={exporting}
                    className="flex-1"
                  >
                    PDF
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('Bank Performance', 'Excel')}
                    loading={exporting}
                    className="flex-1"
                  >
                    Excel
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('Bank Performance', 'CSV')}
                    loading={exporting}
                    className="flex-1"
                  >
                    CSV
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('Bank Performance', 'Image')}
                    loading={exporting}
                    className="flex-1"
                  >
                    Image
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
                <div className="grid grid-cols-2 gap-2 mt-6">
                  <ProfessionalButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleExport('Daily Activity', 'PDF')}
                    loading={exporting}
                    className="flex-1"
                  >
                    PDF
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('Daily Activity', 'Excel')}
                    loading={exporting}
                    className="flex-1"
                  >
                    Excel
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('Daily Activity', 'CSV')}
                    loading={exporting}
                    className="flex-1"
                  >
                    CSV
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExport('Daily Activity', 'Image')}
                    loading={exporting}
                    className="flex-1"
                  >
                    Image
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
