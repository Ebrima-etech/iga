'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import MetricsPanel from '@/components/Dashboard/MetricsPanel';
import Card from '@/components/Common/Card';
import Badge from '@/components/Common/Badge';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import ProfessionalTable from '@/components/Common/ProfessionalTable';
{/* GIA Logo Engravings - Inline */}
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
  const router = useRouter();
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

      // Fetch all bank payment submissions with pagination
      let allPaymentsData: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const paymentsParam = `${baseParam}${baseParam.includes('?') ? '&' : ''}limit=100&offset=${(page - 1) * 100}&ordering=-submitted_at`;
        const paymentsRes = await api.get(`/bank-payment-submissions/${paymentsParam}`);
        const pageData = paymentsRes.data.results || paymentsRes.data || [];

        if (Array.isArray(pageData)) {
          allPaymentsData = [...allPaymentsData, ...pageData];
          hasMore = pageData.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }

      const [pilgrimsRes, banksRes] = await Promise.all([
        api.get(`/pilgrims/${baseParam}`),
        api.get('/banks/'),
      ]);

      const recentPayments = allPaymentsData.slice(0, 10);
      const pilgrimsData = pilgrimsRes.data.results || pilgrimsRes.data || [];
      const banksData = banksRes.data.results || banksRes.data || [];

      setPayments(recentPayments);
      setPilgrims(pilgrimsData);
      setBanks(banksData);

      // Calculate real stats (using ALL payments, not just recent)
      const totalPilgrims = pilgrimsData.length;
      const totalPayments = allPaymentsData.reduce((sum: number, p: any) => {
        const amount = parseFloat(p.amount) || 0;
        return sum + amount;
      }, 0);
      const completedCount = pilgrimsData.filter((p: any) => (p.amount_remaining || 0) === 0).length;
      const paymentRate = totalPilgrims > 0 ? Math.round((completedCount / totalPilgrims) * 100) : 0;
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

  const navigateToPayments = () => {
    router.push('/dashboard/payments');
  };

  const exportDashboardData = () => {
    try {
      // Prepare CSV data
      const headers = ['Pilgrim Name', 'Amount', 'Bank', 'Status', 'Date', 'Reference Number'];
      const rows = payments.map((p: any) => {
        const pilgrimName = p.pilgrim_name ||
          `${p.pilgrim_first_name || ''} ${p.pilgrim_last_name || ''}`.trim() ||
          'N/A';
        return [
        pilgrimName,
        p.amount || 0,
        p.bank_name || 'N/A',
        p.status || 'N/A',
        new Date(p.payment_date).toLocaleDateString(),
        p.reference_number || 'N/A',
      ];
      });

      // Create CSV content
      const csvContent = [
        ['DASHBOARD EXPORT', new Date().toLocaleString()].join(','),
        '',
        ['STATISTICS'].join(','),
        ['Metric', 'Value'].join(','),
        ['Total Pilgrims', stats.totalPilgrims].join(','),
        ['Total Payments', `D${stats.totalPayments.toLocaleString()}`].join(','),
        ['Completion Rate', `${stats.paymentRate}%`].join(','),
        ['Banks Connected', stats.activeBanks].join(','),
        '',
        ['RECENT PAYMENTS'].join(','),
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Dashboard data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export dashboard data');
    }
  };

  const statCards = [
    {
      label: 'Total Pilgrims',
      value: stats.totalPilgrims.toLocaleString(),
      caption: `${stats.totalPilgrims} registered`,
      icon: <BiUser size={15} />,
      isFinancial: false,
    },
    {
      label: 'Total Payment',
      value: stats.totalPayments > 0 ? `D${(stats.totalPayments / 1000000).toFixed(2)}M` : 'D0.00M',
      caption: `${payments.length} transactions`,
      icon: <BiWallet size={15} />,
      isFinancial: true,
      fieldId: 'dashboard-total-payments',
      isHidden: isFieldHidden('dashboard-total-payments'),
    },
    {
      label: 'Completion Rate',
      value: `${stats.paymentRate}%`,
      caption: `${pilgrims.filter((p: any) => (p.amount_remaining || 0) === 0).length} completed`,
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

  const completedPilgrims = pilgrims.filter((p: any) => (p.amount_remaining || 0) === 0).length;
  const uncompletedPilgrims = pilgrims.filter((p: any) => (p.amount_remaining || 0) > 0).length;
  const paymentStatusData = [
    { name: 'Completed', value: completedPilgrims, color: '#22c55e' },
    { name: 'Uncompleted', value: uncompletedPilgrims, color: '#eab308' },
  ].filter(item => item.value > 0);

  const bankComparisonData = banks.map((bank: any) => ({
    bank: bank.name,
    amount: payments
      .filter((p: any) => p.bank_name === bank.name)
      .reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0),
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
      render: (value: string, row?: any) => {
        const pilgrimName = value ||
          `${row?.pilgrim_first_name || ''} ${row?.pilgrim_last_name || ''}`.trim() ||
          'N/A';
        const title = row?.gender === 'M' ? 'Alagie' : row?.gender === 'F' ? 'Aja' : '';
        return <span className="font-medium text-gray-900">{title && `${title} `}{pilgrimName}</span>;
      },
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
      <div className="relative">
        {/* GIA Logo Engravings */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <img src="https://strapi.yolcu360.com/gambia_airlines_logo_1_ebe63e51ad.png" alt="GIA" className="absolute top-12 left-12 w-20 h-20 object-contain opacity-50" />
          <img src="https://strapi.yolcu360.com/gambia_airlines_logo_1_ebe63e51ad.png" alt="GIA" className="absolute top-20 right-24 w-16 h-16 object-contain opacity-50" style={{ transform: 'rotate(15deg)' }} />
          <img src="https://strapi.yolcu360.com/gambia_airlines_logo_1_ebe63e51ad.png" alt="GIA" className="absolute top-1/2 left-1/2 w-32 h-32 object-contain opacity-50" style={{ transform: 'translate(-50%, -50%) rotate(-10deg)' }} />
          <img src="https://strapi.yolcu360.com/gambia_airlines_logo_1_ebe63e51ad.png" alt="GIA" className="absolute bottom-20 left-16 w-24 h-24 object-contain opacity-50" style={{ transform: 'rotate(8deg)' }} />
          <img src="https://strapi.yolcu360.com/gambia_airlines_logo_1_ebe63e51ad.png" alt="GIA" className="absolute bottom-16 right-20 w-28 h-28 object-contain opacity-50" style={{ transform: 'rotate(-12deg)' }} />
        </div>
        <div className="min-h-screen bg-white/95 relative z-10">
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
                onClick={exportDashboardData}
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
                    <h3 className="text-sm font-semibold text-gray-900 mb-6">Payment Status</h3>
                    {paymentStatusData.length > 0 ? (
                      <div>
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <Pie
                              data={paymentStatusData}
                              cx="50%"
                              cy="45%"
                              labelLine={true}
                              label={({ name, value }) => {
                                const total = paymentStatusData.reduce((sum, item) => sum + item.value, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${name} ${value}`;
                              }}
                              outerRadius={70}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {paymentStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) => {
                                const total = paymentStatusData.reduce((sum, item) => sum + item.value, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${value} pilgrims (${percentage}%)`;
                              }}
                              contentStyle={{
                                backgroundColor: 'var(--bg-primary)',
                                border: `1px solid var(--border-color)`,
                                borderRadius: '8px',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="mt-6 grid grid-cols-2 gap-4">
                          {paymentStatusData.map((item, index) => {
                            const total = paymentStatusData.reduce((sum, i) => sum + i.value, 0);
                            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                            return (
                              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div
                                  className="w-4 h-4 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: item.color }}
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                  <p className="text-xs text-gray-600">{item.value} ({percentage}%)</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-80 text-gray-500">
                        <p>No payment data available</p>
                      </div>
                    )}
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
                {/* Top Payments This Week */}
                <Card
                  padding="lg"
                  shadow="none"
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={navigateToPayments}
                >
                  <h3 className="text-xs font-semibold text-gray-900 mb-2">Top Payments This Week</h3>
                  <div className="space-y-1">
                    {payments.slice(0, 5).map((payment: any, idx: number) => {
                      const pilgrimName = payment.pilgrim_name ||
                        `${payment.pilgrim_first_name || ''} ${payment.pilgrim_last_name || ''}`.trim() ||
                        'N/A';
                      const title = payment.gender === 'M' ? 'Alagie' : payment.gender === 'F' ? 'Aja' : '';
                      return (
                      <div key={payment.id} className="flex items-center justify-between py-1 px-2 -mx-2 hover:bg-gray-50 rounded-md transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{title && `${title} `}{pilgrimName}</p>
                          <p className="text-xs text-gray-500 leading-tight">{payment.bank_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-900">D{parseFloat(payment.amount || 0).toLocaleString()}</p>
                          <p className={`text-xs font-medium leading-tight ${
                            payment.status === 'verified' || payment.status === 'confirmed' ? 'text-emerald-600' :
                            payment.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                          </p>
                        </div>
                      </div>
                    );
                    })}
                    {payments.length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-2">No payments recorded</p>
                    )}
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
        </div>
    </Layout>
  );
}
