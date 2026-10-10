import type { NutricionistaUser } from '../types/auth'

const AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL || 'https://ep-purple-fire-b66qzulk.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth'
const DATA_API_URL = import.meta.env.VITE_NEON_DATA_API_URL || 'https://ep-purple-fire-b66qzulk.apirest.c-2.sa-east-1.aws.neon.tech/neondb/rest/v1'

const STORAGE_KEY_USER = 'nutrisbm_auth_user'
const STORAGE_KEY_TOKEN = 'nutrisbm_auth_token'
const STORAGE_KEY_JWT = 'nutrisbm_auth_jwt'

export interface AuthResponse {
  user: NutricionistaUser
  token?: string
  jwt?: string
}

/**
 * Traduz erros comuns do Neon Auth / Better Auth para mensagens em português claras e amigáveis.
 */
export function formatAuthError(error: any): string {
  if (!error) return 'Ocorreu um erro inesperado. Tente novamente.'

  const message = error.message || (typeof error === 'string' ? error : '')
  const code = error.code || ''

  if (message.includes('Invalid email or password') || message.includes('INVALID_EMAIL_OR_PASSWORD') || code === 'invalid_email_or_password') {
    return 'E-mail ou senha incorretos. Por favor, verifique seus dados.'
  }

  if (message.includes('User already exists') || message.includes('USER_ALREADY_EXISTS') || code === 'user_already_exists') {
    return 'Este e-mail já está cadastrado no sistema. Tente fazer login.'
  }

  if (message.includes('Password') && (message.includes('short') || message.includes('length') || message.includes('characters'))) {
    return 'A senha deve ter no mínimo 9 caracteres.'
  }

  if (message.includes('Invalid origin') || code === 'invalid_origin') {
    return 'Origem não autorizada. O domínio da aplicação foi registrado para permitir a conexão segura.'
  }

  if (message.includes('Invalid email') || code === 'invalid_email') {
    return 'O formato do e-mail inserido é inválido.'
  }

  if (message.includes('Network') || message.includes('Failed to fetch')) {
    return 'Falha na conexão com o servidor. Verifique sua conexão com a internet.'
  }

  return message || 'Não foi possível completar a operação. Tente novamente mais tarde.'
}

/**
 * Busca o JWT atualizado da sessão do Neon Auth
 */
export async function fetchNeonJwt(): Promise<string | null> {
  try {
    const response = await fetch(`${AUTH_URL}/token`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data?.token) {
        localStorage.setItem(STORAGE_KEY_JWT, data.token)
        return data.token
      }
    }
  } catch (err) {
    console.warn('Não foi possível obter JWT de sessão:', err)
  }
  return localStorage.getItem(STORAGE_KEY_JWT)
}

/**
 * Garante que o nutricionista esteja salvo na tabela `nutricionistas` do Neon.
 */
export async function ensureNutricionistaInDatabase(user: NutricionistaUser, jwtToken?: string | null): Promise<void> {
  const token = jwtToken || (await fetchNeonJwt())
  if (!token) return

  try {
    // 1. Tenta verificar se já existe na tabela nutricionistas
    const checkRes = await fetch(`${DATA_API_URL}/nutricionistas?id=eq.${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })

    if (checkRes.ok) {
      const existing = await checkRes.json()
      if (Array.isArray(existing) && existing.length > 0) {
        // Já existe registrado
        return
      }
    }

    // 2. Se não existir, faz a inserção explícita
    await fetch(`${DATA_API_URL}/nutricionistas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: user.id,
        nome: user.name,
        email: user.email,
      }),
    })
  } catch (err) {
    console.warn('Trigger automático já trata a inserção na tabela nutricionistas:', err)
  }
}

/**
 * Cadastra um novo nutricionista no Neon Auth
 */
export async function signUpWithEmail(name: string, email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase()
  const cleanName = name.trim()

  const response = await fetch(`${AUTH_URL}/sign-up/email`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      name: cleanName,
      email: cleanEmail,
      password,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(formatAuthError(data))
  }

  const user: NutricionistaUser = {
    id: data.user.id,
    name: data.user.name || cleanName,
    email: data.user.email || cleanEmail,
    createdAt: data.user.createdAt,
  }

  // Armazena a sessão localmente
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  if (data.token) {
    localStorage.setItem(STORAGE_KEY_TOKEN, data.token)
  }

  // Obtém o JWT e garante o registro na tabela nutricionistas
  const jwt = await fetchNeonJwt()
  await ensureNutricionistaInDatabase(user, jwt)

  return { user, token: data.token, jwt: jwt || undefined }
}

/**
 * Realiza login do nutricionista no Neon Auth
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase()

  const response = await fetch(`${AUTH_URL}/sign-in/email`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      email: cleanEmail,
      password,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(formatAuthError(data))
  }

  const user: NutricionistaUser = {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    createdAt: data.user.createdAt,
  }

  // Armazena a sessão localmente
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
  if (data.token) {
    localStorage.setItem(STORAGE_KEY_TOKEN, data.token)
  }

  const jwt = await fetchNeonJwt()

  return { user, token: data.token, jwt: jwt || undefined }
}

/**
 * Encerra a sessão do usuário
 */
export async function signOutUser(): Promise<void> {
  try {
    await fetch(`${AUTH_URL}/sign-out`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
  } catch (err) {
    console.warn('Erro ao chamar sign-out no servidor:', err)
  } finally {
    localStorage.removeItem(STORAGE_KEY_USER)
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_JWT)
  }
}

/**
 * Obtém a sessão salva (localmente e no servidor)
 */
export async function getStoredSession(): Promise<{ user: NutricionistaUser | null; token: string | null }> {
  const rawUser = localStorage.getItem(STORAGE_KEY_USER)
  const token = localStorage.getItem(STORAGE_KEY_TOKEN)

  if (!rawUser) {
    return { user: null, token: null }
  }

  try {
    const user = JSON.parse(rawUser) as NutricionistaUser
    return { user, token }
  } catch {
    return { user: null, token: null }
  }
}
