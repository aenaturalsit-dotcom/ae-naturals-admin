"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import apiClient from "@/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Search,
  GripVertical,
  Trash2,
  ArrowLeft,
  UploadCloud,
  X,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";
import { resolveFirstProductImage } from "@/shared/utils/media-normalization"; // 🔥 IMPORT NEW RESOLVER HELPER

const DEBUG = true;

function log(scope: string, message: string, data?: any) {
  if (!DEBUG) return;
  const prefix = `%c[CollectionEditor::${scope}]`;
  const style = "color: #006044; font-weight: bold;";
  if (data !== undefined) {
    console.log(prefix, style, message, data);
  } else {
    console.log(prefix, style, message);
  }
}

function logError(scope: string, message: string, error?: any) {
  if (!DEBUG) return;
  const prefix = `%c[CollectionEditor::${scope}] ❌`;
  const style = "color: #dc2626; font-weight: bold;";
  console.error(prefix, style, message, error);
}

function logWarn(scope: string, message: string, data?: any) {
  if (!DEBUG) return;
  const prefix = `%c[CollectionEditor::${scope}] ⚠️`;
  const style = "color: #d97706; font-weight: bold;";
  console.warn(prefix, style, message, data);
}

// Helper to keep checking manual strings (like banner collections field upload types)
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

interface EditCollectionPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCollectionPage({
  params,
}: EditCollectionPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { id } = use(params);
  const isNew = id === "new";

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
  });

  const [collectionProducts, setCollectionProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isNew && id) {
      apiClient
        .get(`/admin/collections/${id}`)
        .then((res: any) => {
          const payload = res.data || res;

          if (payload && (payload.id || payload.name)) {
            const mapped = {
              name: payload.name || "",
              slug: payload.slug || "",
              description: payload.description || "",
              image: payload.image || "",
              isActive: payload.isActive ?? true,
            };

            setFormData(mapped);

            const rawProducts = payload.products || [];
            const mappedProducts = rawProducts.map((cp: any) => ({
              ...cp.product,
              order: cp.order,
            }));

            setCollectionProducts(mappedProducts);
          }
        })
        .catch((err) => {
          logError(
            "FetchCollection",
            `Failed to fetch collection details for id="${id}"`,
            err,
          );
          toast.error("Failed to load collection details.");
        });
    }
  }, [id, isNew]);

  const { data: allProducts, isLoading: isProductsLoading } = useQuery({
    queryKey: ["admin-products", "force-refresh"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/admin/products");
        let finalArray: any[] = [];
        if (Array.isArray(res)) finalArray = res;
        else if (res && Array.isArray(res.data)) finalArray = res.data;
        else if (res?.data && Array.isArray(res.data.data))
          finalArray = res.data.data;
        return finalArray;
      } catch (error: any) {
        logError("FetchAllProducts", `API Request Failed`, error);
        return [];
      }
    },
    initialData: [],
    refetchOnMount: "always",
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      let currentId = id;

      if (isNew) {
        const res: any = await apiClient.post("/admin/collections", formData);
        const payload = res.data || res;
        currentId = payload.id;
        if (!currentId)
          throw new Error("Backend did not return a valid collection ID.");
      } else {
        await apiClient.put(`/admin/collections/${currentId}`, formData);
      }

      const syncPayload = {
        products: collectionProducts.map((p, index) => ({
          productId: p.id,
          order: index,
         })),
      };

      await apiClient.post(
        `/admin/collections/${currentId}/sync-products`,
        syncPayload,
      );
    },
    onSuccess: () => {
      toast.success(
        isNew
          ? "Collection created successfully!"
          : "Collection updated successfully!",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] });
      router.push("/admin/collections");
    },
    onError: (error: any) => {
      const backendMessage =
        error?.response?.data?.message || "Failed to save collection.";
      toast.error(backendMessage);
      logError("SaveMutation", `Save FAILED`, error);
    },
  });

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    let _items = [...collectionProducts];
    const draggedItemContent = _items.splice(dragItem.current, 1)[0];
    _items.splice(dragOverItem.current, 0, draggedItemContent);

    dragItem.current = null;
    dragOverItem.current = null;
    setCollectionProducts(_items);
  };

  const handleAddProduct = (product: any) => {
    const alreadyAdded = collectionProducts.find((p) => p.id === product.id);
    if (alreadyAdded) {
      toast.error("Product already in collection!");
      return;
    }

    const updated = [...collectionProducts, product];
    setCollectionProducts(updated);
    setSearchQuery("");
    toast.success("Added to collection", {
      icon: "✅",
      style: { fontSize: "14px" },
    });
  };

  const handleRemoveProduct = (productId: string) => {
    const updated = collectionProducts.filter((p) => p.id !== productId);
    setCollectionProducts(updated);
  };

  const searchResults =
    allProducts
      ?.filter((p: any) => {
        const name = p.name?.toLowerCase() || "";
        const matchesSearch = name.includes(searchQuery.toLowerCase());
        const isNotAdded = !collectionProducts.some((cp) => cp.id === p.id);
        return matchesSearch && isNotAdded;
      })
      .slice(0, 8) || [];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-32">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/collections"
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {isNew ? "New Collection" : "Edit Collection"}
          </h1>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-[#006044] hover:bg-[#004b35] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {saveMutation.isPending ? (
            "Saving..."
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Collection
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Collection Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const newSlug = newName
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    setFormData({ ...formData, name: newName, slug: newSlug });
                  }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#006044]/10 focus:border-[#006044] transition-all"
                  placeholder="e.g. Best Sellers"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 outline-none cursor-not-allowed text-gray-500"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#006044]/10 focus:border-[#006044] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Banner Image
                </label>
                {formData.image ? (
                  <div className="relative w-full h-40 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 shadow-inner group">
                    <Image
                      src={
                        isValidImageUrl(formData.image)
                          ? formData.image
                          : "/placeholder.png"
                      }
                      alt="Banner Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="absolute top-3 right-3 p-2 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg shadow-md transition-all active:scale-95"
                    >
                      <X className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <CldUploadWidget
                    uploadPreset={
                      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                    }
                    onSuccess={(result: any) => {
                      const url = result?.info?.secure_url;
                      if (url) setFormData({ ...formData, image: url });
                    }}
                    options={{
                      maxFiles: 1,
                      resourceType: "image",
                      clientAllowedFormats: [
                        "jpeg",
                        "png",
                        "jpg",
                        "webp",
                        "avif",
                      ],
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="w-full flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-[#006044]/5 hover:border-[#006044] transition-all group outline-none focus:ring-4 focus:ring-[#006044]/10"
                      >
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-[#006044] transition-colors" />
                        </div>
                        <span className="text-sm font-bold text-gray-600 group-hover:text-[#006044]">
                          Click to Upload Image
                        </span>
                      </button>
                    )}
                  </CldUploadWidget>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2 group">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 text-[#006044] rounded border-gray-300 focus:ring-[#006044]"
                />
                <span className="font-bold text-gray-700 group-hover:text-[#006044] transition-colors">
                  Visible on Website
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Collection Products
                </h2>
                <p className="text-sm text-gray-400">
                  Search to add products, then drag to reorder.
                </p>
              </div>
              <div className="bg-green-50 text-[#006044] font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">
                {collectionProducts.length} Items
              </div>
            </div>

            <div className="relative mb-8">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
              <input
                type="text"
                placeholder="Type to search and add products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-4 focus:ring-[#006044]/5 focus:border-[#006044] transition-all"
              />

              {searchQuery && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto">
                  {isProductsLoading ? (
                    <div className="p-6 text-sm text-gray-400 text-center animate-pulse">
                      Loading store catalog...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-6 text-sm text-gray-400 text-center font-medium">
                      No matches found for "{searchQuery}"
                    </div>
                  ) : (
                    searchResults.map((p: any) => {
                      // 🔥 RESOLVE: First image from full catalog search list
                      const resolvedSearchImage = resolveFirstProductImage(p.images);
                      
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleAddProduct(p)}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                        >
                          <div className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100">
                            <Image
                              src={resolvedSearchImage || "/placeholder.png"}
                              fill
                              alt=""
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-gray-900 truncate">
                              {p.name || "Untitled"}
                            </p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              ₹{p.price || 0}
                            </p>
                          </div>
                          <button className="bg-gray-900 text-white text-[10px] font-black px-4 py-2 rounded-lg hover:bg-[#006044] transition-colors flex-shrink-0 uppercase">
                            Add
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {collectionProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                  <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-bold">
                    No products added to this collection yet.
                  </p>
                </div>
              ) : (
                collectionProducts.map((product, index) => {
                  // 🔥 RESOLVE: First image from active draggable item stack
                  const resolvedRowImage = resolveFirstProductImage(product.images);

                  return (
                    <div
                      key={product.id}
                      draggable
                      onDragStart={() => (dragItem.current = index)}
                      onDragEnter={() => (dragOverItem.current = index)}
                      onDragEnd={handleSort}
                      onDragOver={(e) => e.preventDefault()}
                      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-[#006044] transition-all group cursor-move active:scale-[0.99] active:shadow-md"
                    >
                      <div className="text-gray-300 group-hover:text-[#006044] transition-colors cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      <div className="w-14 h-14 bg-gray-50 rounded-xl relative overflow-hidden flex-shrink-0 border border-gray-100">
                        <Image
                          src={resolvedRowImage || "/placeholder.png"}
                          fill
                          alt=""
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 truncate text-sm">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                          ID: {product.id.slice(-6)}
                        </p>
                      </div>

                      <div className="text-right mr-4">
                        <p className="font-black text-gray-900">
                          ₹{product.price}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveProduct(product.id);
                        }}
                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}