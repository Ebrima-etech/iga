'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { Pilgrim, Payment, Bank } from '@/types';
import { BiSearch, BiX, BiChevronRight } from 'react-icons/bi';

interface SearchResult {
  id: string;
  type: 'pilgrim' | 'payment' | 'bank';
  title: string;
  subtitle?: string;
  icon?: string;
  href: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

  const placeholders = [
    'Search pilgrims...',
    'Search payments...',
    'Search banks...',
    'Search by ID...',
    'Search by name...',
  ];

  // Search across all resources
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchQuery = query.toLowerCase();
    setLoading(true);

    // Search pilgrims, payments, and banks in parallel
    Promise.all([
      api.get('/pilgrims/').catch(() => ({ data: [] })),
      api.get('/payments/').catch(() => ({ data: [] })),
      api.get('/banks/').catch(() => ({ data: [] })),
    ])
      .then(([pilgrimsRes, paymentsRes, banksRes]) => {
        const pilgrimsList = pilgrimsRes.data.results || pilgrimsRes.data || [];
        const paymentsList = paymentsRes.data.results || paymentsRes.data || [];
        const banksList = banksRes.data.results || banksRes.data || [];

        const searchResults: SearchResult[] = [];

        // Search pilgrims
        pilgrimsList.forEach((p: Pilgrim) => {
          if (
            (p.full_name && p.full_name.toLowerCase().includes(searchQuery)) ||
            (p.registration_id && p.registration_id.toLowerCase().includes(searchQuery)) ||
            (p.email && p.email.toLowerCase().includes(searchQuery)) ||
            (p.phone && p.phone.includes(searchQuery))
          ) {
            searchResults.push({
              id: `pilgrim-${p.id}`,
              type: 'pilgrim',
              title: p.full_name || 'Unknown',
              subtitle: `ID: ${p.registration_id || 'N/A'} • ${p.email || 'N/A'}`,
              icon: '👤',
              href: `/dashboard/pilgrims/${p.id}`,
            });
          }
        });

        // Search payments
        paymentsList.forEach((p: Payment) => {
          if (
            (p.reference_number && p.reference_number.toLowerCase().includes(searchQuery)) ||
            (p.pilgrim_name && p.pilgrim_name.toLowerCase().includes(searchQuery)) ||
            (p.bank_name && p.bank_name.toLowerCase().includes(searchQuery))
          ) {
            searchResults.push({
              id: `payment-${p.id}`,
              type: 'payment',
              title: `Payment: ${p.reference_number || 'N/A'}`,
              subtitle: `${p.pilgrim_name || 'Unknown'} • ${p.bank_name || 'Unknown'}`,
              icon: '💳',
              href: `/dashboard/payments`,
            });
          }
        });

        // Search banks
        banksList.forEach((b: Bank) => {
          if (b.name.toLowerCase().includes(searchQuery)) {
            searchResults.push({
              id: `bank-${b.id}`,
              type: 'bank',
              title: b.name,
              subtitle: b.is_active ? 'Active' : 'Inactive',
              icon: '🏦',
              href: `/dashboard/banks`,
            });
          }
        });

        setResults(searchResults.slice(0, 10)); // Limit to 10 results
        setSelectedIndex(0);
      })
      .finally(() => setLoading(false));
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Cycle through placeholders
  useEffect(() => {
    if (!isOpen || query.length > 0) return;

    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i < results.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i > 0 ? i - 1 : results.length - 1));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.href);
    setQuery('');
    setResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .search-result-item {
          animation: slideUp 0.3s ease-out forwards;
        }
        .placeholder-text {
          animation: slideUp 0.8s ease-out;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-start justify-center pt-20 px-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <BiSearch size={20} className="text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholders[currentPlaceholderIndex]}
              className="flex-1 bg-transparent outline-none text-sm font-medium placeholder-text"
              key={currentPlaceholderIndex}
            />
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <BiX size={20} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {results.map((result, idx) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className={`w-full px-4 py-3 flex items-center justify-between transition-colors search-result-item ${
                      idx === selectedIndex
                        ? 'bg-emerald-50 text-emerald-900'
                        : 'hover:bg-gray-50'
                    }`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-start gap-3 flex-1 text-left">
                      <span className="text-lg mt-0.5">{result.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {result.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <BiChevronRight
                      size={16}
                      className="text-gray-400 flex-shrink-0"
                    />
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">No results found for &quot;{query}&quot;</p>
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                <p>Start typing to search...</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
            <div className="flex gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-gray-300 font-mono bg-white">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-gray-300 font-mono bg-white">
                  ↵
                </kbd>
                Select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-gray-300 font-mono bg-white">
                Esc
              </kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
