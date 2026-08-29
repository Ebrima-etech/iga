import { useRouter } from 'next/router';
import { BiChevronDown, BiHelpCircle, BiBot } from 'react-icons/bi';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/professional': 'Overview',
  '/dashboard/pilgrims': 'Pilgrims',
  '/dashboard/payments': 'Payments',
  '/dashboard/banks': 'Banks',
  '/dashboard/reports': 'Reports',
  '/dashboard/speech-demo': 'Speech (Pilot)',
  '/dashboard/settings': 'Settings',
};

export default function Header() {
  const router = useRouter();
  const current = pageTitles[router.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-gray-500">All Projects</span>
          <BiChevronDown size={14} className="text-gray-400" />
          <span className="text-gray-300 mx-1">/</span>
          <span className="font-medium text-gray-900">{current}</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <BiHelpCircle size={18} />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
            <BiBot size={16} />
            Agent
          </button>
        </div>
      </div>
    </header>
  );
}
