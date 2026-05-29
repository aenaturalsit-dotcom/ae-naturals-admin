// src\components\admin\providers\SmsEventToggles.tsx




'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Switch } from '../ui/Switch';
import  apiClient  from '@/lib/api-client';

const SMS_EVENTS = [
  'ORDER_PLACED',
  'ORDER_CONFIRMED',
  'ORDER_SHIPPED',
  'ORDER_DELIVERED',
  'ORDER_CANCELLED',
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
];

export default function SmsEventToggles() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
    const fetchConfig = async () => {
      try {
        // 🔥 FIX: Remove the { } around data. The interceptor already returns the array directly.
        const data: any[] = await apiClient.get('/admin/providers?type=SMS');
        
        // Find our pseudo-provider containing the JSON preferences
        const prefConfig = data.find((c: any) => c.provider === 'EVENT_PREFERENCES');
        
        if (prefConfig && prefConfig.config) {
          setPreferences(prefConfig.config);
        } else {
          // If not found, default all events to TRUE
          setPreferences(SMS_EVENTS.reduce((acc, ev) => ({ ...acc, [ev]: true }), {}));
        }
      } catch (err) {
        console.error('Failed to load SMS preferences', err);
        toast.error('Failed to load SMS settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleToggle = (event: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [event]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // ✅ POSTs to the newly added backend alias route
      await apiClient.post('/admin/providers/config', {
        type: 'SMS',
        provider: 'EVENT_PREFERENCES', // Stored in DB as provider name
        isActive: true,
        priority: 99, 
        config: preferences, // This gets safely encrypted by ProviderConfigService
      });
      toast.success('SMS Event preferences saved successfully!');
    } catch (err) {
      console.error('Save error', err);
      toast.error('Failed to save preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500 animate-pulse">Loading SMS Preferences...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="text-lg font-bold text-gray-900 mb-1">SMS Event Routing</h3>
      <p className="text-sm text-gray-500 mb-6">
        Enable or disable SMS notifications for specific lifecycle events. <br/>
        <span className="text-rose-500 font-semibold">* Note: OTP SMS is critical and cannot be disabled.</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strictly ON toggle for OTP visual clarity */}
        <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between opacity-70 cursor-not-allowed">
           <div>
             <p className="font-semibold text-sm text-gray-900">OTP / VERIFICATION</p>
             <p className="text-xs text-gray-500">Critical system requirement</p>
           </div>
           <Switch checked={true} onChange={() => {}} disabled={true} />
        </div>

        {/* Dynamic Event Toggles */}
        {SMS_EVENTS.map(event => (
          <div key={event} className="p-4 rounded-lg border border-gray-100 bg-white flex items-center justify-between hover:border-gray-300 transition-colors">
             <div>
               <p className="font-semibold text-sm text-gray-900 capitalize">
                 {event.replace(/_/g, ' ').toLowerCase()}
               </p>
               <p className="text-xs text-gray-500 font-mono mt-0.5">{event}</p>
             </div>
             <Switch 
               checked={preferences[event] ?? true} 
               onChange={(val) => handleToggle(event, val)} 
               disabled={isSaving} 
             />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-lg hover:bg-rose-700 text-sm font-medium transition-all disabled:opacity-70 shadow-sm shadow-rose-600/20"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Event Settings
        </button>
      </div>
    </div>
  );
}