import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout, getMe } from '@/lib/auth';
import { User } from '@/types';
import toast from 'react-hot-toast';
import {
  BiBarChartAlt2,
  BiUser,
  BiWallet,
  BiLineChart,
  BiMicrophone,
  BiCog,
  BiMenu,
  BiBuilding,
  BiSearch,
  BiChevronDown,
  BiLogOut,
  BiDotsHorizontalRounded,
} from 'react-icons/bi';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const getNavItems = (): NavItem[] => [
  { label: 'Dashboard', href: '/dashboard', icon: <BiBarChartAlt2 size={18} /> },
  { label: 'Pilgrims', href: '/dashboard/pilgrims', icon: <BiUser size={18} /> },
  { label: 'Payments', href: '/dashboard/payments', icon: <BiWallet size={18} /> },
  { label: 'Banks', href: '/dashboard/banks', icon: <BiBuilding size={18} /> },
  { label: 'Reports', href: '/dashboard/reports', icon: <BiLineChart size={18} /> },
  { label: 'Speech (Pilot)', href: '/dashboard/speech-demo', icon: <BiMicrophone size={18} /> },
  { label: 'Settings', href: '/dashboard/settings', icon: <BiCog size={18} /> },
];

export default function Sidebar() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navItems = getNavItems();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const isActive = (href: string) => {
    return router.pathname === href || router.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white transform transition-transform md:translate-x-0 z-50 flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Org switcher */}
        <div className="px-3 pt-4 pb-3 border-b border-gray-200">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
              <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">G</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm truncate">GIA Hajj</span>
              <span className="text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5">
                2026
              </span>
              <BiChevronDown size={14} className="text-gray-400 ml-auto flex-shrink-0" />
            </div>
          </Link>

          {/* Search */}
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-gray-400 hover:border-gray-300 transition-colors cursor-pointer">
            <BiSearch size={15} />
            <span className="text-sm flex-1">Find</span>
            <kbd className="text-[10px] font-mono font-semibold border border-gray-200 rounded px-1.5 py-0.5 text-gray-400">
              F
            </kbd>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto space-y-0.5 p-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-100 cursor-pointer group ${
                    active
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={active ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User row */}
        {user && (
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors">
              <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <BiLogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-6 right-6 md:hidden bg-black text-white p-4 rounded-full z-40 flex items-center justify-center shadow-lg"
      >
        <BiMenu size={22} />
      </button>
    </>
  );
}
