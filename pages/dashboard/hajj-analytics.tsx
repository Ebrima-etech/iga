'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Card from '@/components/Common/Card';
import Badge from '@/components/Common/Badge';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import { BiMedal, BiTrendingUp, BiTrendingDown, BiDownload, BiFilter, BiCalendar, BiMap, BiBarChartAlt2 } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

interface BankMetrics {
  name: string;
  submissions: number;
  revenue: number;
  successRate: number;
  avgTransaction: number;
  rank: number;
  trend: number;
}

export default function HajjAnalytics() {
  const [loading, setLoading] = useState(true);
  const [bankMetrics, setBankMetrics] = useState<BankMetrics[]>([]);
  const [paymentTimeline, setPaymentTimeline] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [years, setYears] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const yearsRes = await api.get('/hajj-years/');
      const yearsData = yearsRes.data.results || yearsRes.data || [];
      setYears(yearsData.sort((a: any, b: any) => b.year - a.year));

      if (yearsData.length > 0) {
        setSelectedYear(yearsData[0].id);
        await loadYearAnalytics(yearsData[0].id);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadYearAnalytics = async (yearId: number) => {
    try {
      const [paymentsRes, banksRes] = await Promise.all([
        api.get(`/bank-payment-submissions/?hajj_year=${yearId}`),
        api.get('/banks/'),
      ]);

      const payments = paymentsRes.data.results || paymentsRes.data || [];
      const banks = banksRes.data.results || banksRes.data || [];

      // Calculate bank metrics
      const bankMap = new Map<number, BankMetrics>();

      payments.forEach((payment: any) => {
        const bankId = payment.bank;
        const bank = banks.find((b: any) => b.id === bankId);

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

      // Create payment timeline (mock data for demo)
      const timelineData = [
        { week: 'Week 1', verified: Math.floor(Math.random() * 50), pending: Math.floor(Math.random() * 30) },
        { week: 'Week 2', verified: Math.floor(Math.random() * 60), pending: Math.floor(Math.random() * 25) },
        { week: 'Week 3', verified: Math.floor(Math.random() * 75), pending: Math.floor(Math.random() * 20) },
        { week: 'Week 4', verified: Math.floor(Math.random() * 85), pending: Math.floor(Math.random() * 15) },
      ];
      setPaymentTimeline(timelineData);
    } catch (error) {
      console.error('Error loading year analytics:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-gray-700 rounded-lg w-1/3"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">📊 Deep Analytics Hub</h1>
          <p className="text-purple-200">Bank performance, payment timelines, and detailed breakdowns</p>
        </div>

        {/* Year Filter */}
        <div className="mb-8 flex gap-3 flex-wrap">
          {years.map((year) => (
            <button
              key={year.id}
              onClick={() => {
                setSelectedYear(year.id);
                loadYearAnalytics(year.id);
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedYear === year.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-800 text-purple-200 hover:bg-slate-700'
              }`}
            >
              Hajj {year.year}
            </button>
          ))}
        </div>

        {/* Bank Leaderboard */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BiMedal size={28} className="text-yellow-400" /> Bank Performance Leaderboard
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {bankMetrics.slice(0, 3).map((bank, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-lg border-2 relative overflow-hidden ${
                  idx === 0
                    ? 'bg-gradient-to-br from-yellow-900/30 to-yellow-900/10 border-yellow-500/50'
                    : idx === 1
                    ? 'bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-gray-500/50'
                    : 'bg-gradient-to-br from-orange-900/30 to-orange-900/10 border-orange-500/50'
                }`}
              >
                <div className="absolute top-0 right-0 text-6xl opacity-10">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{bank.name}</h3>
                    <Badge variant="info" size="sm">#{bank.rank}</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-200">Revenue</span>
                      <span className="text-lg font-bold text-green-400">${(bank.revenue / 1000000).toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Submissions</span>
                      <span className="text-lg font-bold text-blue-400">{bank.submissions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Success Rate</span>
                      <span className="text-lg font-bold text-purple-400">{bank.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Avg Transaction</span>
                      <span className="text-lg font-bold text-yellow-400">${bank.avgTransaction.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full Rankings Table */}
          <Card padding="lg" shadow="none" className="bg-slate-800 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Complete Rankings</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">#</th>
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Bank Name</th>
                    <th className="text-right py-3 px-4 text-purple-200 font-semibold">Revenue</th>
                    <th className="text-right py-3 px-4 text-purple-200 font-semibold">Submissions</th>
                    <th className="text-right py-3 px-4 text-purple-200 font-semibold">Success Rate</th>
                    <th className="text-right py-3 px-4 text-purple-200 font-semibold">Avg Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {bankMetrics.map((bank, idx) => (
                    <tr key={idx} className="border-b border-purple-500/10 hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-4 text-white font-bold">{bank.rank}</td>
                      <td className="py-3 px-4 text-white">{bank.name}</td>
                      <td className="py-3 px-4 text-right text-green-400 font-semibold">${(bank.revenue / 1000000).toFixed(2)}M</td>
                      <td className="py-3 px-4 text-right text-blue-400">{bank.submissions}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={bank.successRate >= 80 ? 'text-green-400' : bank.successRate >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                          {bank.successRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-yellow-400">${bank.avgTransaction.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Payment Timeline */}
        <Card padding="lg" shadow="none" className="bg-slate-800 border border-purple-500/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BiCalendar size={24} className="text-cyan-400" /> Payment Timeline Analysis
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
              <XAxis dataKey="week" stroke="#a78bfa" />
              <YAxis stroke="#a78bfa" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Bar dataKey="verified" fill="#10b981" name="Verified Payments" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending Payments" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Export Options */}
        <Card padding="lg" shadow="none" className="bg-slate-800 border border-purple-500/20">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BiDownload size={24} className="text-purple-400" /> Export Analytics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <ProfessionalButton variant="secondary" size="md" className="flex items-center justify-center gap-2">
              <BiDownload size={18} /> Export PDF
            </ProfessionalButton>
            <ProfessionalButton variant="secondary" size="md" className="flex items-center justify-center gap-2">
              <BiDownload size={18} /> Export Excel
            </ProfessionalButton>
            <ProfessionalButton variant="secondary" size="md" className="flex items-center justify-center gap-2">
              <BiDownload size={18} /> Export CSV
            </ProfessionalButton>
            <ProfessionalButton variant="secondary" size="md" className="flex items-center justify-center gap-2">
              <BiDownload size={18} /> Email Report
            </ProfessionalButton>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
