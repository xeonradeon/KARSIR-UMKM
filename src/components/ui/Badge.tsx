import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  }[size];

  const variantClasses = {
    default:
      'bg-[#efece6] text-[#2c323d] border-[#d8d3c7] dark:bg-[#252b36] dark:text-[#dcd9d2] dark:border-[#383f4d]',
    primary:
      'bg-[#1f232b] text-[#f7f6f2] border-[#1f232b] dark:bg-[#f5f4ef] dark:text-[#181b21] dark:border-[#f5f4ef]',
    success:
      'bg-[#2d3440] text-[#f7f6f2] border-[#444e60] dark:bg-[#343c4a] dark:text-[#f4f2ec]',
    warning:
      'bg-[#e8e4da] text-[#1f232b] border-[#cfc8bc] dark:bg-[#2e3542] dark:text-[#f5f3ed] dark:border-[#434d5e]',
    danger:
      'bg-[#373d4a] text-[#f7f6f2] border-[#535c6e] dark:bg-[#2d333f] dark:text-[#f7f6f2]',
    purple:
      'bg-[#e2dee6] text-[#282531] border-[#cac2d2] dark:bg-[#2d2936] dark:text-[#ede9f2]',
    cyan:
      'bg-[#dee4e6] text-[#202b30] border-[#c0cbcf] dark:bg-[#263137] dark:text-[#e4eef2]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-lg sm:rounded-xl border whitespace-nowrap ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
