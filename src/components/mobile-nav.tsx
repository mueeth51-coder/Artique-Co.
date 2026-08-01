'use client';

import Link from 'next/link';
import { Home, Search, ShoppingBag, User, Menu } from 'lucide-react';
import { useShop } from './site-shell';
import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const { cart, adminAuthenticated } = useShop();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();

  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: ShoppingBag, label: 'Shop', href: '/shop' },
    { icon: ShoppingBag, label: 'Cart', href: '/cart', badge: cartItemCount },
    { icon: User, label: adminAuthenticated ? 'Admin' : 'Account', href: adminAuthenticated ? '/admin/dashboard' : '/register' },
  ];

  // Don't show on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-slate-200 shadow-2xl">
        <div className="flex items-center justify-around h-20 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition ${
                  active
                    ? 'text-amber-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  <Icon size={24} strokeWidth={1.5} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 min-w-5 bg-amber-500 text-white text-xs font-bold rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-20 md:hidden" />
    </>
  );
}
