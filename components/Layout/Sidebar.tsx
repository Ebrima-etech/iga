import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BiBarChartAlt2, BiUser, BiWallet, BiLineChart, BiMicrophone, BiCog, BiMenu } from 'react-icons/bi';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const getNavItems = (): NavItem[] => [
  { label: 'Dashboard', href: '/dashboard', icon: <BiBarChartAlt2 size={20} /> },
  { label: 'Pilgrims', href: '/dashboard/pilgrims', icon: <BiUser size={20} /> },
  { label: 'Payments', href: '/dashboard/payments', icon: <BiWallet size={20} /> },
  { label: 'Reports', href: '/dashboard/reports', icon: <BiLineChart size={20} /> },
  { label: 'Speech (Pilot)', href: '/dashboard/speech-demo', icon: <BiMicrophone size={20} /> },
  { label: 'Settings', href: '/dashboard/settings', icon: <BiCog size={20} /> },
];

export default function Sidebar() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navItems = getNavItems();

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
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-gray-200 bg-white transform transition-transform md:translate-x-0 z-50 overflow-y-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group ${
                    active
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-6 right-6 md:hidden text-white p-4 rounded-full z-40 flex items-center justify-center"
        style={{
          backgroundColor: 'var(--color-primary-600)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <BiMenu size={24} />
      </button>
    </>
  );
}
