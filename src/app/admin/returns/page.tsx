// app/admin/returns/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Eye,
  RefreshCw
} from 'lucide-react';
import { AdminReturnsService } from '@/services/admin-returns.service'; // ✅ Changed import
import { useDebounce } from '@/hooks/useDebounce';
import { ReturnStatusBadge } from '@/components/admin/returns/ReturnStatusBadge';
import { DataTable } from '@/components/admin/ui/DataTable';
import { BRAND } from '@/config/brand.config';

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All Returns' },
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
  { value: 'PICKUP_COMPLETED', label: 'Pickup Completed' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'INSPECTED', label: 'Inspected' },
  { value: 'CLOSED', label: 'Closed' },
];

export default function AdminReturnsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);

  // app/admin/returns/page.tsx - Update the query

const { data, isLoading, refetch } = useQuery({
  queryKey: ['admin-returns', { page, search: debouncedSearch, status: statusFilter }],
  queryFn: async () => {
    console.log('[DEBUG] Fetching returns with params:', {
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    });
    
    const response = await AdminReturnsService.getReturns({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    });
    
    console.log('[DEBUG] API Response from service:', response);
    console.log('[DEBUG] Response data:', response?.data);
    console.log('[DEBUG] Response data length:', response?.data?.length);
    
    return response;
  },
});

// ✅ Use the data correctly
const returns = data?.data || [];
const meta = data?.meta || { totalPages: 1, total: 0 };

// ✅ Add this debug log
console.log('[DEBUG] Returns array:', returns);
console.log('[DEBUG] Meta:', meta);

  const columns = [
    {
      accessorKey: 'returnNumber',
      header: 'Return',
      cell: ({ row }: any) => (
        <Link
          href={`/admin/returns/${row.original.id}`}
          className="font-semibold text-gray-900 hover:underline"
        >
          #{row.original.returnNumber}
        </Link>
      ),
    },
    {
      accessorKey: 'order',
      header: 'Order',
      cell: ({ row }: any) => (
        <Link
          href={`/admin/orders/${row.original.orderId}`}
          className="text-sm text-gray-600 hover:underline"
        >
          #{row.original.orderId?.slice(-6).toUpperCase()}
        </Link>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }: any) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {row.original.customer?.name || 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.customer?.email || ''}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'returnReason',
      header: 'Reason',
      cell: ({ row }: any) => (
        <div className="text-sm text-gray-600 max-w-xs truncate" title={row.original.returnReason}>
          {row.original.returnReason}
        </div>
      ),
    },
    {
      accessorKey: 'returnStatus',
      header: 'Status',
      cell: ({ row }: any) => (
        <ReturnStatusBadge status={row.original.returnStatus} />
      ),
    },
    {
      accessorKey: 'requestedAt',
      header: 'Requested Date',
      cell: ({ row }: any) => (
        <div className="text-sm text-gray-600">
          {format(new Date(row.original.requestedAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <Link
          href={`/admin/returns/${row.original.id}`}
          className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-4 h-4 mr-1.5" />
          View
        </Link>
      ),
    },
  ];

  return (
    <div 
      className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 min-h-screen"
      style={{ backgroundColor: BRAND.theme.accent }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Returns</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer return requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search returns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
              >
                {STATUS_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={returns}
          pageCount={meta.totalPages}
          totalItems={meta.total}
          isLoading={isLoading}
          noBorder
        />
      </div>
    </div>
  );
}