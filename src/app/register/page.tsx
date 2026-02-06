'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
    const [fullName, setFullName] = useState('')
    const [businessType, setBusinessType] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("As senhas não coincidem.")
            return
        }

        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    business_type: businessType,
                },
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            setSuccess(true)
            // Aguarda 3 segundos antes de redirecionar para dar tempo do usuário ler
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        }
    }

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    return (
        <div className="bg-[#f8f7f5] dark:bg-[#231a0f] text-[#181510] dark:text-white h-screen overflow-hidden w-full flex font-sans">

            {/* Lado Esquerdo: Imagem & Marca */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-end bg-[#00173F]">
                <div className="absolute inset-0 z-0">
                    <div className="w-full h-full bg-cover bg-center opacity-60 mix-blend-overlay" style={{ backgroundImage: "url('/gym-bg.jpg')" }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00173F]/90 via-[#00173F]/40 to-[#00173F]/20"></div>
                </div>
                <div className="relative z-10 p-16 pb-24">
                    <div className="max-w-lg">
                        <h1 className="text-white text-5xl font-bold leading-tight tracking-tight mb-4">
                            Junte-se à BeeGym
                        </h1>
                        <p className="text-white/80 text-lg">
                            Comece hoje a transformar a gestão do seu negócio fitness.
                        </p>
                    </div>
                </div>
            </div>

            {/* Lado Direito: Formulário */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center relative bg-[#f8f7f5] dark:bg-[#231a0f]">

                <div className="w-full max-w-[440px] px-6 z-10">

                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="flex items-center gap-1 text-3xl font-bold tracking-tighter">
                            <span className="text-[#ff8c00]">Bee</span><span className="text-[#00173F] dark:text-white">Gym</span>
                        </div>
                        <div className="h-3 w-3 bg-[#ff8c00] rounded-full ml-1"></div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-[#00173F] dark:text-white text-[28px] font-bold leading-tight">Crie sua conta</h2>
                        <p className="text-gray-500 mt-2">Preencha os campos abaixo para começar.</p>
                    </div>

                    {success ? (
                        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-6 text-center animate-in fade-in zoom-in duration-300">
                            <div className="mb-4 flex justify-center">
                                <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Conta criada com sucesso!</h3>
                            <p className="mb-4">
                                Verifique seu e-mail para confirmar seu cadastro. Você será redirecionado para o login em instantes.
                            </p>
                            <button
                                onClick={() => router.push('/login')}
                                className="text-sm font-medium text-green-700 hover:underline"
                            >
                                Ir para Login agora
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full h-12 bg-white dark:bg-[#2f2519] border border-[#e7e1da] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#3a2e22] text-[#181510] dark:text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 mb-6"
                            >
                                <img
                                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                                <span>Cadastrar com Google</span>
                            </button>

                            <div className="relative flex py-2 items-center mb-6">
                                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                                <span className="flex-shrink mx-4 text-gray-400 text-sm">Ou cadastre com e-mail</span>
                                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                            </div>

                            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                                {error && (
                                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                                        {error}
                                    </div>
                                )}

                                <label className="flex flex-col gap-2">
                                    <span className="text-[#00173F] dark:text-gray-200 text-sm font-medium">Nome Completo</span>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full rounded-lg border border-[#e7e1da] dark:border-gray-700 bg-white dark:bg-[#2f2519] text-[#181510] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff8c00]/50 focus:border-[#ff8c00] h-12 px-4 placeholder:text-gray-400 transition-all duration-200"
                                            placeholder="Seu nome"
                                            required
                                        />
                                    </div>
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-[#00173F] dark:text-gray-200 text-sm font-medium">Tipo de Negócio</span>
                                    <div className="relative">
                                        <select
                                            value={businessType}
                                            onChange={(e) => setBusinessType(e.target.value)}
                                            className="w-full rounded-lg border border-[#e7e1da] dark:border-gray-700 bg-white dark:bg-[#2f2519] text-[#181510] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff8c00]/50 focus:border-[#ff8c00] h-12 px-4 transition-all duration-200 appearance-none"
                                            required
                                        >
                                            <option value="" disabled>Selecione seu perfil</option>
                                            <option value="personal">Personal Trainer</option>
                                            <option value="studio">Box / Studio</option>
                                            <option value="gym">Academia</option>
                                            <option value="training_center">Centro de Treinamento</option>
                                            <option value="physio">Fisioterapia</option>
                                            <option value="other">Outros</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                        </div>
                                    </div>
                                </label>

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
                                            minLength={6}
                                        />
                                    </div>
                                </label>

                                <label className="flex flex-col gap-2">
                                    <span className="text-[#00173F] dark:text-gray-200 text-sm font-medium">Confirmar Senha</span>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full rounded-lg border border-[#e7e1da] dark:border-gray-700 bg-white dark:bg-[#2f2519] text-[#181510] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff8c00]/50 focus:border-[#ff8c00] h-12 px-4 placeholder:text-gray-400 transition-all duration-200"
                                            placeholder="Repita sua senha"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </label>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-4 w-full h-12 bg-[#ff8c00] hover:bg-[#e67e00] text-white rounded-full font-bold text-base transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <span>{loading ? 'Criando conta...' : 'Cadastrar'}</span>
                                    {!loading && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">→</span>}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Já tem uma conta?
                            <Link href="/login" className="text-[#ff8c00] font-bold hover:underline ml-1">
                                Entre
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8 flex justify-center items-center gap-4 text-gray-300 text-xs">
                        <span>© 2026 BeeGym</span>
                        <span>•</span>
                        <a href="#" className="hover:text-gray-500">Privacidade</a>
                    </div>
                </div>
            </div>
        </div>
    )
}
