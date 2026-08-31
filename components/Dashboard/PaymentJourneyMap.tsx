'use client';

import { useState } from 'react';
import { Payment } from '@/types';
import { formatCurrency } from '@/lib/utils';

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

  let cumulativeAmount = 0;
  const paymentPoints = verifiedPayments.map((payment, idx) => {
    cumulativeAmount += payment.amount;
    return {
      index: idx + 1,
      ...payment,
      cumulative: cumulativeAmount,
    };
  });

  const progressPercentage = packagePrice > 0 ? Math.min((totalPaid / packagePrice) * 100, 100) : 0;

  return (
    <div className="mb-6">
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-900">{pilgrimName}</p>
            <p className="text-xs text-gray-500">Payment Progress</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">{Math.round(progressPercentage)}%</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-4 py-4 overflow-x-hidden">
          <div className="relative" style={{ minHeight: '100px' }}>
            {/* Horizontal Line */}
            <svg className="absolute w-full pointer-events-none" style={{ height: '90px', top: '0' }}>
              <line x1="0" y1="35" x2="100%" y2="35" stroke="#e5e7eb" strokeWidth="1" />
            </svg>

            {/* Waypoints Container */}
            <div style={{ position: 'relative', height: '90px' }}>
              {/* Start */}
              <div
                className="absolute flex flex-col items-center"
                style={{ left: '0', top: '0', width: '60px' }}
                onClick={() => setSelectedPoint(0)}
              >
                <div className="mb-2 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                    selectedPoint === 0
                      ? 'bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    1
                  </div>
                </div>
                <div className="text-center text-xs whitespace-nowrap">
                  <p className="font-medium text-gray-700">Start</p>
                  <p className="text-gray-500 text-xs">{new Date(registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>

              {/* Payments */}
              {paymentPoints.map((payment, idx) => {
                const paymentPosition = ((payment.cumulative / packagePrice) * 100);
                return (
                  <div
                    key={payment.id}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${paymentPosition}%`, top: '0', width: '60px', transform: 'translateX(-50%)' }}
                    onClick={() => setSelectedPoint(idx + 1)}
                  >
                    <div className="mb-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                        selectedPoint === idx + 1
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500'
                      }`}>
                        {idx + 2}
                      </div>
                    </div>
                    <div className="text-center text-xs whitespace-nowrap">
                      <p className="font-medium text-gray-700">{formatCurrency(payment.amount)}</p>
                      <p className="text-gray-500 text-xs">{payment.bank_name}</p>
                      <p className="text-gray-500 text-xs">{new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                );
              })}

              {/* Pending/Done - Position based on progress */}
              <div
                className="absolute flex flex-col items-center"
                style={{ left: `${progressPercentage}%`, top: '0', width: '60px', transform: 'translateX(-50%)' }}
              >
                <div className="mb-2 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
                    amountRemaining > 0
                      ? 'bg-white border-gray-300 text-gray-500'
                      : 'bg-green-50 border-green-500 text-green-600'
                  }`}>
                    ✓
                  </div>
                </div>
                <div className="text-center text-xs whitespace-nowrap">
                  <p className="font-medium text-gray-700">{amountRemaining > 0 ? 'Pending' : 'Done'}</p>
                  <p className="text-gray-500 text-xs">{formatCurrency(amountRemaining)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
