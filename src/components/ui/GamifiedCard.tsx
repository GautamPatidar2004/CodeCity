import React from 'react'

export interface GamifiedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accentColor?: 'emerald' | 'amber' | 'purple' | 'blue' | 'rose' | 'none'
  children: React.ReactNode
}

export const GamifiedCard: React.FC<GamifiedCardProps> = ({
  accentColor = 'none',
  className = '',
  children,
  ...props
}) => {
  const accentClasses = {
    none: 'border border-slate-100 shadow-[0_12px_30px_rgba(15,23,42,0.06)]',
    emerald: 'border-2 border-slate-100 border-l-8 border-l-emerald-500 shadow-[0_12px_30px_rgba(16,185,129,0.1)]',
    amber: 'border-2 border-slate-100 border-l-8 border-l-amber-500 shadow-[0_12px_30px_rgba(245,158,11,0.1)]',
    purple: 'border-2 border-slate-100 border-l-8 border-l-purple-500 shadow-[0_12px_30px_rgba(168,85,247,0.1)]',
    blue: 'border-2 border-slate-100 border-l-8 border-l-blue-500 shadow-[0_12px_30px_rgba(59,130,246,0.1)]',
    rose: 'border-2 border-slate-100 border-l-8 border-l-rose-500 shadow-[0_12px_30px_rgba(244,63,94,0.1)]',
  }

  return (
    <div
      className={`bg-white rounded-2xl p-6 transition-all duration-200 ${accentClasses[accentColor]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
