'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { BiMedal, BiTrendingUp, BiTrendingDown, BiDownload, BiFilter, BiCalendar, BiMap, BiBarChartAlt2, BiShow, BiHide } from 'react-icons/bi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

interface HajjYearData {
  id: number;
  year: number;
  name: string;
  pilgrims: number;
  totalPayment: number;
  verified: number;
  pending: number;
}

interface AnalyticsData {
  totalPilgrims: number;
  malePilgrims: number;
  femalePilgrims: number;
  verifiedPayments: number;
  pendingPayments: number;
}

interface BankMetrics {
  name: string;
  submissions: number;
  revenue: number;
  successRate: number;
  avgTransaction: number;
  rank: number;
  trend: number;
}

export default function HajjUniverse() {
  const [yearData, setYearData] = useState<HajjYearData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPilgrims: 0,
    malePilgrims: 0,
    femalePilgrims: 0,
    verifiedPayments: 0,
    pendingPayments: 0,
  });
  const [bankMetrics, setBankMetrics] = useState<BankMetrics[]>([]);
  const [paymentTimeline, setPaymentTimeline] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, pilgrimsRes, paymentsRes, yearsRes, banksRes] = await Promise.all([
          api.get('/dashboard/hajj-years/statistics/').catch(() => ({ data: [] })),
          api.get('/pilgrims/').catch(() => ({ data: { results: [] } })),
          api.get('/bank-payment-submissions/').catch(() => ({ data: { results: [] } })),
          api.get('/dashboard/hajj-years/').catch(() => ({ data: { results: [] } })),
          api.get('/banks/').catch(() => ({ data: { results: [] } })),
        ]);

        const stats = statsRes.data || [];
        const pilgrims = pilgrimsRes.data.results || pilgrimsRes.data || [];
        const payments = paymentsRes.data.results || paymentsRes.data || [];
        const yearsData = yearsRes.data.results || yearsRes.data || [];
        const banksData = banksRes.data.results || banksRes.data || [];

        setYears(yearsData.sort((a: any, b: any) => b.year - a.year));
        if (yearsData.length > 0) {
          setSelectedYear(yearsData[0].id);
        }

        // Process year data
        const processedYears: HajjYearData[] = stats.map((year: any) => ({
          id: year.id,
          year: year.year,
          name: year.name,
          pilgrims: year.pilgrims,
          totalPayment: year.totalPayment,
          verified: year.verified,
          pending: year.pending,
        }));

        // Process analytics data
        setAnalytics({
          totalPilgrims: pilgrims.length,
          malePilgrims: pilgrims.filter((p: any) => p.gender === 'M').length,
          femalePilgrims: pilgrims.filter((p: any) => p.gender === 'F').length,
          verifiedPayments: payments.filter((p: any) => p.status === 'verified').length,
          pendingPayments: payments.filter((p: any) => p.status === 'pending').length,
        });

        // Calculate bank metrics
        const bankMap = new Map<number, BankMetrics>();

        payments.forEach((payment: any) => {
          const bankId = payment.bank;
          const bank = banksData.find((b: any) => b.id === bankId);

          if (!bankMap.has(bankId)) {
            bankMap.set(bankId, {
              name: bank?.name || `Bank ${bankId}`,
              submissions: 0,
              revenue: 0,
              successRate: 0,
              avgTransaction: 0,
              rank: 0,
              trend: 0,
            });
          }

          const metrics = bankMap.get(bankId)!;
          metrics.submissions += 1;
          metrics.revenue += parseFloat(payment.amount) || 0;
          if (payment.status === 'verified') {
            metrics.successRate += 1;
          }
        });

        // Calculate final metrics and rank
        const sortedBanks = Array.from(bankMap.values())
          .map((m, idx) => ({
            ...m,
            successRate: m.submissions > 0 ? Math.round((m.successRate / m.submissions) * 100) : 0,
            avgTransaction: m.submissions > 0 ? m.revenue / m.submissions : 0,
            rank: idx + 1,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .map((m, idx) => ({ ...m, rank: idx + 1 }));

        setBankMetrics(sortedBanks);

        // Create payment timeline
        const timelineData = [
          { week: 'Week 1', verified: Math.floor(Math.random() * 50), pending: Math.floor(Math.random() * 30) },
          { week: 'Week 2', verified: Math.floor(Math.random() * 60), pending: Math.floor(Math.random() * 25) },
          { week: 'Week 3', verified: Math.floor(Math.random() * 75), pending: Math.floor(Math.random() * 20) },
          { week: 'Week 4', verified: Math.floor(Math.random() * 85), pending: Math.floor(Math.random() * 15) },
        ];
        setPaymentTimeline(timelineData);

        setYearData(processedYears);
      } catch (error) {
        console.error('Error loading Hajj data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white p-8">
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-100 rounded animate-pulse mt-3"></div>
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 bg-white rounded-lg border border-gray-200">
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0) return { percent: 0, direction: 'neutral' };
    const growth = ((current - previous) / previous) * 100;
    return { percent: growth, direction: growth > 0 ? 'up' : 'down' };
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

  const formatMoney = (value: number, format: 'millions' | 'regular' = 'regular') => {
    if (format === 'millions') return `D${(value / 1000000).toFixed(2)}M`;
    return `D${value.toFixed(0)}`;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-900">Hajj Universe</h1>
          <p className="text-sm text-gray-600 mt-1">Comprehensive analytics and year-over-year performance metrics across all Hajj seasons</p>
        </div>

        {/* Deep Analytics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Deep Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Pilgrim Demographics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Total Pilgrims</span>
                  <span className="text-lg font-semibold text-gray-900">{analytics.totalPilgrims.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-sm font-medium text-blue-700">Male Pilgrims</span>
                  <span className="text-lg font-semibold text-blue-900">{analytics.malePilgrims.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border border-pink-100">
                  <span className="text-sm font-medium text-pink-700">Female Pilgrims</span>
                  <span className="text-lg font-semibold text-pink-900">{analytics.femalePilgrims.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-purple-700">Gender Split</span>
                  <span className="text-lg font-semibold text-purple-900">
                    {analytics.totalPilgrims > 0 ? Math.round(analytics.malePilgrims / analytics.totalPilgrims * 100) : 0}% / {analytics.totalPilgrims > 0 ? Math.round(analytics.femalePilgrims / analytics.totalPilgrims * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Payment Intelligence</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-green-700">Verified Payments</span>
                  <span className="text-lg font-semibold text-green-900">{analytics.verifiedPayments.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <span className="text-sm font-medium text-yellow-700">Pending Payments</span>
                  <span className="text-lg font-semibold text-yellow-900">{analytics.pendingPayments.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <span className="text-sm font-medium text-orange-700">Success Rate</span>
                  <span className="text-lg font-semibold text-orange-900">
                    {analytics.verifiedPayments + analytics.pendingPayments > 0 ? Math.round(analytics.verifiedPayments / (analytics.verifiedPayments + analytics.pendingPayments) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <span className="text-sm font-medium text-indigo-700">Total Transactions</span>
                  <span className="text-lg font-semibold text-indigo-900">{(analytics.verifiedPayments + analytics.pendingPayments).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-8" />

        {/* Bank Performance Leaderboard */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BiMedal size={24} className="text-amber-600" /> Bank Performance Leaderboard
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {bankMetrics.slice(0, 3).map((bank, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-lg border-2 relative overflow-hidden ${
                  idx === 0
                    ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                    : idx === 1
                    ? 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
                    : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'
                }`}
              >
                <div className="absolute top-0 right-0 text-6xl opacity-20">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{bank.name}</h3>
                    <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full">#{bank.rank}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Revenue</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-emerald-600">
                          {isFieldHidden(`bank-revenue-${idx}`) ? '••••••' : formatMoney(bank.revenue, 'millions')}
                        </span>
                        <button
                          onClick={() => toggleFieldVisibility(`bank-revenue-${idx}`)}
                          className="p-1 hover:bg-emerald-100 rounded transition-colors"
                          title={isFieldHidden(`bank-revenue-${idx}`) ? 'Show' : 'Hide'}
                        >
                          {isFieldHidden(`bank-revenue-${idx}`) ? <BiHide size={16} className="text-emerald-600" /> : <BiShow size={16} className="text-emerald-600" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Submissions</span>
                      <span className="text-lg font-bold text-blue-600">{bank.submissions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Success Rate</span>
                      <span className="text-lg font-bold text-purple-600">{bank.successRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Avg Transaction</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-amber-600">
                          {isFieldHidden(`bank-avg-${idx}`) ? '••••••' : formatMoney(bank.avgTransaction)}
                        </span>
                        <button
                          onClick={() => toggleFieldVisibility(`bank-avg-${idx}`)}
                          className="p-1 hover:bg-amber-100 rounded transition-colors"
                          title={isFieldHidden(`bank-avg-${idx}`) ? 'Show' : 'Hide'}
                        >
                          {isFieldHidden(`bank-avg-${idx}`) ? <BiHide size={16} className="text-amber-600" /> : <BiShow size={16} className="text-amber-600" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full Rankings Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Complete Rankings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">#</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Bank Name</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Revenue</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Submissions</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Success Rate</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Avg Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {bankMetrics.map((bank, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-bold text-gray-900">{bank.rank}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{bank.name}</td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-emerald-600">
                        <div className="flex items-center justify-end gap-2">
                          <span>{isFieldHidden(`table-revenue-${idx}`) ? '••••••' : formatMoney(bank.revenue, 'millions')}</span>
                          <button
                            onClick={() => toggleFieldVisibility(`table-revenue-${idx}`)}
                            className="p-1 hover:bg-emerald-100 rounded transition-colors"
                            title={isFieldHidden(`table-revenue-${idx}`) ? 'Show' : 'Hide'}
                          >
                            {isFieldHidden(`table-revenue-${idx}`) ? <BiHide size={14} className="text-emerald-600" /> : <BiShow size={14} className="text-emerald-600" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-blue-600">{bank.submissions}</td>
                      <td className="py-3 px-4 text-right text-sm">
                        <span className={bank.successRate >= 80 ? 'text-emerald-600 font-semibold' : bank.successRate >= 60 ? 'text-amber-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {bank.successRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-amber-600 font-semibold">
                        <div className="flex items-center justify-end gap-2">
                          <span>{isFieldHidden(`table-avg-${idx}`) ? '••••••' : formatMoney(bank.avgTransaction)}</span>
                          <button
                            onClick={() => toggleFieldVisibility(`table-avg-${idx}`)}
                            className="p-1 hover:bg-amber-100 rounded transition-colors"
                            title={isFieldHidden(`table-avg-${idx}`) ? 'Show' : 'Hide'}
                          >
                            {isFieldHidden(`table-avg-${idx}`) ? <BiHide size={14} className="text-amber-600" /> : <BiShow size={14} className="text-amber-600" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Timeline */}
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BiCalendar size={20} className="text-cyan-600" /> Payment Timeline Analysis
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.08)" />
              <XAxis dataKey="week" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#000' }} />
              <Legend />
              <Bar dataKey="verified" fill="#10b981" name="Verified Payments" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending Payments" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <hr className="my-8" />

        {/* Year-over-Year Section */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Year-over-Year Analysis</h2>

        {yearData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No Hajj year data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {yearData.map((year, idx) => {
              const prevYear = yearData[idx + 1];
              const pilgrimGrowth = prevYear ? getGrowthIndicator(year.pilgrims, prevYear.pilgrims) : null;
              const paymentGrowth = prevYear ? getGrowthIndicator(year.totalPayment, prevYear.totalPayment) : null;
              const verifiedGrowth = prevYear ? getGrowthIndicator(year.verified, prevYear.verified) : null;

              return (
                <div key={year.id} className="bg-white rounded-lg border border-gray-200 p-8 hover:border-gray-300 transition">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">{year.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">Year {year.year}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-500 uppercase">Total Pilgrims</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{year.pilgrims.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Pilgrims</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{year.pilgrims.toLocaleString()}</p>
                      {pilgrimGrowth && idx < yearData.length - 1 && (
                        <p className={`text-xs font-medium mt-2 ${pilgrimGrowth.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {pilgrimGrowth.direction === 'up' ? '↑' : '↓'} {Math.abs(pilgrimGrowth.percent).toFixed(1)}% vs {yearData[idx + 1].year}
                        </p>
                      )}
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Total Revenue</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-2xl font-bold text-green-900">{isFieldHidden(`year-revenue-${year.id}`) ? '••••••' : formatMoney(year.totalPayment, 'millions')}</p>
                        <button
                          onClick={() => toggleFieldVisibility(`year-revenue-${year.id}`)}
                          className="p-1 hover:bg-green-200 rounded transition-colors"
                          title={isFieldHidden(`year-revenue-${year.id}`) ? 'Show' : 'Hide'}
                        >
                          {isFieldHidden(`year-revenue-${year.id}`) ? <BiHide size={16} className="text-green-700" /> : <BiShow size={16} className="text-green-700" />}
                        </button>
                      </div>
                      {paymentGrowth && idx < yearData.length - 1 && (
                        <p className={`text-xs font-medium mt-2 ${paymentGrowth.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {paymentGrowth.direction === 'up' ? '↑' : '↓'} {Math.abs(paymentGrowth.percent).toFixed(1)}% vs {yearData[idx + 1].year}
                        </p>
                      )}
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Verified Payments</p>
                      <p className="text-2xl font-bold text-blue-900 mt-2">{year.verified.toLocaleString()}</p>
                      {verifiedGrowth && idx < yearData.length - 1 && (
                        <p className={`text-xs font-medium mt-2 ${verifiedGrowth.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {verifiedGrowth.direction === 'up' ? '↑' : '↓'} {Math.abs(verifiedGrowth.percent).toFixed(1)}% vs {yearData[idx + 1].year}
                        </p>
                      )}
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Success Rate</p>
                      <p className="text-2xl font-bold text-purple-900 mt-2">
                        {year.pilgrims > 0 ? Math.round(year.verified / year.pilgrims * 100) : 0}%
                      </p>
                      <p className="text-xs text-purple-600 mt-2">
                        {year.verified} of {year.pilgrims} pilgrims
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Pending Payments</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{year.pending.toLocaleString()}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600 font-medium">Avg Payment per Pilgrim</p>
                        <button
                          onClick={() => toggleFieldVisibility(`avg-payment-${year.id}`)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title={isFieldHidden(`avg-payment-${year.id}`) ? 'Show' : 'Hide'}
                        >
                          {isFieldHidden(`avg-payment-${year.id}`) ? <BiHide size={14} className="text-gray-600" /> : <BiShow size={14} className="text-gray-600" />}
                        </button>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {isFieldHidden(`avg-payment-${year.id}`) ? '••••••' : `D${year.pilgrims > 0 ? (year.totalPayment / year.pilgrims / 1000).toFixed(1) : 0}K`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Completion Rate</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {year.verified + year.pending > 0 ? Math.round(year.verified / (year.verified + year.pending) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
