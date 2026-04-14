// src\app\admin\menus\MenuBuilder.tsx

"use client";

import React, { useEffect, useState } from "react";
import { adminMenusService } from "@/services/admin-menus.service";
import {
  Trash2,
  Plus,
  Save,
  Loader2,
  Layout,
  Columns,
  Database,
  ExternalLink,
  Package,
  Tags,
  Monitor,
} from "lucide-react";
import AdminMenuPreview from "./AdminMenuPreview";
import toast from "react-hot-toast";

const MENU_TYPES = [
  { label: "Collection", value: "COLLECTION", icon: <Database size={14} /> },
  { label: "Category", value: "CATEGORY", icon: <Tags size={14} /> },
  { label: "Product", value: "PRODUCT", icon: <Package size={14} /> },
  { label: "Custom Link", value: "EXTERNAL", icon: <ExternalLink size={14} /> },
];

export default function MenuBuilder({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    init();
  }, [slug]);

  const init = async () => {
    setLoading(true);
    try {
      const [menuRes, colRes, catRes, prodRes] = await Promise.all([
        adminMenusService.getMenuBySlug(slug),
        adminMenusService.getAvailableCollections(),
        adminMenusService.getCategories?.(),
        adminMenusService.getProducts?.(),
      ]);
      const menu = menuRes?.data || menuRes;
      setGroups(menu?.groups || []);
      setCollections(colRes || []);
      setCategories(catRes || []);
      setProducts(prodRes || []);
    } catch (e) {
      toast.error("Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Syncing with storefront...");
    try {
      const payload = {
        groups: groups.map((g, gIdx) => ({
          title: g.title,
          image: g.image || null,
          link: g.link || null,
          position: gIdx,
          columns: (g.columns || []).map((c: any, cIdx: number) => ({
            title: c.title,
            position: cIdx,
            items: (c.items || []).map((i: any, iIdx: number) => ({
              label: i.label || "",
              slug: i.slug || "",
              type: i.type || "COLLECTION",
              position: iIdx,
              referenceId: i.referenceId || null,
            })),
          })),
        })),
      };
      await adminMenusService.updateMenu(slug, payload);
      toast.success("Menu published successfully", { id: toastId });
    } catch (e) {
      toast.error("Save failed", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center text-slate-400 gap-4">
        <Loader2 className="animate-spin text-[#006044]" size={40} />
        <p className="text-xs font-bold uppercase tracking-widest">
          Initialising Menu Engine...
        </p>
      </div>
    );

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* 🔥 FIX: Visual Preview - Removed grayscale/opacity hiding the data */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm  transition-all">
          <div className="bg-slate-50 px-6 py-3 border-b flex items-center gap-2">
            <Monitor size={14} className="text-[#006044]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Live Visual Preview
            </span>
          </div>
          <div className="p-6 bg-white z-9999">
            <AdminMenuPreview groups={groups} />
          </div>
        </section>

        {/* STICKY HEADER - Updated Z-index to not hide toast */}
        <header className="sticky top-4 z-[40]">
          <div className="backdrop-blur-xl bg-white/90 border border-slate-200 rounded-2xl shadow-xl px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#006044] rounded-xl flex items-center justify-center shadow-lg shadow-green-100">
                <Layout className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-none">
                  Navigation Builder
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Status: Active
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white px-8 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#006044] transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              <span className="font-bold text-sm">Publish Menu</span>
            </button>
          </div>
        </header>

        {/* BUILDER GRID */}
        <div className="space-y-10">
          {groups.map((group, gIdx) => (
            <div
              key={gIdx}
              className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-8"
            >
              <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <div className="flex items-center gap-4 flex-1">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-[#006044] font-black text-sm">
                    {gIdx + 1}
                  </span>
                  <input
                    value={group.title}
                    onChange={(e) => {
                      const u = [...groups];
                      u[gIdx].title = e.target.value;
                      setGroups(u);
                    }}
                    className="text-xl font-black w-full bg-transparent focus:outline-none text-slate-900"
                    placeholder="GROUP TITLE"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const u = [...groups];
                      if (!u[gIdx].columns) u[gIdx].columns = [];
                      u[gIdx].columns.push({ title: "New Column", items: [] });
                      setGroups(u);
                    }}
                    className="h-10 px-4 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 hover:bg-black hover:text-white transition-all"
                  >
                    + Add Column
                  </button>
                  <button
                    onClick={() =>
                      setGroups(groups.filter((_, i) => i !== gIdx))
                    }
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(group.columns || []).map((col: any, cIdx: number) => (
                  <div
                    key={cIdx}
                    className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        value={col.title}
                        onChange={(e) => {
                          const u = [...groups];
                          u[gIdx].columns[cIdx].title = e.target.value;
                          setGroups(u);
                        }}
                        className="font-bold text-xs uppercase tracking-widest bg-transparent w-full text-slate-400 focus:text-[#006044] outline-none"
                      />
                      <button
                        onClick={() => {
                          const u = [...groups];
                          u[gIdx].columns.splice(cIdx, 1);
                          setGroups(u);
                        }}
                        className="text-slate-300 hover:text-rose-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(col.items || []).map((item: any, iIdx: number) => (
                        <div
                          key={iIdx}
                          className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm relative group/item"
                        >
                          <div className="flex items-center justify-between">
                            <select
                              value={item.type}
                              onChange={(e) => {
                                const u = [...groups];
                                u[gIdx].columns[cIdx].items[iIdx] = {
                                  ...item,
                                  type: e.target.value,
                                  label: "",
                                  slug: "",
                                  referenceId: null,
                                };
                                setGroups(u);
                              }}
                              className="bg-slate-50 border-none rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-tighter cursor-pointer"
                            >
                              {MENU_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                const u = [...groups];
                                u[gIdx].columns[cIdx].items.splice(iIdx, 1);
                                setGroups(u);
                              }}
                              className="text-slate-200 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="space-y-2">
                            {item.type === "COLLECTION" && (
                              <select
                                value={item.referenceId || ""}
                                onChange={(e) => {
                                  const selected = collections.find(
                                    (c) => c.id === e.target.value,
                                  );
                                  if (!selected) return;
                                  const u = [...groups];
                                  u[gIdx].columns[cIdx].items[iIdx] = {
                                    ...item,
                                    label: selected.name,
                                    slug: selected.slug,
                                    referenceId: selected.id,
                                  };
                                  setGroups(u);
                                }}
                                className="w-full border-slate-200 border rounded-xl px-3 py-2 text-sm font-medium"
                              >
                                <option value="">Select Collection</option>
                                {collections.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            )}

                            {item.type === "CATEGORY" && (
                              <select
                                value={item.referenceId || ""}
                                onChange={(e) => {
                                  const selected = categories.find(
                                    (c) => c.id === e.target.value,
                                  );
                                  if (!selected) return;
                                  const u = [...groups];
                                  u[gIdx].columns[cIdx].items[iIdx] = {
                                    ...item,
                                    label: selected.name,
                                    slug: selected.slug,
                                    referenceId: selected.id,
                                  };
                                  setGroups(u);
                                }}
                                className="w-full border-slate-200 border rounded-xl px-3 py-2 text-sm font-medium"
                              >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            )}

                            {item.type === "PRODUCT" && (
                              <select
                                value={item.referenceId || ""}
                                onChange={(e) => {
                                  const selected = products.find(
                                    (p) => p.id === e.target.value,
                                  );
                                  if (!selected) return;
                                  const u = [...groups];
                                  u[gIdx].columns[cIdx].items[iIdx] = {
                                    ...item,
                                    label: selected.name,
                                    slug: selected.slug,
                                    referenceId: selected.id,
                                  };
                                  setGroups(u);
                                }}
                                className="w-full border-slate-200 border rounded-xl px-3 py-2 text-sm font-medium"
                              >
                                <option value="">Select Product</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            )}

                            {(item.type === "EXTERNAL" || !item.type) && (
                              <div className="space-y-2">
                                <input
                                  placeholder="Label (e.g. Help Center)"
                                  value={item.label}
                                  onChange={(e) => {
                                    const u = [...groups];
                                    u[gIdx].columns[cIdx].items[iIdx].label =
                                      e.target.value;
                                    setGroups(u);
                                  }}
                                  className="w-full border-slate-200 border rounded-xl px-3 py-2 text-sm"
                                />
                                <input
                                  placeholder="Slug/URL (e.g. /support)"
                                  value={item.slug}
                                  onChange={(e) => {
                                    const u = [...groups];
                                    u[gIdx].columns[cIdx].items[iIdx].slug =
                                      e.target.value;
                                    setGroups(u);
                                  }}
                                  className="w-full border-slate-200 border rounded-xl px-3 py-2 text-sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const u = [...groups];
                          u[gIdx].columns[cIdx].items.push({
                            label: "",
                            slug: "",
                            type: "COLLECTION",
                            referenceId: null,
                          });
                          setGroups(u);
                        }}
                        className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-300 hover:border-[#006044] hover:text-[#006044] transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase"
                      >
                        <Plus size={14} /> Add Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-8 border-t border-slate-100">
          <button
            onClick={() =>
              setGroups([
                ...groups,
                { title: "NEW NAVIGATION GROUP", columns: [] },
              ])
            }
            className="inline-flex items-center gap-3 bg-white text-black border-2 border-black px-12 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all shadow-xl active:scale-95"
          >
            <Plus size={20} /> Add New Section
          </button>
        </div>
      </div>
    </div>
  );
}
