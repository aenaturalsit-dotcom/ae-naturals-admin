'use client';

import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, DollarSign, Users, Package, Loader2 } from 'lucide-react';
import { adminService } from '@/services/admin.service';

export default function AdminDashboard() {
  // TanStack Query v5 requires the object signature
 const { data: stats, isLoading, error } = useQuery({
  queryKey: ['admin-stats'],
  queryFn: adminService.getStats,
  refetchOnWindowFocus: false,
});

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-rose-500" size={40} />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">Error loading dashboard: {error.message}</div>;
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard Overview</h1>
        <p className="text-zinc-500">Real-time statistics for your e-commerce platform.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total Revenue" 
          value={`₹${stats?.revenue?.toLocaleString('en-IN') || '0'}`} 
          icon={<DollarSign className="text-emerald-600" />} 
          description="From confirmed payments"
        />
        <StatCard 
          label="Total Orders" 
          value={stats?.orderCount || 0} 
          icon={<ShoppingBag className="text-blue-600" />} 
          description="Total volume"
        />
        <StatCard 
          label="Total Users" 
          value={stats?.userCount || 0} 
          icon={<Users className="text-purple-600" />} 
          description="Registered customers"
        />
        <StatCard 
          label="Active Products" 
          value={stats?.productCount || 0} 
          icon={<Package className="text-rose-600" />} 
          description="Live in store"
        />
      </div>
    </div>
  );
}

// --- NEW COMPONENT DEFINITION ---
function StatCard({ label, value, icon, description }: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode; 
  description: string; 
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
        <div className="rounded-md bg-zinc-50 p-2">{icon}</div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-zinc-900">{value}</div>
        <p className="text-xs text-zinc-400 mt-1">{description}</p>
      </div>
    </div>
  );
}