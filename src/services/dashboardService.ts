import { fetchNeonJwt } from './neonAuth'
import type { DashboardData, Paciente, Consulta, PacienteSemRetorno } from '../types/dashboard'

const DATA_API_URL = import.meta.env.VITE_NEON_DATA_API_URL || 'https://ep-purple-fire-b66qzulk.apirest.c-2.sa-east-1.aws.neon.tech/neondb/rest/v1'

/**
 * Retorna os headers padrão para consulta no Neon Data API / PostgREST
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const jwt = await fetchNeonJwt()
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`
  }
  return headers
}

/**
 * Calcula início e fim da semana atual em formato pt-BR (Segunda a Domingo ou Domingo a Sábado)
 */
function getCurrentWeekRange() {
  const now = new Date()
  const day = now.getDay()
  // Ajuste para semana começando na Segunda (1) ou Domingo (0)
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return {
    startDate: monday,
    endDate: sunday,
    inicio: fmt(monday),
    fim: fmt(sunday),
  }
}

/**
 * Computa as métricas do dashboard a partir de listas de pacientes e consultas
 */
export function computeDashboardMetrics(
  nutricionistaId: string,
  pacientes: Paciente[],
  consultas: Consulta[]
): DashboardData {
  const userPacientes = pacientes.filter(p => p.nutricionista_id === nutricionistaId)
  const userPacienteIds = new Set(userPacientes.map(p => p.id))
  const userConsultas = consultas.filter(c => userPacienteIds.has(c.paciente_id))

  const { startDate, endDate, inicio, fim } = getCurrentWeekRange()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 1. Total de pacientes ativos da nutricionista logada
  const total_pacientes = userPacientes.length

  // 2. Consultas da semana atual
  const consultas_semana = userConsultas.filter(c => {
    if (!c.data_consulta) return false
    // Trata YYYY-MM-DD
    const parts = c.data_consulta.split('-').map(Number)
    const cDate = new Date(parts[0], parts[1] - 1, parts[2])
    return cDate >= startDate && cDate <= endDate
  }).length

  // 3. Pacientes sem retorno (> 30 dias desde a última consulta e sem próximo retorno agendado)
  const consultasPorPaciente = new Map<string, Consulta[]>()
  for (const c of userConsultas) {
    const list = consultasPorPaciente.get(c.paciente_id) || []
    list.push(c)
    consultasPorPaciente.set(c.paciente_id, list)
  }

  const pacientes_sem_retorno: PacienteSemRetorno[] = []

  for (const p of userPacientes) {
    const pConsultas = consultasPorPaciente.get(p.id) || []
    if (pConsultas.length === 0) {
      // Paciente novo sem consulta registrada ainda não é considerado 'sem retorno há > 30 dias'
      continue
    }

    // Ordena por data_consulta decrescente
    const sorted = [...pConsultas].sort((a, b) => {
      return new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime()
    })

    const latest = sorted[0]
    const parts = latest.data_consulta.split('-').map(Number)
    const latestDate = new Date(parts[0], parts[1] - 1, parts[2])
    const diffMs = today.getTime() - latestDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    // Verifica se possui próximo retorno agendado para o futuro
    const hasUpcoming = pConsultas.some(c => {
      if (!c.proximo_retorno) return false
      const rParts = c.proximo_retorno.split('-').map(Number)
      const rDate = new Date(rParts[0], rParts[1] - 1, rParts[2])
      return rDate >= today
    })

    if (diffDays > 30 && !hasUpcoming) {
      pacientes_sem_retorno.push({
        id: p.id,
        nome: p.nome,
        whatsapp: p.whatsapp,
        email: p.email,
        ultima_consulta: latest.data_consulta,
        dias_sem_retorno: diffDays,
      })
    }
  }

  // Ordena por maior tempo sem retorno
  pacientes_sem_retorno.sort((a, b) => b.dias_sem_retorno - a.dias_sem_retorno)

  return {
    total_pacientes,
    consultas_semana,
    pacientes_sem_retorno,
    semana_inicio: inicio,
    semana_fim: fim,
  }
}

/**
 * Busca as métricas do Dashboard em tempo real diretamente do Neon
 */
export async function fetchDashboardMetrics(nutricionistaId: string): Promise<DashboardData> {
  const headers = await getAuthHeaders()

  // 1. Tenta executar via RPC do PostgreSQL no Neon (mais performático e atômico)
  try {
    const rpcRes = await fetch(`${DATA_API_URL}/rpc/get_nutricionista_dashboard`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_nutri_id: nutricionistaId }),
    })

    if (rpcRes.ok) {
      const data = await rpcRes.json()
      if (data && typeof data.total_pacientes === 'number') {
        return {
          total_pacientes: data.total_pacientes,
          consultas_semana: data.consultas_semana,
          pacientes_sem_retorno: Array.isArray(data.pacientes_sem_retorno) ? data.pacientes_sem_retorno : [],
          semana_inicio: data.semana_inicio,
          semana_fim: data.semana_fim,
        }
      }
    }
  } catch (err) {
    console.warn('Tentando fallback de tabelas diretas para métricas:', err)
  }

  // 2. Fallback: Consulta direta nas tabelas 'pacientes' e 'consultas' via Neon Data API
  try {
    const [pacientesRes, consultasRes] = await Promise.all([
      fetch(`${DATA_API_URL}/pacientes?nutricionista_id=eq.${nutricionistaId}&select=*`, {
        headers,
      }),
      fetch(`${DATA_API_URL}/consultas?select=*&order=data_consulta.desc`, {
        headers,
      }),
    ])

    if (pacientesRes.ok && consultasRes.ok) {
      const pacientes: Paciente[] = await pacientesRes.json()
      const consultas: Consulta[] = await consultasRes.json()
      return computeDashboardMetrics(nutricionistaId, pacientes, consultas)
    }
  } catch (err) {
    console.error('Erro ao consultar tabelas do Neon:', err)
  }

  // 3. Fallback seguro padrão caso haja falha temporária de rede
  const { inicio, fim } = getCurrentWeekRange()
  return {
    total_pacientes: 0,
    consultas_semana: 0,
    pacientes_sem_retorno: [],
    semana_inicio: inicio,
    semana_fim: fim,
  }
}

/**
 * Busca a lista de pacientes do nutricionista logado
 */
export async function fetchPacientes(nutricionistaId: string): Promise<Paciente[]> {
  const headers = await getAuthHeaders()
  try {
    const res = await fetch(`${DATA_API_URL}/pacientes?nutricionista_id=eq.${nutricionistaId}&order=nome.asc`, {
      headers,
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.error('Erro ao buscar pacientes:', err)
  }
  return []
}

/**
 * Busca os detalhes de um paciente e seu histórico de consultas
 */
export async function fetchPacienteDetails(pacienteId: string): Promise<{ paciente: Paciente | null; consultas: Consulta[] }> {
  const headers = await getAuthHeaders()
  try {
    const [pRes, cRes] = await Promise.all([
      fetch(`${DATA_API_URL}/pacientes?id=eq.${pacienteId}&select=*`, { headers }),
      fetch(`${DATA_API_URL}/consultas?paciente_id=eq.${pacienteId}&order=data_consulta.desc&select=*`, { headers }),
    ])

    let paciente: Paciente | null = null
    let consultas: Consulta[] = []

    if (pRes.ok) {
      const list = await pRes.json()
      if (Array.isArray(list) && list.length > 0) {
        paciente = list[0]
      }
    }

    if (cRes.ok) {
      consultas = await cRes.json()
    }

    return { paciente, consultas }
  } catch (err) {
    console.error('Erro ao buscar detalhes do paciente:', err)
    return { paciente: null, consultas: [] }
  }
}
