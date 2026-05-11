// src\app\admin\orders\page.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Search,
  Filter,
  ArrowUpRight,
  Package,
  Truck,
  RotateCcw,
  Loader2
} from "lucide-react";
import { OrderStatus } from "@/types/types";
import apiClient from "@/lib/api-client";

const fetcher = async (url: string) => {
  try {
    const res = await apiClient.get(url);

    // 🔥 Handles ALL backend formats
    return res?.data ?? res ?? null;

  } catch (error) {
    console.error(`SWR Fetch Error for ${url}:`, error);
    throw error;
  }
};
export default function OrdersDashboard() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // 1. Analytics
  const {
    data: analytics,
    error: analyticsError,
    isLoading: isAnalyticsLoading,
  } = useSWR("/admin/orders/dashboard", fetcher);
console.log("ANALYTICS RAW:", analytics); // 🔥 debug
  // 2. Orders
  const {
    data: rawOrdersData,
    error: ordersError,
    isLoading: isOrdersLoading,
  } = useSWR(
    `/admin/orders?page=${page}&limit=20&tab=${activeTab}&search=${search}`,
    fetcher
  );

  // ✅ Normalize orders safely
  const ordersList = Array.isArray(rawOrdersData)
    ? rawOrdersData
    : rawOrdersData?.data || [];

  // 🔥 Debug
  console.log("FINAL ANALYTICS:", analytics);
  console.log("ORDERS:", rawOrdersData);

  if (analyticsError) console.error("Analytics Error:", analyticsError);
  if (ordersError) console.error("Orders Error:", ordersError);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Orders Overview
        </h1>
      </div>

      {/* ✅ KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Orders"
          value={analytics?.totalOrders?.count || 0}
          icon={<Package />}
        />
        <KpiCard
          title="Units Sold"
          value={analytics?.itemsVolume?.count || 0}
          icon={<ArrowUpRight />}
        />
        <KpiCard
          title="Fulfilled"
          value={analytics?.fulfilled?.count || 0}
          icon={<Truck />}
        />
        <KpiCard
          title="Returns"
          value={analytics?.returns?.count || 0}
          icon={<RotateCcw />}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4 pt-2 gap-6 overflow-x-auto">
          {["ALL", "UNFULFILLED", "UNPAID", "OPEN", "CLOSED"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "ALL"
                ? "All Orders"
                : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 flex gap-4 border-b border-gray-100 flex-wrap">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all"
            />
          </div>
          <button className="px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isOrdersLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : ordersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                ordersList.map((order: any) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/admin/orders/${order.id}`)
                    }
                  >
                    <td className="px-6 py-4 font-medium">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {order.user?.name || "Guest"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      ₹{order.totalAmount?.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// KPI Card
const KpiCard = ({ title, value, icon }: any) => (
  <div className="bg-white p-5 rounded-xl border flex justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">
        {value !== undefined ? value.toLocaleString("en-IN") : "-"}
      </p>
    </div>
    <div>{icon}</div>
  </div>
);

// Status Badge
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    RETURNED: "bg-orange-100 text-orange-700",
  };

  return (
    <span className={`px-2 py-1 rounded ${colors[status] || ""}`}>
      {status}
    </span>
  );
};