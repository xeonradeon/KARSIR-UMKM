import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={generatedId}
          className="block text-xs font-bold text-[#3a4150] dark:text-[#c4cad4]"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-[#6c7585] pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          id={generatedId}
          className={`w-full h-11 px-3.5 ${leftIcon ? 'pl-10' : ''} ${
            rightIcon ? 'pr-10' : ''
          } bg-[#fcfbf8] dark:bg-[#181b20] border rounded-xl sm:rounded-2xl text-sm font-medium text-[#1a1d24] dark:text-[#f4f2ec] placeholder:text-[#8e97a6] focus:outline-hidden focus:ring-2 focus:ring-[#1f232b]/20 focus:border-[#1f232b] dark:focus:ring-[#f5f4ef]/20 dark:focus:border-[#f5f4ef] transition-all min-h-[44px] ${
            error
              ? 'border-[#5b6375]'
              : 'border-[#e0dcd4] dark:border-[#2f3542]'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-[#6c7585] flex items-center">{rightIcon}</div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-[#444c5d] dark:text-[#aab3c2] font-semibold">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#70798a] dark:text-[#9aa2b0]">{helperText}</p>
      ) : null}
    </div>
  );
};
