import React from 'react'
import { cn } from '../../lib/utils'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'destructive' | 'success' | 'info'
}

export const Alert: React.FC<AlertProps> = ({ className, variant = 'destructive', children, ...props }) => {
  const styles = {
    destructive: 'bg-rose-50 text-rose-800 border-rose-200/90',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    info: 'bg-blue-50 text-blue-800 border-blue-200/90',
  }

  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-xl border p-4 text-sm flex items-start gap-3 transition-all',
        styles[variant],
        className
      )}
      {...props}
    >
      {variant === 'destructive' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
      {variant === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
      <div className="flex-1">{children}</div>
    </div>
  )
}
