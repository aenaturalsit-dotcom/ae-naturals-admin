"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Loader2, AlertTriangle } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

interface CollectionsShowcaseProps {
  settings: {
    title?: string;
    collectionId?: string;
    collectionSlug?: string;
  };
}

export const CollectionsShowcase: React.FC<CollectionsShowcaseProps> = ({ settings }) => {
  const { title, collectionId, collectionSlug } = settings;

  const { data: collection, isLoading } = useQuery({
    // Cache using whichever identifier we have
    queryKey: ["preview-collection-data", collectionSlug || collectionId],
    queryFn: async () => {
      // If we have literally nothing selected, skip
      if (!collectionSlug && !collectionId) return null;
      
      try {
        const domain = typeof window !== "undefined" ? window.location.hostname : "localhost";
        let res: any;

        // 🔥 FALLBACK LOGIC: Try slug first, if missing, use the ID via the admin route!
        if (collectionSlug) {
          res = await apiClient.get(`/collections/${collectionSlug}`, {
            headers: { "x-tenant-domain": domain }
          });
        } else if (collectionId) {
          res = await apiClient.get(`/admin/collections/${collectionId}`);
        }
        
        let finalData = null;
        if (res?.data && res.data.data) finalData = res.data.data;
        else if (res?.data) finalData = res.data;
        else finalData = res;

        return finalData;
      } catch (error) {
        console.error("Failed to fetch collection preview:", error);
        return null;
      }
    },
    // Run if we have either a slug OR an id
    enabled: !!collectionSlug || !!collectionId, 
  });

  // STATE 1: NOTHING SELECTED YET
  if (!collectionSlug && !collectionId) {
    return (
      <div className="container mx-auto px-4 py-8 w-full">
        {title && <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 tracking-tight uppercase">{title}</h2>}
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium text-sm uppercase tracking-widest">
            Select a collection to preview products
          </p>
        </div>
      </div>
    );
  }

  // STATE 2: HAS ID BUT NO SLUG (Old saved data warning)
  if (collectionId && !collectionSlug && !isLoading && !collection) {
    return (
      <div className="container mx-auto px-4 py-8 w-full">
        {title && <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 tracking-tight uppercase">{title}</h2>}
        <div className="flex flex-col items-center justify-center p-8 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800">
          <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
          <p className="font-bold">Settings Update Required</p>
          <p className="text-sm mt-1">Please click the collection button again in the right config panel to save its slug.</p>
        </div>
      </div>
    );
  }

  // STATE 3: LOADING ANIMATION
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 w-full">
        {title && <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 tracking-tight uppercase">{title}</h2>}
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-[#006044] animate-spin mb-4" />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Products...</p>
        </div>
      </div>
    );
  }

  // STATE 4: DATA LOADED
  const products = collection?.products || [];
  const previewProducts = products.slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8 w-full">
      {/* HEADER SECTION */}
      {title && (
        <div className="flex justify-between items-end mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">{title}</h2>
          {products.length > 4 && (
            <span className="text-xs font-black uppercase tracking-widest text-[#006044] hover:underline cursor-pointer">
              View All
            </span>
          )}
        </div>
      )}

      {/* PRODUCT GRID SECTION */}
      {previewProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {previewProducts.map((product: any) => (
            <ProductCard 
              key={product.id || product.product?.id} 
              // Notice: Your backend uses a join table. It might return { product: {id, name, ...} }
              product={product.product ? product.product : product} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
             <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
             </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-400">No products found in this collection.</h3>
        </div>
      )}
    </div>
  );
};