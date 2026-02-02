'use client';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFormContext } from '../form-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { logAction } from '@/lib/logger';
import { plans } from '@/lib/plans';

const availableSlots = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"
]

export function SchedulingStep() {
  const { form, prevStep } = useFormContext();
  const { control, watch } = form;
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if(isValid) {
        const formData = form.getValues();
        
        const newStudent = {
            id: Date.now(),
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: `${formData.address.street}, ${formData.address.number}, ${formData.address.neighborhood}, ${formData.address.city}, ${formData.address.state}`,
            cpf: formData.cpf,
            birthDate: formData.birthDate,
            objetivo: '', 
            plan: plans.find(p => p.id === formData.plan.planId)?.name || 'N/A',
            status: 'Ativo',
            avatar: '', 
            primaryUnitId: formData.primaryUnitId,
            unitMemberships: formData.unitLinkType === 'single' ? [formData.primaryUnitId] : (formData.unitMemberships || []),
        };

        const existingStudents = JSON.parse(localStorage.getItem('students_data') || '[]');
        localStorage.setItem('students_data', JSON.stringify([...existingStudents, newStudent]));

        logAction({
            user: 'Kristin Watson',
            origin: 'professional',
            entity: 'Aluno',
            entityId: newStudent.id.toString(),
            action: 'Criação',
            description: `Novo aluno "${newStudent.name}" criado.`,
            unitId: newStudent.primaryUnitId,
            details: { after: newStudent }
        });

        toast({
            title: "Aluno criado com sucesso!",
            description: "O novo aluno foi adicionado à sua lista.",
        });
        router.push('/dashboard/clients');
    } else {
        toast({
            title: "Erro de Validação",
            description: "Por favor, verifique os campos e tente novamente.",
            variant: "destructive"
        })
    }
  }

  const selectedPlanId = watch('plan.planId');
  const finalPrice = 120; // Replace with actual price calculation
  const selectedDate = watch('scheduling.date');
  const selectedTime = watch('scheduling.time');
  const location = watch('scheduling.location');


  return (
    <Card className="shadow-soft rounded-2xl">
      <CardHeader>
        <CardTitle>Agendamento e Revisão</CardTitle>
        <CardDescription>
          Agende a primeira sessão e revise os detalhes antes de finalizar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="scheduling.date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data da Primeira Sessão</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedDate && (
            <>
                <FormItem>
                    <FormLabel>Horários Disponíveis</FormLabel>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {availableSlots.map(slot => (
                            <Button 
                                key={slot}
                                variant={selectedTime === slot ? 'default' : 'outline'}
                                onClick={() => form.setValue('scheduling.time', slot)}
                                type="button"
                            >
                                {slot}
                            </Button>
                        ))}
                    </div>
                </FormItem>
                 <FormField
                    control={control}
                    name="scheduling.location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Local da Sessão *</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Academia X, Estúdio Y" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </>
        )}
        
        <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
            <h4 className="font-bold">Resumo</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground">Nome</p>
                    <p className="font-medium">{watch('name')}</p>
                </div>
                 <div>
                    <p className="text-muted-foreground">Plano</p>
                    <p className="font-medium">{selectedPlanId} (R$ {finalPrice.toFixed(2)})</p>
                </div>
                {selectedDate && selectedTime && (
                     <div>
                        <p className="text-muted-foreground">1ª Sessão</p>
                        <p className="font-medium">{format(selectedDate, 'dd/MM/yyyy')} às {selectedTime} em {location}</p>
                    </div>
                )}
                 <div>
                    <p className="text-muted-foreground">Vencimento da Fatura</p>
                    <p className="font-medium">{format(watch('plan.dueDate'), 'dd/MM/yyyy')}</p>
                </div>
            </div>
        </div>

         <div className="space-y-4">
            <FormField
                control={control}
                name="reminders.email"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                    <FormLabel>
                        Enviar lembretes de pagamento por e-mail.
                    </FormLabel>
                    </div>
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name="reminders.whatsapp"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                    <FormLabel>
                       Enviar lembretes de pagamento por WhatsApp.
                    </FormLabel>
                    </div>
                </FormItem>
                )}
            />
        </div>

      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="ghost" onClick={prevStep} type="button">Voltar</Button>
        <Button type="button" onClick={handleSubmit}>Criar Aluno</Button>
      </CardFooter>
    </Card>
  );
}

    