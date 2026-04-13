'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, ShoppingBag, Package, Settings, LogOut, Menu, X, Tags, Sparkles, Layers, FileText, ListTree } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const logoutStore = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    logoutStore();
    await signOut({ callbackUrl: '/admin/login' });
  };

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: "Dashboard" },
    { href: '/admin/orders', icon: ShoppingBag, label: "Orders" },
    { href: '/admin/products', icon: Package, label: "Products" },
    { href: '/admin/categories', icon: Tags, label: "Categories" },
    { href: '/admin/collections', icon: Layers, label: "Collections" },
    { href: '/admin/blogs', icon: FileText, label: "Blogs & Journal" },
    { href: '/admin/menus', icon: ListTree, label: "Navigation" },
    { href: '/admin/features', icon: Sparkles, label: "Highlights" },
    { href: '/admin/config', icon: Settings, label: "General Config" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-950 text-white sticky top-0 z-50 border-b border-zinc-800 shadow-sm">
        <span className="text-rose-500 font-bold tracking-wide">AE Admin</span>
        <button onClick={() => setIsOpen(true)} className="p-1 rounded-md hover:bg-zinc-800 transition"><Menu size={24} /></button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-64 bg-zinc-950 text-zinc-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-zinc-800 flex flex-col shadow-xl lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex justify-between items-center px-6 border-b border-zinc-800">
          <span className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-6 h-6 bg-rose-500 rounded-md flex items-center justify-center"><Package size={14} className="text-white"/></div>
            AE Naturals
          </span>
          <button className="lg:hidden text-zinc-400 hover:text-white transition" onClick={() => setIsOpen(false)}><X size={20} /></button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Overview</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-rose-500/10 text-rose-500' 
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-rose-500' : 'text-zinc-500 group-hover:text-zinc-300 transition-colors'} /> 
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all duration-200"
          >
            <LogOut size={18} className="text-zinc-500" /> Logout
          </button>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden transition-opacity" onClick={() => setIsOpen(false)} />}
    </>
  );
};