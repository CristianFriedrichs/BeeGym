'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Check, Users, User, Dumbbell, Building2, Crown, Zap } from 'lucide-react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { completeOnboardingAction } from '@/actions/onboarding'
import { cn } from '@/lib/utils'

interface Plan {
    id: string
    name: string
    description: string
    max_students: number | null
    price: number
    promo_price?: number | null
    startingFrom?: boolean
    features: string[]
    icon: any
    colorClass: string
    bgClass: string
}

const localPlans: Plan[] = [
    {
        id: 'plan_starter',
        name: 'STARTER',
        description: 'Ideal para profissionais independentes e iniciantes.',
        max_students: 20,
        price: 19.90,
        promo_price: 9.90,
        features: ['Gestão de Alunos e Pagamentos', 'Calendário Completo', 'Controle de Frequência e Treinos', 'Relatórios e Alertas'],
        icon: User,
        colorClass: 'text-amber-600',
        bgClass: 'bg-amber-50'
    },
    {
        id: 'plan_plus',
        name: 'PLUS',
        description: 'Para quem está crescendo e precisa de mais espaço.',
        max_students: 40,
        price: 29.90,
        promo_price: 19.90,
        features: ['Tudo do STARTER', 'App do Aluno', 'Chat'],
        icon: Zap,
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-50'
    },
    {
        id: 'plan_studio',
        name: 'STUDIO',
        description: 'Perfeito para Studios e Boxes com turmas e treinos coletivos.',
        max_students: 100,
        price: 49.90,
        promo_price: 29.90,
        features: ['Tudo do PLUS', 'Aulas Coletivas e Turmas', 'Múltiplos Agendamentos'],
        icon: Dumbbell,
        colorClass: 'text-teal-600',
        bgClass: 'bg-teal-50'
    },
    {
        id: 'plan_pro',
        name: 'PRO',
        description: 'Gestão completa para Academias de médio porte.',
        max_students: 400,
        price: 79.90,
        promo_price: 49.90,
        features: ['Tudo do STUDIO', 'Múltiplos Usuários/Instrutores', 'Automatização de Cobrança'],
        icon: Building2,
        colorClass: 'text-slate-600',
        bgClass: 'bg-slate-50'
    },
    {
        id: 'plan_enterprise',
        name: 'ENTERPRISE',
        description: 'Solução ilimitada para grandes redes e franqueadoras.',
        max_students: null,
        price: 0,
        features: ['Tudo do PRO', 'Multipropriedade (Redes)', 'Integração API Externa', 'CRM e Relacionamento'],
        icon: Crown,
        colorClass: 'text-orange-600',
        bgClass: 'bg-orange-50'
    }
]

export default function OnboardingStep3() {
    const router = useRouter()
    const { toast } = useToast()
    const { data, resetData } = useOnboarding()

    const [plans, setPlans] = useState<Plan[]>([])
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const supabase = createClient()

    // Redirect if no data
    useEffect(() => {
        if (!data.businessType || !data.organizationName) {
            router.push('/onboarding')
        }
    }, [data, router])

    // Fetch and filter plans locally
    useEffect(() => {
        if (data.studentRange) {
            // Parse student range to get max value
            const studentCount = parseInt(data.studentRange.split('-')[1] || data.studentRange.replace('+', ''))

            // Filter local plans: max_students >= selected student count or max_students is null (unlimited)
            const filteredPlans = localPlans.filter(plan => plan.max_students === null || plan.max_students >= studentCount)

            // To ensure they always see at least some options, if filtered is too small, fallback slightly
            if (filteredPlans.length < 2) {
                const addPlan = localPlans.find(plan => plan.id === 'plan_enterprise')
                if (addPlan && !filteredPlans.find(p => p.id === 'plan_enterprise')) {
                    filteredPlans.push(addPlan)
                }
            }

            setPlans(filteredPlans)
        }
    }, [data.studentRange])

    const handleComplete = async () => {
        if (!selectedPlanId) {
            toast({ variant: 'destructive', title: 'Selecione um plano', description: 'Você deve escolher um plano para continuar.' })
            return
        }

        setIsLoading(true)
        try {
            // Map business type to enum
            let mappedType = 'STARTER'
            if (data.businessType === 'Studio') mappedType = 'STUDIO'
            if (data.businessType === 'Academia') mappedType = 'PRO'
            if (data.businessType === 'Escola') mappedType = 'PLUS'
            if (data.businessType === 'Fisioterapia') mappedType = 'PLUS'

            const result = await completeOnboardingAction({
                organizationName: data.organizationName,
                businessType: mappedType as any,
                phone: data.phone,
                email: data.email,
                studentRange: data.studentRange as any,
                addressLine1: data.addressLine1,
                addressNumber: data.addressNumber,
                addressNeighborhood: data.addressNeighborhood,
                addressCity: data.addressCity,
                addressState: data.addressState,
                addressZip: data.addressZip,
                hasPhysicalLocation: data.hasPhysicalLocation,
                planId: selectedPlanId
            })

            if (result?.error) {
                throw new Error(result.error)
            }

            toast({ title: 'Configuração concluída!', description: 'Bem-vindo ao BeeGym.' })
            resetData()
            router.push('/painel')
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: error.message || 'Falha ao concluir configuração.'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto w-full my-auto space-y-6">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Passo 4 de 4</span>
                        <span className="text-sm font-medium text-primary">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '100%' }} />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Escolha o plano ideal para o seu negócio</h1>
                    <p className="text-gray-600">Aproveite a oferta de lançamento: 3 primeiros meses com desconto. <strong className="text-green-600">7 dias de teste com reembolso de 100%</strong> em todos os planos.</p>
                </div>

                {/* Plans Grid */}
                <div className="flex gap-4 items-stretch w-full">
                    {plans.map(plan => {
                        const isSelected = selectedPlanId === plan.id
                        const hasPromo = plan.promo_price && plan.promo_price > 0
                        const isFree = plan.price === 0

                        return (
                            <Card
                                key={plan.id}
                                className={`cursor-pointer transition-all hover:border-primary hover:shadow-lg flex flex-col flex-1 basis-0 min-w-0 ${isSelected ? 'border-2 border-primary ring-2 ring-primary/20' : ''
                                    }`}
                                onClick={() => setSelectedPlanId(plan.id)}
                            >
                                {/* Zone 1: Icon – centered */}
                                <div className="px-4 pt-4 pb-0 flex justify-center">
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm border border-black/5", plan.bgClass)}>
                                        <plan.icon className={cn("w-6 h-6", plan.colorClass)} />
                                    </div>
                                </div>
                                {/* Zone 2: Plan name – centered fixed height */}
                                <div className="px-4 pt-3 h-10 flex items-start justify-center">
                                    <h3 className="text-xl font-black font-display tracking-tight text-slate-800">{plan.name}</h3>
                                </div>
                                {/* Zone 3: Description – centered fixed height */}
                                <div className="px-4 h-11 flex items-start text-center">
                                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 w-full">{plan.description}</p>
                                </div>
                                {/* Zone 4: Main price – centered fixed height */}
                                <div className="px-4 h-10 flex items-center justify-center">
                                    {isFree ? (
                                        <span className="text-xl font-black font-display text-primary">Sob Consulta</span>
                                    ) : (
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black font-display text-primary uppercase">
                                                R$ {(hasPromo ? plan.promo_price! : plan.price).toFixed(2).replace('.', ',')}
                                            </span>
                                            <span className="text-xs font-bold text-muted-foreground">/mês</span>
                                        </div>
                                    )}
                                </div>
                                {/* Zone 5: Promo context row – centered fixed height */}
                                <div className="px-4 h-10 flex flex-col justify-center items-center border-b border-black/5 mx-4 mb-2">
                                    {!isFree && hasPromo ? (
                                        <div className="text-center">
                                            <span className="block text-[10px] text-amber-600 font-bold uppercase tracking-wider">Oferta: 3 primeiros meses</span>
                                            <span className="block text-[10px] text-slate-500 font-bold">
                                                Após: {plan.startingFrom ? 'a partir de ' : ''}R$ {plan.price.toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                    ) : isFree ? (
                                        <span className="text-[10px] text-muted-foreground font-medium">Contato para proposta personalizada</span>
                                    ) : (
                                        <span className="text-[10px] text-muted-foreground font-medium">Preço regular mensal</span>
                                    )}
                                </div>
                                {/* Zone 6: Student count – fixed height */}
                                <div className="px-4 h-8 flex items-center gap-2">
                                    <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span className="text-xs font-medium">{plan.max_students ? `Até ${plan.max_students} alunos` : 'Ilimitado'}</span>
                                </div>
                                {/* Zone 7: Features – flex-1 so footer stays at bottom */}
                                <div className="px-4 pb-2 flex-1">
                                    <ul className="space-y-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-[10px] text-muted-foreground">
                                                <Check className="h-3 w-3 mr-1 text-green-500 shrink-0" /> {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {/* Zone 8: Button – always pinned to bottom */}
                                <div className="px-4 pb-4 pt-2">
                                    <Button
                                        className="w-full text-xs h-8"
                                        variant={isSelected ? 'default' : 'outline'}
                                    >
                                        {isSelected ? 'Selecionado' : 'Selecionar'}
                                    </Button>
                                </div>
                            </Card>
                        )
                    })}
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                    <Button variant="outline" onClick={() => router.push('/onboarding/step-2')}>Voltar</Button>
                    <Button onClick={handleComplete} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Finalizar e Pagar
                    </Button>
                </div>
            </div>
        </div >
    )
}
