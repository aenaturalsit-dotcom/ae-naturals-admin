// src\components\admin\Sidebar.tsx

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  X,
  Tags,
  Sparkles,
  Layers,
  FileText,
  ListTree,
  LayoutTemplate,
  PanelBottom,
  Store,
  Leaf,
  Truck,
  IndianRupee,
  RotateCcw,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { BRAND } from "@/config/brand.config";

export const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) => {
  const pathname = usePathname();
  const logoutStore = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    logoutStore();
    await signOut({ callbackUrl: "/admin/login" });
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  // Grouped Navigation Structure
  const navGroups = [
    {
      title: "Overview",
      items: [{ href: "/admin", icon: LayoutDashboard, label: "Dashboard" }],
    },
    {
      title: "Order Management",
      items: [
        { href: "/admin/orders", icon: ShoppingBag, label: "All Orders" },
        { href: "/admin/refunds", icon: IndianRupee, label: "Refunds" },
        { href: "/admin/returns", icon: RotateCcw, label: "Returns" },
        // { href: '/admin/shipping', icon: Truck, label: "Shipping & Logistics" },
      ],
    },
    {
      title: "Product Catalog",
      items: [
        { href: "/admin/products", icon: Package, label: "Products" },
        { href: "/admin/categories", icon: Tags, label: "Categories" },
        { href: "/admin/collections", icon: Layers, label: "Collections" },
        { href: "/admin/features", icon: Sparkles, label: "Highlights" },
      ],
    },
    {
      title: "Storefront & Content",
      items: [
        { href: "/admin/storefront", icon: Store, label: "Store Builder" },
        { href: "/admin/blogs", icon: FileText, label: "Blogs & Journal" },
        { href: "/admin/menus", icon: ListTree, label: "Navigation Menus" },
        { href: "/admin/pages", icon: LayoutTemplate, label: "Site Pages" },
        { href: "/admin/footer", icon: PanelBottom, label: "Footer Layout" },
      ],
    },
    {
      title: "System",
      items: [{ href: "/admin/config", icon: Settings, label: "Settings" }],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"; // strict match only for dashboard
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 lg:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Sidebar Container */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-full
        w-[85%] max-w-[280px]
        border-r border-zinc-800/60
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        lg:static lg:translate-x-0 lg:w-[260px]
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
        style={{ backgroundColor: BRAND.theme.secondary }}
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#10b981]/15 p-1.5 rounded-lg border border-[#10b981]/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Leaf className="w-5 h-5 text-[#10b981]" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-zinc-100 text-lg tracking-tight">
              {BRAND.name}
            </span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1.5">
              {/* Category Header */}
              {group.title !== "Overview" && (
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-white mb-2 px-3">
                  {group.title}
                </h4>
              )}

              {/* Category Items */}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden
                      ${
                        active
                          ? "bg-[#10b981]/10 text-[#10b981]" // Active styling
                          : "text-white hover:bg-zinc-800/40 hover:text-zinc-200" // Inactive styling
                      }
                    `}
                  >
                    {/* Glowing Active Indicator */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#10b981] rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                    )}

                    <Icon
                      size={20}
                      strokeWidth={active ? 2.5 : 2}
                      className={`transition-colors text-bold duration-200 ${active ? "text-[#10b981]" : "text-white group-hover:text-zinc-300"}`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Area (Logout) */}
        <div className="p-4 border-t border-zinc-800/60 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full group flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white hover:text-zinc-200 hover:bg-zinc-800/40 rounded-xl transition-all duration-200"
          >
            <LogOut
              size={18}
              className="text-white group-hover:text-zinc-300 transition-colors"
            />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
