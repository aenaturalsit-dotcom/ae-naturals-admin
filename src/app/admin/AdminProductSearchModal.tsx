"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Plus } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useProductSearch } from "@/hooks/useProductSearch";

const isValidImageUrl = (url?: string) => {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("/")) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

interface AdminProductSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: any) => void;
}

export function AdminProductSearchModal({ isOpen, onClose, onSelect }: AdminProductSearchModalProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchTerm = useDebounce(inputValue, 300);
  const { data: results, isLoading, isFetching } = useProductSearch(debouncedSearchTerm);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setInputValue("");
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 🚨 FIX 1: Better Loading Logic
  // Only show the big loading spinner on the FIRST load, not every keystroke
  const showInitialLoading = isLoading && debouncedSearchTerm.length >= 2;
  const showEmpty = !isFetching && debouncedSearchTerm.length >= 2 && (!results || results.length === 0);
  const showResults = results && results.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-zinc-900/60 backdrop-blur-sm">
      <div className="absolute inset-0 " onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-zinc-100 bg-white relative">
          <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search to attach a product..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-lg text-zinc-900 placeholder:text-zinc-400"
          />
          
          {/* Subtle loading spinner when typing to fetch new data */}
          {isFetching && !showInitialLoading && (
             <Loader2 className="w-4 h-4 text-zinc-400 animate-spin absolute right-12" />
          )}

          {inputValue && (
            <button onClick={() => setInputValue("")} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-md">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto overscroll-contain flex-1 bg-zinc-50/50">
          {debouncedSearchTerm.length < 2 && (
            <div className="px-6 py-12 text-center text-sm text-zinc-500">
              Type at least 2 characters to search your catalog.
            </div>
          )}

          {showInitialLoading && (
            <div className="px-6 py-12 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin mb-3 text-[#006044]" />
              <p className="text-sm font-medium">Searching...</p>
            </div>
          )}

          {showEmpty && (
            <div className="px-6 py-12 text-center">
              <p className="text-zinc-900 font-bold mb-1">No results found</p>
            </div>
          )}

          {showResults && !showInitialLoading && (
            <div className={`py-2 transition-opacity duration-200 ${isFetching ? "opacity-50" : "opacity-100"}`}>
              {results.map((product: any) => {
                
                // Extract Image correctly for strings or objects
                let finalImageUrl = "/placeholder.png";
                if (product.imageUrl) {
                   finalImageUrl = product.imageUrl;
                } else if (Array.isArray(product.images) && product.images.length > 0) {
                   finalImageUrl = typeof product.images[0] === 'string' 
                     ? product.images[0] 
                     : product.images[0]?.url || "/placeholder.png";
                }

                // Ensure it's a valid URL string before rendering
                const safeImageSrc = isValidImageUrl(finalImageUrl) ? finalImageUrl : "/placeholder.png";

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelect({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        slug: product.slug,
                        image: safeImageSrc
                      });
                      setInputValue("");
                      onClose();
                    }}
                    className="flex items-center px-4 py-3 hover:bg-green-50 cursor-pointer transition-colors group border-l-2 border-transparent hover:border-[#006044]"
                  >
                    {/* 🚨 FIX 2: Used standard <img> tag to bypass Next.js hostname blocking */}
                    <div className="w-12 h-12 bg-white rounded-lg relative overflow-hidden shrink-0 border border-zinc-200">
                      <img
                        src={safeImageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Details */}
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 truncate group-hover:text-[#006044]">
                        {product.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {product.category?.name || "Uncategorized"} • ₹{product.price}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="ml-4 flex items-center shrink-0">
                      <div className="bg-[#006044] text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}