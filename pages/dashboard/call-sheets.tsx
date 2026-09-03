'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import PageHeader from '@/components/Dashboard/PageHeader';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import Card from '@/components/Common/Card';
import Loading from '@/components/Common/Loading';
import { BiPlus, BiX, BiDownload } from 'react-icons/bi';
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
  <div
    className="fixed inset-0 bg-white flex flex-col z-50 overflow-hidden animate-fadeOut"
    style={{
      animation: 'fadeOut 0.8s ease-out forwards',
      animationDelay: '0.5s'
    }}
  >
    <style>{`
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      @keyframes borderGlow {
        0%, 100% { border-color: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.3); }
        50% { border-color: #059669; box-shadow: 0 0 12px rgba(5, 150, 105, 0.5); }
      }
      @keyframes fadeOut {
        0% { opacity: 1; }
        100% { opacity: 0; pointer-events: none; }
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

    {/* Grid cells - fills entire remaining space */}
    <div className="flex-1 overflow-auto flex flex-col">
      {/* Column Headers */}
      <div className="flex border-b-2 border-green-500 sticky top-0 bg-white flex-shrink-0">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={`header-${i}`}
            className="flex-1 min-w-48 h-10 px-3 py-2 border-r-2 cell-border border-green-500"
          >
            <div className="h-4 w-24 shimmer rounded" />
          </div>
        ))}
      </div>

      {/* Data Rows - fills all remaining space */}
      <div className="flex-1">
        {Array(30).fill(0).map((_, rowIdx) => (
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
);

interface CellCoord {
  row: number;
  col: number;
}

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
  const [selectedCell, setSelectedCell] = useState<CellCoord | null>(null);
  const [selectionStart, setSelectionStart] = useState<CellCoord | null>(null);
  const [editCell, setEditCell] = useState<CellCoord | null>(null);
  const [editValue, setEditValue] = useState('');
  const [copiedRange, setCopiedRange] = useState<{ start: CellCoord; end: CellCoord } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSheets();
  }, []);

  useEffect(() => {
    if (selectedSheet) {
      fetchSheetData(selectedSheet);
      setSelectedCell(null);
      setSelectionStart(null);
      setEditCell(null);
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
        // Columns to hide for payment records
        const hiddenColumns = ['bank', 'payment', 'status', 'submission_method', 'error_message', 'verified_at', 'created_pigrim_id'];
        const allColumns = Object.keys(allData[0]);
        const columns = allColumns.filter(col => !hiddenColumns.includes(col));
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

  // Calculate optimal column widths based on content
  const getColumnWidths = () => {
    if (!sheetData) return {};
    const widths: Record<string, number> = {};
    const minWidth = 100;
    const maxWidth = 500;
    const padding = 24;

    sheetData.columns.forEach(column => {
      let headerLength = column.length * 8;
      let maxDataLength = 0;
      sheetData.rows.slice(0, 100).forEach(row => {
        const cellValue = String(row[column] || '');
        const cellLength = cellValue.length * 7;
        if (cellLength > maxDataLength) {
          maxDataLength = cellLength;
        }
      });
      const width = Math.max(minWidth, Math.min(maxWidth, Math.max(headerLength, maxDataLength) + padding));
      widths[column] = width;
    });
    return widths;
  };

  const columnWidths = getColumnWidths();
  const filteredData = getFilteredAndSortedData();

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, selectionStart, editCell, sheetData, filteredData]);

  const getColumnLetter = (colIndex: number): string => {
    let letter = '';
    while (colIndex >= 0) {
      letter = String.fromCharCode(65 + (colIndex % 26)) + letter;
      colIndex = Math.floor(colIndex / 26) - 1;
    }
    return letter;
  };

  const getCellRef = (row: number, col: number): string => {
    return `${getColumnLetter(col)}${row + 1}`;
  };

  const handleCellClick = (row: number, col: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      return;
    }
    if (e.shiftKey && selectedCell) {
      setSelectionStart(selectedCell);
      setSelectedCell({ row, col });
    } else {
      setSelectedCell({ row, col });
      setSelectionStart(null);
      setCopiedRange(null);
      setContextMenu(null);
    }
    setEditCell(null);
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    setEditCell({ row, col });
    setEditValue(String(filteredData[row][sheetData?.columns[col] || ''] || ''));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedCell || editCell) return;

    const columns = sheetData?.columns || [];
    const rows = filteredData.length;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (selectedCell.row > 0) {
          if (e.shiftKey) {
            setSelectionStart(selectedCell);
          }
          setSelectedCell({ ...selectedCell, row: selectedCell.row - 1 });
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (selectedCell.row < rows - 1) {
          if (e.shiftKey) {
            setSelectionStart(selectedCell);
          }
          setSelectedCell({ ...selectedCell, row: selectedCell.row + 1 });
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (selectedCell.col > 0) {
          if (e.shiftKey) {
            setSelectionStart(selectedCell);
          }
          setSelectedCell({ ...selectedCell, col: selectedCell.col - 1 });
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (selectedCell.col < columns.length - 1) {
          if (e.shiftKey) {
            setSelectionStart(selectedCell);
          }
          setSelectedCell({ ...selectedCell, col: selectedCell.col + 1 });
        }
        break;
      case 'Enter':
        e.preventDefault();
        setSelectedCell({ ...selectedCell, row: Math.min(selectedCell.row + 1, rows - 1) });
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          setSelectedCell({ ...selectedCell, col: Math.max(selectedCell.col - 1, 0) });
        } else {
          setSelectedCell({ ...selectedCell, col: Math.min(selectedCell.col + 1, columns.length - 1) });
        }
        break;
      case 'F2':
      case 'Enter':
        if (e.key === 'F2') {
          e.preventDefault();
          handleCellDoubleClick(selectedCell.row, selectedCell.col);
        }
        break;
      case 'c':
      case 'C':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleCopy();
        }
        break;
      case 'v':
      case 'V':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handlePaste();
        }
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        handleDelete();
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedCell(null);
        setSelectionStart(null);
        setCopiedRange(null);
        setEditCell(null);
        break;
    }
  };

  const handleCopy = () => {
    if (!selectedCell || !sheetData) return;

    const startRow = Math.min(selectedCell.row, selectionStart?.row || selectedCell.row);
    const endRow = Math.max(selectedCell.row, selectionStart?.row || selectedCell.row);
    const startCol = Math.min(selectedCell.col, selectionStart?.col || selectedCell.col);
    const endCol = Math.max(selectedCell.col, selectionStart?.col || selectedCell.col);

    const copyData: string[] = [];
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const colName = sheetData.columns[c];
        const value = filteredData[r][colName];
        copyData.push(String(value || ''));
      }
    }

    navigator.clipboard.writeText(copyData.join('\t'));
    setCopiedRange({ start: { row: startRow, col: startCol }, end: { row: endRow, col: endCol } });
    toast.success('Copied to clipboard');
  };

  const handlePaste = () => {
    toast.info('Paste in read-only mode');
  };

  const handleDelete = () => {
    toast.info('Delete protected - data is read-only');
  };

  const handleSaveEdit = () => {
    if (editCell) {
      const column = sheetData?.columns[editCell.col];
      if (column) {
        filteredData[editCell.row][column] = editValue;
        toast.info('Edit logged (read-only mode)');
      }
    }
    setEditCell(null);
  };

  const isCellSelected = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    if (selectionStart) {
      const minRow = Math.min(selectedCell.row, selectionStart.row);
      const maxRow = Math.max(selectedCell.row, selectionStart.row);
      const minCol = Math.min(selectedCell.col, selectionStart.col);
      const maxCol = Math.max(selectedCell.col, selectionStart.col);
      return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
    }
    return row === selectedCell.row && col === selectedCell.col;
  };

  const isCellActive = (row: number, col: number): boolean => {
    return selectedCell?.row === row && selectedCell?.col === col;
  };

  const isCellCopied = (row: number, col: number): boolean => {
    if (!copiedRange) return false;
    return row >= copiedRange.start.row && row <= copiedRange.end.row &&
           col >= copiedRange.start.col && col <= copiedRange.end.col;
  };

  const getStatusBarInfo = () => {
    if (!selectedCell || !sheetData) return { count: 0, sum: 0, avg: 0 };

    const startRow = Math.min(selectedCell.row, selectionStart?.row || selectedCell.row);
    const endRow = Math.max(selectedCell.row, selectionStart?.row || selectedCell.row);
    const startCol = Math.min(selectedCell.col, selectionStart?.col || selectedCell.col);
    const endCol = Math.max(selectedCell.col, selectionStart?.col || selectedCell.col);

    let count = 0;
    let sum = 0;
    let numberCount = 0;

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const colName = sheetData.columns[c];
        const value = filteredData[r][colName];
        count++;
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          sum += numValue;
          numberCount++;
        }
      }
    }

    return {
      count,
      sum: numberCount > 0 ? sum : 0,
      avg: numberCount > 0 ? sum / numberCount : 0,
      numberCount
    };
  };

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
            <ProfessionalButton
              variant="secondary"
              size="sm"
              onClick={() => {
                if (selectedSheet) {
                  const currentIdx = sheets.findIndex((s) => s.id === selectedSheet.id);
                  const updatedSheets = sheets.filter((s) => s.id !== selectedSheet.id);

                  // Update sheets list
                  setSheets(updatedSheets);
                  localStorage.setItem('call_sheets', JSON.stringify(updatedSheets));

                  // Switch to next sheet or previous if it was last
                  if (updatedSheets.length > 0) {
                    const nextIdx = currentIdx < updatedSheets.length ? currentIdx : currentIdx - 1;
                    setSelectedSheet(updatedSheets[nextIdx]);
                  } else {
                    setSelectedSheet(null);
                    setSheetData(null);
                  }
                }
              }}
            >
              Close Sheet
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

        {/* Sheet Toolbar - Name Box & Formula Bar */}
        <div className="bg-white border-b border-gray-300 px-6 py-3 flex items-center gap-4 shadow-sm">
          {/* Name Box */}
          <div className="flex-shrink-0 w-32 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm font-mono text-gray-700">
            {selectedCell ? getCellRef(selectedCell.row, selectedCell.col) : 'A1'}
          </div>

          {/* Formula Bar */}
          <div className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm font-mono text-gray-700 flex items-center">
            {selectedCell && sheetData ? (
              <span className="text-gray-600">
                {String(filteredData[selectedCell.row][sheetData.columns[selectedCell.col]] || '')}
              </span>
            ) : (
              <span className="text-gray-400">Select a cell to view its value</span>
            )}
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
                      style={{ width: `${columnWidths[column] || 192}px` }}
                      className="px-3 py-2 border-r border-gray-300 last:border-r-0 flex-shrink-0"
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
                      <div key={`col-${column}`} className="flex flex-col flex-shrink-0" style={{ width: `${columnWidths[column] || 192}px` }}>
                        {/* Header Cell */}
                        <div
                          className="h-10 bg-gray-100 border-b border-gray-300 border-r border-gray-300 px-3 py-1 cursor-pointer hover:bg-gray-200 transition flex items-center justify-between group"
                          onClick={() => handleSort(column)}
                        >
                          <span className="text-xs font-bold text-gray-700 truncate">
                            {column}
                          </span>
                          {sortConfig?.column === column && (
                            <span className="ml-2 flex-shrink-0 text-blue-600 text-xs">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>

                        {/* Data Cells */}
                        {filteredData.map((row, idx) => {
                          const isSelected = isCellSelected(idx, sheetData.columns.indexOf(column));
                          const isActive = isCellActive(idx, sheetData.columns.indexOf(column));
                          const isCopied = isCellCopied(idx, sheetData.columns.indexOf(column));
                          const isEditing = editCell?.row === idx && editCell?.col === sheetData.columns.indexOf(column);

                          return (
                            <div
                              key={`cell-${idx}-${column}`}
                              onClick={(e) => handleCellClick(idx, sheetData.columns.indexOf(column), e)}
                              onDoubleClick={() => handleCellDoubleClick(idx, sheetData.columns.indexOf(column))}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setContextMenu({ x: e.clientX, y: e.clientY });
                                setSelectedCell({ row: idx, col: sheetData.columns.indexOf(column) });
                              }}
                              className={`h-9 px-3 py-1 border-b border-gray-300 border-r border-gray-300 text-xs text-gray-800 flex items-center overflow-hidden cursor-cell transition-colors ${
                                isActive
                                  ? 'bg-blue-100 border border-blue-500 border-b-2 border-r-2'
                                  : isSelected
                                  ? 'bg-blue-50 border border-blue-300'
                                  : idx % 2 === 0
                                  ? 'bg-white'
                                  : 'bg-gray-50'
                              } ${
                                isCopied ? 'ring-2 ring-yellow-400 ring-inset' : ''
                              }`}
                            >
                              {isEditing ? (
                                <input
                                  autoFocus
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={handleSaveEdit}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveEdit();
                                      setSelectedCell({ row: idx + 1, col: sheetData.columns.indexOf(column) });
                                    } else if (e.key === 'Escape') {
                                      setEditCell(null);
                                    }
                                  }}
                                  className="w-full px-0 py-0 border-0 focus:outline-none focus:ring-0 bg-white text-xs"
                                />
                              ) : (
                                <span className="truncate">
                                  {row[column] !== null && row[column] !== undefined
                                    ? String(row[column])
                                    : '-'}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer - Status Bar */}
              <div className="bg-gray-50 px-6 py-2 border-t border-gray-300 text-xs text-gray-600 flex items-center justify-between">
                <div>
                  Showing {filteredData.length} of {sheetData.rows.length} rows
                </div>
                {selectedCell && (
                  <div className="flex gap-4 text-xs text-gray-700">
                    <span>Count: {getStatusBarInfo().count}</span>
                    {getStatusBarInfo().numberCount > 0 && (
                      <>
                        <span>Sum: {getStatusBarInfo().sum.toFixed(2)}</span>
                        <span>Average: {getStatusBarInfo().avg.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                )}
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

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed bg-white border border-gray-300 rounded shadow-lg z-50 text-xs"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onMouseLeave={() => setContextMenu(null)}
          >
            <button
              onClick={() => {
                handleCopy();
                setContextMenu(null);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200"
            >
              Copy (Ctrl+C)
            </button>
            <button
              onClick={() => {
                handleDelete();
                setContextMenu(null);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200"
            >
              Clear (Del)
            </button>
            <button
              onClick={() => setContextMenu(null)}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        )}

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
