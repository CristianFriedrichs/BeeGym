'use client';

import { Stepper } from '@/components/dashboard/clients/new/stepper';
import { IdentificationStep } from '@/components/dashboard/clients/new/steps/identification-step';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { AddressStep } from '@/components/dashboard/clients/new/steps/address-step';
import { PlanStep } from '@/components/dashboard/clients/new/steps/plan-step';
import { SchedulingStep } from '@/components/dashboard/clients/new/steps/scheduling-step';
import { FormContext, NewStudentFormValues, newStudentSchema } from '@/components/dashboard/clients/new/form-context';
import { addMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function NewClientPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Identificação', 'Endereço', 'Plano & Pagamento', 'Agendamento'];
  const router = useRouter();
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);

  useEffect(() => {
    const storedUnitId = localStorage.getItem('currentUnitId');
    setCurrentUnitId(storedUnitId);
  }, []);

  const form = useForm<NewStudentFormValues>({
    resolver: zodResolver(newStudentSchema),
    mode: 'onChange',
    defaultValues: {
        name: '',
        cpf: '',
        email: '',
        phone: '',
        address: {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zip: ''
        },
        birthDate: undefined,
        primaryUnitId: currentUnitId || '',
        unitLinkType: 'single',
        unitMemberships: [],
        plan: {
            planId: '',
            discount: {
                type: 'PERCENT',
                value: 0
            },
            dueDate: addMonths(new Date(), 1),
        },
        scheduling: {
            date: undefined,
            time: '',
            location: '',
        },
        reminders: {
            email: true,
            whatsapp: true
        }
    }
  });

  useEffect(() => {
    if (currentUnitId) {
      form.setValue('primaryUnitId', currentUnitId);
      form.setValue('unitMemberships', [currentUnitId]);
    }
  }, [currentUnitId, form]);

  const nextStep = () => setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  const prevStep = () => setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));


  return (
    <FormProvider {...form}>
        <FormContext.Provider value={{ form, currentStep, setCurrentStep, steps, nextStep, prevStep }}>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Criar Novo Aluno</h1>
                    <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
                </div>
                <Stepper />
                <div className="mt-8">
                    {currentStep === 0 && <IdentificationStep />}
                    {currentStep === 1 && <AddressStep />}
                    {currentStep === 2 && <PlanStep />}
                    {currentStep === 3 && <SchedulingStep />}
                </div>
            </div>
        </FormContext.Provider>
    </FormProvider>
  );
}

    