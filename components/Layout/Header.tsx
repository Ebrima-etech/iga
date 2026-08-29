import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getMe } from '@/lib/auth';
import { User } from '@/types';
import { BiSearch, BiHelpCircle } from 'react-icons/bi';
import SearchModal from '@/components/Dashboard/SearchModal';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/professional': 'Overview',
  '/dashboard/pilgrims': 'Pilgrims',
  '/dashboard/payments': 'Payments',
  '/dashboard/banks': 'Banks',
  '/dashboard/reports': 'Reports',
  '/dashboard/speech-demo': 'Speech (Pilot)',
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
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 h-14 px-6">
        <div className="flex items-center gap-1.5 text-sm flex-shrink-0">
          <span className="text-gray-500">GIA Hajj</span>
          <span className="text-gray-300 mx-1">/</span>
          <span className="font-medium text-gray-900">{current}</span>
        </div>

        <div className="flex-1 max-w-sm hidden sm:block">
          <div
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <BiSearch size={15} />
            <span className="text-sm flex-1">Search pilgrims, payments, banks...</span>
            <kbd className="text-[10px] font-mono font-semibold border border-gray-200 rounded px-1.5 py-0.5 text-gray-400">
              Ctrl K
            </kbd>
          </div>
        </div>

        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            All Systems OK
          </span>
          <button className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <BiHelpCircle size={18} />
          </button>
          {user && (
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
