'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface UserProfile {
    id: string
    full_name: string | null
    email: string | null
    role: 'ADMIN' | 'INSTRUCTOR' | 'MANAGER' | 'STUDENT'
    organization_id: string
    avatar_url: string | null
    status: 'ACTIVE' | 'PENDING'
}

interface AuthContextType {
    user: User | null
    profile: UserProfile | null
    loading: boolean
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
    isAdmin: boolean
    isInstructor: boolean
    organizationId: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await (supabase as any)
                .from('profiles')
                .select('id, full_name, email, role, organization_id, avatar_url, status')
                .eq('id', userId)
                .single()

            if (error) throw error

            // 🔒 VALIDAÇÃO: Usuário DEVE ter organization_id
            if (!data?.organization_id) {
                console.warn('⚠️ Usuário sem organization_id - redirecionando para onboarding')

                // Allow them to stay logged in, but send them to onboarding
                if (!window.location.pathname.startsWith('/onboarding')) {
                    router.push('/onboarding')
                }

                return data as UserProfile
            }

            // 🔒 VALIDAÇÃO: Conta deve estar ACTIVE
            if (data.status !== 'ACTIVE') {
                console.warn('⚠️ Conta não está ativa')
                if (!window.location.pathname.startsWith('/pending-activation') && !window.location.pathname.startsWith('/onboarding')) {
                    router.push('/pending-activation')
                }
                return null
            }

            return data as UserProfile
        } catch (error) {
            console.error('Erro ao buscar perfil:', error)
            return null
        }
    }

    const refreshProfile = async () => {
        if (user) {
            const profileData = await fetchProfile(user.id)
            setProfile(profileData)
        }
    }

    useEffect(() => {
        // Verificar sessão inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id).then(setProfile)
            }
            setLoading(false)
        })

        // Listener de mudanças de auth
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null)

            if (session?.user) {
                const profileData = await fetchProfile(session.user.id)
                setProfile(profileData)
            } else {
                setProfile(null)
            }

            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        router.push('/login')
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading,
                signOut,
                refreshProfile,
                isAdmin: profile?.role === 'ADMIN',
                isInstructor: profile?.role === 'INSTRUCTOR' || profile?.role === 'ADMIN',
                organizationId: profile?.organization_id ?? null,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth deve se usado dentro de AuthProvider')
    }
    return context
}
