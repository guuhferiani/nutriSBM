import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '../components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import {
  Users,
  Calendar,
  ClockAlert,
  ChevronRight,
  RefreshCw,
  Menu,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react'
import { fetchDashboardMetrics } from '../services/dashboardService'
import type { DashboardData } from '../types/dashboard'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData>({
    total_pacientes: 0,
    consultas_semana: 0,
    pacientes_sem_retorno: [],
  })

  // Redireciona para o login se não houver usuário autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, authLoading, navigate])

  const userId = user?.id

  // Carrega métricas em tempo real do Neon
  const loadMetrics = useCallback(async (isRefresh = false) => {
    if (!userId) return
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const res = await fetchDashboardMetrics(userId)
      setData(res)
    } catch (err: any) {
      console.error('Erro ao buscar métricas:', err)
      setError('Não foi possível sincronizar os dados do Neon em tempo real.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      loadMetrics()
    }
  }, [userId, loadMetrics])

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-700">Carregando painel Nutri SBM...</p>
          <p className="text-xs text-slate-400 mt-1">Conectando ao banco de dados Neon</p>
        </div>
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
        pacientesCount={data.total_pacientes}
      />

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Mobile / Tablet */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
              aria-label="Abrir menu lateral"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Painel Principal
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Visão consolidada em tempo real com Neon PostgreSQL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadMetrics(true)}
              disabled={refreshing || loading}
              className="text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-100"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>

            <Link to="/pacientes">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs">
                <Users className="w-3.5 h-3.5 mr-1.5" />
                <span>Ver Pacientes</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Saudação e Boas-Vindas */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-950/10">
            <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/70 text-emerald-100 border border-emerald-400/30 mb-3">
                <UserCheck className="w-3.5 h-3.5" />
                Nutricionista Ativo(a)
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Olá, {user.name}!
              </h2>
              <p className="mt-2 text-emerald-100/90 text-sm sm:text-base leading-relaxed">
                Aqui está o resumo dos seus atendimentos e acompanhamento de pacientes cadastrados.
              </p>
            </div>
          </div>

          {/* Mensagem de Erro (se houver) */}
          {error && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Aviso de Sincronização</p>
                <p className="text-amber-700 text-xs mt-0.5">{error}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => loadMetrics()} className="text-xs">
                Tentar novamente
              </Button>
            </div>
          )}

          {/* ============================================================ */}
          {/* CARDS DE INFORMAÇÃO (PROMPT 3) */}
          {/* ============================================================ */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Métricas em Tempo Real
                </h3>
                <p className="text-xs text-slate-500">
                  Dados isolados exclusivamente para o seu perfil no Neon
                </p>
              </div>

              {data.semana_inicio && data.semana_fim && (
                <div className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 hidden sm:block">
                  Semana: <span className="font-bold text-slate-700">{data.semana_inicio}</span> a <span className="font-bold text-slate-700">{data.semana_fim}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* CARD 1 — Total de pacientes ativos */}
              <Card className="border-slate-200/90 hover:border-emerald-200 hover:shadow-md transition-all duration-200 bg-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Card 1
                      </span>
                      <h4 className="text-sm font-semibold text-slate-600 mt-1">
                        Total de pacientes ativos
                      </h4>
                      <div className="mt-3 flex items-baseline gap-2">
                        {loading ? (
                          <div className="h-10 w-16 bg-slate-100 rounded-lg animate-pulse" />
                        ) : (
                          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                            {data.total_pacientes}
                          </span>
                        )}
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                          sob seus cuidados
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Cadastrados pela nutricionista logada no sistema
                      </p>
                    </div>

                    <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                      <Users className="w-6 h-6 stroke-[2.2]" />
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link
                      to="/pacientes"
                      className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
                    >
                      <span>Gerenciar pacientes</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <span className="text-slate-400 text-[11px]">Sincronizado no Neon</span>
                  </div>
                </CardContent>
              </Card>

              {/* CARD 2 — Consultas da semana */}
              <Card className="border-slate-200/90 hover:border-teal-200 hover:shadow-md transition-all duration-200 bg-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Card 2
                      </span>
                      <h4 className="text-sm font-semibold text-slate-600 mt-1">
                        Consultas da semana
                      </h4>
                      <div className="mt-3 flex items-baseline gap-2">
                        {loading ? (
                          <div className="h-10 w-16 bg-slate-100 rounded-lg animate-pulse" />
                        ) : (
                          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                            {data.consultas_semana}
                          </span>
                        )}
                        <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/80 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> esta semana
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Consultas registradas na semana atual
                      </p>
                    </div>

                    <div className="w-13 h-13 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 shadow-xs">
                      <Calendar className="w-6 h-6 stroke-[2.2]" />
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Período: {data.semana_inicio || 'Início'} a {data.semana_fim || 'Hoje'}
                    </span>
                    <span className="text-slate-400 text-[11px]">Histórico semanal</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CARD 3 — Pacientes sem retorno */}
            <Card className="border-slate-200/90 hover:shadow-md transition-all duration-200 bg-white rounded-2xl overflow-hidden mt-6">
              <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <ClockAlert className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Card 3
                        </span>
                        <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                          Pacientes sem retorno
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado
                      </CardDescription>
                    </div>
                  </div>

                  {!loading && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                          data.pacientes_sem_retorno.length > 0
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {data.pacientes_sem_retorno.length}{' '}
                        {data.pacientes_sem_retorno.length === 1 ? 'paciente' : 'pacientes'}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500">Buscando histórico de consultas no Neon...</p>
                  </div>
                ) : data.pacientes_sem_retorno.length === 0 ? (
                  /* Mensagem obrigatória do Prompt 3 quando não houver pacientes sem retorno */
                  <div className="p-8 sm:p-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto mb-3 shadow-xs">
                      <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">
                      Nenhum paciente sem retorno no momento
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                      Excelente trabalho! Todos os seus pacientes cadastrados estão com consultas recentes ou com próximo retorno já agendado.
                    </p>
                  </div>
                ) : (
                  /* Lista de pacientes sem retorno (cada nome é clicável e redireciona para o perfil) */
                  <div className="divide-y divide-slate-100">
                    {data.pacientes_sem_retorno.map((paciente) => (
                      <Link
                        key={paciente.id}
                        to={`/pacientes/${paciente.id}`}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/80 transition-colors gap-3"
                        title={`Abrir perfil de ${paciente.nome}`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 group-hover:from-emerald-100 group-hover:to-teal-100 group-hover:text-emerald-800 transition-colors">
                            {paciente.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                              {paciente.nome}
                              <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-600" />
                            </span>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              {paciente.whatsapp && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" /> {paciente.whatsapp}
                                </span>
                              )}
                              {paciente.email && (
                                <span className="flex items-center gap-1 hidden md:inline-flex">
                                  <Mail className="w-3 h-3 text-slate-400" /> {paciente.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="text-left sm:text-right">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              <ClockAlert className="w-3 h-3 text-amber-600" />
                              Há {paciente.dias_sem_retorno} dias sem consulta
                            </span>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Última consulta:{' '}
                              <span className="font-medium text-slate-600">
                                {paciente.ultima_consulta.split('-').reverse().join('/')}
                              </span>
                            </p>
                          </div>

                          <div className="p-2 rounded-xl text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors shrink-0">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}
