import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export const Switch = ({ checked, onChange, label, description }: SwitchProps) => (
  <div className="flex items-center justify-between">
    {(label || description) && (
      <div className="flex flex-col">
        {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
        {description && <span className="text-sm text-gray-500">{description}</span>}
      </div>
    )}
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${checked ? 'bg-rose-500' : 'bg-gray-200'}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);