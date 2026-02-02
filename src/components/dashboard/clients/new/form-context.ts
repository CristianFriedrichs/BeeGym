'use client';
import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export const newStudentSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  cpf: z.string().length(14, 'CPF inválido.'),
  email: z.string().email('Por favor, insira um email válido.'),
  phone: z.string().min(10, 'Telefone inválido.'),
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatório'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatório'),
    state: z.string().min(1, 'Estado é obrigatório'),
    zip: z.string().min(8, 'CEP inválido'),
  }),
  birthDate: z.date().optional(),
  primaryUnitId: z.string().min(1, 'A unidade principal é obrigatória.'),
  unitLinkType: z.enum(['single', 'multiple', 'all']).default('single'),
  unitMemberships: z.array(z.string()).optional(),
  plan: z.object({
    planId: z.string().min(1, 'Por favor, selecione um plano.'),
    discount: z.object({
        type: z.enum(['PERCENT', 'ABSOLUTE']),
        value: z.number().min(0),
    }),
    dueDate: z.date(),
  }),
  scheduling: z.object({
      date: z.date().optional(),
      time: z.string().optional(),
      location: z.string().optional(),
  }).optional(),
  reminders: z.object({
      email: z.boolean(),
      whatsapp: z.boolean(),
  })
});

export type NewStudentFormValues = z.infer<typeof newStudentSchema>;

interface IFormContext {
  form: UseFormReturn<NewStudentFormValues>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  steps: string[];
  nextStep: () => void;
  prevStep: () => void;
}

export const FormContext = createContext<IFormContext | null>(null);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

    