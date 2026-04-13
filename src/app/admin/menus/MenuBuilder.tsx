// src\app\admin\menus\MenuBuilder.tsx

'use client';

import { useState, useEffect } from 'react';
import { adminMenusService } from '@/services/admin-menus.service';
import { Trash2, Plus, MoveUp, MoveDown, Save } from 'lucide-react';

export default function MenuBuilder({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    fetchMenu();
  }, [slug]);

  const fetchMenu = async () => {
    setLoading(true);
    const data = await adminMenusService.getMenuBySlug(slug);
    if (data && data.groups) {
      setGroups(data.groups);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminMenusService.updateMenu(slug, { groups });
      alert('Menu saved successfully!');
    } catch (error) {
      alert('Failed to save menu.');
    }
    setSaving(false);
  };

  // Group Handlers
  const addGroup = () => {
    setGroups([...groups, { id: Date.now().toString(), title: 'New Column', items: [] }]);
  };

  const updateGroup = (index: number, field: string, value: string) => {
    const newGroups = [...groups];
    newGroups[index][field] = value;
    setGroups(newGroups);
  };

  const removeGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
  };

  // Item Handlers
  const addItem = (groupIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].items.push({
      id: Date.now().toString(),
      label: 'New Link',
      slug: '',
      type: 'COLLECTION'
    });
    setGroups(newGroups);
  };

  const updateItem = (groupIndex: number, itemIndex: number, field: string, value: string) => {
    const newGroups = [...groups];
    newGroups[groupIndex].items[itemIndex][field] = value;
    setGroups(newGroups);
  };

  const removeItem = (groupIndex: number, itemIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].items.splice(itemIndex, 1);
    setGroups(newGroups);
  };

  if (loading) return <div>Loading Menu Builder...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Mega Menu Builder</h2>
          <p className="text-sm text-gray-500">Editing: {slug}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded-md flex items-center hover:bg-green-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Menu'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {groups.map((group, gIndex) => (
          <div key={group.id} className="bg-gray-50 border rounded-lg p-4 relative shadow-sm">
            
            {/* Column Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <input
                type="text"
                value={group.title}
                onChange={(e) => updateGroup(gIndex, 'title', e.target.value)}
                className="font-bold text-lg bg-transparent border-none focus:ring-0 p-0 text-gray-800"
                placeholder="Column Title"
              />
              <button onClick={() => removeGroup(gIndex)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Optional Promotional Image for the Column */}
            <div className="mb-4 space-y-2">
              <input
                type="text"
                value={group.image || ''}
                onChange={(e) => updateGroup(gIndex, 'image', e.target.value)}
                placeholder="Promo Image URL (Optional)"
                className="w-full text-sm border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="text"
                value={group.link || ''}
                onChange={(e) => updateGroup(gIndex, 'link', e.target.value)}
                placeholder="Promo Image Link (Optional)"
                className="w-full text-sm border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Links List */}
            <div className="space-y-3 mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Links</h4>
              {group.items.map((item: any, iIndex: number) => (
                <div key={item.id} className="bg-white border rounded p-3 flex flex-col space-y-2 relative group/item">
                  <div className="flex justify-between">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateItem(gIndex, iIndex, 'label', e.target.value)}
                      placeholder="Display Label"
                      className="text-sm font-medium border-none p-0 focus:ring-0 w-1/2"
                    />
                    <button onClick={() => removeItem(gIndex, iIndex)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={item.slug}
                      onChange={(e) => updateItem(gIndex, iIndex, 'slug', e.target.value)}
                      placeholder="slug (e.g. skin-care)"
                      className="text-xs w-full border-gray-200 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => addItem(gIndex)}
              className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-md flex items-center justify-center hover:border-gray-400 hover:text-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Link
            </button>
          </div>
        ))}

        {/* Add New Column Button */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
          <button
            onClick={addGroup}
            className="flex flex-col items-center text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Plus className="w-8 h-8 mb-2" />
            <span className="font-medium">Add New Column</span>
          </button>
        </div>

      </div>
    </div>
  );
}