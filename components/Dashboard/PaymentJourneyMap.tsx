'use client';

import { useState } from 'react';
import { Payment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BiMapPin, BiCalendar, BiDollar, BiBuilding } from 'react-icons/bi';

interface PaymentJourneyMapProps {
  pilgrimName: string;
  registrationDate: string;
  registrationId: string;
  payments: Payment[];
  totalPaid: number;
  packagePrice: number;
  amountRemaining: number;
}

export default function PaymentJourneyMap({
  pilgrimName,
  registrationDate,
  registrationId,
  payments,
  totalPaid,
  packagePrice,
  amountRemaining,
}: PaymentJourneyMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const verifiedPayments = payments.filter(p => p.status === 'verified' || p.status === 'confirmed');
  const totalPoints = verifiedPayments.length + 1; // +1 for registration

  // Calculate cumulative amounts
  let cumulativeAmount = 0;
  const paymentPoints = verifiedPayments.map((payment, idx) => {
    cumulativeAmount += payment.amount;
    return {
      index: idx + 1,
      ...payment,
      cumulative: cumulativeAmount,
    };
  });

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Journey Map</h2>

      {/* Map Container */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BiMapPin size={20} />
              <div>
                <p className="text-sm font-medium opacity-90">Journey of</p>
                <p className="font-bold text-lg">{pilgrimName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Progress</p>
              <p className="text-2xl font-bold">{Math.round((totalPaid / packagePrice) * 100)}%</p>
            </div>
          </div>
        </div>

        {/* Map Content */}
        <div className="p-8">
          {/* Journey Line */}
          <div className="relative">
            {/* SVG Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ height: `${(totalPoints - 1) * 200 + 100}px` }}>
              <line
                x1="30"
                y1="50"
                x2="30"
                y2={`${(totalPoints - 1) * 200 + 50}`}
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray="5,5"
              />
            </svg>

            {/* Waypoints */}
            <div className="space-y-0">
              {/* Registration Point */}
              <div
                className="relative pl-20 pb-20 cursor-pointer group"
                onClick={() => setSelectedPoint(0)}
              >
                {/* Pin */}
                <div className="absolute left-0 top-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
                    📍
                  </div>
                </div>

                {/* Card */}
                <div className={`rounded-lg border-2 p-4 transition-all ${
                  selectedPoint === 0
                    ? 'bg-white border-blue-500 shadow-xl'
                    : 'bg-white border-gray-200 hover:shadow-md'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900">Registration Start</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <BiCalendar size={14} />
                        {new Date(registrationDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">ID</p>
                      <p className="font-mono font-bold text-gray-900">{registrationId}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Points */}
              {paymentPoints.map((payment, idx) => (
                <div
                  key={payment.id}
                  className="relative pl-20 pb-20 cursor-pointer group"
                  onClick={() => setSelectedPoint(idx + 1)}
                >
                  {/* Pin */}
                  <div className="absolute left-0 top-0 flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform ${
                      idx === 0 ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}>
                      💰
                    </div>
                  </div>

                  {/* Card */}
                  <div className={`rounded-lg border-2 p-4 transition-all ${
                    selectedPoint === idx + 1
                      ? 'bg-white border-blue-500 shadow-xl'
                      : 'bg-white border-gray-200 hover:shadow-md'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900">
                          {idx === 0 ? '💳 First Deposit' : `📝 Deposit ${idx + 1}`}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <BiCalendar size={14} />
                          {new Date(payment.payment_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600 font-mono">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Bank</p>
                        <p className="font-medium text-gray-900">{payment.bank_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total So Far</p>
                        <p className="font-mono font-bold text-blue-600">{formatCurrency(payment.cumulative)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Final Status */}
              <div className="relative pl-20">
                <div className="absolute left-0 top-0 flex items-center justify-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg ${
                    amountRemaining > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}>
                    {amountRemaining > 0 ? '⏳' : '✅'}
                  </div>
                </div>

                <div className="rounded-lg border-2 border-gray-200 p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900">
                        {amountRemaining > 0 ? 'Journey In Progress' : 'Journey Complete ✓'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {totalPaid} / {formatCurrency(packagePrice)} paid
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Remaining</p>
                      <p className={`font-bold font-mono text-lg ${
                        amountRemaining > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {formatCurrency(amountRemaining)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 border-t border-gray-200 px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-700">Start</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-gray-700">First Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-gray-700">Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="border-l-2 border-dashed border-blue-400 w-4"></span>
              <span className="text-gray-700">Journey Path</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
