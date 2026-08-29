'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import MultiStepForm from '@/components/Common/MultiStepForm';
import { Pilgrim } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { BiChevronLeft } from 'react-icons/bi';

const paymentFormSteps = [
  {
    id: 'pilgrim-info',
    title: 'Select Pilgrim',
    description: 'Choose which pilgrim this payment is for',
    fields: [
      {
        name: 'pilgrim',
        label: 'Pilgrim',
        type: 'select' as const,
        required: true,
        placeholder: 'Select a pilgrim...',
        options: [] as { label: string; value: string }[],
      },
    ],
  },
  {
    id: 'payment-details',
    title: 'Payment Details',
    description: 'Enter the payment information',
    fields: [
      {
        name: 'amount',
        label: 'Amount (GMD)',
        type: 'number' as const,
        required: true,
        placeholder: '0.00',
        validation: (value: any) => {
          const num = parseFloat(value);
          return num > 0 ? null : 'Amount must be greater than 0';
        },
      },
      {
        name: 'payment_date',
        label: 'Payment Date',
        type: 'date' as const,
        required: true,
      },
      {
        name: 'reference_number',
        label: 'Reference Number',
        type: 'text' as const,
        required: true,
        placeholder: 'e.g., REF20260829ABC123',
        validation: (value: any) =>
          value.trim().length >= 5 ? null : 'Reference must be at least 5 characters',
      },
      {
        name: 'bank',
        label: 'Bank',
        type: 'select' as const,
        required: true,
        placeholder: 'Select a bank...',
        options: [] as { label: string; value: string }[],
      },
    ],
  },
  {
    id: 'payer-info',
    title: 'Payer Information',
    description: 'Who made this payment?',
    fields: [
      {
        name: 'payer_name',
        label: 'Payer Name',
        type: 'text' as const,
        required: true,
        placeholder: 'Full name of person making payment',
      },
      {
        name: 'payer_contact',
        label: 'Payer Contact/ID',
        type: 'text' as const,
        required: false,
        placeholder: 'Phone, ID, or account number',
      },
      {
        name: 'payer_relationship',
        label: 'Relationship to Pilgrim',
        type: 'select' as const,
        required: false,
        options: [
          { label: 'Self', value: 'Self' },
          { label: 'Parent', value: 'Parent' },
          { label: 'Spouse', value: 'Spouse' },
          { label: 'Child', value: 'Child' },
          { label: 'Sibling', value: 'Sibling' },
          { label: 'Other Family', value: 'Other Family' },
          { label: 'Friend', value: 'Friend' },
          { label: 'Employer', value: 'Employer' },
          { label: 'Other', value: 'Other' },
        ],
      },
    ],
  },
  {
    id: 'review',
    title: 'Review Payment',
    description: 'Verify all details before submitting',
    fields: [
      {
        name: 'description',
        label: 'Notes (Optional)',
        type: 'textarea' as const,
        required: false,
        placeholder: 'Any additional notes about this payment...',
      },
    ],
  },
];

export default function RecordPaymentPage() {
  const router = useRouter();
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [formSteps, setFormSteps] = useState(paymentFormSteps);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pilgrimsRes, banksRes] = await Promise.all([
        api.get('/pilgrims/'),
        api.get('/banks/'),
      ]);

      const pilgrimsList = pilgrimsRes.data.results || pilgrimsRes.data || [];
      const banksList = banksRes.data.results || banksRes.data || [];

      setPilgrims(pilgrimsList);
      setBanks(banksList);

      // Update form steps with pilgrim and bank options
      const updatedSteps = paymentFormSteps.map((step) => ({
        ...step,
        fields: step.fields.map((field: any) => {
          if (field.name === 'pilgrim') {
            return {
              ...field,
              options: pilgrimsList.map((p: Pilgrim) => ({
                label: `${p.full_name} (${p.registration_id})`,
                value: p.id.toString(),
              })),
            };
          }
          if (field.name === 'bank') {
            return {
              ...field,
              options: banksList.map((b: any) => ({
                label: b.name,
                value: b.id.toString(),
              })),
            };
          }
          return field;
        }),
      })) as typeof paymentFormSteps;

      setFormSteps(updatedSteps);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load pilgrims and banks');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    try {
      // Find the selected pilgrim to get their name
      const selectedPilgrim = pilgrims.find((p) => p.id.toString() === formData.pilgrim);

      const paymentData = {
        pilgrim: parseInt(formData.pilgrim),
        amount: parseFloat(formData.amount),
        reference_number: formData.reference_number,
        status: 'confirmed',
        payment_date: formData.payment_date,
        description: formData.description || '',
        notes: formData.description || '',
        bank: parseInt(formData.bank),
        payer_name: formData.payer_name,
        payer_contact: formData.payer_contact || '',
        payer_relationship: formData.payer_relationship || '',
      };

      await api.post('/payments/', paymentData);
      toast.success(`Payment of ${formData.amount} GMD recorded for ${selectedPilgrim?.full_name}!`);
      router.push('/dashboard/payments');
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to record payment';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8 text-center text-gray-500">Loading form...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium mb-4"
          >
            <BiChevronLeft size={16} />
            Back to Payments
          </button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Record Payment</h1>
            <p className="text-gray-600 mt-1">Add a new payment for a pilgrim</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8">
            <MultiStepForm
              steps={formSteps}
              onSubmit={handleFormSubmit}
              title="Record Payment"
              showProgressBar={true}
              voiceEnabled={false}
              submitLabel="Record Payment"
            />
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">💡 Tips:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Reference number must be unique for each payment</li>
              <li>• Payment date cannot be in the future</li>
              <li>• All payments are recorded as confirmed</li>
              <li>• Payer information helps track the payment source</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
