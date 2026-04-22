// src\app\admin\Header.tsx





'use client';

import { Menu, Bell, Search } from 'lucide-react';

export const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  return (
    <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-gray-200 bg-white sticky top-0 z-30">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>

        <span className="font-semibold text-gray-900">
          Admin Panel
        </span>
      </div>

      {/* Center */}
      <div className="hidden md:flex items-center bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 w-72">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          placeholder="Search..."
          className="bg-transparent outline-none text-sm w-full text-gray-700"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <Bell size={18} className="text-gray-600" />
        </button>

        <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-sm font-semibold">
          A
        </div>
      </div>
    </header>
  );
};