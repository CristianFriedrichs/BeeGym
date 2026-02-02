'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarIcon, CreditCard, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { students } from '../page';
import { plans, planHistory } from '@/lib/plans';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PlanPage = () => {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const studentId = parseInt(params.id as string, 10);
    const student = students.find(s => s.id === studentId);

    const currentPlan = plans.find(p => p.id === student?.plan);
    const initialDiscount = student?.discount || { type: 'percentage', value: 0 };
    
    const [selectedPlanId, setSelectedPlanId] = useState(currentPlan?.id || '');
    const [discountType, setDiscountType] = useState(initialDiscount.type);
    const [discountValue, setDiscountValue] = useState(initialDiscount.value);
    const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
    const [fixedSchedules, setFixedSchedules] = useState<{ day: string; time: string; location: string }[]>([]);
    
    const timeSlots: string[] = [];
    for (let h = 6; h < 23; h++) { // from 6am to 10:30pm
        timeSlots.push(`${String(h).padStart(2, '0')}:00`);
        timeSlots.push(`${String(h).padStart(2, '0')}:30`);
    }

    const selectedPlanDetails = useMemo(() => plans.find(p => p.id === selectedPlanId), [selectedPlanId]);
    
    useEffect(() => {
        if (selectedPlanDetails?.scheduleType === 'fixed' && selectedPlanDetails.classesPerWeek) {
            const newSchedules = Array.from({ length: selectedPlanDetails.classesPerWeek }, () => ({
                day: '',
                time: '',
                location: ''
            }));
            setFixedSchedules(newSchedules);
        } else {
            setFixedSchedules([]);
        }
    }, [selectedPlanDetails]);

    const handleScheduleChange = (index: number, field: keyof typeof fixedSchedules[number], value: string) => {
        const updatedSchedules = [...fixedSchedules];
        updatedSchedules[index][field] = value;
        setFixedSchedules(updatedSchedules);
    };

    const finalPrice = useMemo(() => {
        const price = selectedPlanDetails?.price ? parseFloat(selectedPlanDetails.price.replace('R$ ', '').replace(',', '.')) : 0;
        if (discountType === 'percentage') {
            return price * (1 - discountValue / 100);
        }
        return price - discountValue;
    }, [selectedPlanDetails, discountType, discountValue]);

    const handleSave = () => {
        toast({
            title: "Plano atualizado com sucesso!",
            description: "As alterações no plano do aluno foram salvas."
        });
        // In a real app, you would persist this data.
        // For now, we just show a toast and navigate back.
        router.push(`/dashboard/clients/${studentId}`);
    };


    if (!student || !currentPlan) {
        return <div className="p-8">Aluno ou plano não encontrado.</div>;
    }

    const currentPlanPrice = parseFloat(currentPlan.price.replace('R$ ', '').replace(',', '.'));
    const currentFinalPrice = student.discount.type === 'percentage' 
        ? currentPlanPrice * (1 - student.discount.value / 100)
        : currentPlanPrice - student.discount.value;


    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar} alt={student.name}/>
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
                    <p className="text-muted-foreground">Gerenciamento de Plano</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Plano Atual e Histórico</CardTitle>
                            <CardDescription>Informações sobre a assinatura vigente e histórico de alterações.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                                   <div className="lg:col-span-1">
                                        <p className="font-semibold text-muted-foreground">Nome do Plano</p>
                                        <p className="font-bold">{currentPlan.name}</p>
                                   </div>
                                   <div className="lg:col-span-2">
                                        <p className="font-semibold text-muted-foreground">Modelo de Cobrança</p>
                                        <p className="font-bold">Mensal</p>
                                   </div>
                                   <div className="lg:col-span-1">
                                        <p className="font-semibold text-muted-foreground">Data de Início</p>
                                        <p>{student.memberSince}</p>
                                   </div>
                                   <div className="lg:col-span-2">
                                        <p className="font-semibold text-muted-foreground">Próximo Vencimento</p>
                                        <p>12 de Ago, 2024</p>
                                   </div>
                                   <div className="col-span-1">
                                        <p className="font-semibold text-muted-foreground">Valor Original</p>
                                        <p>{currentPlan.price}</p>
                                   </div>
                                    <div className="col-span-1">
                                        <p className="font-semibold text-muted-foreground">Desconto</p>
                                        <p>{student.discount.type === 'percentage' ? `${student.discount.value}%` : `R$ ${student.discount.value.toFixed(2)}`}</p>
                                   </div>
                                   <div className="col-span-1">
                                        <p className="font-semibold text-muted-foreground">Valor Final</p>
                                        <p className="text-xl font-bold text-primary">R$ {currentFinalPrice.toFixed(2)}</p>
                                   </div>
                                </div>
                                <div className="border-t pt-8">
                                    <h4 className="font-semibold mb-4 text-card-foreground">Histórico de Alterações</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {planHistory.map((item, index) => (
                                            <div key={index} className="flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                                    <CreditCard className="h-4 w-4 text-muted-foreground"/>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-semibold">{item.action}</p>
                                                    <p className="text-muted-foreground">{item.details}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Alterar Plano</CardTitle>
                             <CardDescription>Selecione um novo plano, aplique descontos e defina a data de vencimento.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-2">
                                <Label>Selecionar Novo Plano</Label>
                                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um plano" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.price})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label>Desconto</Label>
                                    <div className="flex items-center gap-2">
                                        <RadioGroup value={discountType} onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed')} className="flex items-center space-x-1 rounded-lg border bg-card p-1">
                                            <RadioGroupItem value="percentage" id="percentage" className="sr-only"/>
                                            <Label htmlFor="percentage" className={cn("rounded-md px-2.5 py-1.5 text-sm cursor-pointer", discountType === 'percentage' && 'bg-muted font-semibold')}>%</Label>
                                            <RadioGroupItem value="fixed" id="fixed" className="sr-only"/>
                                            <Label htmlFor="fixed" className={cn("rounded-md px-2.5 py-1.5 text-sm cursor-pointer", discountType === 'fixed' && 'bg-muted font-semibold')}>R$</Label>
                                        </RadioGroup>
                                        <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor Final Calculado</Label>
                                    <div className="p-2.5 rounded-lg border bg-muted flex justify-between items-center">
                                        <span className="font-bold text-lg">R$ {finalPrice.toFixed(2)}</span>
                                        {discountValue > 0 && <Badge variant="secondary">Desconto aplicado</Badge>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Nova Data de Vencimento</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : <span>Escolha a data</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedPlanDetails && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Regras e Horários do Plano</CardTitle>
                                <CardDescription>Defina os horários e regras de agendamento para este plano.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedPlanDetails.scheduleType === 'fixed' && (
                                    <div className="space-y-6">
                                        <p className="text-sm text-muted-foreground">Este plano requer horários fixos. Defina os dias, horários e locais para as {selectedPlanDetails.classesPerWeek} aulas semanais.</p>
                                        {fixedSchedules.map((schedule, index) => (
                                            <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/50">
                                                <h4 className="font-semibold">Aula {index + 1}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Dia da Semana</Label>
                                                        <Select onValueChange={(value) => handleScheduleChange(index, 'day', value)} value={schedule.day}>
                                                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="monday">Segunda-feira</SelectItem>
                                                                <SelectItem value="tuesday">Terça-feira</SelectItem>
                                                                <SelectItem value="wednesday">Quarta-feira</SelectItem>
                                                                <SelectItem value="thursday">Quinta-feira</SelectItem>
                                                                <SelectItem value="friday">Sexta-feira</SelectItem>
                                                                <SelectItem value="saturday">Sábado</SelectItem>
                                                                <SelectItem value="sunday">Domingo</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Horário</Label>
                                                        <div className="relative">
                                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                            <Select onValueChange={(value) => handleScheduleChange(index, 'time', value)} value={schedule.time}>
                                                                <SelectTrigger className="pl-10">
                                                                    <SelectValue placeholder="Selecione..." />
                                                                </SelectTrigger>
                                                                <SelectContent className="max-h-60">
                                                                    {timeSlots.map(slot => (
                                                                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Local</Label>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input placeholder="Ex: Academia X" className="pl-10" value={schedule.location} onChange={(e) => handleScheduleChange(index, 'location', e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedPlanDetails.scheduleType === 'flexible' && (
                                    <div>
                                        <h4 className="font-semibold">Horário Flexível</h4>
                                        <p className="text-sm text-muted-foreground">Este plano permite que o aluno agende suas {selectedPlanDetails.classesPerWeek || 'várias'} aulas semanais livremente, conforme disponibilidade.</p>
                                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Nenhuma sessão recorrente será criada. O controle de aulas será feito no momento do agendamento pelo aluno.</p>
                                        </div>
                                    </div>
                                )}
                                {selectedPlanDetails.scheduleType === 'open' && (
                                    <div>
                                        <h4 className="font-semibold">Acesso Livre</h4>
                                        <p className="text-sm text-muted-foreground">Este plano não possui controle de agendamento de aulas.</p>
                                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg">
                                            <p className="text-sm font-medium text-green-800 dark:text-green-300">O aluno tem acesso livre e não precisa agendar sessões.</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                    
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" type="button" onClick={() => router.back()}>Cancelar</Button>
                        <Button type="submit">Salvar Alterações</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PlanPage;
