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
  BiHotel,
  BiPlane,
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
    label: 'Operations',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <BiBarChartAlt2 size={18} /> },
      { label: 'Pilgrims', href: '/dashboard/pilgrims', icon: <BiUser size={18} /> },
      { label: 'Payments', href: '/dashboard/payments', icon: <BiWallet size={18} /> },
      { label: 'Banks', href: '/dashboard/banks', icon: <BiBuilding size={18} /> },
      { label: 'Reports', href: '/dashboard/reports', icon: <BiLineChart size={18} /> },
    ],
  },
  {
    label: 'Accommodations',
    items: [
      { label: 'Hotels', href: '/dashboard/accommodations/hotels', icon: <BiHotel size={18} /> },
      { label: 'Room Assignments', href: '/dashboard/accommodations/room-assignments', icon: <BiBuilding size={18} /> },
      { label: 'Flights', href: '/dashboard/accommodations/flights', icon: <BiPlane size={18} /> },
      { label: 'Flight Assignments', href: '/dashboard/accommodations/flight-assignments', icon: <BiPlane size={18} /> },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Speech (Pilot)', href: '/dashboard/speech-demo', icon: <BiMicrophone size={18} /> },
      { label: 'Settings', href: '/dashboard/settings', icon: <BiCog size={18} /> },
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
              <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">G</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm truncate">GIA Hajj</span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                2026
              </span>
              <BiChevronDown size={14} className="text-gray-400 ml-auto flex-shrink-0" />
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
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
              </div>
            </div>
          ))}
        </nav>

        {/* User row */}
        {user && (
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors">
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
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
