// src\components\admin\Sidebar.tsx




'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, ShoppingBag, Package, Settings, LogOut,
  X, Tags, Sparkles, Layers, FileText, ListTree,
  LayoutTemplate, PanelBottom, Store
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const Sidebar = ({
  isOpen,
  setIsOpen
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) => {

  const pathname = usePathname();
  const logoutStore = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    logoutStore();
    await signOut({ callbackUrl: '/admin/login' });
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }, [isOpen]);

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: "Dashboard" },
    { href: '/admin/orders', icon: ShoppingBag, label: "Orders" },
    { href: '/admin/products', icon: Package, label: "Products" },
    { href: '/admin/categories', icon: Tags, label: "Categories" },
    { href: '/admin/collections', icon: Layers, label: "Collections" },
    { href: '/admin/blogs', icon: FileText, label: "Blogs & Journal" },
    { href: '/admin/menus', icon: ListTree, label: "Navigation" },
    { href: '/admin/pages', icon: LayoutTemplate, label: "Pages" },
    { href: '/admin/footer', icon: PanelBottom, label: "Footer" },
    { href: '/admin/storefront', icon: Store, label: "Storefront Builder" },
    { href: '/admin/features', icon: Sparkles, label: "Highlights" },
    { href: '/admin/config', icon: Settings, label: "General Config" },
  ];

const isActive = (href: string) => {
  if (href === '/admin') {
    return pathname === '/admin'; // strict match only
  }

  return pathname.startsWith(href);
};

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 transition lg:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full
        w-[85%] max-w-[280px]
        bg-white border-r border-gray-200
        transform transition-transform duration-300
        lg:static lg:translate-x-0 lg:w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
          <span className="font-semibold text-gray-900">AE Naturals</span>

          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                  ${active
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={18} className={active ? 'text-rose-500' : 'text-gray-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};