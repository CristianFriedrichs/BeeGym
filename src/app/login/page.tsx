'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/') // Redireciona para o Dashboard após sucesso
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  return (
    <div className="bg-[#f8f7f5] dark:bg-[#231a0f] text-[#181510] dark:text-white h-screen overflow-hidden w-full flex font-sans">

      {/* Lado Esquerdo: Imagem & Marca */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-end bg-[#00173F]">
        <div className="absolute inset-0 z-0">
          {/* Placeholder para a imagem da academia - Substitua pelo arquivo real em /public */}
          <div className="w-full h-full bg-cover bg-center opacity-60 mix-blend-overlay" style={{ backgroundImage: "url('/gym-bg.jpg')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#00173F]/90 via-[#00173F]/40 to-[#00173F]/20"></div>
        </div>
        <div className="relative z-10 p-16 pb-24">

          {/* LOGO NOVO AQUI (Esquerda) */}
          <div className="mb-8">
            <Image
              src="/logo-white.png"
              alt="BeeGym Logo"
              width={180}
              height={60}
              className="object-contain"
            />
          </div>

          <div className="max-w-lg">
            <h1 className="text-white text-5xl font-bold leading-tight tracking-tight mb-4">
              Sua gestão no ritmo do seu treino
            </h1>
            <p className="text-white/80 text-lg">
              Transforme a administração da sua academia com a plataforma mais ágil do mercado.
            </p>
          </div>
        </div>
      </div>

      {/* Lado Direito: Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center relative bg-[#f8f7f5] dark:bg-[#231a0f]">

        <div className="w-full max-w-[440px] px-6 z-10">

          {/* Logo removido daqui conforme solicitado */}

          <div className="mb-8">
            <h2 className="text-[#00173F] dark:text-white text-[28px] font-bold leading-tight">Acesse sua conta</h2>
            <p className="text-gray-500 mt-2">Bem-vindo de volta! Insira seus dados abaixo.</p>
          </div>

          {/* Botão Google (Novidade Solicitada) */}
          <button
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white dark:bg-[#2f2519] border border-[#e7e1da] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#3a2e22] text-[#181510] dark:text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 mb-6"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Entrar com Google</span>
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">Ou continue com e-mail</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <label className="flex flex-col gap-2">
              <span className="text-[#00173F] dark:text-gray-200 text-sm font-medium">E-mail</span>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#e7e1da] dark:border-gray-700 bg-white dark:bg-[#2f2519] text-[#181510] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff8c00]/50 focus:border-[#ff8c00] h-12 px-4 placeholder:text-gray-400 transition-all duration-200"
                  placeholder="exemplo@beegym.com"
                  required
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[#00173F] dark:text-gray-200 text-sm font-medium">Senha</span>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#e7e1da] dark:border-gray-700 bg-white dark:bg-[#2f2519] text-[#181510] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff8c00]/50 focus:border-[#ff8c00] h-12 px-4 placeholder:text-gray-400 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </label>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-sm font-medium text-gray-500 hover:text-[#ff8c00] transition-colors">
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full h-12 bg-[#ff8c00] hover:bg-[#e67e00] text-white rounded-full font-bold text-base transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Entrando...' : 'Entrar'}</span>
              {!loading && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">→</span>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Ainda não tem uma conta?
              <Link href="/register" className="text-[#ff8c00] font-bold hover:underline ml-1">
                Cadastre-se
              </Link>
            </p>
          </div>

          <div className="mt-12 flex justify-center items-center gap-4 text-gray-300 text-xs">
            <span>© 2026 BeeGym</span>
            <span>•</span>
            <a href="#" className="hover:text-gray-500">Privacidade</a>
          </div>
        </div>
      </div>
    </div>
  )
}
