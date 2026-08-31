import { Pilgrim } from '@/types';
import { BiX, BiPrinter } from 'react-icons/bi';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ReceiptModalProps {
  pilgrim: Pilgrim;
  onClose: () => void;
}

export default function ReceiptModal({ pilgrim, onClose }: ReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between print:hidden">
          <h2 className="text-xl font-bold text-gray-900">Registration Receipt</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <BiPrinter size={18} />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BiX size={20} />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-8 print:p-4">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
            <h1 className="text-3xl font-bold text-gray-900">GIA Hajj Portal</h1>
            <p className="text-gray-600 mt-1">Gambia International Airlines</p>
            <p className="text-sm text-gray-500 mt-2">Pilgrim Registration Receipt</p>
          </div>

          {/* Receipt Number and Date */}
          <div className="grid grid-cols-2 gap-4 mb-8 pb-6 border-b border-gray-200">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Receipt ID</p>
              <p className="text-sm font-mono text-gray-900 mt-1">{pilgrim.registration_id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Registration Date</p>
              <p className="text-sm font-mono text-gray-900 mt-1">{formatDate(pilgrim.created_at)}</p>
            </div>
          </div>

          {/* Pilgrim Information */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pilgrim Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Full Name</p>
                <p className="text-sm text-gray-900 mt-1 font-medium">{pilgrim.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Gender</p>
                <p className="text-sm text-gray-900 mt-1">{pilgrim.gender === 'M' ? 'Male (Alagie)' : 'Female (Aja)'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Date of Birth</p>
                <p className="text-sm text-gray-900 mt-1">{formatDate(pilgrim.date_of_birth)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Passport Number</p>
                <p className="text-sm text-gray-900 mt-1 font-mono">{pilgrim.passport_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Phone</p>
                <p className="text-sm text-gray-900 mt-1 font-mono">{pilgrim.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Email</p>
                <p className="text-sm text-gray-900 mt-1 font-mono break-all">{pilgrim.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="mb-8 border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Address</h3>
            <p className="text-sm text-gray-900">{pilgrim.address}</p>
            <p className="text-sm text-gray-900 mt-1">
              {[pilgrim.city, pilgrim.state, pilgrim.postal_code].filter(Boolean).join(', ')}
            </p>
            <p className="text-sm text-gray-900 mt-1">{pilgrim.country}</p>
          </div>

          {/* Financial Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Summary</h3>
            <div className="space-y-3 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Amount Due:</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(pilgrim.total_amount_due)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Amount Paid:</span>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(pilgrim.total_amount_paid)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">Amount Remaining:</span>
                <span className={`text-lg font-bold ${
                  (pilgrim.total_amount_due - pilgrim.total_amount_paid) > 0
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}>
                  {formatCurrency(pilgrim.total_amount_due - pilgrim.total_amount_paid)}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-semibold uppercase">Registration Status</p>
            <p className="text-lg font-bold text-gray-900 mt-2 capitalize">{pilgrim.status}</p>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t-2 border-gray-300 mt-8">
            <p className="text-xs text-gray-500">This is an official registration receipt from GIA Hajj Portal</p>
            <p className="text-xs text-gray-500 mt-1">Print this receipt for your records</p>
            <p className="text-xs text-gray-500 mt-4 print:block hidden">Generated on {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .fixed {
            position: static;
            background: white;
          }
          .print\\:hidden {
            display: none;
          }
          .print\\:block {
            display: block;
          }
          .print\\:p-4 {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
