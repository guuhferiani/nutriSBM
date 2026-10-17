import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center gap-2 p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700/80 shadow-2xs ${className}`}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      aria-label="Alternar tema claro/escuro"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-180 duration-300" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? 'Modo Claro' : 'Modo Escuro'}
        </span>
      )}
    </button>
  )
}
