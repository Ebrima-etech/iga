import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getMe } from '@/lib/auth';
import { User } from '@/types';
import { BiSearch, BiHelpCircle, BiChevronDown } from 'react-icons/bi';
import SearchModal from '@/components/Dashboard/SearchModal';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/professional': 'Dashboard',
  '/dashboard/pilgrims': 'Pilgrims',
  '/dashboard/payments': 'Payments',
  '/dashboard/banks': 'Banks',
  '/dashboard/reports': 'Reports',
  '/dashboard/speech-demo': 'Speech',
  '/dashboard/settings': 'Settings',
  '/dashboard/bank-submissions': 'Bank Submissions',
};

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const current = pageTitles[router.pathname] || 'Dashboard';

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {});
  }, []);

  // Handle Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-6 h-16 px-8">
        {/* Page Breadcrumb */}
        <div className="flex items-center gap-2.5 text-sm flex-shrink-0">
          <span className="font-medium text-slate-900">{current}</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <div
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer group"
          >
            <BiSearch size={16} className="text-slate-400 group-hover:text-slate-600" />
            <span className="text-sm flex-1">Search records...</span>
            <kbd className="hidden lg:flex text-xs font-semibold bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-600 shadow-xs">
              ⌘K
            </kbd>
          </div>
        </div>

        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Right Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Status */}
          <span className="hidden lg:flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Operational
          </span>

          {/* Help */}
          <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" title="Help">
            <BiHelpCircle size={20} />
          </button>

          {/* User Avatar Dropdown */}
          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="flex items-center gap-2.5 cursor-pointer group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm group-hover:shadow-md transition-shadow">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-medium text-slate-900">{user.username}</span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
                <BiChevronDown size={16} className="text-slate-400 hidden sm:block" />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
