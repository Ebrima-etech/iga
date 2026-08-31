'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import Card from '@/components/Common/Card';
import Loading from '@/components/Common/Loading';
import { BiPlus, BiX, BiDownload, BiFilter, BiArrowUp, BiArrowDown } from 'react-icons/bi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Sheet {
  id: string;
  name: string;
  dataSource: string;
  createdAt: string;
  rowCount: number;
}

interface SheetData {
  columns: string[];
  rows: any[];
}

const DATA_SOURCES = [
  { value: 'pilgrims', label: 'Pilgrims' },
  { value: 'payments', label: 'Payments' },
  { value: 'bank-submissions', label: 'Bank Submissions' },
  { value: 'banks', label: 'Banks' },
];

export default function CallSheetsPage() {
  const router = useRouter();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState('');
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Load sheets from localStorage
  useEffect(() => {
    loadSheets();
  }, []);

  // Load sheet data when selected
  useEffect(() => {
    if (selectedSheet) {
      fetchSheetData(selectedSheet);
    }
  }, [selectedSheet]);

  const loadSheets = () => {
    const saved = localStorage.getItem('call_sheets');
    if (saved) {
      setSheets(JSON.parse(saved));
    }
  };

  const fetchSheetData = async (sheet: Sheet) => {
    try {
      setLoading(true);
      const response = await api.get(`/${sheet.dataSource}/`);
      const data = response.data.results || response.data || [];

      if (Array.isArray(data) && data.length > 0) {
        const columns = Object.keys(data[0]);
        setSheetData({
          columns,
          rows: data,
        });
      } else {
        setSheetData({ columns: [], rows: [] });
      }
    } catch (error) {
      console.error('Failed to fetch sheet data:', error);
      toast.error('Failed to load sheet data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSheet = () => {
    if (!newSheetName.trim() || !selectedDataSource) {
      toast.error('Please fill in all fields');
      return;
    }

    const newSheet: Sheet = {
      id: Date.now().toString(),
      name: newSheetName,
      dataSource: selectedDataSource,
      createdAt: new Date().toISOString(),
      rowCount: 0,
    };

    const updated = [...sheets, newSheet];
    setSheets(updated);
    localStorage.setItem('call_sheets', JSON.stringify(updated));
    setSelectedSheet(newSheet);
    setNewSheetName('');
    setSelectedDataSource('');
    setShowCreateModal(false);
    toast.success('Sheet created successfully');
  };

  const handleDeleteSheet = (id: string) => {
    const updated = sheets.filter((s) => s.id !== id);
    setSheets(updated);
    localStorage.setItem('call_sheets', JSON.stringify(updated));
    if (selectedSheet?.id === id) {
      setSelectedSheet(null);
      setSheetData(null);
    }
    toast.success('Sheet deleted');
  };

  const handleSort = (column: string) => {
    if (sortConfig?.column === column) {
      setSortConfig({
        column,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSortConfig({ column, direction: 'asc' });
    }
  };

  const handleFilterChange = (column: string, value: string) => {
    if (value) {
      setFilters({ ...filters, [column]: value });
    } else {
      const { [column]: _, ...rest } = filters;
      setFilters(rest);
    }
  };

  const getFilteredAndSortedData = () => {
    if (!sheetData) return [];

    let filtered = sheetData.rows.filter((row) => {
      return Object.entries(filters).every(([column, value]) => {
        const cellValue = String(row[column] || '').toLowerCase();
        return cellValue.includes(value.toLowerCase());
      });
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.column];
        const bValue = b[sortConfig.column];

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        const comparison = String(aValue).localeCompare(String(bValue));
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  };

  const handleExport = () => {
    if (!sheetData || !selectedSheet) {
      toast.error('No data to export');
      return;
    }

    const data = getFilteredAndSortedData();
    const headers = sheetData.columns;
    const rows = data.map((row) => headers.map((col) => row[col]));

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell || ''}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSheet.name}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const filteredData = getFilteredAndSortedData();

  return (
    <Layout>
      <div className="min-h-screen bg-white p-8">
        <PageHeader
          title="Call Sheets"
          description="Create and manage spreadsheet-like data views"
          showBreadcrumb={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          {/* Sheets List */}
          <div className="lg:col-span-1">
            <Card padding="lg" className="h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Sheets</h3>
                <ProfessionalButton
                  variant="primary"
                  size="sm"
                  icon={<BiPlus size={16} />}
                  onClick={() => setShowCreateModal(true)}
                >
                  New
                </ProfessionalButton>
              </div>

              <div className="space-y-2">
                {sheets.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No sheets yet</p>
                ) : (
                  sheets.map((sheet) => (
                    <div
                      key={sheet.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedSheet?.id === sheet.id
                          ? 'bg-blue-50 border border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                      onClick={() => setSelectedSheet(sheet)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{sheet.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {DATA_SOURCES.find((d) => d.value === sheet.dataSource)?.label}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSheet(sheet.id);
                          }}
                          className="text-gray-400 hover:text-red-600 transition"
                        >
                          <BiX size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Sheet Content */}
          <div className="lg:col-span-3">
            {selectedSheet ? (
              <Card padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedSheet.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {DATA_SOURCES.find((d) => d.value === selectedSheet.dataSource)?.label}
                    </p>
                  </div>
                  <ProfessionalButton
                    variant="secondary"
                    size="sm"
                    icon={<BiDownload size={16} />}
                    onClick={handleExport}
                  >
                    Export CSV
                  </ProfessionalButton>
                </div>

                {loading ? (
                  <Loading />
                ) : sheetData && sheetData.rows.length > 0 ? (
                  <div className="space-y-4">
                    {/* Filter Row */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            {sheetData.columns.map((column) => (
                              <th
                                key={`filter-${column}`}
                                className="px-4 py-2 text-left"
                              >
                                <input
                                  type="text"
                                  placeholder={`Filter ${column}...`}
                                  value={filters[column] || ''}
                                  onChange={(e) => handleFilterChange(column, e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </th>
                            ))}
                          </tr>
                        </thead>
                      </table>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr className="border-b border-gray-200">
                            {sheetData.columns.map((column) => (
                              <th
                                key={column}
                                className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition"
                                onClick={() => handleSort(column)}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{column}</span>
                                  {sortConfig?.column === column && (
                                    sortConfig.direction === 'asc' ? (
                                      <BiArrowUp size={14} className="text-blue-500" />
                                    ) : (
                                      <BiArrowDown size={14} className="text-blue-500" />
                                    )
                                  )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((row, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-gray-200 hover:bg-gray-50 transition"
                            >
                              {sheetData.columns.map((column) => (
                                <td
                                  key={`${idx}-${column}`}
                                  className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate"
                                >
                                  {row[column] !== null && row[column] !== undefined
                                    ? String(row[column])
                                    : '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="text-xs text-gray-500 text-right">
                      Showing {filteredData.length} of {sheetData.rows.length} rows
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No data available</p>
                  </div>
                )}
              </Card>
            ) : (
              <Card padding="lg" className="flex items-center justify-center h-96">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">Create a new sheet to get started</p>
                  <ProfessionalButton
                    variant="primary"
                    icon={<BiPlus size={16} />}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create New Sheet
                  </ProfessionalButton>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Create Sheet Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card padding="lg" className="w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create New Sheet</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <BiX size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sheet Name
                  </label>
                  <input
                    type="text"
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    placeholder="e.g., December Pilgrims"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Source
                  </label>
                  <select
                    value={selectedDataSource}
                    onChange={(e) => setSelectedDataSource(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a data source...</option>
                    {DATA_SOURCES.map((source) => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <ProfessionalButton
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </ProfessionalButton>
                  <ProfessionalButton
                    variant="primary"
                    className="flex-1"
                    onClick={handleCreateSheet}
                  >
                    Create
                  </ProfessionalButton>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
