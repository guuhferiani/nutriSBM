import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '../components/Sidebar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Alert } from '../components/ui/Alert'
import {
  Menu,
  ArrowLeft,
  User,
  Activity,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Save,
  Phone,
  Mail,
  Droplets,
  Clock,
} from 'lucide-react'
import { createPaciente } from '../services/dashboardService'
import type { Paciente } from '../types/dashboard'

export const PacienteNovo: React.FC = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'pessoal' | 'clinico' | 'habitos'>('pessoal')

  // Estado de submissão
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Aba 1 — Pessoal
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [sexo, setSexo] = useState<string>('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')

  // Aba 2 — Clínico
  const [peso, setPeso] = useState<string>('')
  const [altura, setAltura] = useState<string>('') // cm
  const [objetivosSelecionados, setObjetivosSelecionados] = useState<string[]>([])
  const [objetivoTexto, setObjetivoTexto] = useState('')
  const [nivelAtividade, setNivelAtividade] = useState('')
  const [patologias, setPatologias] = useState<string[]>([])
  const [outraPatologia, setOutraPatologia] = useState('')
  const [restricoes, setRestricoes] = useState<string[]>([])
  const [outraRestricao, setOutraRestricao] = useState('')
  const [alergias, setAlergias] = useState<string[]>([])
  const [outraAlergia, setOutraAlergia] = useState('')
  const [medicamentos, setMedicamentos] = useState('')
  const [suplementos, setSuplementos] = useState('')

  // Aba 3 — Hábitos
  const [refeicoesPorDia, setRefeicoesPorDia] = useState<string>('')
  const [horarioAcorda, setHorarioAcorda] = useState('')
  const [horarioDorme, setHorarioDorme] = useState('')
  const [litrosAgua, setLitrosAgua] = useState<string>('')
  const [praticaAtividadeFisica, setPraticaAtividadeFisica] = useState<boolean | null>(null)
  const [atividadeDescricao, setAtividadeDescricao] = useState('')
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, authLoading, navigate])

  // Cálculo automático de idade
  const idadeCalculada = React.useMemo(() => {
    if (!dataNascimento) return null
    const birth = new Date(dataNascimento)
    if (isNaN(birth.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age >= 0 ? age : null
  }, [dataNascimento])

  // Cálculo automático do IMC
  const imcInfo = React.useMemo(() => {
    const p = parseFloat(peso.replace(',', '.'))
    const a = parseFloat(altura.replace(',', '.'))
    if (!p || !a || p <= 0 || a <= 0) return null

    // Altura é em cm
    const alturaMetros = a > 3 ? a / 100 : a
    const imc = p / (alturaMetros * alturaMetros)

    let classificacao = ''
    let cor = 'text-slate-600 bg-slate-50 border-slate-200'

    if (imc < 18.5) {
      classificacao = 'Abaixo do peso'
      cor = 'text-amber-700 bg-amber-50 border-amber-200'
    } else if (imc < 24.9) {
      classificacao = 'Peso adequado (Eutrofia)'
      cor = 'text-emerald-700 bg-emerald-50 border-emerald-200'
    } else if (imc < 29.9) {
      classificacao = 'Sobrepeso'
      cor = 'text-orange-700 bg-orange-50 border-orange-200'
    } else if (imc < 34.9) {
      classificacao = 'Obesidade Grau I'
      cor = 'text-rose-700 bg-rose-50 border-rose-200'
    } else if (imc < 39.9) {
      classificacao = 'Obesidade Grau II'
      cor = 'text-red-700 bg-red-50 border-red-200'
    } else {
      classificacao = 'Obesidade Grau III'
      cor = 'text-red-800 bg-red-100 border-red-300'
    }

    return {
      valor: imc.toFixed(1),
      classificacao,
      cor,
    }
  }, [peso, altura])

  // Formatação de WhatsApp
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 11) v = v.substring(0, 11)

    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    } else if (v.length > 5) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2')
    } else if (v.length > 0) {
      v = `(${v}`
    }
    setWhatsapp(v)
  }

  // Conversão de horário automático (ex: 6 -> 06:00, 630 -> 06:30, 23 -> 23:00)
  const formatHourString = (val: string): string => {
    const raw = val.replace(/\D/g, '').trim()
    if (!raw) return ''
    if (raw.length === 1) return `0${raw}:00`
    if (raw.length === 2) {
      const num = parseInt(raw, 10)
      if (num >= 0 && num <= 23) return `${raw}:00`
      return `0${raw.charAt(0)}:0${raw.charAt(1)}`
    }
    if (raw.length === 3) {
      return `0${raw.charAt(0)}:${raw.substring(1)}`
    }
    if (raw.length >= 4) {
      const hh = raw.substring(0, 2)
      const mm = raw.substring(2, 4)
      return `${hh}:${mm}`
    }
    return val
  }

  const handleHorarioBlur = (setter: (v: string) => void, val: string) => {
    setter(formatHourString(val))
  }

  // Helpers de seleção múltipla com exclusão de "Nenhum"
  const toggleArrayItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (item === 'Nenhum') {
      if (list.includes('Nenhum')) {
        setList([])
      } else {
        setList(['Nenhum'])
      }
      return
    }

    const withoutNenhum = list.filter(i => i !== 'Nenhum')
    if (withoutNenhum.includes(item)) {
      setList(withoutNenhum.filter(i => i !== item))
    } else {
      setList([...withoutNenhum, item])
    }
  }

  const addCustomItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string,
    clearInput: () => void
  ) => {
    const trimmed = item.trim()
    if (!trimmed) return
    const withoutNenhum = list.filter(i => i !== 'Nenhum')
    if (!withoutNenhum.includes(trimmed)) {
      setList([...withoutNenhum, trimmed])
    }
    clearInput()
  }

  const removeArrayItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setList(list.filter(i => i !== item))
  }

  // Opções padrão
  const OPCOES_OBJETIVOS = [
    'Emagrecer',
    'Ganhar massa',
    'Controlar diabetes',
    'Saúde geral',
    'Performance esportiva',
    'Reeducação alimentar',
  ]

  const NIVEIS_ATIVIDADE = [
    'Sedentário',
    'Levemente ativo',
    'Moderadamente ativo',
    'Muito ativo',
    'Extremamente ativo',
  ]

  const OPCOES_PATOLOGIAS = [
    'Diabetes',
    'Hipertensão',
    'Hipotireoidismo',
    'Hipertireoidismo',
    'Síndrome do ovário policístico',
    'Doença celíaca',
    'Colesterol alto',
  ]

  const OPCOES_RESTRICOES = [
    'Lactose',
    'Glúten',
    'Açúcar',
    'Carne vermelha',
    'Frutos do mar',
  ]

  const OPCOES_ALERGIAS = [
    'Amendoim',
    'Leite',
    'Ovo',
    'Soja',
    'Trigo',
    'Frutos do mar',
  ]

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!nome.trim()) {
      setErrorMessage('O nome completo do paciente é obrigatório.')
      setActiveTab('pessoal')
      return
    }

    if (!user?.id) {
      setErrorMessage('Sessão expirada. Faça login novamente.')
      return
    }

    setSaving(true)

    try {
      const pesoNum = peso ? parseFloat(peso.replace(',', '.')) : null
      const alturaNum = altura ? parseFloat(altura.replace(',', '.')) : null
      const refeicoesNum = refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null
      const aguaNum = litrosAgua ? parseFloat(litrosAgua.replace(',', '.')) : null

      const payload: Partial<Paciente> & { nutricionista_id: string; nome: string } = {
        nutricionista_id: user.id,
        nome: nome.trim(),
        data_nascimento: dataNascimento || null,
        sexo: sexo || null,
        whatsapp: whatsapp.trim() || null,
        email: email.trim().toLowerCase() || null,
        peso_inicial: isNaN(pesoNum as any) ? null : pesoNum,
        altura: isNaN(alturaNum as any) ? null : alturaNum,
        objetivos: objetivosSelecionados.length > 0 ? objetivosSelecionados : null,
        objetivo_texto: objetivoTexto.trim() || null,
        nivel_atividade: nivelAtividade || null,
        patologias: patologias.length > 0 ? patologias : null,
        restricoes_alimentares: restricoes.length > 0 ? restricoes : null,
        alergias: alergias.length > 0 ? alergias : null,
        medicamentos: medicamentos.trim() || null,
        suplementos: suplementos.trim() || null,
        refeicoes_por_dia: isNaN(refeicoesNum as any) ? null : refeicoesNum,
        horario_acorda: horarioAcorda.trim() || null,
        horario_dorme: horarioDorme.trim() || null,
        litros_agua: isNaN(aguaNum as any) ? null : aguaNum,
        atividade_fisica: praticaAtividadeFisica,
        atividade_fisica_descricao: praticaAtividadeFisica ? (atividadeDescricao.trim() || null) : null,
        observacoes: observacoes.trim() || null,
      }

      const novoPaciente = await createPaciente(payload)
      setSuccessMessage('Paciente cadastrado com sucesso!')

      setTimeout(() => {
        if (novoPaciente?.id) {
          navigate(`/pacientes/${novoPaciente.id}`, { replace: true })
        } else {
          navigate('/pacientes', { replace: true })
        }
      }, 1000)
    } catch (err: any) {
      console.error('Erro ao cadastrar paciente:', err)
      setErrorMessage(err.message || 'Erro ao salvar paciente. Verifique os dados e tente novamente.')
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex">
      {/* Menu Lateral Fixo */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Cabeçalho */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/pacientes"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors mr-1"
              title="Voltar para Pacientes"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Novo Paciente
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Preencha os dados cadastrais, clínicos e hábitos alimentares
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/pacientes">
              <Button size="sm" variant="outline" className="text-xs" disabled={saving}>
                Cancelar
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm shadow-emerald-600/20"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Salvar Paciente
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Mensagens de Sucesso / Erro */}
          {successMessage && (
            <Alert variant="success" className="animate-in fade-in duration-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm text-emerald-900">Sucesso!</p>
                <p className="text-xs text-emerald-700 mt-0.5">{successMessage} Redirecionando...</p>
              </div>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive" className="animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-sm text-rose-900">Atenção</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </Alert>
          )}

          {/* Abas do Formulário */}
          <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-2xs flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('pessoal')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'pessoal'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>1. Pessoal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clinico')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'clinico'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>2. Clínico</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('habitos')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'habitos'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Coffee className="w-4 h-4 shrink-0" />
              <span>3. Hábitos</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ======================================================== */}
            {/* ABA 1: PESSOAL */}
            {/* ======================================================== */}
            {activeTab === 'pessoal' && (
              <Card className="border-slate-200/90 bg-white rounded-3xl shadow-2xs">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-600" />
                      Dados Pessoais
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Informações básicas de identificação e contato do paciente.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Nome Completo */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nome Completo <span className="text-rose-500 font-extrabold">*</span>
                      </label>
                      <Input
                        type="text"
                        required
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        placeholder="Ex: Mariana Silva Souza"
                        className="h-11 text-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Data de Nascimento & Idade Calculada */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Data de Nascimento
                        </label>
                        {idadeCalculada !== null && (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            {idadeCalculada} {idadeCalculada === 1 ? 'ano' : 'anos'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          type="date"
                          value={dataNascimento}
                          onChange={e => setDataNascimento(e.target.value)}
                          className="h-11 text-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Sexo */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Sexo
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Feminino', 'Masculino', 'Outro'].map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSexo(opt)}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                              sexo === opt
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          type="tel"
                          value={whatsapp}
                          onChange={handleWhatsappChange}
                          placeholder="(00) 00000-0000"
                          className="pl-10 h-11 text-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        E-mail
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="paciente@exemplo.com"
                          className="pl-10 h-11 text-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setActiveTab('clinico')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                    >
                      Avançar para Clínico →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ======================================================== */}
            {/* ABA 2: CLÍNICO */}
            {/* ======================================================== */}
            {activeTab === 'clinico' && (
              <Card className="border-slate-200/90 bg-white rounded-3xl shadow-2xs">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      Avaliação Clínica e Antropométrica
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Medidas corporais, IMC automático, objetivos e histórico de saúde.
                    </p>
                  </div>

                  {/* Medidas e IMC */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Peso Atual
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={peso}
                          onChange={e => setPeso(e.target.value)}
                          placeholder="Ex: 68.5"
                          className="pr-12 h-11 text-sm border-slate-200 bg-white focus:border-emerald-500"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          kg
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Altura
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={altura}
                          onChange={e => setAltura(e.target.value)}
                          placeholder="Ex: 168"
                          className="pr-12 h-11 text-sm border-slate-200 bg-white focus:border-emerald-500"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          cm
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        IMC (Calculado)
                      </label>
                      <div
                        className={`h-11 px-4 rounded-xl border flex items-center justify-between text-sm font-bold ${
                          imcInfo ? imcInfo.cor : 'bg-slate-100/70 border-slate-200 text-slate-400'
                        }`}
                      >
                        <span>{imcInfo ? `${imcInfo.valor} kg/m²` : '—'}</span>
                        <span className="text-xs font-medium truncate ml-2">
                          {imcInfo ? imcInfo.classificacao : 'Informe peso e altura'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nível de Atividade Física */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Nível de Atividade Física
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {NIVEIS_ATIVIDADE.map(nivel => (
                        <button
                          key={nivel}
                          type="button"
                          onClick={() => setNivelAtividade(nivel)}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                            nivelAtividade === nivel
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {nivel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Objetivos */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Objetivos (Múltipla Escolha)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {OPCOES_OBJETIVOS.map(obj => {
                        const isSelected = objetivosSelecionados.includes(obj)
                        return (
                          <button
                            key={obj}
                            type="button"
                            onClick={() => toggleArrayItem(objetivosSelecionados, setObjetivosSelecionados, obj)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {obj}
                          </button>
                        )
                      })}
                    </div>

                    <Input
                      type="text"
                      value={objetivoTexto}
                      onChange={e => setObjetivoTexto(e.target.value)}
                      placeholder="Campo de texto livre adicional sobre os objetivos..."
                      className="h-10 text-xs border-slate-200"
                    />
                  </div>

                  {/* Patologias ou condições de saúde */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Patologias ou Condições de Saúde
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleArrayItem(patologias, setPatologias, 'Nenhum')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          patologias.includes('Nenhum')
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Nenhum
                      </button>
                      {OPCOES_PATOLOGIAS.map(item => {
                        const isSelected = patologias.includes(item)
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleArrayItem(patologias, setPatologias, item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      })}
                      {patologias
                        .filter(p => !OPCOES_PATOLOGIAS.includes(p) && p !== 'Nenhum')
                        .map(item => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => removeArrayItem(patologias, setPatologias, item)}
                              className="hover:text-rose-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={outraPatologia}
                        onChange={e => setOutraPatologia(e.target.value)}
                        placeholder="Adicionar outra patologia..."
                        className="h-9 text-xs border-slate-200"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomItem(patologias, setPatologias, outraPatologia, () => setOutraPatologia(''))
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addCustomItem(patologias, setPatologias, outraPatologia, () => setOutraPatologia(''))}
                        className="text-xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                      </Button>
                    </div>
                  </div>

                  {/* Restrições Alimentares */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Restrições Alimentares
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleArrayItem(restricoes, setRestricoes, 'Nenhum')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          restricoes.includes('Nenhum')
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Nenhum
                      </button>
                      {OPCOES_RESTRICOES.map(item => {
                        const isSelected = restricoes.includes(item)
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleArrayItem(restricoes, setRestricoes, item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      })}
                      {restricoes
                        .filter(r => !OPCOES_RESTRICOES.includes(r) && r !== 'Nenhum')
                        .map(item => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => removeArrayItem(restricoes, setRestricoes, item)}
                              className="hover:text-rose-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={outraRestricao}
                        onChange={e => setOutraRestricao(e.target.value)}
                        placeholder="Adicionar outra restrição alimentar..."
                        className="h-9 text-xs border-slate-200"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomItem(restricoes, setRestricoes, outraRestricao, () => setOutraRestricao(''))
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addCustomItem(restricoes, setRestricoes, outraRestricao, () => setOutraRestricao(''))}
                        className="text-xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                      </Button>
                    </div>
                  </div>

                  {/* Alergias Alimentares */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Alergias Alimentares
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleArrayItem(alergias, setAlergias, 'Nenhum')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          alergias.includes('Nenhum')
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Nenhum
                      </button>
                      {OPCOES_ALERGIAS.map(item => {
                        const isSelected = alergias.includes(item)
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleArrayItem(alergias, setAlergias, item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      })}
                      {alergias
                        .filter(a => !OPCOES_ALERGIAS.includes(a) && a !== 'Nenhum')
                        .map(item => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => removeArrayItem(alergias, setAlergias, item)}
                              className="hover:text-rose-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={outraAlergia}
                        onChange={e => setOutraAlergia(e.target.value)}
                        placeholder="Adicionar outra alergia alimentar..."
                        className="h-9 text-xs border-slate-200"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomItem(alergias, setAlergias, outraAlergia, () => setOutraAlergia(''))
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addCustomItem(alergias, setAlergias, outraAlergia, () => setOutraAlergia(''))}
                        className="text-xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                      </Button>
                    </div>
                  </div>

                  {/* Medicamentos e Suplementos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Medicamentos Contínuos (Texto Livre)
                      </label>
                      <textarea
                        rows={3}
                        value={medicamentos}
                        onChange={e => setMedicamentos(e.target.value)}
                        placeholder="Ex: Puran T4 50mcg em jejum, Losartana 50mg..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Suplementos em Uso (Texto Livre)
                      </label>
                      <textarea
                        rows={3}
                        value={suplementos}
                        onChange={e => setSuplementos(e.target.value)}
                        placeholder="Ex: Creatina 5g/dia, Whey protein pós-treino, Ômega 3..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('pessoal')}
                      className="text-xs"
                    >
                      ← Voltar para Pessoal
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab('habitos')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                    >
                      Avançar para Hábitos →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ======================================================== */}
            {/* ABA 3: HÁBITOS */}
            {/* ======================================================== */}
            {activeTab === 'habitos' && (
              <Card className="border-slate-200/90 bg-white rounded-3xl shadow-2xs">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Coffee className="w-5 h-5 text-emerald-600" />
                      Hábitos e Rotina Diária
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Horários de sono, consumo de água, refeições e atividade física.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Refeições por dia */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Quantas refeições faz por dia
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={refeicoesPorDia}
                        onChange={e => setRefeicoesPorDia(e.target.value)}
                        placeholder="Ex: 4"
                        className="h-11 text-sm border-slate-200 focus:border-emerald-500"
                      />
                    </div>

                    {/* Quantidade de água por dia */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Quantidade de água por dia
                      </label>
                      <div className="relative">
                        <Droplets className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={litrosAgua}
                          onChange={e => setLitrosAgua(e.target.value)}
                          placeholder="Ex: 2.5"
                          className="pl-10 pr-16 h-11 text-sm border-slate-200 focus:border-emerald-500"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          litros
                        </span>
                      </div>
                    </div>

                    {/* Horário que acorda */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Horário que acorda
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          type="text"
                          value={horarioAcorda}
                          onChange={e => setHorarioAcorda(e.target.value)}
                          onBlur={() => handleHorarioBlur(setHorarioAcorda, horarioAcorda)}
                          placeholder="Ex: 6 (→ 06:00) ou 630"
                          className="pl-10 h-11 text-sm border-slate-200 focus:border-emerald-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Digite ex: 6 (converte para 06:00) ou 630 (06:30)
                      </p>
                    </div>

                    {/* Horário que dorme */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Horário que dorme
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          type="text"
                          value={horarioDorme}
                          onChange={e => setHorarioDorme(e.target.value)}
                          onBlur={() => handleHorarioBlur(setHorarioDorme, horarioDorme)}
                          placeholder="Ex: 23 (→ 23:00) ou 2230"
                          className="pl-10 h-11 text-sm border-slate-200 focus:border-emerald-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Digite ex: 23 (converte para 23:00) ou 2230 (22:30)
                      </p>
                    </div>
                  </div>

                  {/* Pratica Atividade Física */}
                  <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Pratica Atividade Física?
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setPraticaAtividadeFisica(true)}
                          className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                            praticaAtividadeFisica === true
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPraticaAtividadeFisica(false)
                            setAtividadeDescricao('')
                          }}
                          className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                            praticaAtividadeFisica === false
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Não
                        </button>
                      </div>
                    </div>

                    {praticaAtividadeFisica === true && (
                      <div className="animate-in fade-in duration-200">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Qual atividade e frequência semanal?
                        </label>
                        <textarea
                          rows={2}
                          value={atividadeDescricao}
                          onChange={e => setAtividadeDescricao(e.target.value)}
                          placeholder="Ex: Musculação 4x na semana + Corrida aos sábados (40 min)"
                          className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-white focus:border-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    )}
                  </div>

                  {/* Observações Gerais */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Observações Gerais (Texto Livre)
                    </label>
                    <textarea
                      rows={3}
                      value={observacoes}
                      onChange={e => setObservacoes(e.target.value)}
                      placeholder="Histórico prévio, preferências alimentares, aversões ou rotina de trabalho..."
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('clinico')}
                      className="text-xs"
                    >
                      ← Voltar para Clínico
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                    >
                      {saving ? 'Salvando...' : 'Finalizar e Salvar Paciente'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </main>
      </div>
    </div>
  )
}
