// src\app\admin\menus\page.tsx

import MenuBuilder from "./MenuBuilder";

export default function AdminMenuPage() {
  return (
    <div className="bg-[#FDFDFD] min-h-screen">
      {/* Target 'main-menu' directly */}
      <MenuBuilder slug="main-menu" />
    </div>
  );
}