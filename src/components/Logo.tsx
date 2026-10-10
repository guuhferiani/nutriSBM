import React from 'react'
import { Apple } from 'lucide-react'

interface LogoProps {
  className?: string
  subtitle?: string
  align?: 'center' | 'left'
  size?: 'sm' | 'md' | 'lg'
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  subtitle = 'Gestão para Nutricionistas',
  align = 'center',
  size = 'md',
}) => {
  const isSm = size === 'sm'
  const isLg = size === 'lg'

  const iconContainerSize = isSm ? 'w-9 h-9 rounded-xl' : isLg ? 'w-14 h-14 rounded-2xl' : 'w-11 h-11 rounded-2xl'
  const iconSize = isSm ? 'w-4 h-4' : isLg ? 'w-7 h-7' : 'w-5 h-5'
  const textSize = isSm ? 'text-lg' : isLg ? 'text-2xl' : 'text-xl'

  return (
    <div className={`select-none ${align === 'left' ? 'flex flex-col items-start' : 'flex flex-col items-center'} ${className}`}>
      <div className="flex items-center gap-2.5">
        <div
          className={`${iconContainerSize} bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-100 shrink-0`}
        >
          <Apple className={`${iconSize} stroke-[2.3]`} />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`${textSize} font-extrabold tracking-tight text-slate-900`}>
              Nutri<span className="text-emerald-600"> SBM</span>
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              PRO
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] font-medium text-slate-500 tracking-wide mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
