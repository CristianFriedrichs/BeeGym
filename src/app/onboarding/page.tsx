'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { User, Dumbbell, Building2, Stethoscope, Trophy } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useOnboarding } from '@/contexts/OnboardingContext'

const businessTypes = [
    {
        id: 'Personal',
        title: 'Personal Trainer',
        description: 'Gerencie seus alunos individualmente com treinos personalizados.',
        icon: User,
    },
    {
        id: 'Studio',
        title: 'Studio / Box',
        description: 'Ideal para pequenos grupos, crossfit, pilates e funcionais.',
        icon: Dumbbell,
    },
    {
        id: 'Academia',
        title: 'Academia',
        description: 'Gestão completa de acesso, catracas e mensalidades recorrentes.',
        icon: Building2,
    },
    {
        id: 'Fisioterapia',
        title: 'Fisioterapia',
        description: 'Agendamento clínico e prontuário eletrônico.',
        icon: Stethoscope,
    },
    {
        id: 'Escola',
        title: 'Escola',
        description: 'Para escolas de esportes (Natação, Futebol) e Artes Marciais.',
        icon: Trophy,
    },
]



export default function OnboardingStep1() {
    const router = useRouter()
    const { updateData } = useOnboarding()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    // Attempt to self-heal stuck sessions
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const { syncAuthMetadata } = await import('@/actions/auth-sync')
                const result = await syncAuthMetadata()
                if (result.success) {
                    router.refresh()
                    router.push('/painel')
                }
            } catch (error) {
                console.error('Auto-sync failed:', error)
            }
        }
        checkStatus()
    }, [router])

    const handleSelect = (typeId: string) => {
        updateData({ businessType: typeId })
        router.push('/onboarding/step-2')
    }

    return (
        <div className="flex min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto w-full my-auto space-y-8">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Passo 1 de 4</span>
                        <span className="text-sm font-medium text-primary">33%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '33%' }} />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Qual o seu tipo de negócio?</h1>
                    <p className="text-gray-600">Selecione a opção que melhor descreve sua atuação para personalizarmos sua experiência.</p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {businessTypes.map((type) => {
                        const Icon = type.icon
                        return (
                            <Card
                                key={type.id}
                                className="cursor-pointer transition-all hover:border-primary hover:shadow-lg group flex flex-col"
                                onClick={() => handleSelect(type.id)}
                            >
                                <CardHeader className="flex-1 p-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg mb-1">{type.title}</CardTitle>
                                    <CardDescription className="text-xs leading-relaxed">{type.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        )
                    })}
                </div>

                {/* Back Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
                    >
                        Sair e voltar ao Login
                    </button>
                </div>
            </div>
        </div>
    )
}
