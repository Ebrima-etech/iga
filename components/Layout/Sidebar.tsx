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
  BiChevronDown,
  BiLogOut,
} from 'react-icons/bi';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <BiBarChartAlt2 size={19} /> },
      { label: 'Pilgrims', href: '/dashboard/pilgrims', icon: <BiUser size={19} /> },
      { label: 'Payments', href: '/dashboard/payments', icon: <BiWallet size={19} /> },
      { label: 'Banks', href: '/dashboard/banks', icon: <BiBuilding size={19} /> },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Reports', href: '/dashboard/reports', icon: <BiLineChart size={19} /> },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Speech', href: '/dashboard/speech-demo', icon: <BiMicrophone size={19} /> },
      { label: 'Settings', href: '/dashboard/settings', icon: <BiCog size={19} /> },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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
    toast.success('Logged out');
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
        className={`fixed left-0 top-0 h-screen w-72 border-r border-slate-200 bg-white transform transition-transform md:translate-x-0 z-50 flex flex-col shadow-sm ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-200">
          <Link href="/dashboard">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-base">GIA Hajj</p>
                <p className="text-xs text-slate-500">Operations Portal</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-7">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-2">
              <p className="px-4 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <span
                        className={`flex items-center gap-3.5 px-4 py-2.5 rounded-lg transition-all duration-150 cursor-pointer group ${
                          active
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 transition-colors ${
                            active
                              ? 'text-blue-600'
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="text-sm font-medium">{item.label}</span>
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        {user && (
          <div className="border-t border-slate-200 p-4 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.username}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <BiLogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-6 right-6 md:hidden bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full z-40 flex items-center justify-center shadow-lg transition-all"
      >
        <BiMenu size={24} />
      </button>
    </>
  );
}
