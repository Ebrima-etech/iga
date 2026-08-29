'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Loading from '@/components/Common/Loading';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { BiChevronLeft, BiPlus } from 'react-icons/bi';

interface BankPaymentSubmission {
  id: string | number;
  reference_number: string;
  pilgrim_first_name: string;
  pilgrim_last_name: string;
  pilgrim_gender: string;
  pilgrim_phone: string;
  pilgrim_email: string;
  payer_name: string;
  payer_contact: string;
  payer_relationship: string;
  amount: number;
  bank: number;
  bank_name: string;
  payment_date: string;
  status: string;
  description: string;
  created_pilgrim_id?: number;
}

export default function PaymentDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [payment, setPayment] = useState<BankPaymentSubmission | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bank-payment-submissions/${id}/`);
      setPayment(response.data);
    } catch (err) {
      console.error('Failed to fetch payment:', err);
      setError('Failed to load payment details');
      toast.error('Failed to load payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePilgrim = async () => {
    if (!payment) return;

    setCreating(true);
    try {
      // Create new pilgrim from payment data
      const pilgrimData = {
        first_name: payment.pilgrim_first_name,
        last_name: payment.pilgrim_last_name,
        gender: payment.pilgrim_gender || 'M',
        phone: payment.pilgrim_phone,
        email: payment.pilgrim_email || '',
        registration_number: `REG${Date.now()}`,
      };

      const pilgrimRes = await api.post('/pilgrims/', pilgrimData);
      const newPilgrim = pilgrimRes.data;

      // Create corresponding payment record linking to the new pilgrim
      const paymentData = {
        pilgrim: newPilgrim.id,
        bank: payment.bank,
        amount: payment.amount,
        reference_number: payment.reference_number,
        payment_date: payment.payment_date,
        status: 'confirmed',
        description: `From bank submission - ${payment.reference_number}`,
        payer_name: payment.payer_name,
        payer_contact: payment.payer_contact,
        payer_relationship: payment.payer_relationship,
      };

      await api.post('/payments/', paymentData);

      // Update the bank submission to mark pilgrim as created
      await api.patch(`/bank-payment-submissions/${id}/`, {
        created_pilgrim_id: newPilgrim.id,
        status: 'verified',
      });

      toast.success(`Pilgrim ${newPilgrim.full_name} created successfully!`);

      // Refresh payment data
      fetchPayment();
    } catch (err: any) {
      console.error('Failed to create pilgrim:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to create pilgrim';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Layout><Loading /></Layout>;

  if (!payment) {
    return (
      <Layout>
        <div className="p-8 text-center text-red-600">
          {error || 'Payment not found'}
        </div>
      </Layout>
    );
  }

  const hasPilgrim = payment?.created_pilgrim_id || false;
  const isFirstDeposit = !hasPilgrim;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
            >
              <BiChevronLeft size={20} />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Details</h1>
              <p className="text-gray-600 mt-1">{payment.reference_number}</p>
            </div>
          </div>
          {isFirstDeposit && (
            <button
              onClick={handleCreatePilgrim}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              <BiPlus size={18} />
              {creating ? 'Creating...' : 'Create Pilgrim'}
            </button>
          )}
        </div>

        {/* Status Alert */}
        {isFirstDeposit && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <strong>⚠️ First Deposit:</strong> This payment is not yet linked to a pilgrim. Click &quot;Create Pilgrim&quot; to register them in the system.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pilgrim Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilgrim Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium text-gray-900">
                  {payment.pilgrim_first_name} {payment.pilgrim_last_name}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Gender</p>
                <p className="font-medium text-gray-900">
                  {payment.pilgrim_gender === 'M' ? 'Male' : 'Female'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{payment.pilgrim_phone}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{payment.pilgrim_email || '(Not provided)'}</p>
              </div>
            </div>
          </div>

          {/* Payer Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payer Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Payer Name</p>
                <p className="font-medium text-gray-900">{payment.payer_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Contact/ID</p>
                <p className="font-medium text-gray-900">{payment.payer_contact || '(Not provided)'}</p>
              </div>
              <div>
                <p className="text-gray-600">Relationship</p>
                <p className="font-medium text-gray-900">{payment.payer_relationship}</p>
              </div>
              <div>
                <p className="text-gray-600">Bank</p>
                <p className="font-medium text-gray-900">{payment.bank_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Amount</p>
              <p className="font-bold text-lg text-emerald-700">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <p className="text-gray-600">Reference</p>
              <p className="font-mono font-medium text-gray-900">{payment.reference_number}</p>
            </div>
            <div>
              <p className="text-gray-600">Date</p>
              <p className="font-medium text-gray-900">{formatDate(payment.payment_date)}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className={`font-medium capitalize ${payment.status === 'confirmed' ? 'text-emerald-600' : 'text-yellow-600'}`}>
                {payment.status}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {payment.description && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
            <p className="text-gray-700">{payment.description}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
