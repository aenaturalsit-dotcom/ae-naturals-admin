'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast'; // Make sure to run: pnpm add react-hot-toast
import { Switch } from '../ui/Switch';

const PROVIDER_SCHEMAS: Record<string, Record<string, string[]>> = {
  EMAIL: {
    SMTP: ['host', 'port', 'secure', 'user', 'password', 'from'],
    AWS_SES: ['accessKeyId', 'secretAccessKey', 'region', 'from'],
    SENDGRID: ['apiKey', 'from'],
  },
SMS: {
    FAST2SMS: ['apiKey'],
    MSG91: [
      'authKey', 
      'templateId', // Default (OTP)
      'template_order_placed', 
      'template_order_confirmed', 
      'template_order_shipped', 
      'template_order_delivered', 
      'template_order_cancelled'
    ],
    TWILIO: ['accountSid', 'authToken', 'fromNumber'],
  },
  PAYMENT: {
    RAZORPAY: ['key_id', 'key_secret'],
    STRIPE: ['public_key', 'secret_key', 'webhook_secret'],
    PHONEPE: ['merchant_id', 'salt_key', 'salt_index', 'frontend_url', 'backend_webhook_url', 'is_production'],
    // ✅ ADDED PAYU SCHEMA HERE
    PAYU: ['merchant_key', 'merchant_salt','frontend_url', 'backend_webhook_url', 'is_production'],
  },
};

export default function ProviderModal({ isOpen, onClose, onSave, initialData, activeType }: any) {
  const [providerName, setProviderName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState(1);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const availableProviders = Object.keys(PROVIDER_SCHEMAS[activeType] || {});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setProviderName(initialData.provider);
        setIsActive(initialData.isActive);
        setPriority(initialData.priority);
        setConfig(initialData.config || {});
      } else {
        const defaultProv = availableProviders[0] || '';
        setProviderName(defaultProv);
        setIsActive(true);
        setPriority(1);
        setConfig(defaultProv ? getEmptyConfig(defaultProv) : {});
      }
      setShowSecrets({});
      setIsSaving(false); // Reset loading state on open
    }
  }, [initialData, isOpen, activeType]);

  const getEmptyConfig = (prov: string) => {
    return (PROVIDER_SCHEMAS[activeType]?.[prov] || []).reduce((acc, key) => ({ ...acc, [key]: '' }), {});
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProv = e.target.value;
    setProviderName(newProv);
    setConfig(getEmptyConfig(newProv));
  };

  const isSecretField = (key: string) => /secret|password|key|salt/i.test(key); // ✅ Added 'salt' to be hidden
  const toggleSecretView = (key: string) => setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSaving) return;

    try {
      setIsSaving(true);
      
      // We await the onSave function (Ensure parent passes a promise, e.g., mutateAsync)
      await onSave({ 
        id: initialData?.id, 
        type: activeType, 
        provider: providerName, 
        isActive, 
        priority, 
        config 
      });

      toast.success('Provider configuration saved successfully!');
      onClose();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error?.message || 'Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentSchema = PROVIDER_SCHEMAS[activeType]?.[providerName] || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={() => !isSaving && onClose()} // Prevent closing by clicking outside while saving
      />
      
      {/* Changed to <form> to support native HTML validation and "Enter" to submit */}
      <form 
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{initialData ? 'Edit Integration' : 'New Integration'}</h3>
            <p className="text-sm text-gray-500 mt-0.5">Configure API keys and connection settings.</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[65vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Provider Service</label>
              <select
                value={providerName}
                onChange={handleProviderChange}
                disabled={!!initialData || isSaving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-shadow"
              >
                {availableProviders.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Failover Priority</label>
              <input
                type="number" 
                min="1" 
                required
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                disabled={isSaving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-shadow"
                placeholder="e.g., 1 (Highest)"
              />
            </div>
          </div>

          <div className={`p-4 bg-gray-50 rounded-xl border border-gray-200 transition-opacity ${isSaving ? 'opacity-60 pointer-events-none' : ''}`}>
            <Switch 
              checked={isActive} 
              onChange={setIsActive} 
              label="Enable this Provider" 
              description="If disabled, traffic will route to the next priority provider." 
            />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> API Configuration
            </h4>
            <div className="space-y-4">
              {currentSchema.map((key) => {
                const isSecret = isSecretField(key);
                const showVal = showSecrets[key];
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">
                      {key.replace(/_/g, ' ')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        required
                        type={isSecret && !showVal ? 'password' : 'text'}
                        value={config[key] || ''}
                        onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                        disabled={isSaving}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-mono disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-shadow pr-10"
                        placeholder={`Enter ${key}`}
                      />
                      {isSecret && (
                        <button 
                          type="button" 
                          onClick={() => toggleSecretView(key)}
                          disabled={isSaving}
                          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {showVal ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose} 
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 min-w-[140px] px-4 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-lg hover:bg-rose-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm shadow-rose-600/20"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}