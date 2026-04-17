
// src/app/admin/pages/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Edit, Trash2, Globe, FileInput } from "lucide-react";
import { adminPagesService } from "@/services/admin-pages.service";

import toast from "react-hot-toast";
import { Card } from "@/components/admin/ui/Card";
import { Badge } from "@/components/admin/ui/Badge";

export default function PagesListAdmin() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    try {
      const data = await adminPagesService.getAllPages();
      setPages(data);
    } catch (error) {
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete /${slug}?`)) return;
    try {
      await adminPagesService.deletePage(slug);
      toast.success("Page deleted successfully");
      fetchPages(); // Refresh list
    } catch (error) {
      toast.error("Failed to delete page");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" /> Custom Pages
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage Privacy Policy, Terms, and static content.</p>
        </div>
        <Link 
          href="/admin/pages/edit/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Create Page
        </Link>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading pages...</div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <FileInput size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No pages found</h3>
            <p className="text-gray-500 mb-4">Create your first custom page to get started.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-sm text-gray-600">
                <th className="p-4 font-medium">Page Title</th>
                <th className="p-4 font-medium">Slug / URL</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Last Updated</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{page.title}</td>
                  <td className="p-4 text-gray-500 text-sm">/{page.slug}</td>
                  <td className="p-4">
                    <Badge variant={page.isPublished ? "success" : "warning"}>
                      {page.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-3">
                    <Link href={`/admin/pages/edit/${page.slug}`} className="text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </Link>
                    <button onClick={() => handleDelete(page.slug)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}