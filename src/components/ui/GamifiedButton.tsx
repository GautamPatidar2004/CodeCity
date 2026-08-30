import React from 'react'

export interface GamifiedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'amber'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const GamifiedButton: React.FC<GamifiedButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-pixel text-center uppercase tracking-wider transition-all duration-150 rounded-xl cursor-pointer select-none active:translate-y-1 active:border-b-0 focus:outline-none disabled:opacity-50 disabled:pointer-events-none'

  const sizeStyles = {
    sm: 'text-[9px] px-3 py-2 border-b-[3px]',
    md: 'text-[11px] px-5 py-3 border-b-4',
    lg: 'text-[13px] px-6 py-4 border-b-4',
  }

  const variantStyles = {
    primary:
      'bg-amber-400 text-slate-900 border-amber-600 hover:bg-amber-300 shadow-[0_4px_12px_rgba(251,191,36,0.35)]',
    secondary:
      'bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.35)]',
    accent:
      'bg-purple-600 text-white border-purple-800 hover:bg-purple-500 shadow-[0_4px_12px_rgba(147,51,234,0.35)]',
    amber:
      'bg-amber-500 text-white border-amber-700 hover:bg-amber-400 shadow-[0_4px_12px_rgba(245,158,11,0.35)]',
    danger:
      'bg-rose-500 text-white border-rose-700 hover:bg-rose-400 shadow-[0_4px_12px_rgba(244,63,94,0.35)]',
    outline:
      'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm border-2 border-b-4',
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
