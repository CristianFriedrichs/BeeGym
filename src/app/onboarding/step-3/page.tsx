'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Check, Users } from 'lucide-react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { completeOnboardingAction } from '@/actions/onboarding'

interface Plan {
    id: string
    name: string
    max_students: number
    price: number
    promo_price?: number | null
    features: string[]
}

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

    // Fetch and filter plans
    useEffect(() => {
        async function fetchPlans() {
            const { data: plansData, error } = await supabase
                .from('plans')
                .select('*')
                .order('price', { ascending: true })

            if (plansData) {
                // Parse student range to get max value
                const studentCount = parseInt(data.studentRange.split('-')[1] || data.studentRange.replace('+', ''))

                // Filter plans where max_students >= selected student count or max_students is null (unlimited)
                const filteredPlans = plansData.filter((plan: any) => plan.max_students === null || plan.max_students >= studentCount)

                const formattedData = filteredPlans.map((plan: any) => ({
                    ...plan,
                    features: Array.isArray(plan.features) ? plan.features : []
                })) as Plan[]

                setPlans(formattedData)
            }
        }

        if (data.studentRange) {
            fetchPlans()
        }
    }, [data.studentRange, supabase])

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
            router.push('/dashboard')
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
            <div className="max-w-6xl mx-auto w-full my-auto space-y-8">
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
                    <p className="text-gray-600">Aproveite a oferta de lançamento: R$ 9,90 nos primeiros 3 meses em todos os planos.</p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map(plan => {
                        const isSelected = selectedPlanId === plan.id
                        const hasPromo = plan.promo_price && plan.promo_price > 0
                        const isFree = plan.price === 0

                        return (
                            <Card
                                key={plan.id}
                                className={`cursor-pointer transition-all hover:border-primary hover:shadow-lg ${isSelected ? 'border-2 border-primary ring-2 ring-primary/20' : ''
                                    }`}
                                onClick={() => setSelectedPlanId(plan.id)}
                            >
                                <CardHeader>
                                    <CardTitle>{plan.name}</CardTitle>
                                    <CardDescription className="text-lg font-bold text-primary">
                                        {isFree ? (
                                            'Sob Consulta'
                                        ) : hasPromo ? (
                                            <>
                                                <span className="line-through text-sm text-muted-foreground">R$ {plan.price.toFixed(2)}</span>
                                                {' '}por{' '}
                                                <span className="text-2xl">R$ {plan.promo_price!.toFixed(2)}</span>
                                                <span className="text-sm font-normal text-muted-foreground">/mês (3 meses)</span>
                                            </>
                                        ) : (
                                            <>
                                                R$ {plan.price.toFixed(2)}
                                                <span className="text-sm font-normal text-muted-foreground">/mês</span>
                                            </>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>{plan.max_students ? `Até ${plan.max_students} alunos` : 'Alunos ilimitados'}</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <ul className="space-y-1">
                                                {plan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-center text-xs text-muted-foreground">
                                                        <Check className="h-3 w-3 mr-1 text-green-500" /> {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        variant={isSelected ? 'default' : 'outline'}
                                    >
                                        {isSelected ? 'Selecionado' : 'Selecionar'}
                                    </Button>
                                </CardFooter>
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
        </div>
    )
}
