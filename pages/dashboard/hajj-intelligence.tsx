'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Card from '@/components/Common/Card';
import Badge from '@/components/Common/Badge';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import { BiTrendingUp, BiUsers, BiWallet, BiTarget, BiZoomIn, BiDownload, BiCheckCircle, BiAlertTriangle, BiLightbulb } from 'react-icons/bi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { HajjYear } from '@/types';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Treemap
} from 'recharts';

interface AdvancedMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: string;
}

interface Insight {
  title: string;
  description: string;
  icon: React.ReactNode;
  severity: 'positive' | 'warning' | 'critical';
  actionable: boolean;
}

export default function HajjUniverseAdvanced() {
  const [loading, setLoading] = useState(true);
  const [yearsStats, setYearsStats] = useState<any[]>([]);
  const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedMetric[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    loadAdvancedAnalytics();
  }, []);

  const loadAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hajj-years/');
      const years: HajjYear[] = response.data.results || response.data;

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
            avgPaymentPerPilgrim: pilgrims.length > 0 ? totalPayments / pilgrims.length : 0,
          };
        } catch (error) {
          console.error(`Failed to load stats for year ${year.year}:`, error);
          return null;
        }
      });

      const stats = (await Promise.all(statsPromises)).filter(Boolean).sort((a, b) => b.year.year - a.year.year);
      setYearsStats(stats);

      // Generate advanced metrics
      if (stats.length >= 2) {
        const latest = stats[0];
        const previous = stats[1];

        const metrics: AdvancedMetric[] = [
          {
            label: 'YoY Pilgrim Growth',
            value: `${(((latest.totalPilgrims - previous.totalPilgrims) / previous.totalPilgrims) * 100).toFixed(1)}%`,
            change: ((latest.totalPilgrims - previous.totalPilgrims) / previous.totalPilgrims) * 100,
            trend: latest.totalPilgrims > previous.totalPilgrims ? 'up' : 'down',
            target: '+15%',
          },
          {
            label: 'Revenue Growth',
            value: `$${((latest.totalPayments - previous.totalPayments) / 1000000).toFixed(2)}M`,
            change: ((latest.totalPayments - previous.totalPayments) / previous.totalPayments) * 100,
            trend: latest.totalPayments > previous.totalPayments ? 'up' : 'down',
            target: '+20%',
          },
          {
            label: 'Payment Success Rate',
            value: `${latest.paymentRate}%`,
            change: latest.paymentRate - previous.paymentRate,
            trend: latest.paymentRate > previous.paymentRate ? 'up' : 'down',
            target: '85%',
          },
          {
            label: 'Avg Payment/Pilgrim',
            value: `$${latest.avgPaymentPerPilgrim.toFixed(0)}`,
            change: ((latest.avgPaymentPerPilgrim - previous.avgPaymentPerPilgrim) / previous.avgPaymentPerPilgrim) * 100,
            trend: latest.avgPaymentPerPilgrim > previous.avgPaymentPerPilgrim ? 'up' : 'down',
            target: `$${(previous.avgPaymentPerPilgrim * 1.1).toFixed(0)}`,
          },
        ];

        setAdvancedMetrics(metrics);

        // Generate intelligent insights
        const generatedInsights: Insight[] = [];

        if (latest.totalPilgrims > previous.totalPilgrims * 1.2) {
          generatedInsights.push({
            title: '📈 Strong Pilgrim Enrollment Growth',
            description: `Enrollment has grown ${(((latest.totalPilgrims - previous.totalPilgrims) / previous.totalPilgrims) * 100).toFixed(1)}% YoY. Consider expanding bank partnerships to handle increased volume.`,
            icon: <BiTrendingUp size={24} />,
            severity: 'positive',
            actionable: true,
          });
        }

        if (latest.paymentRate < 70) {
          generatedInsights.push({
            title: '⚠️ Payment Conversion Below Target',
            description: `Payment rate at ${latest.paymentRate}% vs target 85%. Investigate payment friction points and consider payment plan options.`,
            icon: <BiAlertTriangle size={24} />,
            severity: 'warning',
            actionable: true,
          });
        }

        if (latest.paymentRate > 90) {
          generatedInsights.push({
            title: '✨ Exceptional Payment Performance',
            description: `Payment success rate of ${latest.paymentRate}% exceeds industry standards. This is an excellent operational achievement.`,
            icon: <BiCheckCircle size={24} />,
            severity: 'positive',
            actionable: false,
          });
        }

        if (latest.totalPayments > previous.totalPayments * 1.5) {
          generatedInsights.push({
            title: '💰 Significant Revenue Acceleration',
            description: 'Revenue has exceeded 150% of previous year. Ensure payment processing infrastructure can handle this volume.',
            icon: <BiWallet size={24} />,
            severity: 'positive',
            actionable: true,
          });
        }

        if (latest.activeBanks < 3) {
          generatedInsights.push({
            title: '🏦 Limited Bank Coverage',
            description: 'Only few banks active. Consider onboarding additional financial institutions to increase payment options and resilience.',
            icon: <BiLightbulb size={24} />,
            severity: 'critical',
            actionable: true,
          });
        }

        setInsights(generatedInsights);
      }
    } catch (error) {
      console.error('Error loading advanced analytics:', error);
      toast.error('Failed to load advanced analytics');
    } finally {
      setLoading(false);
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
        {/* Advanced Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">🎯 Intelligence Center</h1>
          <p className="text-purple-200">Advanced analytics, forecasting, and actionable business intelligence</p>
        </div>

        {/* Advanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {advancedMetrics.map((metric, idx) => (
            <div key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/60 transition-all">
              <p className="text-purple-300 text-sm font-medium mb-2">{metric.label}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                  <p className="text-xs text-gray-400 mt-1">Target: {metric.target}</p>
                </div>
                <div className={`text-right ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  <p className="text-sm font-semibold">{metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%</p>
                  <span className="text-lg">{metric.trend === 'up' ? '📈' : '📉'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Intelligent Insights */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">💡 Intelligent Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-lg border-2 ${
                  insight.severity === 'positive'
                    ? 'bg-emerald-900/20 border-emerald-500/30'
                    : insight.severity === 'warning'
                    ? 'bg-amber-900/20 border-amber-500/30'
                    : 'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${
                    insight.severity === 'positive'
                      ? 'text-emerald-400'
                      : insight.severity === 'warning'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-2">{insight.title}</h3>
                    <p className="text-purple-200 text-sm mb-3">{insight.description}</p>
                    {insight.actionable && (
                      <button className="text-sm font-medium text-purple-300 hover:text-purple-200 transition-colors">
                        → Take Action
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Forecasting */}
        <Card padding="lg" shadow="none" className="bg-slate-800 border border-purple-500/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">📊 Performance Forecast (Next Year)</h2>
          {yearsStats.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Projected Growth</h3>
                <div className="space-y-3">
                  {(() => {
                    const latest = yearsStats[0];
                    const previous = yearsStats[1];
                    const pilgrimGrowthRate = (latest.totalPilgrims - previous.totalPilgrims) / previous.totalPilgrims;
                    const revenueGrowthRate = (latest.totalPayments - previous.totalPayments) / previous.totalPayments;

                    return (
                      <>
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <p className="text-purple-200 text-sm">Projected Pilgrims</p>
                          <p className="text-2xl font-bold text-blue-400">{Math.round(latest.totalPilgrims * (1 + pilgrimGrowthRate)).toLocaleString()}</p>
                          <p className="text-xs text-gray-400 mt-1">Based on {(pilgrimGrowthRate * 100).toFixed(1)}% growth trend</p>
                        </div>
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <p className="text-purple-200 text-sm">Projected Revenue</p>
                          <p className="text-2xl font-bold text-green-400">${(latest.totalPayments * (1 + revenueGrowthRate) / 1000000).toFixed(1)}M</p>
                          <p className="text-xs text-gray-400 mt-1">Based on {(revenueGrowthRate * 100).toFixed(1)}% growth trend</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
                <div className="space-y-3">
                  {(() => {
                    const latest = yearsStats[0];
                    const risks = [];

                    if (latest.paymentRate < 75) risks.push({ label: 'Low Payment Rate', severity: 'high' });
                    if (latest.activeBanks < 3) risks.push({ label: 'Limited Bank Coverage', severity: 'high' });
                    if (latest.totalPilgrims > 5000) risks.push({ label: 'High Pilgrim Volume', severity: 'medium' });

                    return risks.length > 0 ? (
                      risks.map((risk, i) => (
                        <div key={i} className={`p-3 rounded-lg ${risk.severity === 'high' ? 'bg-red-900/30 border border-red-500/30' : 'bg-amber-900/30 border border-amber-500/30'}`}>
                          <p className={`text-sm font-medium ${risk.severity === 'high' ? 'text-red-300' : 'text-amber-300'}`}>
                            ⚠️ {risk.label}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-lg bg-emerald-900/30 border border-emerald-500/30">
                        <p className="text-sm font-medium text-emerald-300">✅ Low Risk Profile</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Benchmarking & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card padding="lg" shadow="none" className="bg-slate-800 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4">🎯 Goals vs Reality</h3>
            {yearsStats.length > 0 && (
              <div className="space-y-4">
                {(() => {
                  const latest = yearsStats[0];
                  const goalPaymentRate = 85;
                  const goalPilgrimGrowth = 15;
                  const goalRevenuGrowth = 20;

                  return (
                    <>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-purple-200 text-sm">Payment Success Rate</span>
                          <span className="text-white font-bold">{latest.paymentRate}% / {goalPaymentRate}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${latest.paymentRate >= goalPaymentRate ? 'bg-green-500' : 'bg-orange-500'}`}
                            style={{ width: `${Math.min((latest.paymentRate / goalPaymentRate) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </Card>

          <Card padding="lg" shadow="none" className="bg-slate-800 border border-purple-500/20">
            <h3 className="text-lg font-bold text-white mb-4">📋 Action Items</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-700/50 rounded-lg border-l-4 border-blue-500">
                <p className="text-white font-medium text-sm">→ Optimize Payment Processing</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg border-l-4 border-purple-500">
                <p className="text-white font-medium text-sm">→ Expand Bank Partnerships</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg border-l-4 border-green-500">
                <p className="text-white font-medium text-sm">→ Launch Pilgrim Growth Campaign</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg border-l-4 border-yellow-500">
                <p className="text-white font-medium text-sm">→ Monitor Payment Trends Weekly</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
