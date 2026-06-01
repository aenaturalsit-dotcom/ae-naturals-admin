import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'success' | 'error' | 'neutral' | 'warning' | 'info';
}
export const Badge = ({ children, variant = 'neutral' }: BadgeProps) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    error: 'bg-red-50 text-red-700 ring-red-600/10',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    neutral: 'bg-gray-50 text-gray-600 ring-gray-500/10',
     info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${styles[variant]}`}>
      {children}
    </span>
  );
};