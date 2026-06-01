// src\app\admin\blogs\add\page.tsx

import BlogForm from "../BlogForm";


export default function AddBlogPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Blog</h1>
      </div>
      <BlogForm />
    </div>
  );
}