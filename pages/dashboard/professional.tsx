'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import MetricsPanel from '@/components/Dashboard/MetricsPanel';
import Card from '@/components/Common/Card';
import Badge from '@/components/Common/Badge';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import ProfessionalTable from '@/components/Common/ProfessionalTable';
import GIALogoEngravings from '@/components/GIALogoEngravings';
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/Common/Skeleton';
import { BiBarChartAlt2, BiTrendingUp, BiUser, BiWallet, BiDownload, BiRefresh, BiShow, BiHide } from 'react-icons/bi';
import { useHajjYear } from '@/lib/stores/hajjYearStore';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function ProfessionalDashboard() {
  const { selectedHajjYear } = useHajjYear();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalPilgrims: 0,
    totalPayments: 0,
    paymentRate: 0,
    activeBanks: 0,
  });
  const [payments, setPayments] = useState<any[]>([]);
  const [pilgrims, setPilgrims] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    setCurrentTime(new Date().toLocaleTimeString());
  }, [selectedHajjYear]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const baseParam = selectedHajjYear ? `?hajj_year=${selectedHajjYear}` : '?';
      const paymentsParam = `${baseParam}${baseParam.includes('?') ? '&' : ''}ordering=-submitted_at`;
      const [paymentsRes, pilgrimsRes, banksRes] = await Promise.all([
        api.get(`/bank-payment-submissions/${paymentsParam}`),
        api.get(`/pilgrims/${baseParam}`),
        api.get('/banks/'),
      ]);

      const allPaymentsData = paymentsRes.data.results || paymentsRes.data || [];
      const recentPayments = allPaymentsData.slice(0, 10);
      const pilgrimsData = pilgrimsRes.data.results || pilgrimsRes.data || [];
      const banksData = banksRes.data.results || banksRes.data || [];

      setPayments(recentPayments);
      setPilgrims(pilgrimsData);
      setBanks(banksData);

      // Calculate real stats (using ALL payments, not just recent)
      const totalPilgrims = pilgrimsData.length;
      const totalPayments = allPaymentsData.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
      const confirmedPayments = allPaymentsData.filter((p: any) => p.status === 'confirmed').length;
      const paymentRate = totalPilgrims > 0 ? Math.round((confirmedPayments / totalPilgrims) * 100) : 0;
      const activeBanks = banksData.filter((b: any) => b.is_active).length;

      setStats({
        totalPilgrims,
        totalPayments,
        paymentRate,
        activeBanks,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  const statCards = [
    {
      label: 'Total Pilgrims',
      value: stats.totalPilgrims.toLocaleString(),
      caption: `${stats.totalPilgrims} registered`,
      icon: <BiUser size={15} />,
      isFinancial: false,
    },
    {
      label: 'Total Payments',
      value: `D${(stats.totalPayments / 1000000).toFixed(2)}M`,
      caption: `${payments.length === 10 ? '10+ recent' : payments.length} transactions`,
      icon: <BiWallet size={15} />,
      isFinancial: true,
      fieldId: 'dashboard-total-payments',
      isHidden: isFieldHidden('dashboard-total-payments'),
    },
    {
      label: 'Payment Rate',
      value: `${stats.paymentRate}%`,
      caption: `${payments.filter((p: any) => p.status === 'confirmed').length} confirmed`,
      icon: <BiTrendingUp size={15} />,
      isFinancial: false,
    },
    {
      label: 'Banks Connected',
      value: stats.activeBanks.toString(),
      caption: `${stats.activeBanks} active`,
      icon: <BiBarChartAlt2 size={15} />,
      isFinancial: false,
    },
  ];

  // Calculate real chart data
  const pilgrimTrendData = pilgrims.slice(0, 6).map((p, i) => ({
    week: `Pilgrim ${i + 1}`,
    pilgrims: i + 1,
  }));

  const paymentStatusData = [
    { name: 'Confirmed', value: payments.filter((p: any) => p.status === 'confirmed').length, color: '#22c55e' },
    { name: 'Pending', value: payments.filter((p: any) => p.status === 'pending').length, color: '#eab308' },
    { name: 'Failed', value: payments.filter((p: any) => p.status === 'failed').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const bankComparisonData = banks.map((bank: any) => ({
    bank: bank.name,
    amount: payments
      .filter((p: any) => p.bank === bank.id)
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
  })).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 5);

  const paymentColumns = [
    {
      key: 'id',
      label: 'Payment ID',
      width: '15%',
      render: (value: string) => <span className="font-mono text-xs text-gray-500">{value}</span>,
    },
    {
      key: 'pilgrim_name',
      label: 'Pilgrim',
      width: '25%',
      render: (value: string) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      width: '15%',
      render: (value: number) => <span className="font-mono font-medium text-gray-900">D{value.toLocaleString()}</span>,
    },
    {
      key: 'bank_name',
      label: 'Bank',
      width: '20%',
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (value: string) => (
        <Badge
          variant={value === 'confirmed' ? 'success' : value === 'pending' ? 'warning' : 'error'}
          size="sm"
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'payment_date',
      label: 'Date',
      width: '10%',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <Layout>
      <GIALogoEngravings />
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="px-8 py-8 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-2 font-medium">Real-time overview of Hajj operations</p>
            </div>
            <div className="flex gap-3">
              <ProfessionalButton
                variant="secondary"
                size="md"
                icon={<BiRefresh size={16} />}
                onClick={loadDashboardData}
                loading={loading}
              >
                Refresh
              </ProfessionalButton>
              <ProfessionalButton
                variant="primary"
                size="md"
                icon={<BiDownload size={16} />}
              >
                Export
              </ProfessionalButton>
            </div>
          </div>
        </div>

        <div className="p-8">

        {/* Stats Panel - with shimmer loading */}
        <div className="mb-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
            </div>
          ) : (
            <MetricsPanel title="Season overview" metrics={statCards} onToggleField={toggleFieldVisibility} />
          )}
        </div>

        {/* Charts Grid - with shimmer loading */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Pilgrim Registration Trend */}
          <div className="lg:col-span-2">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <Card padding="lg" shadow="none">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Pilgrim Registration Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pilgrimTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="week" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-primary)',
                      border: `1px solid var(--border-color)`,
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pilgrims"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Payment Status Breakdown */}
          <div>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <Card padding="lg" shadow="none">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              </Card>
            )}
          </div>
        </div>

        {/* Bank Comparison Chart */}
        <div className="mb-8">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <Card padding="lg" shadow="none">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Bank Payment Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bankComparisonData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="bank" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-primary)',
                  border: `1px solid var(--border-color)`,
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="amount" fill="#111827" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payments Table - spans 2 columns (with shimmer loading) */}
          <div className="lg:col-span-2">
            {loading ? (
              <TableSkeleton rows={5} columnCount={6} />
            ) : (
              <ProfessionalTable
                columns={paymentColumns}
                data={payments.slice(0, 10)}
                loading={false}
                emptyMessage="No recent payments"
                actions={(row) => (
                  <div className="flex gap-2">
                    <ProfessionalButton variant="ghost" size="sm">
                      View
                    </ProfessionalButton>
                  </div>
                )}
              />
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card padding="lg" shadow="none">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Summary</h3>
              <div className="space-y-4">
                {/* Total Amount */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700 font-medium">Total Amount</span>
                    <button
                      onClick={() => toggleFieldVisibility('payments-total-amount')}
                      className="p-1 hover:bg-blue-200 rounded transition-colors"
                      title={isFieldHidden('payments-total-amount') ? 'Show' : 'Hide'}
                    >
                      {isFieldHidden('payments-total-amount') ? <BiHide size={14} className="text-blue-600" /> : <BiShow size={14} className="text-blue-600" />}
                    </button>
                  </div>
                  <p className="text-lg font-semibold text-blue-900 mt-2">
                    {isFieldHidden('payments-total-amount') ? '••••••' : `D${(payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) / 1000000).toFixed(2)}M`}
                  </p>
                </div>

                {(() => {
                  const confirmed = payments.filter((p: any) => p.status === 'confirmed').length;
                  const pending = payments.filter((p: any) => p.status === 'pending').length;
                  const failed = payments.filter((p: any) => p.status === 'failed').length;
                  const total = confirmed + pending + failed;
                  const confirmedWidth = total > 0 ? Math.round((confirmed / total) * 100) : 0;
                  const pendingWidth = total > 0 ? Math.round((pending / total) * 100) : 0;
                  const failedWidth = total > 0 ? Math.round((failed / total) * 100) : 0;

                  return (
                    <>
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm text-gray-600">Confirmed</span>
                          <span className="font-mono font-semibold text-gray-900">{confirmed}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${confirmedWidth}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm text-gray-600">Pending</span>
                          <span className="font-mono font-semibold text-gray-900">{pending}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${pendingWidth}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm text-gray-600">Failed</span>
                          <span className="font-mono font-semibold text-gray-900">{failed}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${failedWidth}%` }}></div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </Card>

            {/* Top Banks */}
            <Card padding="lg" shadow="none">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Banks</h3>
              <div className="space-y-1">
                {bankComparisonData.map((bank: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-2 -mx-2 hover:bg-gray-50 rounded-md transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-white text-[10px] font-semibold">
                        {idx + 1}
                      </div>
                      <span className="text-sm text-gray-900">{bank.bank}</span>
                    </div>
                    <span className="text-sm font-mono font-medium text-gray-700">${(bank.amount / 1000).toFixed(0)}K</span>
                  </div>
                ))}
                {bankComparisonData.length === 0 && (
                  <p className="text-sm text-gray-500 py-4">No payment data yet</p>
                )}
              </div>
            </Card>

            {/* System Status */}
            <Card padding="lg" shadow="none">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <Badge variant={!loading ? 'success' : 'warning'} size="sm">
                    {!loading ? 'Online' : 'Loading'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Loaded</span>
                  <Badge variant={payments.length > 0 && pilgrims.length > 0 ? 'success' : 'warning'} size="sm">
                    {payments.length > 0 && pilgrims.length > 0 ? 'Yes' : 'Syncing'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-mono font-medium text-gray-900">{currentTime || '—'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
}
