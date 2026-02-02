'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, List, Dumbbell, MoreVertical, MapPin, Video, AlertTriangle, UserX, CalendarClock, Timer, UserCheck, BarChart3, Receipt, FileWarning, HeartPulse, Flower2, Bike, Waves, Flame, ArrowUpRight, ArrowDownLeft, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { LiveClassCard } from '@/components/dashboard/live-class-card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { isToday, getDay, parseISO, isWithinInterval } from 'date-fns';
import { initialClients } from '@/app/dashboard/clients/page';
import { RecurringClass, getIcon as getClassIcon, classColorStyles } from '@/lib/class-definitions';


const liveClassStudents = [
    { id: '1', name: 'Ana Clara' },
    { id: '2', name: 'Bruno Gomes' },
    { id: '3', name: 'Carla Dias' },
    { id: '4', name: 'Daniel Alves' },
    { id: '5', name: 'Eduarda Lima' },
    { id: '6', name: 'Felipe Costa' },
    { id: '7', name: 'Jennifer H.' },
    { id: '8', name: 'Gabriel Martins' },
    { id: '9', name: 'Heloisa Santos' },
    { id: '10', name: 'Juliana Paiva' },
    { id: '11', name: 'Kaique Rocha' },
    { id: '12', name: 'Livia Andrade' },
];

const kpis = [
  {
    title: 'Alunos Ativos',
    value: '719',
    change: '+15',
    changeType: 'positive',
    description: 'no último mês',
    icon: UserCheck,
    iconBgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  {
    title: 'Receita Mensal',
    value: 'R$ 10.5K',
    change: '+8.2%',
    changeType: 'positive',
    description: 'em relação ao mês anterior',
    icon: BarChart3,
    iconBgColor: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    title: 'Pagamentos Pendentes',
    value: 'R$ 1.2K',
    change: '-5.4%',
    changeType: 'positive',
    description: 'em relação ao mês anterior',
    icon: AlertTriangle,
    iconBgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-500 dark:text-yellow-400',
  },
  {
    title: 'Treinos Hoje',
    value: '42',
    change: '+3',
    changeType: 'positive',
    description: 'em relação a ontem',
    icon: List,
    iconBgColor: 'bg-secondary',
    iconColor: 'text-secondary-foreground',
  },
];

type ScheduleItem = {
    time: string;
    name: string;
    type: string;
    trainer: string;
    capacity: string;
    status: string;
    statusColor: string;
    classType?: 'individual' | 'group' | 'open';
    icon?: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
};

const schedule: ScheduleItem[] = [
    { time: '09:00', name: 'Morning Yoga Flow', type: 'Yoga', trainer: 'Frieda D.', capacity: '18/20', status: 'Finalizado', statusColor: 'bg-muted text-muted-foreground', classType: 'group' },
    { time: '10:30', name: 'HIIT & Cardio Blast', type: 'HIIT', trainer: 'Sarah Jenkins', capacity: '12/15', status: 'Ao Vivo', statusColor: 'bg-green-500 text-white', classType: 'group' },
    { time: '14:00', name: 'Aqua Aerobics', type: 'Natação', trainer: 'Katrina W.', capacity: '5/12', status: 'Em Breve', statusColor: 'bg-secondary text-secondary-foreground', classType: 'group' },
    { time: '17:00', name: 'Power Lifting', type: 'Musculação', trainer: 'John D.', capacity: '8/10', status: 'Em Breve', statusColor: 'bg-secondary text-secondary-foreground', classType: 'group' },
    { time: '19:00', name: 'Crossfit WOD', type: 'Crossfit', trainer: 'Mike R.', capacity: '15/15', status: 'Em Breve', statusColor: 'bg-secondary text-secondary-foreground', classType: 'group' },
]

const getIconForClass = (item: ScheduleItem) => {
    if (item.icon && item.iconBgColor && item.iconColor) {
      return { icon: item.icon, color: item.iconColor, bgColor: item.iconBgColor };
    }

    if (item.classType === 'individual') {
        return { icon: <User className="h-6 w-6" />, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
    }
    if (item.classType === 'group' || item.classType === 'open') {
        return { icon: <Users className="h-6 w-6" />, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' };
    }

    // Fallback for old data or data without classType
    switch (item.type) {
        case 'Yoga': return { icon: <Flower2 className="h-6 w-6" />, color: 'text-primary', bgColor: 'bg-primary/10' };
        case 'HIIT': return { icon: <Flame className="h-6 w-6" />, color: 'text-destructive', bgColor: 'bg-destructive/10' };
        case 'Natação': return { icon: <Waves className="h-6 w-6" />, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
        case 'Musculação': return { icon: <Dumbbell className="h-6 w-6" />, color: 'text-primary', bgColor: 'bg-primary/10' };
        case 'Crossfit': return { icon: <HeartPulse className="h-6 w-6" />, color: 'text-destructive', bgColor: 'bg-destructive/10' };
        default: return { icon: <Users className="h-6 w-6" />, color: 'text-muted-foreground', bgColor: 'bg-muted' };
    }
}


const chartData = [
  { day: 'Seg', value: 45 },
  { day: 'Ter', value: 62 },
  { day: 'Hoje', value: 85, isToday: true },
  { day: 'Qui', value: 55 },
  { day: 'Sex', value: 70 },
  { day: 'Sáb', value: 90 },
  { day: 'Dom', value: 30 },
]

const staticAlerts = [
    {
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'destructive',
        title: 'Aluno Inadimplente',
        description: 'O aluno <span class="font-semibold">Carlos Andrade</span> está inadimplente. O acesso foi bloqueado.',
        action: 'Ver Perfil',
        href: '/dashboard/clients/2'
    },
    {
        icon: <FileWarning className="h-5 w-5" />,
        color: 'yellow',
        title: 'Pagamento Vencido',
        description: 'A aluna <span class="font-semibold">Jennifer H.</span> tem uma fatura de R$ 120 vencida. Ações automáticas serão tomadas em 3 dias.',
        action: 'Enviar Lembrete',
        href: '#'
    },
    {
        icon: <UserX className="h-5 w-5" />,
        color: 'yellow',
        title: 'Alunos Pouco Frequentes',
        description: '3 alunos não participaram de aulas nos últimos 30 dias.',
        action: 'Ver Lista',
        href: '#'
    },
];


export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [now, setNow] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<ScheduleItem | null>(null);
  const [fullSchedule, setFullSchedule] = useState<ScheduleItem[]>(schedule);
  const [alerts, setAlerts] = useState(staticAlerts);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000 * 60);
    
    try {
        let combinedClasses: ScheduleItem[] = [];
        const storedClassesJSON = localStorage.getItem('scheduled_classes');
        if (storedClassesJSON) {
            const storedClasses = JSON.parse(storedClassesJSON).map((c: any) => ({
                ...c,
                date: new Date(c.date)
            }));
            
            const todayStoredClasses = storedClasses.filter((c:any) => isToday(c.date));

            const mappedStoredClasses: ScheduleItem[] = todayStoredClasses.map((c:any) => ({
                 time: c.time,
                 name: c.client,
                 type: c.type,
                 trainer: 'Kristin Watson', 
                 capacity: '1/1',
                 status: 'Em Breve', 
                 statusColor: 'bg-secondary text-secondary-foreground',
                 classType: c.classType,
            }));
            combinedClasses.push(...mappedStoredClasses);
        }

        const recurringClassesJSON = localStorage.getItem('recurring_classes');
        if (recurringClassesJSON) {
          const recurringClasses: RecurringClass[] = JSON.parse(recurringClassesJSON);
          const today = new Date();
          const todayDayOfWeek = getDay(today).toString();
  
          const todayRecurring = recurringClasses
              .filter(cls => {
                  if (cls.status !== 'active') return false;
                  const starts = parseISO(cls.startDate);
                  const ends = cls.endDate ? parseISO(cls.endDate) : new Date(today.getFullYear() + 5, 0, 1);
                  const todayWithoutTime = new Date(new Date().setHours(0,0,0,0));
                  return cls.daysOfWeek.includes(todayDayOfWeek) && isWithinInterval(todayWithoutTime, { start: starts, end: ends });
              })
              .map((cls): ScheduleItem => {
                  const IconC = getClassIcon(cls.icon);
                  const colorData = classColorStyles[cls.color as keyof typeof classColorStyles] || classColorStyles.primary;
                  return {
                      time: cls.time,
                      name: cls.name,
                      type: cls.name,
                      trainer: cls.instructor,
                      capacity: cls.capacity ? `0/${cls.capacity}` : 'Ilimitado',
                      status: 'Em Breve',
                      statusColor: 'bg-secondary text-secondary-foreground',
                      classType: 'group',
                      icon: <IconC className="h-6 w-6" />,
                      iconBgColor: colorData.background,
                      iconColor: colorData.text,
                  };
              });
          combinedClasses.push(...todayRecurring);
        }
        
        setFullSchedule([...schedule, ...combinedClasses]);

    } catch(e) {
        console.error("Failed to load classes from localStorage", e);
        setFullSchedule(schedule);
    }
    
    try {
        let pendingWorkoutsCount = 0;
        const studentIds = initialClients.map(c => c.id);
        const now = new Date();

        studentIds.forEach(id => {
            const workoutsKey = `workouts_${id}`;
            const storedWorkoutsJSON = localStorage.getItem(workoutsKey);
            if (storedWorkoutsJSON) {
                const storedWorkouts = JSON.parse(storedWorkoutsJSON);
                if (Array.isArray(storedWorkouts)) {
                    storedWorkouts.forEach(workout => {
                        if (workout.status === 'Planejado' && workout.scheduling?.type === 'date' && workout.scheduling.date && workout.scheduling.time) {
                            const workoutDateTime = new Date(`${workout.scheduling.date}T${workout.scheduling.time}:00`);
                            const durationInMs = (workout.scheduling.duration || 60) * 60 * 1000;
                            const workoutEndTime = new Date(workoutDateTime.getTime() + durationInMs);

                            if (now > workoutEndTime) {
                                pendingWorkoutsCount++;
                            }
                        }
                    });
                }
            }
        });

        if (pendingWorkoutsCount > 0) {
            const pendingAlert = {
                icon: <CalendarClock className="h-5 w-5" />,
                color: 'yellow',
                title: 'Aula Pendente de Verificação',
                description: `Você tem <span class="font-semibold">${pendingWorkoutsCount} aula(s)</span> para validar.`,
                action: 'Verificar Aulas',
                href: '/dashboard/calendar'
            };
            setAlerts(prev => [pendingAlert, ...prev.filter(a => a.title !== 'Aula Pendente de Verificação' && a.title !== 'Conflito de Agenda')]);
        }
    } catch (e) {
        console.error("Failed to check for pending workouts", e);
    }


    return () => clearInterval(timer);
  }, [isClient]);

  const liveClass = useMemo(() => {
    if (!isClient) return null;
    return fullSchedule.find(item => {
      const [hours, minutes] = item.time.split(':').map(Number);
      const startTime = new Date(now);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Assume 1 hour duration
      
      return now >= startTime && now < endTime;
    });
  }, [now, isClient, fullSchedule]);

  const upcomingClasses = useMemo(() => {
    if (!isClient) return [];
    return fullSchedule.filter(item => {
      const [hours, minutes] = item.time.split(':').map(Number);
      const startTime = new Date(now);
      startTime.setHours(hours, minutes, 0, 0);
      return startTime > now;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [now, isClient, fullSchedule]);


  return (
    <div className="space-y-8">
      <TooltipProvider>
      {isClient && liveClass && (
        <LiveClassCard 
            liveClass={liveClass} 
            getIconForClass={getIconForClass} 
            liveClassStudents={liveClassStudents} 
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => {
          const isGoingUp = kpi.change === 'N/A' ? true : parseFloat(kpi.change) >= 0;
          const ArrowComponent = isGoingUp ? ArrowUpRight : ArrowDownLeft;
          return (
            <Card key={i} className="shadow-soft p-5 flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">{kpi.title}</p>
                <h3 className="text-3xl font-bold text-foreground mb-2">{kpi.value}</h3>
                {kpi.change && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className={`font-bold flex items-center mr-2 ${kpi.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                      <ArrowComponent className="h-4 w-4" />
                      {kpi.change}
                    </span>
                    {kpi.description}
                  </div>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.iconBgColor}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
              </div>
            </Card>
          );
        })}
      </div>
      </TooltipProvider>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-6">
          <div className="xl:col-span-2 flex flex-col gap-6">
            <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedClass(null)}>
              <div className="bg-card rounded-3xl p-6 shadow-soft border">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-foreground font-display">Próximas Aulas</h3>
                      <Link className="text-sm font-medium text-primary hover:text-primary/90" href="/dashboard/calendar">Ver Tudo</Link>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                          <thead>
                              <tr className="text-xs font-bold text-muted-foreground uppercase border-b">
                                  <th className="py-3 pl-2">Horário</th>
                                  <th className="py-3">Nome da Aula</th>
                                  <th className="py-3">Treinador</th>
                                  <th className="py-3 text-right">Capacidade</th>
                                  <th className="py-3 text-right pr-2">Status</th>
                              </tr>
                          </thead>
                           {isClient && (
                              <tbody className="text-sm">
                                  {upcomingClasses.map(item => (
                                    <DialogTrigger asChild key={item.name}>
                                        <tr onClick={() => setSelectedClass(item)} className="group hover:bg-muted/50 transition-colors cursor-pointer">
                                            <td className="py-4 pl-2 font-medium text-foreground">{item.time}</td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconForClass(item).bgColor} ${getIconForClass(item).color}`}>
                                                        {getIconForClass(item).icon}
                                                    </div>
                                                    <span className="font-medium text-foreground">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-muted-foreground">{item.trainer}</td>
                                            <td className="py-4 text-right text-muted-foreground">{item.capacity}</td>
                                            <td className="py-4 text-right pr-2">
                                                <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${item.statusColor}`}>{item.status}</span>
                                            </td>
                                        </tr>
                                    </DialogTrigger>
                                  ))}
                              </tbody>
                          )}
                      </table>
                  </div>
              </div>
               {selectedClass && (
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                       <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconForClass(selectedClass).bgColor} ${getIconForClass(selectedClass).color}`}>
                          {getIconForClass(selectedClass).icon}
                       </div>
                       {selectedClass.name}
                    </DialogTitle>
                    <DialogDescription>
                      Detalhes da aula agendada.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4 text-sm">
                    <div>
                      <p className="font-semibold text-muted-foreground">Instrutor</p>
                      <p className="font-bold">{selectedClass.trainer}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Horário</p>
                      <p className="font-bold">{selectedClass.time}</p>
                    </div>
                     <div>
                      <p className="font-semibold text-muted-foreground">Capacidade</p>
                      <p className="font-bold">{selectedClass.capacity}</p>
                    </div>
                     <div>
                      <p className="font-semibold text-muted-foreground">Status</p>
                      <Badge variant="outline" className={selectedClass.statusColor}>{selectedClass.status}</Badge>
                    </div>
                  </div>
                </DialogContent>
              )}
            </Dialog>
              <div className="bg-card rounded-3xl p-6 shadow-soft border">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-foreground font-display">Treinos por Dia</h3>
                      <select className="text-xs bg-muted border-none rounded-lg text-muted-foreground py-1.5 focus:ring-primary">
                          <option>Esta Semana</option>
                          <option>Semana Passada</option>
                      </select>
                  </div>
                  <div className="flex items-end justify-between h-48 w-full gap-2 sm:gap-4 px-2">
                      {chartData.map(item => (
                          <div key={item.day} className="flex flex-col items-center gap-2 w-full group">
                              <div className="w-full bg-muted/50 rounded-t-xl relative h-40 overflow-hidden group-hover:bg-muted transition-colors">
                                  <div className={`absolute bottom-0 left-0 w-full rounded-t-xl transition-all duration-500 ${item.isToday ? 'bg-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]' : 'bg-muted-foreground/20'}`} style={{height: `${item.value}%`}}></div>
                              </div>
                              <span className={`text-xs font-medium ${item.isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{item.day}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
          <div className="xl:col-span-1">
              <div className="bg-card rounded-3xl p-6 shadow-soft h-full border flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-foreground font-display">Alertas Importantes</h3>
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                          <MoreVertical className="h-5 w-5" />
                      </button>
                  </div>
                  <div className="space-y-4 flex-1">
                      {alerts.map(alert => (
                        <div key={alert.title} className={`flex gap-4 p-4 rounded-xl ${alert.color === 'destructive' ? 'bg-destructive/10' : alert.color === 'yellow' ? 'bg-orange-400/10' : 'bg-blue-400/10' } border-l-4 ${alert.color === 'destructive' ? 'border-destructive' : alert.color === 'yellow' ? 'border-orange-400' : 'border-blue-400'}`}>
                            <div className={`mt-1 flex-shrink-0 ${alert.color === 'destructive' ? 'text-destructive' : alert.color === 'yellow' ? 'text-orange-500' : 'text-blue-500' }`}>
                                {alert.icon}
                            </div>
                            <div>
                                <h4 className={`text-sm font-bold text-foreground`}>{alert.title}</h4>
                                <p className={`text-xs text-muted-foreground mt-1 mb-2`} dangerouslySetInnerHTML={{__html: alert.description}}></p>
                                <Link href={alert.href || '#'}>
                                  <button className={`text-xs font-semibold hover:underline ${alert.color === 'destructive' ? 'text-destructive' : alert.color === 'yellow' ? 'text-orange-600' : 'text-blue-600' } uppercase tracking-wide`}>{alert.action}</button>
                                </Link>
                            </div>
                        </div>
                      ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                      Ver Todas as Notificações
                  </Button>
              </div>
          </div>
      </div>
    </div>
  );
}
