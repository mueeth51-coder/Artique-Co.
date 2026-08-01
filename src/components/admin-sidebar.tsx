'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Settings,
  Palette,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useShop } from './site-shell';
import { useState } from 'react';

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Orders & Analytics',
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: Package,
    description: 'Manage inventory',
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: Layers,
    description: 'Product categories',
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: ShoppingBag,
    description: 'Order history',
  },
  {
    label: 'Theme',
    href: '/admin/theme',
    icon: Palette,
    description: 'Appearance',
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Shop settings',
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { setAdminAuthenticated } = useShop();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setAdminAuthenticated(false);
    window.localStorage.setItem('artique-admin-auth', JSON.stringify(false));
  };

  const NavContent = () => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg transition ${
              isActive
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon size={20} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs opacity-75">{item.description}</p>
            </div>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-6 right-6 z-40 p-3 bg-amber-600 text-white rounded-full shadow-lg lg:hidden"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:flex lg:flex-col bg-white border-r border-slate-200 shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Admin Panel</h2>
          <p className="text-xs text-slate-500 mt-1">Shop Management</p>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <NavContent />
        </div>

        {/* Logout */}
        <div className="border-t border-slate-200 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition font-semibold"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-30 h-full w-64 bg-white overflow-y-auto lg:hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Admin Panel</h2>
            </div>

            <div className="p-4">
              <NavContent />
            </div>

            <div className="border-t border-slate-200 p-4">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition font-semibold"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Desktop Spacer */}
      <div className="hidden lg:block w-64" />
    </>
  );
}
