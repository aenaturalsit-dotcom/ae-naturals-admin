// src\components\admin\providers\ProviderModal.tsx



'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Switch } from '../ui/Switch';

/* ---------------------- FIELD TYPES ---------------------- */

const FIELD_TYPES: Record<string, 'string' | 'number' | 'boolean'> = {
  port: 'number',
  channel_id: 'number',
  salt_index: 'number',

  secure: 'boolean',
  is_production: 'boolean',
  show_estimation: 'boolean',
};

/* ---------------------- TYPES ---------------------- */

type FieldConfig = {
  key: string;
  placeholder?: string;
  note?: string;
};

type ProviderSchema = Record<string, Record<string, FieldConfig[]>>;

/* ---------------------- SCHEMA ---------------------- */

const PROVIDER_SCHEMAS: ProviderSchema = {
  EMAIL: {
    SMTP: [
      {
        key: 'host',
        placeholder: 'smtp.gmail.com',
        note: 'SMTP server hostname from your email provider',
      },
      {
        key: 'port',
        placeholder: '587',
        note: 'Usually 587 (TLS) or 465 (SSL)',
      },
      {
        key: 'secure',
        placeholder: 'false',
        note: 'Enable SSL connection',
      },
      {
        key: 'user',
        placeholder: 'support@yourdomain.com',
        note: 'SMTP login email',
      },
      {
        key: 'password',
        placeholder: 'Enter SMTP password',
        note: 'Use app password if needed',
      },
      {
        key: 'from',
        placeholder: 'AE Naturals <support@aenaturals.com>',
        note: 'Sender email shown to customers',
      },
    ],

    AWS_SES: [
      {
        key: 'accessKeyId',
        placeholder: 'AKIA...',
        note: 'AWS IAM access key',
      },
      {
        key: 'secretAccessKey',
        placeholder: 'Enter AWS secret key',
        note: 'Keep this private',
      },
      {
        key: 'region',
        placeholder: 'ap-south-1',
        note: 'AWS SES region',
      },
      {
        key: 'from',
        placeholder: 'support@aenaturals.com',
      },
    ],

    SENDGRID: [
      {
        key: 'apiKey',
        placeholder: 'SG.xxxxxx',
        note: 'SendGrid API key',
      },
      {
        key: 'from',
        placeholder: 'support@aenaturals.com',
      },
    ],
  },

  SMS: {
    FAST2SMS: [
      {
        key: 'apiKey',
        placeholder: 'Fast2SMS API key',
      },
    ],

    MSG91: [
      {
        key: 'authKey',
        placeholder: 'MSG91 auth key',
      },
      {
        key: 'templateId',
        placeholder: 'Template ID',
      },
      {
        key: 'template_order_placed',
        placeholder: 'Order placed template ID',
      },
      {
        key: 'template_order_confirmed',
        placeholder: 'Order confirmed template ID',
      },
      {
        key: 'template_order_shipped',
        placeholder: 'Order shipped template ID',
      },
      {
        key: 'template_order_delivered',
        placeholder: 'Order delivered template ID',
      },
      {
        key: 'template_order_cancelled',
        placeholder: 'Order cancelled template ID',
      },
    ],

    TWILIO: [
      {
        key: 'accountSid',
        placeholder: 'Twilio SID',
      },
      {
        key: 'authToken',
        placeholder: 'Twilio auth token',
      },
      {
        key: 'fromNumber',
        placeholder: '+91XXXXXXXXXX',
      },
    ],
  },

  PAYMENT: {
    RAZORPAY: [
      {
        key: 'key_id',
        placeholder: 'rzp_live_xxxxx',
      },
      {
        key: 'key_secret',
        placeholder: 'Razorpay secret',
      },
    ],

    STRIPE: [
      {
        key: 'public_key',
        placeholder: 'pk_live_xxxxx',
      },
      {
        key: 'secret_key',
        placeholder: 'sk_live_xxxxx',
      },
      {
        key: 'webhook_secret',
        placeholder: 'whsec_xxxxx',
      },
    ],

    PHONEPE: [
      {
        key: 'merchant_id',
        placeholder: 'Merchant ID',
      },
      {
        key: 'salt_key',
        placeholder: 'Salt key',
      },
      {
        key: 'salt_index',
        placeholder: '1',
      },
      {
        key: 'frontend_url',
        placeholder: 'https://yourdomain.com',
      },
      {
        key: 'backend_webhook_url',
        placeholder: 'https://api.yourdomain.com/webhook',
      },
      {
        key: 'is_production',
        note: 'Enable live mode',
      },
    ],

    PAYU: [
  {
    key: "merchant_key",
    placeholder: "Merchant key",
    note: "Get this from your PayU Merchant Dashboard → Developer/API Keys.",
  },
  {
    key: "merchant_salt",
    placeholder: "Merchant salt",
    note: "Secret salt provided by PayU for hash generation and response verification.",
  },
  {
    key: "frontend_url",
    placeholder: "https://yourdomain.com",
    note: "Customer-facing website URL where users are redirected after payment success or failure.",
  },
  {
  key: "backend_webhook_url",
  placeholder: "https://api.yourdomain.com/api/v1",
  note: "Example: http://yourdomain.com/api/v1. Public backend endpoint to receive PayU payment status callbacks.",
},
  {
    key: "is_production",
    placeholder: "Select option",
    note: "Enable this only for live transactions. Keep disabled while testing in sandbox mode.",
  },
],
  },

  SHIPPING: {
    SHIPROCKET: [
      {
        key: 'email',
        placeholder: 'support@yourdomain.com',
      },
      {
        key: 'password',
        placeholder: 'Shiprocket password',
      },
   {
  key: 'token',
  placeholder: 'Auth token',
  note: 'Generate this token using Shiprocket API login (POST /v1/external/auth/login) with your API user email and password. Token is required in Authorization: Bearer <token>.',
},
      {
        key: 'pickup_location',
        placeholder: 'Warehouse Mumbai',
      },
      {
        key: 'channel_id',
        placeholder: '123456',
      },
      {
        key: 'show_estimation',
        note: 'Show delivery estimate on checkout',
      },
      {
        key: 'preferred_courier_name',
        placeholder: 'Delhivery',
      },
    ],

    DELHIVERY: [
      {
        key: 'apiKey',
        placeholder: 'Delhivery API key',
      },
      {
        key: 'clientName',
        placeholder: 'Business name',
      },
    ],

    NIMBUSPOST: [
      {
        key: 'email',
        placeholder: 'support@yourdomain.com',
      },
      {
        key: 'password',
        placeholder: 'Nimbuspost password',
      },
      {
        key: 'token',
        placeholder: 'Auth token',
      },
    ],
  },
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  activeType: string;
};

export default function ProviderModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  activeType,
}: Props) {
  const [providerName, setProviderName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState(1);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const availableProviders = Object.keys(
    PROVIDER_SCHEMAS[activeType] || {}
  );

  const getEmptyConfig = (prov: string) => {
    return (PROVIDER_SCHEMAS[activeType]?.[prov] || []).reduce(
      (acc, field) => ({
        ...acc,
        [field.key]: '',
      }),
      {}
    );
  };

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
      setIsSaving(false);
    }
  }, [initialData, isOpen, activeType]);

  const handleProviderChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newProv = e.target.value;
    setProviderName(newProv);
    setConfig(getEmptyConfig(newProv));
  };

  const isSecretField = (key: string) =>
    /secret|password|key|salt|token/i.test(key);

  const toggleSecretView = (key: string) =>
    setShowSecrets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

  const getFieldType = (key: string) =>
    FIELD_TYPES[key] || 'string';

  const validateConfig = () => {
    const schema =
      PROVIDER_SCHEMAS[activeType]?.[providerName] || [];

    const errors: string[] = [];

    schema.forEach((field) => {
      const key = field.key;
      const type = getFieldType(key);
      const value = config[key];

      if (value === '' || value === undefined) {
        errors.push(`${key} is required`);
        return;
      }

      if (type === 'number' && isNaN(value)) {
        errors.push(`${key} must be a valid number`);
      }

      if (type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${key} must be true or false`);
      }
    });

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving) return;

    const errors = validateConfig();

    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    try {
      setIsSaving(true);

      await onSave({
        id: initialData?.id,
        type: activeType,
        provider: providerName,
        isActive,
        priority,
        config,
      });

      toast.success('Provider configuration saved successfully!');
      onClose();
    } catch (error: any) {
      toast.error(
        error?.message || 'Failed to save configuration.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentSchema =
    PROVIDER_SCHEMAS[activeType]?.[providerName] || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={() => !isSaving && onClose()}
      />

      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {initialData
                ? 'Edit Integration'
                : 'New Integration'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Configure API keys and connection settings.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-2 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 max-h-[65vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <select
              value={providerName}
              onChange={handleProviderChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {availableProviders.map((provider) => (
                <option key={provider}>
                  {provider}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={priority}
              onChange={(e) =>
                setPriority(Number(e.target.value))
              }
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Priority"
            />
          </div>

          <Switch
            checked={isActive}
            onChange={setIsActive}
          />

          {currentSchema.map((field) => {
            const key = field.key;
            const type = getFieldType(key);
            const value = config[key];
            const isSecret = isSecretField(key);
            const showValue = showSecrets[key];

            return (
              <div key={key}>
                <label className="text-sm font-medium text-gray-900">
                  {key}
                </label>

                {field.note && (
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    {field.note}
                  </p>
                )}

                {type === 'boolean' ? (
                  <select
                    value={value ?? ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        [key]:
                          e.target.value === 'true',
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">
                      Select option
                    </option>
                    <option value="true">
                      True
                    </option>
                    <option value="false">
                      False
                    </option>
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type={
                        type === 'number'
                          ? 'number'
                          : isSecret && !showValue
                          ? 'password'
                          : 'text'
                      }
                      value={value ?? ''}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          [key]:
                            type === 'number'
                              ? Number(e.target.value)
                              : e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg pr-12"
                    />

                    {isSecret && (
                      <button
                        type="button"
                        onClick={() =>
                          toggleSecretView(key)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        {showValue ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 min-w-[140px] px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
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