// src\app\admin\products\page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Loader2, Package, CheckCircle2, AlertCircle, Trash2, Edit3 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { AddProductModal } from '@/components/admin/AddProductModal';
import { adminProductService } from '@/services/admin-products.service';
import { Product } from '@/types/types';
import { useRouter } from "next/navigation";


export default function ProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: async () => {
      // Make sure your API is actually returning the array directly.
      // If it returns { data: [...] }, you might need to return response.data instead.
      const response = await apiClient.get('/admin/products');
      return (response as any)?.data || response as unknown as Product[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminProductService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-rose-500" size={40} />
        <p className="text-zinc-500 font-medium">Loading Inventory...</p>
      </div>
    );
  }

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-zinc-900">
            <Package className="text-rose-500" size={32} /> Inventory Management
          </h1>
        </div>
        
        <button
         onClick={() => router.push(`/admin/products/add`)}
          className="bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-md active:scale-95"
        >
          <PlusCircle size={20} /> Add New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(products) && products?.map((product) => (
          <div key={product.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group relative">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                className="p-2 bg-white border border-zinc-100 rounded-lg text-zinc-400 hover:text-rose-500 shadow-sm transition-colors"
              >
                <Edit3 size={16} />
              </button>
              <button 
                onClick={() => confirm('Are you sure?') && deleteMutation.mutate(product.id)}
                className="p-2 bg-white border border-zinc-100 rounded-lg text-zinc-400 hover:text-red-500 shadow-sm transition-colors"
              >
                {deleteMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              </button>
            </div>

            <div>
              <div className="flex justify-between items-start mb-4 border-b border-zinc-50 pb-3">
                <h3 className="font-bold text-lg text-zinc-800 line-clamp-1">{product.name}</h3>
                <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded-full uppercase font-black tracking-tighter">
                  {/* 🔥 THE FIX: Check if product.category is truthy first */}
                  {product.category 
                    ? (typeof product.category === 'object' ? product.category.name : product.category) 
                    : 'Uncategorized'}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center justify-between">
                <span className={`flex items-center gap-1.5 text-xs font-bold ${product.isActive ? 'text-emerald-600' : 'text-zinc-400'}`}>
                  <CheckCircle2 size={14} /> {product.isActive ? 'VISIBLE' : 'HIDDEN'}
                </span>
                <p className="text-sm font-bold text-zinc-900">₹{product.price}</p>
              </div>
            </div>
          </div>
        ))}
        
        {(!products || products.length === 0) && (
          <div className="col-span-full p-10 text-center border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-500">
            No products found. Add your first product to get started!
          </div>
        )}
      </div>

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}

