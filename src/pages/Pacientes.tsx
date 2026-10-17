import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '../components/Sidebar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import {
  Users,
  Search,
  Menu,
  ChevronRight,
  Phone,
  Mail,
  ArrowLeft,
  RefreshCw,
  Plus,
  Calendar,
  Target,
} from 'lucide-react'
import { fetchPacientes } from '../services/dashboardService'
import type { Paciente } from '../types/dashboard'

export const Pacientes: React.FC = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, authLoading, navigate])

  const userId = user?.id

  const loadData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await fetchPacientes(userId)
      setPacientes(data)
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      loadData()
    }
  }, [userId, loadData])

  const filteredPacientes = useMemo(() => {
    if (!searchTerm.trim()) return pacientes
    const q = searchTerm.toLowerCase()
    return pacientes.filter(
      p =>
        p.nome.toLowerCase().includes(q) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.objetivo_texto && p.objetivo_texto.toLowerCase().includes(q)) ||
        (p.objetivos && p.objetivos.some(obj => obj.toLowerCase().includes(q)))
    )
  }, [pacientes, searchTerm])

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50/70 flex">
      {/* Menu Lateral Fixo */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        pacientesCount={pacientes.length}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Meus Pacientes
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Lista de pacientes cadastrados por {user.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="text-xs text-slate-600 hidden sm:flex"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Atualizar</span>
            </Button>

            <Link to="/pacientes/novo">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm shadow-emerald-600/20">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                <span>Novo Paciente</span>
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Barra de Busca no Topo */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar paciente por nome..."
                className="pl-10 text-sm h-10 border-slate-200"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold text-slate-500 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 self-center">
                Total: {filteredPacientes.length} {filteredPacientes.length === 1 ? 'paciente' : 'pacientes'}
              </div>

              <Link to="/pacientes/novo" className="sm:hidden">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs w-full">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Novo Paciente
                </Button>
              </Link>
            </div>
          </div>

          {/* Listagem de Pacientes */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-600">Carregando pacientes...</p>
            </div>
          ) : filteredPacientes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado ainda'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                {searchTerm
                  ? 'Tente ajustar sua busca para localizar o paciente desejado.'
                  : 'Comece cadastrando seu primeiro paciente para gerenciar consultas e planos alimentares.'}
              </p>
              {!searchTerm && (
                <Link to="/pacientes/novo">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Cadastrar Primeiro Paciente
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPacientes.map(paciente => {
                const objetivoDisplay =
                  (paciente.objetivos && paciente.objetivos.length > 0)
                    ? paciente.objetivos.join(', ')
                    : paciente.objetivo_texto || 'Acompanhamento nutricional'

                const ultimaConsultaFmt = paciente.ultima_consulta
                  ? paciente.ultima_consulta.split('-').reverse().join('/')
                  : 'Sem consultas registradas'

                return (
                  <Link
                    key={paciente.id}
                    to={`/pacientes/${paciente.id}`}
                    className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200/60 group-hover:scale-105 transition-transform">
                          {paciente.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                          Ativo
                        </span>
                      </div>

                      {/* Nome do Paciente */}
                      <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-base">
                        {paciente.nome}
                      </h4>

                      {/* Objetivo do Paciente */}
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
                        <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium line-clamp-2">
                          <strong className="text-slate-700">Objetivo:</strong> {objetivoDisplay}
                        </span>
                      </div>

                      {/* Data da Última Consulta */}
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          <strong className="text-slate-600 font-medium">Última consulta:</strong> {ultimaConsultaFmt}
                        </span>
                      </div>

                      {/* Contato (WhatsApp / Email) */}
                      {(paciente.whatsapp || paciente.email) && (
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                          {paciente.whatsapp && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{paciente.whatsapp}</span>
                            </div>
                          )}
                          {paciente.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{paciente.email}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                      <span>Ver perfil do paciente</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

