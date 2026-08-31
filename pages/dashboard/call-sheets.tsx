'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import Card from '@/components/Common/Card';
import Loading from '@/components/Common/Loading';
import { BiPlus, BiX, BiDownload, BiArrowUp, BiArrowDown } from 'react-icons/bi';
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
  { value: 'bank-payment-submissions', label: 'Payments' },
  { value: 'bank-payment-submissions', label: 'Bank Submissions' },
  { value: 'banks', label: 'Banks' },
];

const ShimmerLoader = () => (
  <div className="fixed inset-0 bg-white flex flex-col z-50 overflow-hidden">
    <style>{`
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      @keyframes borderGlow {
        0%, 100% { border-color: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.3); }
        50% { border-color: #059669; box-shadow: 0 0 12px rgba(5, 150, 105, 0.5); }
      }
      .shimmer {
        background: linear-gradient(90deg, #f0fdf4 0%, #f9fdf6 50%, #f0fdf4 100%);
        background-size: 1000px 100%;
        animation: shimmer 2s infinite;
      }
      .cell-border {
        animation: borderGlow 3s ease-in-out infinite;
      }
    `}</style>

    {/* Header */}
    <div className="bg-white border-b-2 border-green-500 px-4 py-3 flex-shrink-0">
      <div className="h-6 w-64 shimmer rounded mb-2" />
      <div className="h-3 w-48 shimmer rounded" />
    </div>

    {/* Grid cells */}
    <div className="flex-1 overflow-hidden">
      <div className="w-full h-full">
        {/* Column Headers */}
        <div className="flex border-b-2 border-green-500 sticky top-0 bg-white">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={`header-${i}`}
              className="flex-1 min-w-48 h-10 px-3 py-2 border-r-2 cell-border border-green-500"
            >
              <div className="h-4 w-24 shimmer rounded" />
            </div>
          ))}
        </div>

        {/* Data Rows */}
        <div className="overflow-y-auto">
          {Array(15).fill(0).map((_, rowIdx) => (
            <div key={`row-${rowIdx}`} className="flex border-b border-gray-200">
              {Array(6).fill(0).map((_, colIdx) => (
                <div
                  key={`cell-${rowIdx}-${colIdx}`}
                  className="flex-1 min-w-48 h-9 px-3 py-2 border-r border-gray-200 cell-border"
                  style={{
                    borderRight: '2px solid #10b981',
                    animation: `borderGlow 3s ease-in-out infinite ${(rowIdx + colIdx) * 0.1}s`
                  }}
                >
                  <div className="h-4 w-32 shimmer rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

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

  useEffect(() => {
    loadSheets();
  }, []);

  useEffect(() => {
    if (selectedSheet) {
      fetchSheetData(selectedSheet);
    }
  }, [selectedSheet]);

  const loadSheets = () => {
    const saved = localStorage.getItem('call_sheets');
    if (saved) {
      const parsedSheets = JSON.parse(saved);
      setSheets(parsedSheets);
      if (parsedSheets.length > 0 && !selectedSheet) {
        setSelectedSheet(parsedSheets[0]);
      }
    }
  };

  const fetchSheetData = async (sheet: Sheet) => {
    try {
      setLoading(true);
      let allData: any[] = [];
      let url = `/${sheet.dataSource}/?limit=100`;
      let pageCount = 0;

      // Fetch all pages
      while (url && pageCount < 1000) {
        pageCount++;
        const response = await api.get(url);

        const pageData = response.data.results || (Array.isArray(response.data) ? response.data : []);
        allData = [...allData, ...pageData];

        console.log(`Page ${pageCount}: fetched ${pageData.length} items, total: ${allData.length}`);

        // Check for next page
        url = response.data.next || null;

        // If not paginated format, break
        if (!response.data.results) {
          break;
        }
      }

      console.log(`Finished fetching: ${allData.length} total items`);

      if (Array.isArray(allData) && allData.length > 0) {
        const columns = Object.keys(allData[0]);
        setSheetData({
          columns,
          rows: allData,
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

  const handleSheetReorder = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('sheetId');
    if (sourceId === targetId) return;

    const sourceIdx = sheets.findIndex((s) => s.id === sourceId);
    const targetIdx = sheets.findIndex((s) => s.id === targetId);

    const updated = [...sheets];
    const [movedSheet] = updated.splice(sourceIdx, 1);
    updated.splice(targetIdx, 0, movedSheet);

    setSheets(updated);
    localStorage.setItem('call_sheets', JSON.stringify(updated));
  };

  const filteredData = getFilteredAndSortedData();

  // Show initial shimmer on first load
  if (loading && !sheetData) {
    return <ShimmerLoader />;
  }

  if (selectedSheet && sheetData) {
    // Full-screen sheet view
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b-2 border-green-500 px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedSheet.name}</h1>
            <p className="text-xs text-green-600 mt-1 font-medium">
              {DATA_SOURCES.find((d) => d.value === selectedSheet.dataSource)?.label}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ProfessionalButton
              variant="secondary"
              size="sm"
              icon={<BiDownload size={14} />}
              onClick={handleExport}
            >
              Export
            </ProfessionalButton>
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
              title="Go back"
            >
              <BiX size={20} />
            </button>
          </div>
        </div>

        {/* Sheet Content */}
        <div className="flex-1 overflow-hidden bg-gray-100 p-4 flex flex-col">
          {sheetData.rows.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden flex flex-col h-full shadow-lg">
              {/* Filter Row */}
              <div className="bg-gray-50 border-b border-gray-300 overflow-x-auto">
                <div className="inline-flex min-w-full">
                  <div className="w-12 bg-gray-100 border-r border-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600" />
                  {sheetData.columns.map((column) => (
                    <div
                      key={`filter-${column}`}
                      className="flex-1 min-w-48 px-3 py-2 border-r border-gray-300 last:border-r-0"
                    >
                      <input
                        type="text"
                        placeholder={`Filter...`}
                        value={filters[column] || ''}
                        onChange={(e) => handleFilterChange(column, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Grid */}
              <div className="flex-1 overflow-x-auto overflow-y-auto">
                <div className="inline-flex min-w-full bg-white">
                  {/* Row Numbers */}
                  <div className="w-12 bg-gray-50 border-r border-gray-300 sticky left-0 z-10">
                    <div className="h-10 bg-gray-100 border-b border-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600" />
                    {filteredData.map((_, idx) => (
                      <div
                        key={`row-${idx}`}
                        className="h-9 border-b border-gray-300 flex items-center justify-center text-xs text-gray-600 font-medium"
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>

                  {/* Columns */}
                  <div className="flex">
                    {sheetData.columns.map((column) => (
                      <div key={`col-${column}`} className="flex flex-col">
                        {/* Header Cell */}
                        <div
                          className="w-48 h-10 bg-gray-100 border-b border-gray-300 border-r border-gray-300 px-3 py-1 cursor-pointer hover:bg-gray-200 transition flex items-center justify-between group"
                          onClick={() => handleSort(column)}
                        >
                          <span className="text-xs font-bold text-gray-700 truncate">
                            {column}
                          </span>
                          {sortConfig?.column === column && (
                            <span className="ml-2 flex-shrink-0">
                              {sortConfig.direction === 'asc' ? (
                                <BiArrowUp size={12} className="text-blue-600" />
                              ) : (
                                <BiArrowDown size={12} className="text-blue-600" />
                              )}
                            </span>
                          )}
                        </div>

                        {/* Data Cells */}
                        {filteredData.map((row, idx) => (
                          <div
                            key={`cell-${idx}-${column}`}
                            className={`w-48 h-9 px-3 py-1 border-b border-gray-300 border-r border-gray-300 text-xs text-gray-800 flex items-center overflow-hidden ${
                              idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <span className="truncate">
                              {row[column] !== null && row[column] !== undefined
                                ? String(row[column])
                                : '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-2 border-t border-gray-300 text-xs text-gray-600">
                Showing {filteredData.length} of {sheetData.rows.length} rows
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-sm">No data available</p>
            </div>
          )}
        </div>

        {/* Sheet Tabs at Bottom */}
        <div className="bg-white border-t border-gray-300 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1">
            {sheets.map((sheet) => (
              <div
                key={sheet.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('sheetId', sheet.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => handleSheetReorder(e, sheet.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer border-b-2 transition ${
                  selectedSheet.id === sheet.id
                    ? 'bg-white border-b-green-500 text-green-600 font-semibold shadow-sm'
                    : 'bg-gray-50 border-b-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedSheet(sheet)}
                title={sheet.name}
              >
                <span className="text-sm truncate max-w-32 font-medium">{sheet.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSheet(sheet.id);
                  }}
                  className="text-gray-400 hover:text-red-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition"
                >
                  <BiX size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Sheet Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-green-100 text-green-600 font-bold text-lg transition flex-shrink-0"
            title="Add new sheet"
          >
            +
          </button>

          {/* Spacer */}
          <div className="flex-1" />
        </div>

        {/* Create Sheet Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg border border-gray-400 shadow-lg w-full max-w-md">
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-300 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create New Sheet</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <BiX size={20} />
                </button>
              </div>

              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Sheet Name
                  </label>
                  <input
                    type="text"
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    placeholder="e.g., December Pilgrims"
                    className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Data Source
                  </label>
                  <select
                    value={selectedDataSource}
                    onChange={(e) => setSelectedDataSource(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select a data source...</option>
                    {DATA_SOURCES.map((source) => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-6">
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
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show create modal if no sheets
  if (sheets.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Call Sheets</h1>
            <p className="text-gray-600 mb-8">Create your first sheet to get started</p>
            <ProfessionalButton
              variant="primary"
              size="lg"
              icon={<BiPlus size={18} />}
              onClick={() => setShowCreateModal(true)}
            >
              Create New Sheet
            </ProfessionalButton>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg border border-gray-400 shadow-lg w-full max-w-md">
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-300 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create New Sheet</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <BiX size={20} />
                </button>
              </div>

              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Sheet Name
                  </label>
                  <input
                    type="text"
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    placeholder="e.g., December Pilgrims"
                    className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Data Source
                  </label>
                  <select
                    value={selectedDataSource}
                    onChange={(e) => setSelectedDataSource(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select a data source...</option>
                    {DATA_SOURCES.map((source) => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-6">
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
            </div>
          </div>
        )}
      </Layout>
    );
  }

  // Fallback - should never reach here as selectedSheet is auto-loaded
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loading />
      </div>
    </Layout>
  );
}
