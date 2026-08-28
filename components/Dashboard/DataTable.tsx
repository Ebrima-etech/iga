import React from 'react';

interface Column {
  header: string;
  accessor: string;
  render?: (value: any) => React.ReactNode;
  width?: string;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
}

export default function DataTable({ title, columns, data, onRowClick }: DataTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors duration-200 ${
                  onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''
                }`}
              >
                {columns.map((column, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-6 py-4 text-sm text-gray-900 font-medium"
                  >
                    {column.render
                      ? column.render(row[column.accessor])
                      : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {data.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500 text-sm">No data available</p>
        </div>
      )}
    </div>
  );
}
