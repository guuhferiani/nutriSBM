export interface Paciente {
  id: string
  nutricionista_id: string
  nome: string
  data_nascimento?: string | null
  sexo?: string | null
  whatsapp?: string | null
  email?: string | null
  peso_inicial?: number | null
  altura?: number | null
  objetivo_texto?: string | null
  objetivos?: string[] | null
  created_at: string
}

export interface Consulta {
  id: string
  paciente_id: string
  data_consulta: string
  peso?: number | null
  cintura?: number | null
  quadril?: number | null
  percentual_gordura?: number | null
  observacoes?: string | null
  proximo_retorno?: string | null
  created_at: string
}

export interface PacienteSemRetorno {
  id: string
  nome: string
  whatsapp?: string | null
  email?: string | null
  ultima_consulta: string
  dias_sem_retorno: number
}

export interface DashboardData {
  total_pacientes: number
  consultas_semana: number
  pacientes_sem_retorno: PacienteSemRetorno[]
  semana_inicio?: string
  semana_fim?: string
}
