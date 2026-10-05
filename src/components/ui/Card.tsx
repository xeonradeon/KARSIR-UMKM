import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl sm:rounded-3xl border border-[#e2ded6] bg-[#fcfbf8] shadow-xs text-[#1a1d24] dark:border-[#2e3542] dark:bg-[#1c2026] dark:text-[#f4f2ec] ${
        hoverEffect ? 'transition-all hover:border-[#c5bfb4] hover:shadow-md dark:hover:border-[#434d5f]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
