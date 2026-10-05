import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-bold rounded-xl sm:rounded-2xl transition-all select-none active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-hidden min-h-[42px] sm:min-h-[38px]';

  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs gap-1.5 min-h-[36px]',
    sm: 'px-3.5 py-2 text-xs gap-2 min-h-[40px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3 text-base gap-2.5 min-h-[48px]',
  }[size];

  // Duo-tone Charcoal & Bone White with subtle states
  const variantClasses = {
    primary:
      'bg-[#1f232b] hover:bg-[#2c323d] active:bg-[#16191e] text-[#f7f6f2] shadow-sm shadow-[#1f232b]/20 dark:bg-[#f5f4ef] dark:text-[#181b21] dark:hover:bg-[#e6e4dc]',
    secondary:
      'bg-[#efece6] hover:bg-[#e4e0d7] active:bg-[#d8d3c8] text-[#1f232b] dark:bg-[#252b36] dark:hover:bg-[#2e3542] dark:text-[#f4f2ec]',
    outline:
      'border border-[#d8d3c7] hover:bg-[#efece6] text-[#1f232b] bg-transparent dark:border-[#383f4d] dark:hover:bg-[#252b36] dark:text-[#f4f2ec]',
    ghost:
      'hover:bg-[#efece6] text-[#2c323e] dark:hover:bg-[#252b36] dark:text-[#e4e2db] bg-transparent',
    danger:
      'bg-[#343a46] hover:bg-[#20242c] text-[#f7f6f2] border border-[#485060] dark:bg-[#2d333f] dark:text-[#f7f6f2]',
    success:
      'bg-[#1f232b] hover:bg-[#2b313c] text-[#f7f6f2] dark:bg-[#e8e6df] dark:text-[#1a1d24]',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
