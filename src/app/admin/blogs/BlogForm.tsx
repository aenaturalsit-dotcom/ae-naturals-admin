//  src\app\admin\blogs\BlogForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminBlogsService } from "@/services/admin-blogs.service";
import { Card } from "@/components/admin/ui/Card";
import { Switch } from "@/components/admin/ui/Switch";
import { CldUploadWidget } from "next-cloudinary";
import { Upload, X, Save, Loader2, ArrowLeft } from "lucide-react";

interface BlogFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function BlogForm({
  initialData,
  isEditing = false,
}: BlogFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]); // Initialized as []
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    coverImage: initialData?.coverImage || "",
    categoryId: initialData?.categoryId || "",
    tags: initialData?.tags?.join(", ") || "",
    isFeatured: initialData?.isFeatured || false,
    isPublished: initialData?.isPublished || false,
  });

  useEffect(() => {
    AdminBlogsService.getCategories()
      .then((res) => {
        // Ensure we are setting an array even if the API returns something else
        const data = res?.data || res || [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
        setCategories([]); // Fallback to empty array on error
      });
  }, []);

  // ✅ GLOBAL SCROLL FIX
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEditing ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean),
    };

    try {
      if (isEditing) {
        await AdminBlogsService.updateBlog(initialData.id, payload);
      } else {
        await AdminBlogsService.createBlog(payload);
      }
      router.push("/admin/blogs");
    } catch (error) {
      console.error("Failed to save blog:", error);
      alert("Failed to save blog. Check console for details.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative pb-10">
      {/* ACTION BAR */}
      <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/blogs")}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {isEditing ? "Edit Blog Post" : "Create New Blog"}
            </h2>
            <p className="text-xs text-gray-500">
              {formData.isPublished ? "Currently visible to public" : "Saved as a draft"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => router.push("/admin/blogs")}
            className="px-5 py-2.5 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium bg-[#006044] text-white rounded-lg hover:bg-[#004d36] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isLoading ? "Saving..." : "Save Blog"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-5 shadow-sm border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. 5 Skincare Tips for Glowing Skin"
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-[#006044] focus:ring-1 focus:ring-[#006044] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-600 bg-gray-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Short Excerpt <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="A brief summary of the article..."
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-[#006044] focus:ring-1 focus:ring-[#006044] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Article Content (HTML supported) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={18}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="<p>Write your beautiful blog post here...</p>"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-[#006044] focus:ring-1 focus:ring-[#006044] outline-none transition-all font-mono text-sm leading-relaxed"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-5 shadow-sm border-gray-100">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Publishing Details</h3>
            <div className="flex items-center justify-between group">
              <div>
                <span className="block text-sm font-semibold text-gray-800">Publish Article</span>
                <span className="text-xs text-gray-500">Make visible on storefront</span>
              </div>
              <Switch
                checked={formData.isPublished}
                onChange={(checked) => setFormData({ ...formData, isPublished: checked })}
              />
            </div>
            <div className="flex items-center justify-between group pt-2 border-t border-gray-50">
              <div>
                <span className="block text-sm font-semibold text-gray-800">Featured</span>
                <span className="text-xs text-gray-500">Pin to hero section</span>
              </div>
              <Switch
                checked={formData.isFeatured}
                onChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
              />
            </div>
          </Card>

          <Card className="p-6 space-y-5 shadow-sm border-gray-100">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Organization</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white focus:border-[#006044] focus:ring-1 focus:ring-[#006044] outline-none transition-all"
              >
                <option value="" disabled>Select a category</option>
                {/* Added optional chaining and fallback for total safety */}
                {(categories || []).map((cat) => (
                  <option key={cat.id || cat._id} value={cat.id || cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="skincare, routine, tips"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-[#006044] focus:ring-1 focus:ring-[#006044] outline-none transition-all text-sm"
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4 shadow-sm border-gray-100">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Cover Image</h3>
            {formData.coverImage ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 group">
                <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, coverImage: "" })}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-lg flex items-center gap-2"
                  >
                    <X size={16} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(result: any) => {
                  if (result.event === "success") {
                    setFormData((prev) => ({ ...prev, coverImage: result.info.secure_url }));
                  }
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-[#006044] bg-gray-50"
                  >
                    <Upload size={32} className="mb-3 opacity-80" />
                    <span className="text-sm font-semibold">Click to upload cover</span>
                  </button>
                )}
              </CldUploadWidget>
            )}
          </Card>
        </div>
      </div>
    </form>
  );
}