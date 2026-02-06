'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
    Check,
    ArrowRight,
    Loader2
} from 'lucide-react';

const PLANS = [
    { id: 'starter', name: 'Starter', price: 'R$ 19,90', highlight: 'Ideal para Personal', subtitle: 'Até 20 alunos' },
    { id: 'plus', name: 'Plus', price: 'R$ 29,90', highlight: 'IA + Treinos Coletivos', subtitle: 'Até 50 alunos' },
    { id: 'studio', name: 'Studio', price: 'R$ 49,90', highlight: 'Gestão de Salas + Check-in', subtitle: 'Até 150 alunos' },
    { id: 'pro', name: 'Pro', price: 'R$ 79,90', highlight: 'Automação Financeira', subtitle: 'Alunos Ilimitados' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const { toast } = useToast();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    const [formData, setFormData] = useState({
        business_type: '', // will be loaded/inferred but kept in state for update
        has_physical_location: true,
        address_zip: '',
        address_line1: '',
        address_number: '',
        address_neighborhood: '',
        address_city: '',
        address_state: '',
        selected_plan: '',
    });

    useEffect(() => {
        async function checkStatus() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // 1. Check if Onboarding is already completed
            const { data: userData } = await supabase
                .from('users')
                .select(`
          organization:organizations (
             id,
             onboarding_completed,
             business_type
          )
        `)
                .eq('id', user.id)
                .single();

            const organization = userData?.organization as any;
            const onboardingCompleted = organization?.onboarding_completed;

            if (onboardingCompleted) {
                router.push('/');
                return;
            }

            // 2. Pre-fill logic based on metadata or existing org data
            let businessType = organization?.business_type;

            // If not in DB, check metadata (fallback for just registered users)
            if (!businessType && user.user_metadata?.business_type) {
                businessType = user.user_metadata.business_type;
            }

            // Apply Personal Trainer logic
            if (businessType === 'personal') {
                setFormData(prev => ({
                    ...prev,
                    business_type: businessType,
                    has_physical_location: false,
                    // Clear address fields just in case
                    address_zip: '',
                    address_line1: '',
                    address_number: '',
                    address_neighborhood: '',
                    address_city: '',
                    address_state: ''
                }));
            } else if (businessType) {
                setFormData(prev => ({ ...prev, business_type: businessType }));
            }

            setCheckingStatus(false);
        }
        checkStatus();
    }, [router, supabase]);

    const handleNext = () => {
        if (currentStep < 2) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { data: userData } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!userData?.organization_id) throw new Error('Organização não encontrada');

            const updateData = {
                // Ensure business_type is saved if it wasn't already
                ...(formData.business_type ? { business_type: formData.business_type } : {}),
                has_physical_location: formData.has_physical_location,
                selected_plan: formData.selected_plan,
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
                // Address fields
                address_line1: formData.has_physical_location ? formData.address_line1 : null,
                address_number: formData.has_physical_location ? formData.address_number : null,
                address_neighborhood: formData.has_physical_location ? formData.address_neighborhood : null,
                address_city: formData.has_physical_location ? formData.address_city : null,
                address_state: formData.has_physical_location ? formData.address_state : null,
            };

            const { error } = await supabase
                .from('organizations')
                .update(updateData)
                .eq('id', userData.organization_id);

            if (error) throw error;

            toast({
                title: "Configuração concluída!",
                description: "Bem-vindo ao BeeGym.",
            });

            router.refresh();
            router.push('/');

        } catch (error: any) {
            console.error('Onboarding Error:', error);
            toast({
                title: "Erro ao salvar",
                description: error.message || "Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#F4F6F8]">
                <Loader2 className="h-8 w-8 animate-spin text-[#ff8c00]" />
            </div>
        );
    }

    // Two steps total now
    const totalSteps = 2;
    const visualProgress = (currentStep / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-[#F4F6F8] flex flex-col font-sans text-[#00173F] overflow-x-hidden">

            {/* Container */}
            <div className="layout-container flex h-full grow flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-7xl flex flex-col gap-8">

                    {/* Header & Progress */}
                    <div className="flex flex-col gap-3 w-full max-w-2xl mx-auto">
                        <div className="flex gap-6 justify-between items-end">
                            <p className="text-[#00173F] text-base font-medium leading-normal">Passo {currentStep} de {totalSteps}</p>
                            <p className="text-[#ff8c00] text-sm font-bold leading-normal">{Math.round(visualProgress)}%</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                            <div
                                className="h-full bg-[#ff8c00] transition-all duration-500 ease-out"
                                style={{ width: `${visualProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-[#64748B] text-sm font-normal leading-normal text-center sm:text-left">
                            Wizard de Configuração BeeGym
                        </p>
                    </div>

                    <div className="text-center sm:text-left w-full max-w-2xl mx-auto mt-4">
                        <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-[#00173F] mb-3">
                            {currentStep === 1 && 'Onde você atende?'}
                            {currentStep === 2 && 'Escolha o plano ideal'}
                        </h1>
                        <p className="text-[#64748B] text-lg font-normal">
                            {currentStep === 1 && 'Informe o endereço do seu estabelecimento ou selecione atendimento online.'}
                            {currentStep === 2 && 'Escolha o pacote que melhor se adapta ao seu momento atual.'}
                        </p>
                    </div>

                    {/* Step 1: Address (Formerly Step 2) */}
                    {currentStep === 1 && (
                        <div className="w-full max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="space-y-6">
                                {/* Checkbox No Location */}
                                <label className="flex items-center space-x-3 p-4 bg-[#F4F6F8] rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={!formData.has_physical_location}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            has_physical_location: !e.target.checked,
                                            // Clear fields if checked (meaning NO physical location)
                                            address_zip: e.target.checked ? '' : formData.address_zip,
                                            address_line1: e.target.checked ? '' : formData.address_line1,
                                            address_number: e.target.checked ? '' : formData.address_number,
                                            address_neighborhood: e.target.checked ? '' : formData.address_neighborhood,
                                            address_city: e.target.checked ? '' : formData.address_city,
                                            address_state: e.target.checked ? '' : formData.address_state,
                                        })}
                                        className="w-5 h-5 text-[#ff8c00] border-gray-300 rounded focus:ring-[#ff8c00]"
                                    />
                                    <span className="text-[#00173F] font-medium">Não possuo local fixo (Atendimento Online/Domiciliar)</span>
                                </label>

                                {/* Address Fields */}
                                <div className={cn(
                                    "grid gap-4 transition-all duration-300",
                                    !formData.has_physical_location && "opacity-50 pointer-events-none grayscale"
                                )}>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="sm:col-span-1">
                                            <label className="block text-sm font-medium text-[#00173F] mb-1">CEP</label>
                                            <input
                                                type="text"
                                                placeholder="00000-000"
                                                value={formData.address_zip}
                                                onChange={(e) => setFormData({ ...formData, address_zip: e.target.value })}
                                                className="w-full rounded-lg border-gray-200 focus:border-[#ff8c00] focus:ring-[#ff8c00]"
                                                disabled={!formData.has_physical_location}
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-[#00173F] mb-1">Endereço</label>
                                            <input
                                                type="text"
                                                placeholder="Rua, Avenida..."
                                                value={formData.address_line1}
                                                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                                                className="w-full rounded-lg border-gray-200 focus:border-[#ff8c00] focus:ring-[#ff8c00]"
                                                disabled={!formData.has_physical_location}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="sm:col-span-1">
                                            <label className="block text-sm font-medium text-[#00173F] mb-1">Número</label>
                                            <input
                                                type="text"
                                                placeholder="123"
                                                value={formData.address_number}
                                                onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                                                className="w-full rounded-lg border-gray-200 focus:border-[#ff8c00] focus:ring-[#ff8c00]"
                                                disabled={!formData.has_physical_location}
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-[#00173F] mb-1">Bairro</label>
                                            <input
                                                type="text"
                                                placeholder="Bairro"
                                                value={formData.address_neighborhood}
                                                onChange={(e) => setFormData({ ...formData, address_neighborhood: e.target.value })}
                                                className="w-full rounded-lg border-gray-200 focus:border-[#ff8c00] focus:ring-[#ff8c00]"
                                                disabled={!formData.has_physical_location}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-[#00173F] mb-1">Cidade</label>
                                            <input
                                                type="text"
                                                placeholder="Cidade"
                                                value={formData.address_city}
                                                onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                                                className="w-full rounded-lg border-gray-200 focus:border-[#ff8c00] focus:ring-[#ff8c00]"
                                                disabled={!formData.has_physical_location}
                                            />
                                        </div>
                                        <div className="sm:col-span-1">
                                            <label className="block text-sm font-medium text-[#00173F] mb-1">UF</label>
                                            <select
                                                value={formData.address_state}
                                                onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                                                className="w-full rounded-lg border-gray-200 focus:border-[#ff8c00] focus:ring-[#ff8c00] bg-white text-[#00173F]"
                                                disabled={!formData.has_physical_location}
                                            >
                                                <option value="" disabled>UF</option>
                                                {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map((uf) => (
                                                    <option key={uf} value={uf}>{uf}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Plans (Formerly Step 3) */}
                    {currentStep === 2 && (
                        <div className="w-full mt-4 max-w-5xl mx-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {PLANS.map((plan) => (
                                    <label key={plan.id} className="relative group cursor-pointer block h-full">
                                        <input
                                            type="radio"
                                            name="plan"
                                            value={plan.id}
                                            checked={formData.selected_plan === plan.id}
                                            onChange={(e) => setFormData({ ...formData, selected_plan: e.target.value })}
                                            className="peer sr-only"
                                        />
                                        <div className={cn(
                                            "flex flex-col h-full rounded-xl bg-white border-2 border-transparent hover:border-[#ff8c00]/30 p-6 shadow-sm hover:shadow-md transition-all duration-200",
                                            formData.selected_plan === plan.id ? "border-[#ff8c00] ring-1 ring-[#ff8c00] bg-orange-50/10" : "border-transparent"
                                        )}>
                                            <div className="flex flex-col gap-1 mb-4">
                                                <span className="text-xs font-bold uppercase tracking-wider text-[#ff8c00]">{plan.highlight}</span>
                                                <h3 className="text-xl font-bold text-[#00173F]">{plan.name}</h3>
                                            </div>

                                            <div className="my-4">
                                                <span className="text-3xl font-black text-[#00173F] tracking-tight">{plan.price}</span>
                                                <span className="text-sm text-[#64748B] block">/mês</span>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-gray-100">
                                                <p className="text-sm text-[#00173F] font-medium flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-[#ff8c00]" />
                                                    {plan.subtitle}
                                                </p>
                                            </div>

                                            {formData.selected_plan === plan.id && (
                                                <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-[#ff8c00] flex items-center justify-center shadow-sm">
                                                    <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex justify-center w-full mt-8">
                        <div className="flex w-full max-w-2xl gap-4 flex-col-reverse sm:flex-row justify-between items-center">

                            <button
                                onClick={handleBack}
                                disabled={currentStep === 1 || loading}
                                className={cn(
                                    "w-full sm:w-auto min-w-[140px] h-12 px-6 rounded-lg border border-gray-300 text-[#00173F] bg-white hover:bg-gray-50 text-base font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                    currentStep === 1 && "opacity-0 pointer-events-none" // Hide back button on step 1
                                )}
                            >
                                Voltar
                            </button>

                            {currentStep < 2 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={
                                        (currentStep === 1 && formData.has_physical_location && !formData.address_line1)
                                    }
                                    className="w-full sm:w-auto min-w-[140px] h-12 px-6 rounded-lg bg-[#ff8c00] hover:bg-orange-600 text-white text-base font-bold shadow-lg shadow-orange-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <span>Continuar</span>
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.selected_plan || loading}
                                    className="w-full sm:w-auto min-w-[200px] h-12 px-6 rounded-lg bg-[#ff8c00] hover:bg-orange-600 text-white text-base font-bold shadow-lg shadow-orange-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Finalizar Configuração'}
                                    {!loading && <Check className="h-5 w-5" />}
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
