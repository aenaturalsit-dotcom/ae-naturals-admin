"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import  apiClient  from "@/lib/api-client";
import { Plus, Edit3, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function AdminCollectionsPage() {
  const { data: collections, isLoading } = useQuery({
    // 🚨 1. CACHE BUST: Changed the query key so React Query forgets the old 404 error
    queryKey: ["admin-collections-list", "force-refresh"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/admin/collections");
        
        // 🚨 2. HARD DEBUG: See exactly what the backend sends in F12 Console
        console.log("🟢 RAW COLLECTIONS RESPONSE:", res);

        let finalArray: any[] = [];
        
        // 🚨 3. UNWRAP SAFELY: Handle your custom Axios interceptor
        if (Array.isArray(res)) {
          finalArray = res;
        } else if (res && Array.isArray(res.data)) {
          finalArray = res.data;
        } else if (res?.data && Array.isArray(res.data.data)) {
          finalArray = res.data.data;
        }

        return finalArray;
      } catch (error) {
        console.error("🔴 Failed to fetch collections:", error);
        return [];
      }
    },
    initialData: [], // Start with empty array to prevent 'undefined' crashes
    refetchOnMount: "always", // Force it to fetch from DB every time you open the page
  });


  // 🚨 THE FIX: A helper function to safely check if a string is a valid URL
  // This prevents Next.js <Image /> from crashing the entire page with "Invalid URL"
  const isValidImageUrl = (url?: string) => {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('/')) return true; // Relative paths like /placeholder.png are fine
    try {
      new URL(url); // This will throw an error if the URL is malformed
      return true;
    } catch {
      return false;
    }
  };
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Collections</h1>
          <p className="text-gray-500 mt-1">Manage your curated product groups</p>
        </div>
        <Link 
          href="/admin/collections/new"
          className="bg-gray-900 hover:bg-[#006044] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> Create Collection
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-4">Collection</th>
              <th className="p-4">Status</th>
              <th className="p-4">Products</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-medium">Loading collections...</td></tr>
            ) : collections?.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-medium">No collections found.</td></tr>
            ) : (
              collections?.map((col: any) => (
                <tr key={col.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden relative border border-gray-200">
                      {/* 🚨 APPLY FIX: Only render <Image /> if the URL is valid */}
                      {isValidImageUrl(col.image) ? (
                        <Image src={col.image} alt={col.name || "Collection"} fill className="object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-[#006044] transition-colors">{col.name}</p>
                      <p className="text-xs text-gray-400 font-medium">/{col.slug}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black ${col.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {col.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-600">
                    {col._count?.products || 0} <span className="font-medium text-gray-400">Items</span>
                  </td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/admin/collections/${col.id}`}
                      className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-[#006044] hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Collection"
                    >
                      <Edit3 className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}