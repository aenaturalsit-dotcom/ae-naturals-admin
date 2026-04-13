// src\app\admin\menus\page.tsx

import MenuBuilder from "./MenuBuilder";


export default function MenusPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Navigation Configuration</h1>
        <p className="text-gray-600">Configure your store's Mega Menu structure and promotional banners.</p>
      </div>

      {/* Passing 'main-menu' directly. If you have multiple menus (like footer-menu), 
          you can change this to a dynamic route like /admin/menus/[slug]/page.tsx */}
      <MenuBuilder slug="main-menu" />
    </div>
  );
}