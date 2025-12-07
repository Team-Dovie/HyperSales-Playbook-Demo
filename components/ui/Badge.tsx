import React from 'react';
import { cn } from './Layout';
import { CallResult } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className }) => {
  const variants = {
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-green-50 text-green-700 border-green-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    neutral: "bg-gray-100 text-gray-600 border-gray-200",
    outline: "bg-transparent text-gray-500 border-gray-300"
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export const ResultBadge: React.FC<{ result: CallResult }> = ({ result }) => {
  if (result === CallResult.Success) {
    return <Badge variant="success">Success</Badge>;
  }
  if (result === CallResult.Fail) {
    return <Badge variant="danger">Failed</Badge>;
  }
  return <Badge variant="warning">Follow Up</Badge>;
};