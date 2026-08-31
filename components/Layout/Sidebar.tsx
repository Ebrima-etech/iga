import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout, getMe } from '@/lib/auth';
import { User } from '@/types';
import { useHajjYear } from '@/lib/stores/hajjYearStore';
import toast from 'react-hot-toast';
import {
  BiBarChartAlt2,
  BiUser,
  BiWallet,
  BiLineChart,
  BiCog,
  BiMenu,
  BiBuilding,
  BiChevronDown,
  BiLogOut,
  BiHomeAlt2,
  BiGlobe,
  BiTable,
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
      { label: 'Analytics', href: '/dashboard/analytics', icon: <BiLineChart size={18} /> },
      { label: 'Hajj Universe', href: '/dashboard/hajj-universe', icon: <BiGlobe size={18} /> },
      { label: 'Pilgrims', href: '/dashboard/pilgrims', icon: <BiUser size={18} /> },
      { label: 'Payments', href: '/dashboard/payments', icon: <BiWallet size={18} /> },
      { label: 'Banks', href: '/dashboard/banks', icon: <BiBuilding size={18} /> },
      { label: 'Reports', href: '/dashboard/reports', icon: <BiLineChart size={18} /> },
      { label: 'Call Sheets', href: '/dashboard/call-sheets', icon: <BiTable size={18} /> },
    ],
  },
  {
    label: 'Accommodations',
    items: [
      { label: 'Hotels', href: '/dashboard/accommodations/hotels', icon: <BiHomeAlt2 size={18} /> },
      { label: 'Room Assignments', href: '/dashboard/accommodations/room-assignments', icon: <BiBuilding size={18} /> },
      { label: 'Flights', href: '/dashboard/accommodations/flights', icon: <BiLineChart size={18} /> },
      { label: 'Flight Assignments', href: '/dashboard/accommodations/flight-assignments', icon: <BiWallet size={18} /> },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: <BiCog size={18} /> },
    ],
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed = false, onCollapsedChange }: SidebarProps) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [cyclingYearIndex, setCyclingYearIndex] = useState(0);
  const { activeHajjYear, selectedHajjYear, hajjYears, setSelectedHajjYear } = useHajjYear();

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

  // Cycle through years and logo display
  useEffect(() => {
    if (hajjYears.length === 0) return;
    const interval = setInterval(() => {
      setCyclingYearIndex((prev) => (prev + 1) % (hajjYears.length * 2)); // Multiply by 2 to alternate
    }, 4000);
    return () => clearInterval(interval);
  }, [hajjYears.length]);

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
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes borderShift {
          0%, 100% {
            border-color: rgb(5, 150, 105);
            box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
          }
          25% {
            border-color: rgb(16, 185, 129);
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
          }
          50% {
            border-color: rgb(59, 130, 246);
            box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
          }
          75% {
            border-color: rgb(139, 92, 246);
            box-shadow: 0 0 12px rgba(139, 92, 246, 0.5);
          }
        }
        .sidebar-header-content {
          animation: slideUp 0.8s ease-out;
        }
        .year-badge {
          border: 1px solid rgb(5, 150, 105);
          animation: borderShift 6s ease-in-out infinite;
        }
      `}</style>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen border-r border-gray-200 bg-white transform transition-all duration-300 md:translate-x-0 z-50 flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}
      >
        {/* Org switcher with Hajj Year Dropdown */}
        <div className="px-3 pt-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="flex-1"
            >
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors sidebar-header-content h-10" key={cyclingYearIndex}>
                {!isCollapsed && (
                  <>
                    {cyclingYearIndex % 2 === 0 ? (
                      <>
                        <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">G</span>
                        </div>
                        <span className="font-semibold text-gray-900 text-sm truncate">GIA Hajj</span>
                        <span
                          className="text-[10px] font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 flex-shrink-0 year-badge"
                        >
                          {hajjYears.length > 0 ? hajjYears[Math.floor(cyclingYearIndex / 2)]?.year : 2026}
                        </span>
                      </>
                    ) : (
                      <img
                        src="/gia-logo.svg"
                        alt="GIA"
                        className="h-full flex-shrink-0"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => onCollapsedChange && onCollapsedChange(!isCollapsed)}
              className="hidden md:flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              <BiMenu size={18} />
            </button>
          </div>

          {/* Hajj Year Dropdown */}
          {showYearDropdown && !isCollapsed && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200 space-y-1">
              {hajjYears.map((year) => (
                <button
                  key={year.id}
                  onClick={() => {
                    setSelectedHajjYear(year.id);
                    setShowYearDropdown(false);
                    // Don't refresh - just update state, pages listen to selectedHajjYear changes
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedHajjYear === year.id
                      ? 'bg-emerald-100 text-emerald-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Hajj {year.year}</span>
                    {year.is_active && (
                      <span className="text-[8px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        ACTIVE
                      </span>
                    )}
                  </div>
                </button>
              ))}

            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              {!isCollapsed && (
                <p className="px-3 mb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <span
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-100 cursor-pointer group justify-center md:justify-start ${
                          active
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } ${isCollapsed ? 'md:justify-center' : ''}`}
                        title={isCollapsed ? item.label : ''}
                      >
                        <span className={active ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}>
                          {item.icon}
                        </span>
                        {!isCollapsed && <span className="text-sm">{item.label}</span>}
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
        className="fixed bottom-2 right-2 md:hidden bg-black text-white p-1.5 rounded-full z-40 flex items-center justify-center shadow-lg"
      >
        <BiMenu size={16} />
      </button>

    </>
  );
}
