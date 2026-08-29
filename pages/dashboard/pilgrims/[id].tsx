'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Badge from '@/components/Common/Badge';
import Card from '@/components/Common/Card';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import Loading from '@/components/Common/Loading';
import { Pilgrim, Payment } from '@/types';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { BiChevronLeft, BiPhone, BiEnvelope, BiCalendar, BiMapPin, BiDollar, BiCheckCircle, BiTrendingUp } from 'react-icons/bi';

export default function PilgrimDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [pilgrim, setPilgrim] = useState<Pilgrim | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (id) {
      fetchPilgrimAndPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPilgrimAndPayments = async () => {
    try {
      setLoading(true);
      const [pilgrimRes, paymentsRes] = await Promise.all([
        api.get(`/pilgrims/${id}/`),
        api.get(`/payments/?pilgrim=${id}`),
      ]);

      console.log('Pilgrim data:', pilgrimRes.data);
      console.log('Payments response:', paymentsRes.data);

      setPilgrim(pilgrimRes.data);
      const paymentsList = Array.isArray(paymentsRes.data)
        ? paymentsRes.data
        : paymentsRes.data.results || [];

      console.log('Filtered payments:', paymentsList);

      setPayments(
        paymentsList.sort((a: Payment, b: Payment) =>
          new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
        )
      );
    } catch (error) {
      console.error('Failed to fetch pilgrim details:', error);
      toast.error('Failed to load pilgrim details');
      router.push('/dashboard/pilgrims');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><Loading /></Layout>;
  if (!pilgrim) return <Layout><div className="p-8 text-center text-gray-500">Pilgrim not found</div></Layout>;

  const totalPaid = payments
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + p.amount, 0);
  const amountRemaining = Math.max(0, pilgrim.total_amount_due - totalPaid);

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <ProfessionalButton
            variant="ghost"
            size="sm"
            icon={<BiChevronLeft size={16} />}
            onClick={() => router.back()}
          >
            Back to Pilgrims
          </ProfessionalButton>
        </div>

        {/* Pilgrim Info Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{pilgrim.full_name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={
                    pilgrim.status === 'paid'
                      ? 'success'
                      : pilgrim.status === 'departed'
                      ? 'info'
                      : pilgrim.status === 'returned'
                      ? 'warning'
                      : 'warning'
                  }
                  size="md"
                >
                  {pilgrim.status.charAt(0).toUpperCase() + pilgrim.status.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500">
                  {pilgrim.gender === 'M' ? 'Alagie' : 'Aja'} • ID: {pilgrim.registration_id}
                </span>
              </div>
            </div>
            <ProfessionalButton
              variant="primary"
              size="md"
              onClick={() => {
                // Navigate to edit
              }}
            >
              Edit Details
            </ProfessionalButton>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card padding="lg" shadow="none" className="border border-gray-200">
              <div className="flex items-start gap-3">
                <BiPhone className="text-emerald-600 mt-1" size={20} />
                <div>
                  <p className="text-xs text-gray-600 font-medium uppercase">Phone</p>
                  <p className="text-sm font-mono text-gray-900 mt-1">{pilgrim.phone}</p>
                </div>
              </div>
            </Card>

            <Card padding="lg" shadow="none" className="border border-gray-200">
              <div className="flex items-start gap-3">
                <BiEnvelope className="text-emerald-600 mt-1" size={20} />
                <div>
                  <p className="text-xs text-gray-600 font-medium uppercase">Email</p>
                  <p className="text-sm font-mono text-gray-900 mt-1">{pilgrim.email}</p>
                </div>
              </div>
            </Card>

            <Card padding="lg" shadow="none" className="border border-gray-200">
              <div className="flex items-start gap-3">
                <BiCalendar className="text-emerald-600 mt-1" size={20} />
                <div>
                  <p className="text-xs text-gray-600 font-medium uppercase">Date of Birth</p>
                  <p className="text-sm font-mono text-gray-900 mt-1">{formatDate(pilgrim.date_of_birth)}</p>
                </div>
              </div>
            </Card>

            <Card padding="lg" shadow="none" className="border border-gray-200">
              <div className="flex items-start gap-3">
                <BiMapPin className="text-emerald-600 mt-1" size={20} />
                <div>
                  <p className="text-xs text-gray-600 font-medium uppercase">Nationality</p>
                  <p className="text-sm font-mono text-gray-900 mt-1">{pilgrim.nationality}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Address Information */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium text-gray-900">{pilgrim.address}</p>
              <p className="text-gray-600">{pilgrim.city}, {pilgrim.state} {pilgrim.postal_code}</p>
              <p className="text-gray-600">{pilgrim.country}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-2">Passport: {pilgrim.passport_number}</p>
              <p className="text-gray-600 mb-3">Emergency Contact: {pilgrim.emergency_contact_name}</p>
              <p className="text-gray-600 font-mono">{pilgrim.emergency_contact_phone}</p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="lg" shadow="none" className="border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase">Total Due</p>
            <p className="text-2xl font-bold text-gray-900 mt-3 font-mono">{formatCurrency(pilgrim.total_amount_due)}</p>
          </Card>

          <Card padding="lg" shadow="none" className="border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-600 mt-3 font-mono">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-gray-500 mt-2">{payments.filter(p => p.status === 'confirmed').length} confirmed</p>
          </Card>

          <Card padding="lg" shadow="none" className="border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase">Remaining</p>
            <p className={`text-2xl font-bold mt-3 font-mono ${amountRemaining > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {formatCurrency(amountRemaining)}
            </p>
          </Card>
        </div>

        {/* Transaction Timeline */}
        {payments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Timeline</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              {/* Progress visualization */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">Payment Progress</p>
                  <p className="text-sm font-medium text-gray-700">
                    {Math.round((totalPaid / pilgrim.total_amount_due) * 100)}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((totalPaid / pilgrim.total_amount_due) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                {payments
                  .filter(p => p.status === 'confirmed')
                  .map((payment, index) => (
                    <div key={payment.id} className="flex gap-6">
                      {/* Timeline dot and line */}
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        {index < payments.filter(p => p.status === 'confirmed').length - 1 && (
                          <div className="w-1 h-12 bg-emerald-200 mt-2"></div>
                        )}
                      </div>

                      {/* Transaction Details */}
                      <div className="flex-1 pb-4">
                        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">Deposit #{index + 1}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(payment.payment_date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-emerald-600 font-mono">
                                {formatCurrency(payment.amount)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Reference: {payment.reference_number}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-200">
                            <div>
                              <p className="text-xs text-gray-600">Bank</p>
                              <p className="font-medium text-gray-900">{payment.bank_name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Payer</p>
                              <p className="font-medium text-gray-900">{payment.payer_name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Relationship</p>
                              <p className="font-medium text-gray-900">{payment.payer_relationship || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Running Total</p>
                              <p className="font-mono font-medium text-emerald-600">
                                {formatCurrency(
                                  payments
                                    .filter(p => p.status === 'confirmed')
                                    .slice(0, index + 1)
                                    .reduce((sum, p) => sum + p.amount, 0)
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Summary Stats */}
              {payments.filter(p => p.status === 'confirmed').length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Deposits</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {payments.filter(p => p.status === 'confirmed').length}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Average Deposit</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2 font-mono">
                        {formatCurrency(
                          totalPaid / payments.filter(p => p.status === 'confirmed').length
                        )}
                      </p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <p className="text-sm text-emerald-600 font-medium">Payment Status</p>
                      <p className="text-2xl font-bold text-emerald-600 mt-2">
                        {amountRemaining > 0 ? 'Pending' : 'Complete'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment History */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
          {payments.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Reference</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Bank</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Payer</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3.5 font-mono text-xs text-gray-500">{payment.reference_number}</td>
                        <td className="px-6 py-3.5 font-mono font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">{payment.bank_name}</td>
                        <td className="px-6 py-3.5 text-sm">
                          <div>
                            <p className="font-medium text-gray-900">{payment.payer_name || 'N/A'}</p>
                            {payment.payer_relationship && (
                              <p className="text-xs text-gray-500">{payment.payer_relationship}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm">
                          <Badge
                            variant={
                              payment.status === 'confirmed'
                                ? 'success'
                                : payment.status === 'pending'
                                ? 'warning'
                                : 'error'
                            }
                            size="sm"
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">{formatDate(payment.payment_date)}</td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">
                          {payment.description || payment.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <BiDollar size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No payments recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
