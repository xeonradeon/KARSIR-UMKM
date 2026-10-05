import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
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
      <div className="relative">
        <select
          id={generatedId}
          className={`w-full h-11 px-3.5 bg-[#fcfbf8] dark:bg-[#181b20] border rounded-xl sm:rounded-2xl text-sm font-medium text-[#1a1d24] dark:text-[#f4f2ec] focus:outline-hidden focus:ring-2 focus:ring-[#1f232b]/20 focus:border-[#1f232b] dark:focus:ring-[#f5f4ef]/20 dark:focus:border-[#f5f4ef] transition-all appearance-none pr-9 min-h-[44px] ${
            error
              ? 'border-[#5b6375]'
              : 'border-[#e0dcd4] dark:border-[#2f3542]'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6c7585]">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error ? (
        <p className="text-xs text-[#444c5d] dark:text-[#aab3c2] font-semibold">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#70798a] dark:text-[#9aa2b0]">{helperText}</p>
      ) : null}
    </div>
  );
};
