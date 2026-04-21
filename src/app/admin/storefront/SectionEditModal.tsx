// src\app\admin\storefront\SectionEditModal.tsx


"use client";

import React, { useState, useEffect } from "react";

import { X, Upload, Loader2, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { ThemeSection } from "@/lib/validators/storefront";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  section: ThemeSection;
  onSave: (section: ThemeSection) => void;
}

export function SectionEditModal({ isOpen, onClose, section, onSave }: Props) {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    if (section) {
      setSettings(section.settings || {});
    }
  }, [section]);

  // Global Scroll Fix
  useEffect(() => {
    const restoreScroll = () => {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0px";
    };
    window.addEventListener("focus", restoreScroll);
    document.addEventListener("visibilitychange", restoreScroll);
    return () => {
      window.removeEventListener("focus", restoreScroll);
      document.removeEventListener("visibilitychange", restoreScroll);
    };
  }, []);

  if (!isOpen || !section) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev: any) => ({ ...prev, [name]: value }));
  };

  // --- HERO BANNER ARRAY HANDLERS ---
  const addHeroBanner = () => {
    const current = settings.banners || [];
    setSettings({ ...settings, banners: [...current, { imageUrl: '', headline: '', subtext: '', primaryCtaText: '', primaryCtaLink: '' }] });
  };

  const updateHeroBanner = (index: number, field: string, value: string) => {
    const newBanners = [...(settings.banners || [])];
    newBanners[index][field] = value;
    setSettings({ ...settings, banners: newBanners });
  };

  const removeHeroBanner = (index: number) => {
    const newBanners = [...(settings.banners || [])];
    newBanners.splice(index, 1);
    setSettings({ ...settings, banners: newBanners });
  };

  // --- TRUST BADGE ARRAY HANDLERS ---
  const addTrustBadge = () => {
    const current = settings.badges || [];
    setSettings({ ...settings, badges: [...current, { text: '' }] });
  };

  const updateTrustBadge = (index: number, value: string) => {
    const newBadges = [...(settings.badges || [])];
    newBadges[index].text = value;
    setSettings({ ...settings, badges: newBadges });
  };

  const removeTrustBadge = (index: number) => {
    const newBadges = [...(settings.badges || [])];
    newBadges.splice(index, 1);
    setSettings({ ...settings, badges: newBadges });
  };

  const handleSave = () => {
    onSave({ ...section, settings });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Edit {section.type.replace('_', ' ')}
            </h2>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Configuration Settings</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all shadow-sm">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-8 space-y-8 overflow-y-auto flex-1">
          
          {/* ================= HERO SLIDER BUILDER ================= */}
          {section.type === "HERO" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-700">Slider Banners</p>
                <button type="button" onClick={addHeroBanner} className="flex items-center gap-2 text-sm font-bold text-[#006044] bg-[#006044]/10 px-4 py-2 rounded-xl hover:bg-[#006044]/20 transition-colors">
                  <Plus size={16} /> Add Banner
                </button>
              </div>

              {(settings.banners || []).map((banner: any, index: number) => (
                <div key={index} className="p-5 border-2 border-gray-100 rounded-2xl bg-gray-50/50 relative group">
                  <button onClick={() => removeHeroBanner(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Slide {index + 1}</h4>
                  
                  <div className="space-y-4">
                    {/* Image Upload */}
                    <div className="flex items-center gap-4">
                      {banner.imageUrl ? (
                        <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200 group/img">
                          <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-32 h-20 bg-white border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon size={20} className="mb-1" />
                        </div>
                      )}
                      <div className="flex-1">
                        <CldUploadWidget
                          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                          onSuccess={(result: any) => {
                            if (result.event === "success") updateHeroBanner(index, 'imageUrl', result.info.secure_url);
                          }}
                        >
                          {({ open }) => (
                            <button type="button" onClick={() => open()} className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
                              <Upload size={16} /> {banner.imageUrl ? "Replace Desktop Image" : "Upload Desktop Image"}
                            </button>
                          )}
                        </CldUploadWidget>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Headline</label>
                        <input type="text" value={banner.headline || ''} onChange={(e) => updateHeroBanner(index, 'headline', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#006044] outline-none" placeholder="Premium Formulations" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Subtext</label>
                        <input type="text" value={banner.subtext || ''} onChange={(e) => updateHeroBanner(index, 'subtext', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#006044] outline-none" placeholder="Discover the new range..." />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Button Text</label>
                        <input type="text" value={banner.primaryCtaText || ''} onChange={(e) => updateHeroBanner(index, 'primaryCtaText', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#006044] outline-none" placeholder="Shop Now" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Button Link</label>
                        <input type="text" value={banner.primaryCtaLink || ''} onChange={(e) => updateHeroBanner(index, 'primaryCtaLink', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#006044] outline-none" placeholder="/collections/all" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!settings.banners || settings.banners.length === 0) && (
                <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                  Click "Add Banner" to create your first hero slide.
                </div>
              )}
            </div>
          )}

          {/* ================= TRUST BADGES BUILDER ================= */}
          {section.type === "TRUST_BADGES" && (
             <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-700">Scrolling Trust Bar Text</p>
                <button type="button" onClick={addTrustBadge} className="flex items-center gap-2 text-sm font-bold text-[#006044] bg-[#006044]/10 px-4 py-2 rounded-xl hover:bg-[#006044]/20 transition-colors">
                  <Plus size={16} /> Add Item
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(settings.badges || []).map((badge: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={badge.text || ''} 
                      onChange={(e) => updateTrustBadge(index, e.target.value)} 
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#006044] outline-none" 
                      placeholder="e.g. 100% Vegan" 
                    />
                    <button onClick={() => removeTrustBadge(index)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {(!settings.badges || settings.badges.length === 0) && (
                <div className="p-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                  No trust badges configured. Click "Add Item" to start.
                </div>
              )}
           </div>
          )}

          {/* ================= PRODUCT CAROUSEL ================= */}
          {section.type === "PRODUCT_CAROUSEL" && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Display Title</label>
                <input type="text" name="title" value={settings.title || ''} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#006044] outline-none" placeholder="Trending Right Now" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Data Source</label>
                  <select name="dataSource" value={settings.dataSource || 'featuredProducts'} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#006044] outline-none">
                    <option value="featuredProducts">Bestsellers (Featured)</option>
                    <option value="newArrivals">New Arrivals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">View All URL</label>
                  <input type="text" name="viewAllLink" value={settings.viewAllLink || ''} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#006044] outline-none" placeholder="/collections/bestsellers" />
                </div>
              </div>
            </>
          )}

          {/* ================= PROMO BANNER ================= */}
          {section.type === "PROMO_BANNER" && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Banner Headline</label>
                <input type="text" name="title" value={settings.title || ''} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#006044] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Background Image</label>
                <div className="flex items-center gap-4">
                  {settings.imageUrl ? (
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={settings.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setSettings({ ...settings, imageUrl: "" })} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={20} /></button>
                    </div>
                  ) : (
                    <div className="w-32 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                  )}
                  <div className="flex-1">
                    <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} onSuccess={(result: any) => { if (result.event === "success") setSettings({ ...settings, imageUrl: result.info.secure_url }); }}>
                      {({ open }) => (<button type="button" onClick={() => open()} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-black"><Upload size={18} /> {settings.imageUrl ? "Replace Image" : "Upload Image"}</button>)}
                    </CldUploadWidget>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">CTA Button Text</label>
                  <input type="text" name="buttonText" value={settings.buttonText || ''} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#006044] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">CTA Link</label>
                  <input type="text" name="link" value={settings.link || ''} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#006044] outline-none" />
                </div>
              </div>
            </>
          )}

          {/* ================= BRAND STORY ================= */}
          {section.type === "BRAND_STORY" && (
            <>
              <div><label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Headline</label><input type="text" name="title" value={settings.title || ''} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[#006044] outline-none" /></div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Story Image</label>
                <div className="flex items-center gap-4">
                  {settings.imageUrl ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group"><img src={settings.imageUrl} alt="Story" className="w-full h-full object-cover" /><button type="button" onClick={() => setSettings({ ...settings, imageUrl: "" })} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"><X size={20} /></button></div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                  )}
                  <div className="flex-1">
                    <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} onSuccess={(result: any) => { if (result.event === "success") setSettings({ ...settings, imageUrl: result.info.secure_url }); }}>
                      {({ open }) => (<button type="button" onClick={() => open()} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-900 px-4 py-3 rounded-xl text-sm font-bold"><Upload size={18} /> Replace Image</button>)}
                    </CldUploadWidget>
                  </div>
                </div>
              </div>
              <div><label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Text</label><textarea name="description" value={settings.description || ''} onChange={handleChange} rows={4} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[#006044] outline-none resize-none" /></div>
            </>
          )}

          {/* ================= COLLECTIONS & BLOG ================= */}
          {(section.type === "COLLECTIONS" || section.type === "BLOG_SECTION") && (
            <div><label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Section Title</label><input type="text" name="title" value={settings.title || ''} onChange={handleChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[#006044] outline-none" placeholder="Shop by Concern" /></div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl">Cancel</button>
          <button onClick={handleSave} className="px-8 py-3 text-sm font-bold text-white bg-gray-900 hover:bg-black rounded-xl shadow-lg shadow-gray-900/20 uppercase tracking-widest">Apply Changes</button>
        </div>

      </div>
    </div>
  );
}