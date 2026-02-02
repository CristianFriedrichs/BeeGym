'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dumbbell,
    TrendingUp,
    MessageSquare,
    CheckCircle,
    Clock,
    Calendar,
    Repeat,
    Ruler,
    ChevronRight,
    Edit,
    Trash,
    UserCheck,
    CreditCard,
    WalletCards,
    User as UserIcon,
    Percent,
    Plus,
    CalendarIcon,
    AlertTriangle,
    Building,
} from "lucide-react";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format, isBefore, addDays, getDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import type { Measurement } from './measurements/page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { plans } from '@/lib/plans';


// Mock data - replace with actual data fetching
export const students = [
    {
        id: 1,
        name: 'Milos Vasiljevic',
        email: 'milos@example.com',
        phone: '(11) 98765-4321',
        address: 'Rua das Flores, 123, São Paulo, SP',
        objetivo: 'Hipertrofia',
        plan: 'gold',
        memberSince: '12 de Jan, 2023',
        status: 'Ativo',
        avatar: 'https://i.pravatar.cc/150?img=13',
        goals: 'Hipertrofia e definição muscular.',
        restrictions: 'Nenhuma restrição física conhecida.',
        notes: 'Aluno dedicado e com boa evolução nos treinos de força.',
        discount: { type: 'percentage', value: 10 },
        measurements: {
            height: 182, // in cm
        },
        cpf: '123.456.789-00',
        birthDate: new Date('1990-05-15'),
        sex: 'Masculino',
        primaryUnitId: 'unit-1',
        unitMemberships: ['unit-1'],
    },
    {
        id: 2,
        name: 'Jovana Pavlovic',
        email: 'jovana@example.com',
        phone: '(11) 98765-4321',
        address: 'Rua das Flores, 123, São Paulo, SP',
        objetivo: 'Emagrecimento',
        plan: 'silver',
        memberSince: '12 de Fev, 2023',
        status: 'Inadimplente',
        avatar: 'https://i.pravatar.cc/150?img=16',
        goals: 'Perda de peso e melhora do condicionamento cardiovascular.',
        restrictions: 'Leve desconforto no joelho direito.',
        notes: 'Excelente adesão ao plano alimentar e treinos aeróbicos.',
        discount: { type: 'fixed', value: 20 },
        measurements: {
            height: 168, // in cm
        },
        cpf: '234.567.890-11',
        birthDate: new Date('1992-10-20'),
        sex: 'Feminino',
        primaryUnitId: 'unit-1',
        unitMemberships: ['unit-1'],
    },
    {
        id: 3,
        name: 'Nikola Vujinovic',
        email: 'nikola@example.com',
        phone: '(11) 98765-4321',
        address: 'Rua das Flores, 123, São Paulo, SP',
        objetivo: 'Qualidade de Vida',
        plan: 'gold',
        memberSince: '12 de Mar, 2023',
        status: 'Pendente',
        avatar: 'https://i.pravatar.cc/150?img=15',
        goals: 'Aumentar a disposição e reduzir o estresse.',
        restrictions: 'Nenhuma.',
        notes: 'Prefere treinos ao ar livre.',
        discount: { type: 'percentage', value: 0 },
        measurements: {
            height: 175, // in cm
        },
        cpf: '345.678.901-22',
        birthDate: new Date('1988-03-25'),
        sex: 'Masculino',
        primaryUnitId: 'unit-2',
        unitMemberships: ['unit-2'],
    },
    {
        id: 4,
        name: "Ana Clara",
        email: "ana.clara@example.com",
        phone: "(11) 98765-4321",
        address: "Rua das Flores, 123, São Paulo, SP",
        objetivo: "Definição Muscular",
        plan: "pro",
        status: "Ativo",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop",
        memberSince: "12 de Jan, 2023",
        goals: "Hipertrofia e definição muscular.",
        restrictions: "Nenhuma restrição física conhecida.",
        notes: "Aluna dedicada e com boa evolução nos treinos de força.",
        discount: { type: 'percentage', value: 10 },
        measurements: {
            height: 165, // in cm
        },
        cpf: '456.789.012-33',
        birthDate: new Date('1995-08-10'),
        sex: 'Feminino',
        primaryUnitId: 'unit-1',
        unitMemberships: ['unit-1', 'unit-2'],
    }
];

const initialMeasurementsForAna: Measurement[] = [
    { date: '2024-03-01', peso: 70.0, imc: 25.7, gordura: 24, dobra: 20 },
    { date: '2024-03-08', peso: 69.5, imc: 25.5, gordura: 23.5, dobra: 19 },
    { date: '2024-03-15', peso: 69.0, imc: 25.3, gordura: 23, dobra: 18 },
    { date: '2024-03-22', peso: 68.8, imc: 25.2, gordura: 22.5, dobra: 17 },
    { date: '2024-03-29', peso: 68.5, imc: 25.1, gordura: 22, dobra: 16 },
    { date: '2024-04-05', peso: 68.2, imc: 25.0, gordura: 21.8, dobra: 15 },
];


type MeasurementType = 'Peso' | 'IMC' | '% Gordura' | 'Dobra Cutânea';
const measurementKeyMap: { [key in MeasurementType]: keyof Measurement } = {
    'Peso': 'peso',
    'IMC': 'imc',
    '% Gordura': 'gordura',
    'Dobra Cutânea': 'dobra',
};


const frequencyHistory = [
    { date: "15/04/2024", status: "Realizado" },
    { date: "12/04/2024", status: "Realizado" },
    { date: "10/04/2024", status: "Realizado" },
    { date: "08/04/2024", status: "Falta" },
    { date: "05/04/2024", status: "Realizado" },
];


type Message = {
    id: number;
    content: string;
    sender: 'me' | 'client';
    timestamp: string;
    status: string;
}

const initialMessages = [
    { id: 1, content: "Olá! Seu novo plano de treinos para esta semana já está disponível no app. Qualquer dúvida é só chamar!", sender: 'me', timestamp: "10:40", status: "read"},
    { id: 2, content: "Ok, muito obrigada! Até amanhã.", sender: 'client', timestamp: "10:42", status: "read" },
];

type ProcessedWorkout = {
    id: number;
    name: string;
    date: string;
    status: string;
}

const statusStyles: { [key: string]: string } = {
    'Pago': 'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Pendente': 'border-transparent bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Atrasado': 'border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Cancelado': 'border-transparent bg-foreground text-background',
}

const StudentDetailPage = () => {
  const params = useParams();
  const studentId = parseInt(params.id as string, 10);
  const student = students.find(s => s.id === studentId);

  const [isActive, setIsActive] = useState(student?.status !== 'Inativo');
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  
  const [measurementHistory, setMeasurementHistory] = useState<Measurement[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  const [units, setUnits] = useState<any[]>([]);
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);

  useEffect(() => {
    const storedUnits = JSON.parse(localStorage.getItem('units_data') || '[]');
    setUnits(storedUnits);
    const storedCurrentUnitId = localStorage.getItem('currentUnitId');
    setCurrentUnitId(storedCurrentUnitId);
  }, []);
  
  const handleInactivate = () => {
    setIsActive(false);
    toast({
        title: "Aluno inativado com sucesso",
    });
  }

  const handleActivate = () => {
      setIsActive(true);
      toast({
          title: "Aluno ativado com sucesso",
      });
  }

  const sortedMeasurements = useMemo(() => {
    if (!Array.isArray(measurementHistory)) return [];
    return [...measurementHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [measurementHistory]);

  const latestMeasurement = sortedMeasurements[0] || null;

  const currentPlan = useMemo(() => {
    if (!student) return null;
    return plans.find(p => p.id === student.plan);
  }, [student]);

  const studentPrimaryUnit = useMemo(() => {
    if (!student || units.length === 0) return null;
    return units.find(u => u.id === student.primaryUnitId);
  }, [student, units]);

  const studentData = useMemo(() => {
    if (!student) return null;
    return {
      name: student.name,
      email: student.email,
      phone: student.phone,
      address: student.address,
      goals: student.goals,
      restrictions: student.restrictions,
      notes: student.notes,
      avatar: student.avatar,
      plan: student.plan,
      memberSince: student.memberSince,
      discount: student.discount,
      measurements: {
        height: `${(student.measurements.height / 100).toFixed(2)} m`,
        weight: latestMeasurement?.peso ? `${latestMeasurement.peso.toFixed(1)} kg` : 'N/A',
      },
      unitName: studentPrimaryUnit?.name || 'Unidade não informada'
    };
  }, [student, latestMeasurement, studentPrimaryUnit]);

  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementType>('Peso');

  const [assignedWorkouts, setAssignedWorkouts] = useState<ProcessedWorkout[]>([]);

    useEffect(() => {
        if (!student) return;

        // Fetch Measurements
        try {
            const measurementKey = `measurements_${student.id}`;
            const storedMeasurementsJSON = localStorage.getItem(measurementKey);
            if (storedMeasurementsJSON) {
                const parsedMeasurements = JSON.parse(storedMeasurementsJSON);
                if (Array.isArray(parsedMeasurements)) {
                    setMeasurementHistory(parsedMeasurements);
                } else {
                     const defaultData = student.id === 4 ? initialMeasurementsForAna : [];
                    localStorage.setItem(measurementKey, JSON.stringify(defaultData));
                    setMeasurementHistory(defaultData);
                }
            } else {
                const defaultData = student.id === 4 ? initialMeasurementsForAna : [];
                localStorage.setItem(measurementKey, JSON.stringify(defaultData));
                setMeasurementHistory(defaultData);
            }
        } catch (error) {
            console.error("Failed to load measurements from localStorage", error);
            setMeasurementHistory(student?.id === 4 ? initialMeasurementsForAna : []);
        }

        // Fetch Payments
        try {
            const storedInvoices = localStorage.getItem('invoices_data');
            if(storedInvoices) {
                const allInvoices = JSON.parse(storedInvoices);
                const studentInvoices = allInvoices.filter((inv: any) => inv.studentId === student.id && inv.unitId === currentUnitId);
                setPaymentHistory(studentInvoices);
            }
        } catch(error) {
            console.error("Failed to load invoices from localStorage", error);
        }

    }, [student, currentUnitId]);

    const getNextOccurrence = (scheduling: any): Date | null => {
        if (!scheduling || scheduling.type !== 'recurring' || !scheduling.daysOfWeek?.length) return null;
    
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startDate = new Date(scheduling.startDate);
        const endDate = new Date(scheduling.endDate);
        
        const safeStartDate = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
        const safeEndDate = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());

        if (today > safeEndDate) return null; // Recurrence has ended
    
        const startFrom = today < safeStartDate ? safeStartDate : today;
        const weekDays = scheduling.daysOfWeek.map(Number).sort();
    
        for (let i = 0; i < 7; i++) {
            const nextDay = addDays(startFrom, i);
            if (nextDay > safeEndDate) return null;
            if (weekDays.includes(getDay(nextDay))) {
                return nextDay;
            }
        }
        return null;
    };

  useEffect(() => {
    if (!student) return;

    try {
      const workoutsKey = `workouts_${student.id}`;
      const storedWorkoutsJSON = localStorage.getItem(workoutsKey);
      const storedWorkouts = storedWorkoutsJSON ? JSON.parse(storedWorkoutsJSON) : [];
      const now = new Date();

      if (Array.isArray(storedWorkouts)) {
          const processedWorkouts = storedWorkouts
            .filter((workout: any) => workout.unitId === currentUnitId)
            .map((workout: any): ProcessedWorkout | null => {
              let dateInfo: string;
              let effectiveStatus = workout.status || 'Planejado';
              
              if (workout.scheduling?.type === 'date' && workout.scheduling.date) {
                  const workoutDateTime = new Date(`${workout.scheduling.date}T${workout.scheduling.time || '00:00:00'}`);
                  dateInfo = format(workoutDateTime, "dd/MM/yyyy", { locale: ptBR });
                  
                  if (workout.status === 'Planejado') {
                    const durationInMs = (workout.scheduling.duration || 60) * 60 * 1000;
                    const workoutEndTime = new Date(workoutDateTime.getTime() + durationInMs);

                    if (now > workoutEndTime) {
                        effectiveStatus = 'Pendente';
                    } else if (now >= workoutDateTime && now <= workoutEndTime) {
                        effectiveStatus = 'Em Execução';
                    }
                  }
              } else if (workout.scheduling?.type === 'recurring') {
                  const nextDate = getNextOccurrence(workout.scheduling);
                  if (nextDate) {
                      dateInfo = format(nextDate, "dd/MM/yyyy", { locale: ptBR });
                      effectiveStatus = "Recorrente";
                  } else {
                      return null; 
                  }
              } else {
                  return null;
              }
              
              return {
                  id: workout.id,
                  name: workout.name,
                  date: dateInfo,
                  status: effectiveStatus,
              };
          }).filter((w): w is ProcessedWorkout => w !== null);

          setAssignedWorkouts(processedWorkouts);
      }
    } catch (error) {
      console.error("Failed to load workouts from localStorage", error);
      setAssignedWorkouts([]);
    }
  }, [student, currentUnitId]);
  
  if (!student || !studentData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Aluno não encontrado.</p>
      </div>
    );
  }

  const isDelinquent = student.status === 'Inadimplente';
  const isStudentInActiveUnit = student.unitMemberships.includes(currentUnitId || '');

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast({
        title: 'Mensagem vazia',
        description: 'Por favor, escreva uma mensagem para enviar.',
        variant: 'destructive',
      });
      return;
    }
  
    const messageToSend: Message = {
        id: Date.now(),
        content: message,
        sender: 'me',
        timestamp: format(new Date(), "HH:mm"),
        status: 'sent'
    };
  
    try {
        const storedMessagesKey = `chat_messages_${student.id}`;
        const storedMessagesJSON = localStorage.getItem(storedMessagesKey);
        const existingMessages = storedMessagesJSON ? JSON.parse(storedMessagesJSON) : (student.id === 4 ? initialMessages : []);
  
        const updatedMessages = [...existingMessages, messageToSend];
        
        localStorage.setItem(storedMessagesKey, JSON.stringify(updatedMessages));
  
        toast({
          title: 'Mensagem enviada!',
          description: `Sua mensagem para ${studentData?.name} foi enviada com sucesso.`,
        });
        setMessage('');
        setIsMessageDialogOpen(false);
  
    } catch (error) {
        console.error("Could not access localStorage", error);
         toast({
            title: 'Erro ao enviar mensagem',
            description: 'Não foi possível salvar a mensagem. Verifique as permissões do seu navegador.',
            variant: 'destructive',
        });
    }
  };
  
  const currentPlanName = currentPlan?.name || 'Plano não encontrado';
  const coverGradient = currentPlan?.gradient || 'linear-gradient(110deg,#ff8c004d_0%,#ffc07880_100%)';
  
  const chartData = useMemo(() => {
    if (measurementHistory.length === 0) return [];
    
    const key = measurementKeyMap[selectedMeasurement];
    if (!key) return [];
    
    return measurementHistory
        .slice(-5)
        .map(m => ({
            date: format(parseISO(m.date), "dd/MM"),
            value: m[key] ?? 0,
        }));
  }, [selectedMeasurement, measurementHistory]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-muted/40 min-h-screen">
      {!isStudentInActiveUnit && (
        <Alert variant="default" className="mb-8 bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700">
            <AlertTriangle className="h-4 w-4 !text-yellow-800 dark:!text-yellow-300" />
            <AlertTitle>Contexto de Unidade Diferente</AlertTitle>
            <AlertDescription>
                Você está visualizando este aluno no contexto da unidade ativa, mas ele pertence a outra. Algumas ações podem estar desabilitadas.
            </AlertDescription>
        </Alert>
      )}
      {isDelinquent && (
        <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Pagamento Pendente</AlertTitle>
            <AlertDescription>
                Este aluno está inadimplente. O acesso a novas aulas e funcionalidades está restrito até a regularização do pagamento.
            </AlertDescription>
        </Alert>
      )}
      <Card className="overflow-hidden shadow-soft rounded-3xl">
        <div 
          className="h-32 md:h-40 bg-cover bg-center"
          style={{ backgroundImage: coverGradient }}
        />
        <CardHeader className="pt-0">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="flex flex-col items-center w-full md:w-auto -mt-16">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-lg shrink-0">
                        <AvatarImage src={studentData.avatar} alt={studentData.name}/>
                        <AvatarFallback>{studentData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="md:hidden mt-4 text-center">
                        <CardTitle className="text-3xl font-bold text-foreground">{studentData.name}</CardTitle>
                        <div className="flex items-center justify-center gap-3 mt-1">
                            <CardDescription className="text-primary font-semibold">{currentPlanName}</CardDescription>
                            <Badge variant={isActive ? 'default' : 'destructive'}>{isActive ? 'Ativo' : 'Inativo'}</Badge>
                            {student.status === 'Inadimplente' && isActive && <Badge variant="destructive">Inadimplente</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Membro desde {studentData.memberSince}</p>
                    </div>
                </div>
                
                <div className="hidden md:flex flex-1 flex-col">
                    <CardTitle className="text-3xl font-bold text-foreground">{studentData.name}</CardTitle>
                    <div className="flex items-center gap-3 mt-1">
                        <CardDescription className="text-primary font-semibold">{currentPlanName}</CardDescription>
                        <Badge variant={isActive ? 'default' : 'destructive'}>{isActive ? 'Ativo' : 'Inativo'}</Badge>
                        {student.status === 'Inadimplente' && isActive && <Badge variant="destructive">Inadimplente</Badge>}
                        {student.status === 'Pendente' && isActive && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Pag. Pendente</Badge>}
                    </div>
                     <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Building className="h-4 w-4" />
                        <span>{studentData.unitName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Membro desde {studentData.memberSince}</p>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className="flex gap-4 text-center">
                      <div>
                          <p className="font-bold text-xl text-foreground">{studentData.measurements.height.split(' ')[0]}</p>
                          <p className="text-xs text-muted-foreground">Altura</p>
                      </div>
                      <div>
                          <p className="font-bold text-xl text-foreground">{studentData.measurements.weight.split(' ')[0]}</p>
                          <p className="text-xs text-muted-foreground">Peso</p>
                      </div>
                  </div>
                  <div className="flex justify-center md:justify-end flex-wrap gap-2">
                    <TooltipProvider delayDuration={100}>
                        <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="icon" className="rounded-full">
                                            <MessageSquare className="h-5 w-5" />
                                        </Button>
                                    </DialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>Enviar Mensagem</p></TooltipContent>
                            </Tooltip>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Enviar mensagem para {studentData.name}</DialogTitle>
                                    <DialogDescription>
                                        Sua mensagem será enviada e ficará registrada no histórico de conversas.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <Textarea
                                        placeholder="Digite sua mensagem aqui..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="min-h-[120px]"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>Cancelar</Button>
                                    <Button onClick={handleSendMessage}>Enviar</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="outline" size="icon" className="rounded-full" disabled={isDelinquent || !isStudentInActiveUnit}>
                                    <Link href={`/dashboard/clients/${student.id}/workouts`}>
                                        <Dumbbell className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{isDelinquent ? 'Pagamento pendente' : !isStudentInActiveUnit ? 'Aluno não pertence a esta unidade' : 'Gerenciar Treinos'}</p></TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="outline" size="icon" className="rounded-full" disabled={isDelinquent || !isStudentInActiveUnit}>
                                    <Link href={`/dashboard/clients/${student.id}/measurements`}>
                                        <Ruler className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{isDelinquent ? 'Pagamento pendente' : !isStudentInActiveUnit ? 'Aluno não pertence a esta unidade' : 'Adicionar Medidas'}</p></TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="outline" size="icon" className="rounded-full">
                                  <Link href={`/dashboard/clients/${student.id}/edit`}>
                                    <Edit className="h-5 w-5" />
                                  </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Editar Perfil</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="outline" size="icon" className="rounded-full" disabled={isDelinquent}>
                                  <Link href={`/dashboard/clients/${student.id}/plan`}>
                                    <CreditCard className="h-5 w-5" />
                                  </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{isDelinquent ? 'Pagamento pendente' : 'Gerenciar Plano'}</p></TooltipContent>
                        </Tooltip>

                        {isActive ? (
                            <AlertDialog>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="icon" className="rounded-full text-destructive hover:text-destructive hover:border-destructive/50 hover:bg-destructive/10">
                                                <Trash className="h-5 w-5" />
                                            </Button>
                                        </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Inativar Aluno</p></TooltipContent>
                                </Tooltip>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Inativar aluno?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Ao inativar este aluno, ele não poderá agendar novos treinos e os treinos futuros serão cancelados. Seus dados e histórico serão preservados.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleInactivate}>Confirmar Inativação</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <AlertDialog>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="icon" className="rounded-full text-green-500 hover:text-green-600 hover:border-green-500/50 hover:bg-green-500/10">
                                                <UserCheck className="h-5 w-5" />
                                            </Button>
                                        </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Ativar Aluno</p></TooltipContent>
                                </Tooltip>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Ativar aluno?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Ao ativar este aluno, ele poderá voltar a agendar treinos e o plano ficará ativo novamente. O histórico será mantido.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleActivate}>Confirmar Ativação</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </TooltipProvider>
                </div>
              </div>
            </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="shadow-soft rounded-3xl xl:col-span-1">
          <CardHeader>
              <div className="flex justify-between items-center">
                  <div>
                      <CardTitle className="flex items-center gap-3"><TrendingUp className="text-primary"/> Evolução de Medidas</CardTitle>
                      <CardDescription>Acompanhe o progresso das medidas corporais.</CardDescription>
                  </div>
                    <Select value={selectedMeasurement} onValueChange={(value) => setSelectedMeasurement(value as MeasurementType)}>
                      <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecionar Medida" />
                      </SelectTrigger>
                      <SelectContent>
                          {Object.keys(measurementKeyMap).map(key => (
                              <SelectItem key={key} value={key}>{key}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
          </CardHeader>
          <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                      <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                       <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                  </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-end mt-4">
                <Button variant="link" asChild>
                    <Link href={`/dashboard/clients/${student.id}/measurements`}>
                        Ver Todos
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft rounded-3xl xl:col-span-1">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-3"><Repeat className="text-primary"/>Treinos</CardTitle>
                        <CardDescription>Planos de treino ativos para {studentData.name}.</CardDescription>
                    </div>
                    <Button variant="link" asChild>
                        <Link href={`/dashboard/clients/${student.id}/workouts`}>Ver todos</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {assignedWorkouts.length > 0 ? (
                    assignedWorkouts.slice(0, 3).map((workout) => (
                    <Link key={workout.id} href={`/dashboard/clients/${student.id}/workouts?workoutId=${workout.id}`} className="block">
                        <div className="p-3 bg-muted/50 rounded-lg grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 hover:bg-muted transition-colors">
                            <div className="font-semibold text-foreground">{workout.name}</div>
                            <div className="text-sm text-muted-foreground">{workout.date}</div>
                             <Badge 
                                variant="outline"
                                className={cn(
                                    'font-semibold',
                                    workout.status === 'Realizado' && 'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                    workout.status === 'Pendente' && 'border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                                    workout.status === 'Em Execução' && 'border-transparent bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                                    (workout.status === 'Planejado' || workout.status === 'Prevista') && 'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                    workout.status === 'Falta' && 'border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                    workout.status === 'Recorrente' && 'border-transparent bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                )}
                            >
                                {workout.status === 'Planejado' ? 'Prevista' : workout.status}
                            </Badge>
                            <ChevronRight className="text-muted-foreground h-5 w-5 justify-self-end"/>
                        </div>
                    </Link>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum treino cadastrado para esta unidade.</p>
                )}
            </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <Card className="shadow-soft rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3"><Calendar className="text-primary"/> Frequência</CardTitle>
              <Button variant="link" asChild>
                  <Link href={`/dashboard/clients/${student.id}/frequency`}>Ver Todos</Link>
              </Button>
          </CardHeader>
          <CardContent className="space-y-3">
              {frequencyHistory.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                      {item.status === "Realizado" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-red-500" />}
                      <p className="font-medium text-foreground">{item.date}</p>
                  </div>
                  <Badge variant={item.status === "Realizado" ? "default" : "destructive"} className={cn(item.status === "Realizado" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-500/20")}>{item.status}</Badge>
              </div>
              ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <Card className="shadow-soft rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3"><WalletCards className="text-primary"/> Últimos Pagamentos</CardTitle>
                 <Button variant="link" asChild>
                  <Link href={`/dashboard/clients/${student.id}/payments`}>Ver Todos</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {paymentHistory.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center text-sm p-3 rounded-lg hover:bg-muted/50">
                        <div>
                            <p className="font-medium text-foreground">{format(parseISO(payment.dueDate), "dd 'de' MMM, yyyy", { locale: ptBR })}</p>
                            <p className="text-xs text-muted-foreground">R$ {payment.amount.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <Badge 
                            variant="outline"
                            className={cn('font-semibold', statusStyles[payment.status as keyof typeof statusStyles])}
                        >
                            {payment.status}
                        </Badge>
                    </div>
                ))}
                 {paymentHistory.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum pagamento encontrado para esta unidade.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDetailPage;

    