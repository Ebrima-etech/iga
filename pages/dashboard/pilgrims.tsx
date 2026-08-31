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
import { useTableState } from '@/lib/useTableState';
import { TableSearch, TableFilter, SortableHeader, TablePagination, TableControlsWrapper } from '@/components/Common/TableControls';
import { pilgrimStatusFilters, genderFilters } from '@/lib/filterConfigs';
import { useRouter } from 'next/router';
import { saveDraft, getDraft, deleteDraft } from '@/lib/draftManager';
import { TableSkeleton } from '@/components/Common/Skeleton';
import { useHajjYear } from '@/lib/stores/hajjYearStore';
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
        label: 'Package Price (D)',
        type: 'number' as const,
        required: true,
        placeholder: '5000',
        voiceInput: true,
        description: 'Total package price (will auto-fill from system default if left empty)',
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
  const { selectedHajjYear } = useHajjYear();
  const [loading, setLoading] = useState(true);
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [showDraftList, setShowDraftList] = useState(false);
  const [draftData, setDraftData] = useState({});
  const [draftsList, setDraftsList] = useState<any[]>([]);
  const [editingPilgrim, setEditingPilgrim] = useState<Pilgrim | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [hajjPackagePrice, setHajjPackagePrice] = useState(0);

  // Use the new table state hook
  const tableState = useTableState<Pilgrim>(pilgrims, {
    initialPageSize: pageSize,
    searchableFields: ['first_name', 'last_name', 'email', 'registration_id', 'phone'],
  });

  useEffect(() => {
    fetchPilgrims();
    loadDrafts();
    loadHajjPackagePrice();
  }, [selectedHajjYear]);

  const loadHajjPackagePrice = async () => {
    try {
      const response = await api.get('/settings/hajj-package-price/');
      setHajjPackagePrice(response.data.price || 0);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hajj_package_price', response.data.price || 0);
      }
    } catch (error) {
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('hajj_package_price');
        if (stored) {
          setHajjPackagePrice(parseFloat(stored));
        }
      }
      console.warn('Using localStorage fallback for hajj package price');
    }
  };

  useEffect(() => {
    tableState.handlePageChange(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  // Auto-open form when voice command passes showCreateForm query param
  useEffect(() => {
    if (router.isReady && router.query.showCreateForm === 'true') {
      console.log('Opening form from voice command');
      setShowInlineForm(true);
      setEditingPilgrim(null);
      setDraftData({});
      // Remove query param after opening form
      setTimeout(() => {
        router.replace('/dashboard/pilgrims', undefined, { shallow: true });
      }, 100);
    }
  }, [router.isReady, router.query]);

  const fetchPilgrims = async () => {
    try {
      setLoading(true);
      const params = selectedHajjYear ? `?hajj_year=${selectedHajjYear}` : '';
      const response = await api.get(`/pilgrims/${params}`);
      const pilgrims = response.data.results || response.data;
      console.log('Fetched pilgrims:', pilgrims);
      console.log('First pilgrim gender field:', pilgrims?.[0]?.gender);
      setPilgrims(pilgrims);
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

  // No need for separate filtering - handled by useTableState hook

  const handleFormSubmit = async (formData: Record<string, any>) => {
    try {
      const submitData = {
        ...formData,
        total_amount_due: formData.total_amount_due ? parseFloat(formData.total_amount_due) : hajjPackagePrice,
        hajj_year: selectedHajjYear,
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

  // Columns defined in table header now with sortable headers

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
              className="hidden"
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

        {/* Advanced Search, Filters, and Pagination */}
        <TableControlsWrapper
          title="Registered Pilgrims"
          searchValue={tableState.searchQuery}
          onSearchChange={tableState.handleSearch}
          filters={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TableFilter
                label="Status"
                value={String(tableState.filters.status || '')}
                options={pilgrimStatusFilters}
                onChange={(value) => tableState.handleFilter('status', value)}
              />
              <TableFilter
                label="Gender"
                value={String(tableState.filters.gender || '')}
                options={genderFilters}
                onChange={(value) => tableState.handleFilter('gender', value)}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Results per page</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
            </div>
          }
          onClearFilters={tableState.handleClearFilters}
          hasActiveFilters={
            tableState.searchQuery !== '' ||
            Object.values(tableState.filters).some((v) => v !== null && v !== '')
          }
        >

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <TableSkeleton rows={8} columnCount={6} />
            ) : (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <SortableHeader
                        label="ID"
                        sortKey="registration_id"
                        currentSort={tableState.sortConfig}
                        onSort={tableState.handleSort}
                      />
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                      <SortableHeader
                        label="First Name"
                        sortKey="first_name"
                        currentSort={tableState.sortConfig}
                        onSort={tableState.handleSort}
                      />
                      <SortableHeader
                        label="Last Name"
                        sortKey="last_name"
                        currentSort={tableState.sortConfig}
                        onSort={tableState.handleSort}
                      />
                      <SortableHeader
                        label="Phone"
                        sortKey="phone"
                        currentSort={tableState.sortConfig}
                        onSort={tableState.handleSort}
                      />
                      <SortableHeader
                        label="Status"
                        sortKey="status"
                        currentSort={tableState.sortConfig}
                        onSort={tableState.handleSort}
                      />
                      <SortableHeader
                        label="Amount Remaining"
                        sortKey="total_amount_paid"
                        currentSort={tableState.sortConfig}
                        onSort={tableState.handleSort}
                      />
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tableState.paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          No pilgrims found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      tableState.paginatedData.map((pilgrim) => (
                        <tr key={pilgrim.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-gray-500">{pilgrim.registration_id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold text-gray-600">
                              {pilgrim.gender === 'M' ? 'Alagie' : pilgrim.gender === 'F' ? 'Aja' : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">{pilgrim.first_name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">{pilgrim.last_name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-600 font-mono text-xs">{pilgrim.phone}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                pilgrim.status === 'paid'
                                  ? 'success'
                                  : pilgrim.status === 'registered'
                                  ? 'info'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {pilgrim.status.charAt(0).toUpperCase() + pilgrim.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-900 font-mono font-medium">
                              ${(pilgrim.amount_remaining || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <ProfessionalButton
                                variant="ghost"
                                size="sm"
                                icon={<BiChevronRight size={14} />}
                                onClick={() => router.push(`/dashboard/pilgrims/${pilgrim.id}`)}
                              >
                                View
                              </ProfessionalButton>
                              <ProfessionalButton
                                variant="ghost"
                                size="sm"
                                icon={<BiPencil size={14} />}
                                onClick={() => handleEditClick(pilgrim)}
                              >
                                Edit
                              </ProfessionalButton>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {tableState.totalItems > 0 && (
                  <TablePagination
                    currentPage={tableState.currentPage}
                    totalPages={tableState.totalPages}
                    pageSize={pageSize}
                    totalItems={tableState.totalItems}
                    onPageChange={tableState.handlePageChange}
                    onPageSizeChange={setPageSize}
                  />
                )}
              </>
            )}
          </div>
        </TableControlsWrapper>
      </div>
    </Layout>
  );
}
