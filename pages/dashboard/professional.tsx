'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import StatCard from '@/components/Dashboard/StatCard';
import Card from '@/components/Common/Card';
import Badge from '@/components/Common/Badge';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import ProfessionalTable from '@/components/Common/ProfessionalTable';
import { BiBarChartAlt2, BiTrendingUp, BiUser, BiWallet, BiDownload, BiRefresh } from 'react-icons/bi';
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPilgrims: 2450,
    totalPayments: 1200000,
    paymentRate: 94,
    activeBanks: 5,
  });
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [paymentsRes] = await Promise.all([
        api.get('/payments/'),
      ]);
      setPayments(paymentsRes.data.results || paymentsRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Pilgrims',
      value: stats.totalPilgrims.toLocaleString(),
      trend: '+12%',
      icon: <BiUser size={24} />,
    },
    {
      label: 'Total Payments',
      value: `$${(stats.totalPayments / 1000000).toFixed(1)}M`,
      trend: '+8%',
      icon: <BiWallet size={24} />,
    },
    {
      label: 'Payment Rate',
      value: `${stats.paymentRate}%`,
      trend: '+3%',
      icon: <BiTrendingUp size={24} />,
    },
    {
      label: 'Banks Connected',
      value: stats.activeBanks.toString(),
      trend: 'Active',
      icon: <BiBarChartAlt2 size={24} />,
    },
  ];

  // Chart data
  const pilgrimTrendData = [
    { week: 'Week 1', pilgrims: 450 },
    { week: 'Week 2', pilgrims: 620 },
    { week: 'Week 3', pilgrims: 580 },
    { week: 'Week 4', pilgrims: 890 },
    { week: 'Week 5', pilgrims: 1050 },
    { week: 'Week 6', pilgrims: 1200 },
  ];

  const paymentStatusData = [
    { name: 'Confirmed', value: 2150, color: '#22c55e' },
    { name: 'Pending', value: 250, color: '#eab308' },
    { name: 'Failed', value: 50, color: '#ef4444' },
  ];

  const bankComparisonData = [
    { bank: 'Bank A', amount: 450000 },
    { bank: 'Bank B', amount: 380000 },
    { bank: 'Bank C', amount: 220000 },
    { bank: 'Bank D', amount: 95000 },
    { bank: 'Bank E', amount: 55000 },
  ];

  const paymentColumns = [
    { key: 'id', label: 'Payment ID', width: '15%' },
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
      render: (value: number) => <span className="font-semibold text-green-700">${value.toLocaleString()}</span>,
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
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time overview of Hajj operations</p>
            </div>
            <div className="flex gap-2">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <StatCard
              key={idx}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Pilgrim Registration Trend */}
          <div className="lg:col-span-2">
            <Card padding="lg" shadow="md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pilgrim Registration Trend</h3>
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
                    stroke="#d97706"
                    strokeWidth={3}
                    dot={{ fill: '#d97706', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Payment Status Breakdown */}
          <div>
            <Card padding="lg" shadow="md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Status</h3>
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
          </div>
        </div>

        {/* Bank Comparison Chart */}
        <Card padding="lg" shadow="md" className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Bank Payment Comparison</h3>
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
              <Bar dataKey="amount" fill="#d97706" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payments Table - spans 2 columns */}
          <div className="lg:col-span-2">
            <ProfessionalTable
              columns={paymentColumns}
              data={payments.slice(0, 10)}
              loading={loading}
              emptyMessage="No recent payments"
              actions={(row) => (
                <div className="flex gap-2">
                  <ProfessionalButton variant="ghost" size="sm">
                    View
                  </ProfessionalButton>
                </div>
              )}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card padding="lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Confirmed</span>
                  <span className="font-bold text-green-700">2,150</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>

                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg mt-4">
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                  <span className="font-bold text-yellow-700">250</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>

                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg mt-4">
                  <span className="text-sm font-medium text-gray-700">Failed</span>
                  <span className="font-bold text-red-700">50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '2%' }}></div>
                </div>
              </div>
            </Card>

            {/* Top Banks */}
            <Card padding="lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Banks</h3>
              <div className="space-y-3">
                {[
                  { name: 'Bank A', amount: '$450K', color: 'from-blue-500 to-blue-600' },
                  { name: 'Bank B', amount: '$380K', color: 'from-purple-500 to-purple-600' },
                  { name: 'Bank C', amount: '$220K', color: 'from-pink-500 to-pink-600' },
                ].map((bank, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${bank.color}`}></div>
                      <span className="font-medium text-gray-900">{bank.name}</span>
                    </div>
                    <span className="font-semibold text-gray-700">{bank.amount}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* System Status */}
            <Card padding="lg" shadow="sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">API Status</span>
                  <Badge variant="success" size="sm">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Database</span>
                  <Badge variant="success" size="sm">
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Response Time</span>
                  <span className="text-sm font-medium text-gray-900">45ms</span>
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
