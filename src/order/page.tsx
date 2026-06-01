// src/app/admin/orders/page.tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({ queryKey: ['orders'], queryFn: adminService.getOrders });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: any) => adminService.updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  if (isLoading) return <div className="p-8">Loading Orders...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Orders</h1>
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(orders) && orders?.map((order: any) => (
              <tr key={order.id} className="border-b">
                <td className="p-4">{order.user.name}</td>
                <td className="p-4">₹{order.totalAmount}</td>
                <td className="p-4 font-semibold text-rose-600">{order.status}</td>
                <td className="p-4">
                  <select 
                    className="border rounded p-1"
                    defaultValue={order.status}
                    onChange={(e) => statusMutation.mutate({ id: order.id, status: e.target.value })}
                  >
                    <option value="PAID">Paid</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}