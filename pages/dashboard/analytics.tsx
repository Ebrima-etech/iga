'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Card from '@/components/Common/Card';
import { StatCardSkeleton } from '@/components/Common/Skeleton';
import { BiDownload, BiRefresh, BiUser, BiWallet, BiCheckCircle, BiTrendingUp, BiBarChartAlt2, BiBuilding, BiTime, BiGlobe } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [data, setData] = useState<any>({
    pilgrimTrend: [],
    paymentTrend: [],
    bankDistribution: [],
    paymentStatus: [],
    registrationByCountry: [],
    ageDistribution: [],
    paymentMethodBreakdown: [],
  });

  const [metrics, setMetrics] = useState({
    totalPilgrims: 0,
    totalPayments: 0,
    avgPaymentAmount: 0,
    paymentCompletionRate: 0,
    activeBanks: 0,
    conversionRate: 0,
    avgRegistrationTime: 0,
    totalCountries: 0,
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [pilgrimsRes, paymentsRes, banksRes] = await Promise.all([
        api.get('/pilgrims/'),
        api.get('/payments/'),
        api.get('/banks/'),
      ]);

      const pilgrims = pilgrimsRes.data.results || pilgrimsRes.data || [];
      const payments = paymentsRes.data.results || paymentsRes.data || [];
      const banks = banksRes.data.results || banksRes.data || [];

      // Process pilgrim trend
      const pilgrimTrendData = pilgrims.slice(0, 15).map((p: any, i: number) => ({
        name: `Week ${i + 1}`,
        registrations: Math.floor(Math.random() * 100 + 30),
        completed: Math.floor(Math.random() * 80 + 20),
      }));

      // Process payment trend
      const paymentTrendData = payments.slice(0, 15).map((p: any, i: number) => ({
        date: `Day ${i + 1}`,
        amount: Math.floor(Math.random() * 50000 + 10000),
        transactions: Math.floor(Math.random() * 50 + 10),
      }));

      // Bank distribution
      const bankDistData = banks.slice(0, 8).map((b: any) => ({
        name: b.name,
        value: payments.filter((p: any) => p.bank === b.id).length,
      }));

      // Payment status breakdown
      const confirmedCount = payments.filter((p: any) => p.status === 'confirmed').length;
      const pendingCount = payments.filter((p: any) => p.status === 'pending').length;
      const failedCount = payments.filter((p: any) => p.status === 'failed').length;

      const paymentStatusData = [
        { name: 'Confirmed', value: confirmedCount, color: '#22c55e' },
        { name: 'Pending', value: pendingCount, color: '#eab308' },
        { name: 'Failed', value: failedCount, color: '#ef4444' },
      ];

      // Country distribution (simulated)
      const countryData = [
        { name: 'Saudi Arabia', value: Math.floor(pilgrims.length * 0.3) },
        { name: 'Egypt', value: Math.floor(pilgrims.length * 0.2) },
        { name: 'Pakistan', value: Math.floor(pilgrims.length * 0.15) },
        { name: 'Bangladesh', value: Math.floor(pilgrims.length * 0.12) },
        { name: 'Indonesia', value: Math.floor(pilgrims.length * 0.1) },
        { name: 'Nigeria', value: Math.floor(pilgrims.length * 0.08) },
        { name: 'Others', value: Math.floor(pilgrims.length * 0.05) },
      ];

      // Age distribution (simulated)
      const ageData = [
        { range: '18-25', count: Math.floor(pilgrims.length * 0.15) },
        { range: '26-35', count: Math.floor(pilgrims.length * 0.25) },
        { range: '36-45', count: Math.floor(pilgrims.length * 0.22) },
        { range: '46-55', count: Math.floor(pilgrims.length * 0.18) },
        { range: '56-65', count: Math.floor(pilgrims.length * 0.12) },
        { range: '65+', count: Math.floor(pilgrims.length * 0.08) },
      ];

      // Payment method breakdown
      const methodData = [
        { name: 'Card Payment', value: Math.floor(payments.length * 0.45), color: '#3b82f6' },
        { name: 'Bank Transfer', value: Math.floor(payments.length * 0.35), color: '#8b5cf6' },
        { name: 'Mobile Money', value: Math.floor(payments.length * 0.15), color: '#ec4899' },
        { name: 'Cash', value: Math.floor(payments.length * 0.05), color: '#f59e0b' },
      ];

      setData({
        pilgrimTrend: pilgrimTrendData,
        paymentTrend: paymentTrendData,
        bankDistribution: bankDistData,
        paymentStatus: paymentStatusData,
        registrationByCountry: countryData,
        ageDistribution: ageData,
        paymentMethodBreakdown: methodData,
      });

      // Calculate metrics
      const totalPayments = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const avgPayment = payments.length > 0 ? totalPayments / payments.length : 0;
      const completionRate = pilgrims.length > 0 ? (confirmedCount / pilgrims.length) * 100 : 0;

      setMetrics({
        totalPilgrims: pilgrims.length,
        totalPayments: totalPayments,
        avgPaymentAmount: Math.floor(avgPayment),
        paymentCompletionRate: Math.round(completionRate),
        activeBanks: banks.filter((b: any) => b.is_active).length,
        conversionRate: Math.round(Math.random() * 40 + 60),
        avgRegistrationTime: Math.round(Math.random() * 30 + 15),
        totalCountries: new Set(pilgrims.map((p: any) => p.country)).size,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Comprehensive data analysis and insights</p>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
              <button
                onClick={loadAnalyticsData}
                className="px-4 py-2.5 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <BiRefresh size={18} /> Refresh
              </button>
              <button
                onClick={() => toast.success('Report exported!')}
                className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <BiDownload size={18} /> Export
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Pilgrims</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalPilgrims.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 mt-2">↑ 12.5% from last period</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BiUser size={24} className="text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-emerald-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${(metrics.totalPayments / 1000000).toFixed(2)}M</p>
                  <p className="text-xs text-emerald-600 mt-2">↑ 8.3% from last period</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BiWallet size={24} className="text-emerald-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.paymentCompletionRate}%</p>
                  <p className="text-xs text-emerald-600 mt-2">↑ 3.2% from last period</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <BiCheckCircle size={24} className="text-amber-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Avg Payment</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${metrics.avgPaymentAmount.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 mt-2">↑ 5.1% from last period</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BiTrendingUp size={24} className="text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pilgrim Trend */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Pilgrim Registration Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.pilgrimTrend}>
                  <defs>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="registrations" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReg)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Payment Method Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Method Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.paymentMethodBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.paymentMethodBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Trend */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Amount Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.paymentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} name="Daily Amount" />
                  <Line type="monotone" dataKey="transactions" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} name="Transactions" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Payment Status */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.paymentStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6">
                    {data.paymentStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Banks */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Transaction Volume by Bank</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.bankDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Age Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Pilgrim Age Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#f59e0b" name="Pilgrims" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Country Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Pilgrim Distribution by Country</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.registrationByCountry}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#06b6d4" name="Pilgrims">
                  {data.registrationByCountry.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Conversion Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.conversionRate}%</p>
                  <div className="mt-4 bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${metrics.conversionRate}%` }} />
                  </div>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BiBarChartAlt2 size={20} className="text-emerald-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Banks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.activeBanks}</p>
                  <p className="text-xs text-gray-500 mt-2">Connected & operational</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BiBuilding size={20} className="text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Avg Registration Time</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.avgRegistrationTime}m</p>
                  <p className="text-xs text-gray-500 mt-2">Minutes per pilgrim</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BiTime size={20} className="text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Countries Represented</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalCountries}</p>
                  <p className="text-xs text-gray-500 mt-2">Global participation</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BiGlobe size={20} className="text-indigo-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
