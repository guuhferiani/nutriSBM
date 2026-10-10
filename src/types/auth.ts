export interface NutricionistaUser {
  id: string
  name: string
  email: string
  createdAt?: string
}

export interface AuthState {
  user: NutricionistaUser | null
  token: string | null
  loading: boolean
  error: string | null
}
