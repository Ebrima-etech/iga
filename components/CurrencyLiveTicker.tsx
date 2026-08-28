'use client';

import { useState, useEffect } from 'react';
import { CurrencyCode } from '@/types';
import { useLiveRates } from '@/hooks/useLiveRates';
import Card from './Common/Card';
import { BiTrendingUp, BiCircle } from 'react-icons/bi';

interface RatePair {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rate: number;
  change?: number;
}

export default function CurrencyLiveTicker() {
  const liveRates = useLiveRates();
  const [ratePairs, setRatePairs] = useState<RatePair[]>([
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0, change: 0 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0, change: 0 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0, change: 0 },
  ]);

  useEffect(() => {
    const updated = ratePairs.map((pair) => {
      const newRate = liveRates.rates[pair.code] || pair.rate;
      const change = pair.rate ? ((newRate - pair.rate) / pair.rate) * 100 : 0;

      return {
        ...pair,
        rate: newRate,
        change,
      };
    });

    setRatePairs(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveRates.rates]);

  const timeAgo = new Date(liveRates.lastUpdate);
  const formattedTime = timeAgo.toLocaleTimeString();

  return (
    <Card padding="lg" className="overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-gray-900">Live Rates</h3>
          <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full">
            <BiCircle className="text-green-500 animate-pulse" size={8} />
            <span className="text-xs font-medium text-green-700">
              {liveRates.isLive ? 'Live' : 'Manual'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Updated</p>
          <p className="text-sm font-medium text-gray-900">{formattedTime}</p>
        </div>
      </div>

      {/* Currency Pairs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ratePairs.map((pair) => (
          <div
            key={pair.code}
            className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">{pair.code}</p>
                <p className="text-sm text-gray-700">{pair.name}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{pair.symbol}</p>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold text-indigo-600 tabular-nums">
                  {pair.rate.toFixed(6)}
                </p>
                <p className="text-xs text-gray-500 mt-1">per GMD</p>
              </div>

              {pair.change !== undefined && pair.change !== 0 && (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                    pair.change > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  <BiTrendingUp
                    size={14}
                    className={pair.change < 0 ? 'rotate-180' : ''}
                  />
                  <span className="text-xs font-semibold">{Math.abs(pair.change).toFixed(2)}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info Bar */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-600">
          <p>
            {liveRates.isLive ? (
              <>
                <span className="font-medium text-green-700">✓ Real-Time Mode</span> - Updating every 5 seconds
              </>
            ) : (
              <>
                <span className="font-medium text-blue-700">📋 Manual Mode</span> - Admin configured rates
              </>
            )}
          </p>
          <p>Source: {liveRates.isLive ? 'ExchangeRate.Host API' : 'Administrator'}</p>
        </div>
      </div>
    </Card>
  );
}
