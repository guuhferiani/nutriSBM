import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '../components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  User,
  ClockAlert,
  CheckCircle2,
  Menu,
} from 'lucide-react'
import { fetchPacienteDetails } from '../services/dashboardService'
import type { Paciente, Consulta } from '../types/dashboard'

export const PacientePerfil: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [consultas, setConsultas] = useState<Consulta[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    async function loadData() {
      if (!id) return
      setLoading(true)
      try {
        const { paciente, consultas } = await fetchPacienteDetails(id)
        setPaciente(paciente)
        setConsultas(consultas)
      } catch (err) {
        console.error('Erro ao carregar perfil do paciente:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  // Verifica status de retorno
  const { diasSemConsulta, isSemRetorno } = React.useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const latest = consultas.length > 0 ? consultas[0] : null
    let dias = 0
    let semRetorno = false

    if (latest?.data_consulta) {
      const parts = latest.data_consulta.split('-').map(Number)
      const lDate = new Date(parts[0], parts[1] - 1, parts[2])
      dias = Math.floor((today.getTime() - lDate.getTime()) / (1000 * 60 * 60 * 24))

      const hasUpcoming = consultas.some(c => {
        if (!c.proximo_retorno) return false
        const rParts = c.proximo_retorno.split('-').map(Number)
        const rDate = new Date(rParts[0], rParts[1] - 1, rParts[2])
        return rDate >= today
      })

      if (dias > 30 && !hasUpcoming) {
        semRetorno = true
      }
    }

    return { diasSemConsulta: dias, isSemRetorno: semRetorno }
  }, [consultas])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Carregando dados do paciente...</p>
        </div>
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm bg-white p-8 rounded-2xl border border-slate-200">
          <User className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Paciente não encontrado</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            O paciente solicitado não existe ou não pertence à sua conta.
          </p>
          <Link to="/dashboard">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex transition-colors">
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 lg:hidden transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/dashboard"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors mr-1"
              title="Voltar ao Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Perfil do Paciente
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Informações completas e histórico de consultas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/pacientes">
              <Button size="sm" variant="outline" className="text-xs dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                Todos os Pacientes
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Card de Cabeçalho do Paciente */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-2xs relative transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                  {paciente.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {paciente.nome}
                    </h2>
                    {isSemRetorno ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <ClockAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Sem retorno há {diasSemConsulta} dias
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Acompanhamento em dia
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    {paciente.whatsapp && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {paciente.whatsapp}
                      </span>
                    )}
                    {paciente.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {paciente.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Antropométricas Iniciais */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Peso Inicial</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 block">
                  {paciente.peso_inicial ? `${paciente.peso_inicial} kg` : 'Não registrado'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Altura</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 block">
                  {paciente.altura
                    ? paciente.altura > 3
                      ? `${paciente.altura} cm`
                      : `${paciente.altura} m`
                    : 'Não registrada'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Nível de Atividade</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 block">
                  {paciente.nivel_atividade || 'Não informado'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Data de Nascimento</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 block">
                  {paciente.data_nascimento
                    ? paciente.data_nascimento.split('-').reverse().join('/')
                    : 'Não informada'}
                </span>
              </div>
            </div>


            {/* Objetivos e Clínico */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-semibold mb-1">Objetivos</span>
                <div className="flex flex-wrap gap-1.5">
                  {paciente.objetivos && paciente.objetivos.length > 0 ? (
                    paciente.objetivos.map(obj => (
                      <span
                        key={obj}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/60"
                      >
                        {obj}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-600 dark:text-slate-400">
                      {paciente.objetivo_texto || 'Melhora da saúde e acompanhamento nutricional'}
                    </span>
                  )}
                </div>
                {paciente.objetivos && paciente.objetivos.length > 0 && paciente.objetivo_texto && (
                  <p className="text-slate-500 dark:text-slate-400 mt-1 italic">{paciente.objetivo_texto}</p>
                )}
              </div>

              {/* Patologias, Restrições e Alergias */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Patologias / Condições</span>
                  {paciente.patologias && paciente.patologias.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {paciente.patologias.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">Nenhuma registrada</span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Restrições Alimentares</span>
                  {paciente.restricoes_alimentares && paciente.restricoes_alimentares.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {paciente.restricoes_alimentares.map(r => (
                        <span key={r} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {r}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">Nenhuma registrada</span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Alergias Alimentares</span>
                  {paciente.alergias && paciente.alergias.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {paciente.alergias.map(a => (
                        <span key={a} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">Nenhuma registrada</span>
                  )}
                </div>
              </div>

              {/* Hábitos e Rotina */}
              {(paciente.refeicoes_por_dia || paciente.litros_agua || paciente.horario_acorda || paciente.horario_dorme || paciente.atividade_fisica !== null) && (
                <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mt-2">
                  <span className="text-slate-600 dark:text-slate-300 font-bold block mb-2">Rotina e Hábitos Diários</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 dark:text-slate-300">
                    {paciente.refeicoes_por_dia && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Refeições/dia</span>
                        <span className="font-semibold">{paciente.refeicoes_por_dia} refeições</span>
                      </div>
                    )}
                    {paciente.litros_agua && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Água/dia</span>
                        <span className="font-semibold">{paciente.litros_agua} litros</span>
                      </div>
                    )}
                    {paciente.horario_acorda && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Acorda</span>
                        <span className="font-semibold">{paciente.horario_acorda}</span>
                      </div>
                    )}
                    {paciente.horario_dorme && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Dorme</span>
                        <span className="font-semibold">{paciente.horario_dorme}</span>
                      </div>
                    )}
                  </div>
                  {paciente.atividade_fisica && paciente.atividade_fisica_descricao && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Atividade física:</span> {paciente.atividade_fisica_descricao}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>


          {/* Histórico de Consultas */}
          <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xs">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Histórico de Consultas Registradas
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Consultas e evoluções salvas
                  </CardDescription>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {consultas.length} {consultas.length === 1 ? 'consulta' : 'consultas'}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {consultas.length === 0 ? (
                <div className="p-10 text-center text-slate-500 dark:text-slate-400 text-xs">
                  Nenhuma consulta registrada para este paciente ainda.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {consultas.map((consulta, index) => (
                    <div key={consulta.id} className="p-6 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            Consulta em{' '}
                            {consulta.data_consulta.split('-').reverse().join('/')}
                          </h4>
                          {index === 0 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              Última consulta
                            </span>
                          )}
                        </div>

                        {consulta.proximo_retorno ? (
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            Próximo retorno: {consulta.proximo_retorno.split('-').reverse().join('/')}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
                            Sem retorno agendado
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                        {consulta.peso && (
                          <div className="bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Peso aferido</span>
                            <span className="font-bold text-slate-800 dark:text-white">{consulta.peso} kg</span>
                          </div>
                        )}
                        {consulta.percentual_gordura && (
                          <div className="bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">% Gordura</span>
                            <span className="font-bold text-slate-800 dark:text-white">{consulta.percentual_gordura}%</span>
                          </div>
                        )}
                        {consulta.cintura && (
                          <div className="bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Cintura</span>
                            <span className="font-bold text-slate-800 dark:text-white">{consulta.cintura} cm</span>
                          </div>
                        )}
                        {consulta.quadril && (
                          <div className="bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Quadril</span>
                            <span className="font-bold text-slate-800 dark:text-white">{consulta.quadril} cm</span>
                          </div>
                        )}
                      </div>

                      {consulta.observacoes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="font-semibold text-slate-700 dark:text-slate-200 block mb-0.5">Observações clínicas:</span>
                          {consulta.observacoes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
