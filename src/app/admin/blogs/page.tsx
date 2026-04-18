// src\app\admin\blogs\page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminBlogsService } from '@/services/admin-blogs.service';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';

export default function AdminBlogsPage() {
  // Initialize as empty array to prevent immediate .map errors
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const res = await AdminBlogsService.getBlogs();
      
      /** * Debugging Note: 
       * If this still fails, check your console.log(res) 
       * to see if the data is at res.data or res.data.blogs
       */
      const data = res?.data || res || [];
      setBlogs(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
      setBlogs([]); // Set to empty array on error to prevent crash
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await AdminBlogsService.deleteBlog(id);
      fetchBlogs();
    } catch (error) {
      console.error('Failed to delete blog:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blogs & Journal</h1>
        <div className="flex gap-4">
          <Link 
            href="/admin/blogs/categories" 
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            Manage Categories
          </Link>
          <Link 
            href="/admin/blogs/add" 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus size={18} />
            Add New Blog
          </Link>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading blogs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Featured</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Added optional chaining and fallback to ensure it never reads 'map' of undefined */}
                {(blogs || []).map((blog) => (
                  <tr key={blog.id || blog._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{blog.title}</div>
                      <div className="text-xs text-gray-500">/{blog.slug}</div>
                    </td>
                    <td className="p-4 text-gray-600">{blog.category?.name || 'N/A'}</td>
                    <td className="p-4">
                      <Badge variant={blog.isPublished ? 'success' : 'warning'}>
                        {blog.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {blog.isFeatured && <Badge variant="info">Featured</Badge>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/blogs/edit/${blog.id || blog._id}`} className="text-blue-600 hover:text-blue-800">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(blog.id || blog._id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {(!blogs || blogs.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No blogs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}