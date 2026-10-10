import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Alert } from '../components/ui/Alert'
import { Mail, Lock, User, Eye, EyeOff, Check, X, ShieldCheck } from 'lucide-react'

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const { user, register, loading: authLoading } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Se já estiver logado(a) e tentar acessar a tela de cadastro, redirecionar direto para o dashboard
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  // Validação de requisitos da senha (mínimo 9 caracteres conforme regra)
  const isPasswordValidLength = password.length >= 9
  const passwordsMatch = password.length > 0 && password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    if (password.length < 9) {
      setErrorMessage('A senha deve ter no mínimo 9 caracteres para garantir a segurança da conta.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem. Por favor, confira os campos.')
      return
    }

    setIsLoading(true)

    try {
      await register(name, email, password)
      // Após o cadastro bem sucedido, redirecionar para o dashboard
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao criar conta. Tente novamente mais tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-slate-50 to-emerald-50/30 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Decorações de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[460px] z-10 py-6">
        {/* Logo NutriSBM no topo */}
        <div className="mb-8">
          <Logo />
        </div>

        <Card className="border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xl shadow-emerald-950/5">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-slate-800">Crie sua conta profissional</CardTitle>
            <CardDescription>
              Cadastre-se na NutriSBM e tenha controle total de seus pacientes e dietas
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <div className="mb-5">
                <Alert variant="destructive">{errorMessage}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nome completo
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: Dra. Camila Pereira"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  E-mail profissional
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@consultorio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 9 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="w-4 h-4" />}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Validador visual do requisito de 9 caracteres */}
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  {isPasswordValidLength ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <Check className="w-3.5 h-3.5" /> Mínimo de 9 caracteres atingido
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-500">
                      <X className="w-3.5 h-3.5 text-slate-400" /> A senha deve ter no mínimo 9 caracteres ({password.length}/9)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Confirmar senha
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita a mesma senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={<Lock className="w-4 h-4" />}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={showConfirmPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {confirmPassword && (
                  <div className="mt-2 text-xs">
                    {passwordsMatch ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <Check className="w-3.5 h-3.5" /> As senhas conferem
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-500 font-medium">
                        <X className="w-3.5 h-3.5" /> As senhas não coincidem
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  id="btn-register"
                  type="submit"
                  size="lg"
                  className="w-full text-base font-semibold"
                  isLoading={isLoading}
                >
                  Criar conta
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600">
                Já tem conta?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé de conformidade */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Seus dados ficam isolados com segurança Row Level Security (RLS)</span>
        </div>
      </div>
    </div>
  )
}
