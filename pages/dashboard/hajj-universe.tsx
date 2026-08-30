'use client';

import Layout from '@/components/Layout';

export default function HajjUniverse() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Hajj Universe</h1>
          <p className="text-purple-200 text-lg mb-8">Coming Soon - Hajj Statistics Dashboard</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">📊 Overview</h2>
              <p className="text-purple-200">Historical data and performance metrics for all Hajj years</p>
            </div>

            <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">📈 Comparison</h2>
              <p className="text-purple-200">Compare statistics across different Hajj years</p>
            </div>

            <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">📉 Analytics</h2>
              <p className="text-purple-200">Deep dive into detailed analytics and trends</p>
            </div>

            <div className="bg-slate-800 border border-purple-500/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">🎯 Insights</h2>
              <p className="text-purple-200">Key insights and performance indicators</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
