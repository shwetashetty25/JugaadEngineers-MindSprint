import React from 'react';
import { CredentialStatus } from '../../types';
import { CheckCircle2, AlertOctagon, Clock } from 'lucide-react';

interface BadgeProps {
  status: CredentialStatus | 'VERIFIED' | 'REVOKED' | 'NOT_FOUND' | 'Graduated' | 'Active' | 'Alumni';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  let colorClasses = 'bg-gray-100 text-gray-700 border-gray-200';
  let icon = null;

  const normalized = status.toUpperCase();

  if (normalized === 'ACTIVE' || normalized === 'VERIFIED' || normalized === 'GRADUATED') {
    colorClasses = 'bg-powder-light text-powder-dark border-powder/70';
    icon = <CheckCircle2 className={size === 'sm' ? 'w-3 h-3 text-orange' : size === 'lg' ? 'w-4 h-4 text-orange' : 'w-3.5 h-3.5 text-orange'} />;
  } else if (normalized === 'REVOKED') {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-200/80';
    icon = <AlertOctagon className={size === 'sm' ? 'w-3 h-3 text-rose-600' : size === 'lg' ? 'w-4 h-4 text-rose-600' : 'w-3.5 h-3.5 text-rose-600'} />;
  } else if (normalized === 'PENDING' || normalized === 'NOT_FOUND') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200/80';
    icon = <Clock className={size === 'sm' ? 'w-3 h-3 text-amber-600' : size === 'lg' ? 'w-4 h-4 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2'
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${sizeClasses} ${colorClasses} tracking-tight font-medium`}>
      {showIcon && icon}
      <span>{status}</span>
    </span>
  );
};
