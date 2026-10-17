import React from 'react'
import { cn } from '../../lib/utils'

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      'rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-sm transition-colors',
      className
    )}
    {...props}
  />
)

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6 sm:p-8', className)} {...props} />
)

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={cn('text-2xl font-bold tracking-tight text-slate-900 dark:text-white', className)} {...props} />
)

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cn('text-sm text-slate-500 dark:text-slate-400 mt-1', className)} {...props} />
)


export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('p-6 pt-0 sm:p-8 sm:pt-0', className)} {...props} />
)

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0 sm:p-8 sm:pt-0', className)} {...props} />
)
