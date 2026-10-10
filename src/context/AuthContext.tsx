import React, { createContext, useEffect, useState } from 'react'
import type { NutricionistaUser } from '../types/auth'
import {
  getStoredSession,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  fetchNeonJwt,
} from '../services/neonAuth'

export interface AuthContextType {
  user: NutricionistaUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<NutricionistaUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Recupera a sessão ativa na inicialização
  useEffect(() => {
    async function initSession() {
      try {
        const { user: storedUser, token: storedToken } = await getStoredSession()
        if (storedUser) {
          setUser(storedUser)
          setToken(storedToken)
          // Atualiza JWT silenciosamente em segundo plano
          fetchNeonJwt().catch(() => {})
        }
      } catch (err) {
        console.error('Erro ao restaurar sessão:', err)
      } finally {
        setLoading(false)
      }
    }

    initSession()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await signInWithEmail(email, password)
    setUser(res.user)
    if (res.token) setToken(res.token)
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await signUpWithEmail(name, email, password)
    setUser(res.user)
    if (res.token) setToken(res.token)
  }

  const logout = async () => {
    await signOutUser()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export { useAuth } from './useAuth'
