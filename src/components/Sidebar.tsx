import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut, X } from 'lucide-react'
import { Logo } from './Logo'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from './ThemeToggle'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  pacientesCount?: number
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose, pacientesCount }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const isDashboardActive = location.pathname === '/dashboard' || location.pathname === '/'
  const isPacientesActive = location.pathname.startsWith('/pacientes')

  return (
    <>
      {/* Overlay para telas mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container fixo */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header com Logotipo e ThemeToggle */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Link to="/dashboard" onClick={onClose} className="focus:outline-hidden">
            <Logo align="left" size="sm" subtitle="Gestão Nutricional" />
          </Link>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {/* Botão fechar apenas no mobile */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 lg:hidden transition-colors"
              aria-label="Fechar menu lateral"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navegação Principal */}
        <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navegação
          </div>

          <Link
            to="/dashboard"
            onClick={onClose}
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              isDashboardActive
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className={`w-5 h-5 ${isDashboardActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>Dashboard</span>
            </div>
            {isDashboardActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </Link>

          <Link
            to="/pacientes"
            onClick={onClose}
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              isPacientesActive
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className={`w-5 h-5 ${isPacientesActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>Pacientes</span>
            </div>
            {pacientesCount !== undefined && pacientesCount > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isPacientesActive ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {pacientesCount}
              </span>
            )}
          </Link>
        </div>

        {/* Perfil do Nutricionista & Logout no rodapé */}
        <div className="p-4 border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white dark:ring-slate-800 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user?.name || 'Nutricionista'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={user?.email}>
                {user?.email || 'nutri@nutrisbm.com'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 hover:border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar sessão</span>
          </button>
        </div>
      </aside>
    </>
  )
}

