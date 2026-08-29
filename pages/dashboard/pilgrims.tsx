'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import MultiStepForm from '@/components/Common/MultiStepForm';
import ProfessionalTable from '@/components/Common/ProfessionalTable';
import Card from '@/components/Common/Card';
import Badge from '@/components/Common/Badge';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import { BiPlus, BiSearch, BiTrash, BiPencil, BiX, BiChevronRight } from 'react-icons/bi';
import { useRouter } from 'next/router';
import { saveDraft, getDraft, deleteDraft } from '@/lib/draftManager';
import { TableSkeleton } from '@/components/Common/Skeleton';
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
        type: 'text' as const,
        required: true,
        placeholder: 'John',
        voiceInput: true,
      },
      {
        name: 'last_name',
        label: 'Last Name',
        type: 'text' as const,
        required: true,
        placeholder: 'Doe',
        voiceInput: true,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email' as const,
        required: true,
        placeholder: 'john@example.com',
        voiceInput: true,
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'text' as const,
        required: true,
        placeholder: '+220-123-4567',
        voiceInput: true,
      },
      {
        name: 'date_of_birth',
        label: 'Date of Birth',
        type: 'date' as const,
        required: true,
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select' as const,
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
        type: 'text' as const,
        required: true,
        placeholder: 'A12345678',
        voiceInput: true,
      },
      {
        name: 'nationality',
        label: 'Nationality',
        type: 'text' as const,
        required: true,
        placeholder: 'Gambian',
        voiceInput: true,
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
        type: 'text' as const,
        required: true,
        placeholder: '123 Main Street',
        voiceInput: true,
      },
      {
        name: 'city',
        label: 'City',
        type: 'text' as const,
        required: true,
        placeholder: 'Banjul',
        voiceInput: true,
      },
      {
        name: 'state',
        label: 'State/Province',
        type: 'text' as const,
        placeholder: 'Western Region',
        voiceInput: true,
      },
      {
        name: 'postal_code',
        label: 'Postal Code',
        type: 'text' as const,
        voiceInput: true,
      },
      {
        name: 'country',
        label: 'Country',
        type: 'text' as const,
        required: true,
        placeholder: 'Gambia',
        voiceInput: true,
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
        type: 'number' as const,
        required: true,
        placeholder: '5000',
        voiceInput: true,
      },
    ],
  },
  {
    id: 'review',
    title: 'Review Information',
    description: 'Please review all the information before submitting',
    fields: [],
  },
];

export default function PilgrimsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [filteredPilgrims, setFilteredPilgrims] = useState<Pilgrim[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [showDraftList, setShowDraftList] = useState(false);
  const [draftData, setDraftData] = useState({});
  const [draftsList, setDraftsList] = useState<any[]>([]);
  const [editingPilgrim, setEditingPilgrim] = useState<Pilgrim | null>(null);

  useEffect(() => {
    fetchPilgrims();
    loadDrafts();
  }, []);

  useEffect(() => {
    filterPilgrims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      };

      if (editingPilgrim) {
        await api.put(`/pilgrims/${editingPilgrim.id}/`, submitData);
        toast.success('Pilgrim updated successfully!');
        setShowInlineForm(false);
        setEditingPilgrim(null);
        setDraftData({});
      } else {
        await api.post('/pilgrims/', submitData);
        toast.success('Pilgrim registered successfully!');
        setShowInlineForm(true); // Keep form open but reset data
        deleteDraft('pilgrim_registration');
        setDraftData({});
      }

      fetchPilgrims();
      loadDrafts();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${editingPilgrim ? 'update' : 'register'} pilgrim`);
    }
  };

  const handleEditClick = (pilgrim: Pilgrim) => {
    setEditingPilgrim(pilgrim);
    setDraftData({
      first_name: pilgrim.first_name,
      last_name: pilgrim.last_name,
      email: pilgrim.email,
      phone: pilgrim.phone,
      date_of_birth: pilgrim.date_of_birth,
      gender: pilgrim.gender,
      passport_number: pilgrim.passport_number,
      nationality: pilgrim.nationality,
      address: pilgrim.address,
      city: pilgrim.city,
      state: pilgrim.state,
      postal_code: pilgrim.postal_code,
      country: pilgrim.country,
      total_amount_due: pilgrim.total_amount_due,
      registration_id: pilgrim.registration_id,
    });
    setShowDraftList(false);
    setShowInlineForm(true);
  };

  const handleCloseForm = () => {
    setShowInlineForm(false);
    setEditingPilgrim(null);
    setDraftData({});
  };

  const handleSaveDraft = async (formData: Record<string, any>, currentStep: number) => {
    saveDraft('pilgrim_registration', formData, currentStep);
    toast.success('Draft saved successfully');
    loadDrafts();
  };

  const loadDraft = (draft: any) => {
    setEditingPilgrim(null);
    setDraftData(draft.data);
    setShowInlineForm(true);
    setShowDraftList(false);
  };

  const columns = [
    { key: 'registration_id', label: 'ID', width: '12%', render: (v: string) => <span className="font-mono text-xs text-gray-500">{v}</span> },
    { key: 'first_name', label: 'First Name', width: '18%', render: (v: string) => <span className="font-medium text-gray-900">{v}</span> },
    { key: 'last_name', label: 'Last Name', width: '18%', render: (v: string) => <span className="font-medium text-gray-900">{v}</span> },
    { key: 'phone', label: 'Phone', width: '18%', render: (v: string) => <span className="text-gray-600 font-mono text-xs">{v}</span> },
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
      render: (v: number) => <span className="text-gray-900 font-mono font-medium">${v.toLocaleString()}</span>,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Pilgrims</h1>
            <p className="text-gray-600 mt-1">Manage and register pilgrims for Hajj operations</p>
          </div>
          <div className="flex gap-2 flex-wrap">
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
              icon={<BiPlus size={18} />}
              onClick={() => {
                setEditingPilgrim(null);
                setDraftData({});
                setShowInlineForm(true);
              }}
            >
              Add Pilgrim
            </ProfessionalButton>
          </div>
        </div>

        {/* Drafts List */}
        {showDraftList && draftsList.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Saved Drafts</h3>
            <div className="space-y-2">
              {draftsList.map((draft) => (
                <div key={draft.id} className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 hover:border-gray-300 transition">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {draft.data.first_name || 'Unnamed'} {draft.data.last_name || ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Step {draft.currentStep + 1}/4 • {new Date(draft.savedAt).toLocaleString()}
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
                    <button
                      onClick={() => {
                        deleteDraft('pilgrim_registration');
                        loadDrafts();
                        toast.success('Draft deleted');
                      }}
                      className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded transition"
                      title="Delete draft"
                    >
                      <BiTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inline Form Section - Shows inline on Add Pilgrim / Edit click */}
        {showInlineForm && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200 animate-slideInUp">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {editingPilgrim ? `Edit Pilgrim — ${editingPilgrim.full_name}` : 'Register New Pilgrim'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {editingPilgrim
                    ? 'Update the details below and save your changes'
                    : 'Complete all steps to register a new pilgrim'}
                </p>
              </div>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded transition"
              >
                <BiX size={24} />
              </button>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <MultiStepForm
                key={editingPilgrim ? `edit-${editingPilgrim.id}` : 'new'}
                steps={pilgrimFormSteps}
                onSubmit={handleFormSubmit}
                onSaveDraft={editingPilgrim ? undefined : handleSaveDraft}
                draftData={draftData}
                title="Pilgrim Registration"
                inline={true}
                voiceEnabled={true}
                language="en-US"
                submitLabel={editingPilgrim ? 'Save Changes' : 'Submit'}
              />
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <BiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-sm"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white cursor-pointer text-sm"
            >
              <option value="">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="paid">Paid</option>
              <option value="departed">Departed</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>

        {/* Pilgrims Table */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Registered Pilgrims</h2>
              <p className="text-sm text-gray-500 mt-0.5">{filteredPilgrims.length} pilgrim{filteredPilgrims.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <TableSkeleton rows={8} columnCount={6} />
            ) : (
              <ProfessionalTable
                columns={columns}
                data={filteredPilgrims}
                loading={false}
                emptyMessage="No pilgrims registered yet • Click 'Add Pilgrim' to register a new one"
                actions={(row: Pilgrim) => (
                  <div className="flex gap-2">
                    <ProfessionalButton
                      variant="ghost"
                      size="sm"
                      icon={<BiChevronRight size={14} />}
                      onClick={() => router.push(`/dashboard/pilgrims/${row.id}`)}
                    >
                      View
                    </ProfessionalButton>
                    <ProfessionalButton
                    variant="ghost"
                    size="sm"
                    icon={<BiPencil size={14} />}
                    onClick={() => handleEditClick(row)}
                  >
                    Edit
                  </ProfessionalButton>
                  </div>
                )}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
