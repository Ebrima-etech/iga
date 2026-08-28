'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import MultiStepForm from '@/components/Common/MultiStepForm';
import ProfessionalTable from '@/components/Common/ProfessionalTable';
import Card from '@/components/Common/Card';
import Badge from '@/components/Common/Badge';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import { BiPlus, BiSearch, BiTrash, BiPencil, BiX } from 'react-icons/bi';
import { saveDraft, getDraft, deleteDraft } from '@/lib/draftManager';
import toast from 'react-hot-toast';
import { Pilgrim } from '@/types';
import api from '@/lib/api';

const pilgrimFormSteps = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Enter your basic personal details',
    fields: [
      {
        name: 'first_name',
        label: 'First Name',
        type: 'text',
        required: true,
        placeholder: 'John',
      },
      {
        name: 'last_name',
        label: 'Last Name',
        type: 'text',
        required: true,
        placeholder: 'Doe',
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'john@example.com',
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'text',
        required: true,
        placeholder: '+220-123-4567',
      },
      {
        name: 'date_of_birth',
        label: 'Date of Birth',
        type: 'date',
        required: true,
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: [
          { label: 'Male', value: 'M' },
          { label: 'Female', value: 'F' },
        ],
      },
    ],
  },
  {
    id: 'passport-info',
    title: 'Passport Information',
    description: 'Enter your passport details',
    fields: [
      {
        name: 'passport_number',
        label: 'Passport Number',
        type: 'text',
        required: true,
        placeholder: 'A12345678',
      },
      {
        name: 'nationality',
        label: 'Nationality',
        type: 'text',
        required: true,
        placeholder: 'Gambian',
      },
    ],
  },
  {
    id: 'address-info',
    title: 'Address Information',
    description: 'Enter your residential address',
    fields: [
      {
        name: 'address',
        label: 'Street Address',
        type: 'text',
        required: true,
        placeholder: '123 Main Street',
      },
      {
        name: 'city',
        label: 'City',
        type: 'text',
        required: true,
        placeholder: 'Banjul',
      },
      {
        name: 'state',
        label: 'State/Province',
        type: 'text',
        placeholder: 'Western Region',
      },
      {
        name: 'postal_code',
        label: 'Postal Code',
        type: 'text',
      },
      {
        name: 'country',
        label: 'Country',
        type: 'text',
        required: true,
        placeholder: 'Gambia',
      },
    ],
  },
  {
    id: 'payment-info',
    title: 'Payment Information',
    description: 'Enter your payment details',
    fields: [
      {
        name: 'total_amount_due',
        label: 'Total Amount Due ($)',
        type: 'number',
        required: true,
        placeholder: '5000',
      },
      {
        name: 'registration_id',
        label: 'Registration ID (Auto-generated if blank)',
        type: 'text',
        placeholder: 'Leave blank for auto-generation',
      },
    ],
  },
];

export default function PilgrimsPage() {
  const [loading, setLoading] = useState(true);
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [filteredPilgrims, setFilteredPilgrims] = useState<Pilgrim[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [showDraftList, setShowDraftList] = useState(false);
  const [draftData, setDraftData] = useState({});
  const [draftsList, setDraftsList] = useState<any[]>([]);

  useEffect(() => {
    fetchPilgrims();
    loadDrafts();
  }, []);

  useEffect(() => {
    filterPilgrims();
  }, [searchQuery, statusFilter, pilgrims]);

  const fetchPilgrims = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pilgrims/');
      setPilgrims(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching pilgrims:', error);
      toast.error('Failed to load pilgrims');
    } finally {
      setLoading(false);
    }
  };

  const loadDrafts = () => {
    const draft = getDraft('pilgrim_registration');
    if (draft) {
      setDraftsList([draft]);
    }
  };

  const filterPilgrims = () => {
    let filtered = pilgrims;
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    setFilteredPilgrims(filtered);
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    try {
      const submitData = {
        ...formData,
        total_amount_due: parseFloat(formData.total_amount_due),
        registration_id: formData.registration_id || `GH${Math.random().toString().slice(2, 8)}`,
      };
      await api.post('/pilgrims/', submitData);
      toast.success('Pilgrim registered successfully!');
      setShowInlineForm(true); // Keep form open but reset data
      deleteDraft('pilgrim_registration');
      setDraftData({});
      fetchPilgrims();
      loadDrafts();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to register pilgrim');
    }
  };

  const handleSaveDraft = async (formData: Record<string, any>, currentStep: number) => {
    saveDraft('pilgrim_registration', formData, currentStep);
    toast.success('Draft saved successfully');
    loadDrafts();
  };

  const loadDraft = (draft: any) => {
    setDraftData(draft.data);
    setShowInlineForm(true);
    setShowDraftList(false);
  };

  const columns = [
    { key: 'registration_id', label: 'ID', width: '12%', render: (v: string) => <span className="font-medium text-amber-600">{v}</span> },
    { key: 'full_name', label: 'Name', width: '25%', render: (v: string) => <span className="font-medium">{v}</span> },
    { key: 'email', label: 'Email', width: '20%' },
    { key: 'phone', label: 'Phone', width: '15%' },
    {
      key: 'status',
      label: 'Status',
      width: '12%',
      render: (v: string) => (
        <Badge variant={v === 'paid' ? 'success' : v === 'registered' ? 'info' : 'warning'} size="sm">
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'total_amount_due',
      label: 'Amount Due',
      width: '12%',
      render: (v: number) => <span className="font-semibold text-gray-900">${v.toLocaleString()}</span>,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 p-8">
        {/* Page Header */}
        <PageHeader
          title="Pilgrims Management"
          description="Manage and register pilgrims for Hajj operations"
          action={
            <div className="flex gap-3 flex-wrap">
              {draftsList.length > 0 && (
                <ProfessionalButton
                  variant="secondary"
                  size="md"
                  onClick={() => setShowDraftList(!showDraftList)}
                >
                  Drafts ({draftsList.length})
                </ProfessionalButton>
              )}
              <ProfessionalButton
                variant="primary"
                size="md"
                icon={<BiPlus size={20} />}
                onClick={() => {
                  setDraftData({});
                  setShowInlineForm(true);
                }}
              >
                Add Pilgrim
              </ProfessionalButton>
            </div>
          }
        />

        {/* Drafts List */}
        {showDraftList && draftsList.length > 0 && (
          <Card padding="lg" className="mb-6" shadow="md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Saved Drafts</h3>
            <div className="space-y-3">
              {draftsList.map((draft) => (
                <div key={draft.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-transparent rounded-lg border border-amber-200">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {draft.data.first_name || 'Unnamed'} {draft.data.last_name || ''}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Saved at {new Date(draft.savedAt).toLocaleString()} • Step {draft.currentStep + 1}/4
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <ProfessionalButton
                      variant="primary"
                      size="sm"
                      onClick={() => loadDraft(draft)}
                    >
                      Load
                    </ProfessionalButton>
                    <ProfessionalButton
                      variant="danger"
                      size="sm"
                      icon={<BiTrash size={14} />}
                      onClick={() => {
                        deleteDraft('pilgrim_registration');
                        loadDrafts();
                        toast.success('Draft deleted');
                      }}
                    >
                      Delete
                    </ProfessionalButton>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Inline Form Section - Shows inline on Add Pilgrim click */}
        {showInlineForm && (
          <div className="mb-8 animate-slideInUp">
            <Card padding="lg" shadow="lg" className="border-amber-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Register New Pilgrim</h2>
                  <p className="text-gray-600 text-sm mt-1">Complete all steps • Save drafts anytime</p>
                </div>
                <button
                  onClick={() => setShowInlineForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <BiX size={24} />
                </button>
              </div>
              <MultiStepForm
                steps={pilgrimFormSteps}
                onSubmit={handleFormSubmit}
                onSaveDraft={handleSaveDraft}
                draftData={draftData}
                title="Pilgrim Registration"
                inline={true}
              />
            </Card>
          </div>
        )}

        {/* Search and Filter - Modern Card Design */}
        <Card padding="lg" shadow="sm" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Pilgrims</label>
              <div className="relative">
                <BiSearch className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition bg-white cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="registered">Registered</option>
                <option value="paid">Paid</option>
                <option value="departed">Departed</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Pilgrims Table */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Registered Pilgrims</h3>
            <p className="text-sm text-gray-600 mt-1">{filteredPilgrims.length} pilgrim{filteredPilgrims.length !== 1 ? 's' : ''} found</p>
          </div>
          <ProfessionalTable
            columns={columns}
            data={filteredPilgrims}
            loading={loading}
            emptyMessage="No pilgrims registered yet • Click 'Add Pilgrim' to register a new one"
          />
        </div>
      </div>
    </Layout>
  );
}
