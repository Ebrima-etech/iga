'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Card from '@/components/Common/Card';
import Badge from '@/components/Common/Badge';
import { BiGlobe, BiStar, BiBarChartAlt2, BiLineChart, BiArrowUp, BiArrowDown } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { HajjYear } from '@/types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface YearStats {
  year: HajjYear;
  totalPilgrims: number;
  totalPayments: number;
  confirmedPayments: number;
  activeBanks: number;
  paymentRate: number;
}

export default function HajjUniverse() {
  const [loading, setLoading] = useState(true);
  const [yearsStats, setYearsStats] = useState<YearStats[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'comparison' | 'analytics'>('overview');

  useEffect(() => {
    loadHajjUniverseData();
  }, []);

  const loadHajjUniverseData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hajj-years/');
      const years: HajjYear[] = response.data.results || response.data;

      // Fetch stats for each year
      const statsPromises = years.map(async (year) => {
        try {
          const [pilgrimsRes, paymentsRes, banksRes] = await Promise.all([
            api.get(`/pilgrims/?hajj_year=${year.id}`),
            api.get(`/bank-payment-submissions/?hajj_year=${year.id}`),
            api.get('/banks/'),
          ]);

          const pilgrims = pilgrimsRes.data.results || pilgrimsRes.data || [];
          const payments = paymentsRes.data.results || paymentsRes.data || [];
          const banks = banksRes.data.results || banksRes.data || [];

          const confirmedPayments = payments.filter((p: any) => p.status === 'verified').length;
          const totalPayments = payments.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);

          return {
            year,
            totalPilgrims: pilgrims.length,
            totalPayments,
            confirmedPayments,
            activeBanks: banks.filter((b: any) => b.is_active).length,
            paymentRate: pilgrims.length > 0 ? Math.round((confirmedPayments / pilgrims.length) * 100) : 0,
          };
        } catch (error) {
          console.error(`Failed to load stats for year ${year.year}:`, error);
          return {
            year,
            totalPilgrims: 0,
            totalPayments: 0,
            confirmedPayments: 0,
            activeBanks: 0,
            paymentRate: 0,
          };
        }
      });

      const stats = await Promise.all(statsPromises);
      setYearsStats(stats.sort((a, b) => b.year.year - a.year.year));
      if (stats.length > 0) {
        setSelectedYears([stats[0].year.id]);
      }
    } catch (error) {
      console.error('Error loading Hajj Universe data:', error);
      toast.error('Failed to load Hajj years data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare comparison data
  const comparisonData = yearsStats
    .filter(s => selectedYears.includes(s.year.id))
    .map(s => ({
      year: s.year.year,
      pilgrims: s.totalPilgrims,
      revenue: s.totalPayments / 1000,
      paymentRate: s.paymentRate,
      banks: s.activeBanks,
    }));

  // Prepare trend data (all years)
  const trendData = yearsStats
    .sort((a, b) => a.year.year - b.year.year)
    .map(s => ({
      year: s.year.year,
      pilgrims: s.totalPilgrims,
      revenue: s.totalPayments / 1000000,
      confirmed: s.confirmedPayments,
      rate: s.paymentRate,
    }));

  // Prepare radar data for latest year
  const latestYear = yearsStats[0];
  const radarData = latestYear ? [
    { metric: 'Pilgrims', value: Math.min((latestYear.totalPilgrims / 100) * 100, 100), fullValue: latestYear.totalPilgrims },
    { metric: 'Payment Rate', value: latestYear.paymentRate, fullValue: `${latestYear.paymentRate}%` },
    { metric: 'Banks Active', value: (latestYear.activeBanks / 10) * 100, fullValue: latestYear.activeBanks },
    { metric: 'Revenue (M)', value: Math.min((latestYear.totalPayments / 100000000) * 100, 100), fullValue: `$${(latestYear.totalPayments / 1000000).toFixed(1)}M` },
  ] : [];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-gray-700 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>)}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        {/* Hero Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BiGlobe size={40} className="text-purple-400" />
            <h1 className="text-5xl font-bold text-white">Hajj Universe</h1>
          </div>
          <p className="text-purple-200 text-lg">Explore the complete history and performance of all Hajj years</p>
        </div>

        {/* View Mode Tabs */}
        <div className="mb-8 flex gap-3 justify-center flex-wrap">
          {(['overview', 'comparison', 'analytics'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                viewMode === mode
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-800 text-purple-200 hover:bg-slate-700'
              }`}
            >
              {mode === 'overview' && <div className="flex items-center gap-2"><BiStar size={18} /> Overview</div>}
              {mode === 'comparison' && <div className="flex items-center gap-2"><BiBarChartAlt2 size={18} /> Comparison</div>}
              {mode === 'analytics' && <div className="flex items-center gap-2"><BiLineChart size={18} /> Analytics</div>}
            </button>
          ))}
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {yearsStats.slice(0, 4).map((stat, idx) => (
                <div key={stat.year.id} className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/20 p-6 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/20">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">Hajj {stat.year.year}</h3>
                      {stat.year.is_active && (
                        <Badge variant="success" size="sm">
                          <BiStar size={12} className="mr-1" />
                          ACTIVE
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200 text-sm">Pilgrims</span>
                        <span className="text-2xl font-bold text-white">{stat.totalPilgrims}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200 text-sm">Revenue</span>
                        <span className="text-xl font-bold text-green-400">${(stat.totalPayments / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200 text-sm">Payment Rate</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-blue-400">{stat.paymentRate}%</span>
                          {stat.paymentRate >= 80 ? <BiArrowUp className="text-green-400" /> : <BiArrowDown className="text-red-400" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Year Details Cards */}
            <div className="space-y-4">
              {yearsStats.map((stat) => (
                <div key={stat.year.id} className="bg-gradient-to-r from-slate-800 to-slate-900 border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/50 transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Hajj {stat.year.year}</h3>
                      <p className="text-purple-300 text-sm">{new Date(stat.year.start_date).toLocaleDateString()} - {new Date(stat.year.end_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-200 text-xs uppercase tracking-wide">Pilgrims</p>
                      <p className="text-3xl font-bold text-blue-400">{stat.totalPilgrims}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-200 text-xs uppercase tracking-wide">Revenue</p>
                      <p className="text-3xl font-bold text-green-400">${(stat.totalPayments / 1000000).toFixed(1)}M</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-200 text-xs uppercase tracking-wide">Payment Rate</p>
                      <p className="text-3xl font-bold text-purple-400">{stat.paymentRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-200 text-xs uppercase tracking-wide">Banks</p>
                      <p className="text-3xl font-bold text-yellow-400">{stat.activeBanks}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Mode */}
        {viewMode === 'comparison' && (
          <div className="space-y-8">
            {/* Year Selection */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Select Years to Compare</h3>
              <div className="flex flex-wrap gap-3">
                {yearsStats.map((stat) => (
                  <button
                    key={stat.year.id}
                    onClick={() => {
                      setSelectedYears(prev =>
                        prev.includes(stat.year.id)
                          ? prev.filter(id => id !== stat.year.id)
                          : [...prev, stat.year.id]
                      );
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedYears.includes(stat.year.id)
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                        : 'bg-slate-700 text-purple-200 hover:bg-slate-600'
                    }`}
                  >
                    Hajj {stat.year.year}
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pilgrim Comparison */}
              <Card padding="lg" shadow="none" className="bg-slate-800 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BiUsers className="text-blue-400" /> Pilgrim Numbers
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                    <XAxis dataKey="year" stroke="#a78bfa" />
                    <YAxis stroke="#a78bfa" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="pilgrims" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Revenue Comparison */}
              <Card padding="lg" shadow="none" className="bg-slate-800 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BiWallet className="text-green-400" /> Revenue (in Millions)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                    <XAxis dataKey="year" stroke="#a78bfa" />
                    <YAxis stroke="#a78bfa" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Payment Rate */}
              <Card padding="lg" shadow="none" className="bg-slate-800 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BiTrendingUp className="text-purple-400" /> Payment Rate %
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                    <XAxis dataKey="year" stroke="#a78bfa" />
                    <YAxis stroke="#a78bfa" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="paymentRate" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Banks Active */}
              <Card padding="lg" shadow="none" className="bg-slate-800 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BiBarChartAlt2 className="text-yellow-400" /> Active Banks
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                    <XAxis dataKey="year" stroke="#a78bfa" />
                    <YAxis stroke="#a78bfa" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="banks" fill="#eab308" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}

        {/* Analytics Mode */}
        {viewMode === 'analytics' && (
          <div className="space-y-8">
            {/* Trend Over Time */}
            <Card padding="lg" shadow="none" className="bg-slate-800 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <BiLineChart className="text-cyan-400" /> Historical Trends
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorPilgrims" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                  <XAxis dataKey="year" stroke="#a78bfa" />
                  <YAxis stroke="#a78bfa" yAxisId="left" />
                  <YAxis stroke="#a78bfa" yAxisId="right" orientation="right" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Area type="monotone" dataKey="pilgrims" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPilgrims)" yAxisId="left" />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" yAxisId="right" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Performance Radar */}
            {latestYear && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card padding="lg" shadow="none" className="bg-slate-800 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <BiStar className="text-yellow-400" /> Performance Radar (Hajj {latestYear.year.year})
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(139, 92, 246, 0.2)" />
                      <PolarAngleAxis dataKey="metric" stroke="#a78bfa" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#a78bfa" />
                      <Radar name="Performance" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', color: '#fff' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Key Insights */}
                <Card padding="lg" shadow="none" className="bg-slate-800 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-6">Key Insights</h3>
                  <div className="space-y-4">
                    {yearsStats.slice(0, 2).map((stat, idx) => {
                      const prev = yearsStats[idx + 1];
                      const pilgrimGrowth = prev ? ((stat.totalPilgrims - prev.totalPilgrims) / prev.totalPilgrims * 100) : 0;
                      const revenueGrowth = prev ? ((stat.totalPayments - prev.totalPayments) / prev.totalPayments * 100) : 0;

                      return (
                        <div key={stat.year.id} className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/10">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">Hajj {stat.year.year}</h4>
                            {stat.year.is_active && <Badge variant="success" size="sm">Active</Badge>}
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-purple-200">📊 Total Pilgrims: <span className="text-blue-400 font-bold">{stat.totalPilgrims}</span></p>
                            <p className="text-purple-200">💰 Revenue: <span className="text-green-400 font-bold">${(stat.totalPayments / 1000000).toFixed(2)}M</span></p>
                            <p className="text-purple-200">✅ Payment Success: <span className="text-purple-400 font-bold">{stat.paymentRate}%</span></p>
                            {prev && (
                              <>
                                <p className="text-purple-200">📈 Pilgrim Growth: <span className={`${pilgrimGrowth >= 0 ? 'text-green-400' : 'text-red-400'} font-bold`}>{pilgrimGrowth.toFixed(1)}%</span></p>
                                <p className="text-purple-200">💵 Revenue Growth: <span className={`${revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'} font-bold`}>{revenueGrowth.toFixed(1)}%</span></p>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
