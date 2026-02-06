'use client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, List, Dumbbell, MoreVertical, MapPin, Video, AlertTriangle, UserX, CalendarClock, Timer, UserCheck, BarChart3, Receipt, FileWarning, HeartPulse, Flower2, Bike, Waves, Flame, ArrowUpRight, ArrowDownLeft, User } from 'lucide-react';
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
import { getKPIs, getUpcomingClasses, getAlerts, KPI, ScheduleItem, Alert } from '@/services/supabase/dashboard';
import DOMPurify from 'dompurify';

// Helper to map icon name to component
const getIconComponent = (name: string) => {
  switch (name) {
    case 'UserCheck': return UserCheck;
    case 'BarChart3': return BarChart3;
    case 'AlertTriangle': return AlertTriangle;
    case 'List': return List;
    case 'UserX': return UserX;
    case 'FileWarning': return FileWarning;
    case 'CalendarClock': return CalendarClock;
    default: return Users;
  }
}

// Helper for class icons (legacy + new)
const getIconForClass = (item: ScheduleItem) => {
  // If we have specific icon/color from DB service (not fully implemented yet in service but prepared)
  // For now falling back to type-based logic similar to before, but compatible with new type
  if (item.classType === 'individual') {
    return { icon: <User className="h-6 w-6" />, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
  }
  // Default group/open
  switch (item.type) {
    case 'Yoga': return { icon: <Flower2 className="h-6 w-6" />, color: 'text-primary', bgColor: 'bg-primary/10' };
    case 'HIIT': return { icon: <Flame className="h-6 w-6" />, color: 'text-destructive', bgColor: 'bg-destructive/10' };
    case 'Natação': return { icon: <Waves className="h-6 w-6" />, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
    case 'Musculação': return { icon: <Dumbbell className="h-6 w-6" />, color: 'text-primary', bgColor: 'bg-primary/10' };
    case 'Crossfit': return { icon: <HeartPulse className="h-6 w-6" />, color: 'text-destructive', bgColor: 'bg-destructive/10' };
    default: return { icon: <Users className="h-6 w-6" />, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' };
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

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [now, setNow] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<ScheduleItem | null>(null);

  // Data State
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<ScheduleItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock Unit ID - should be replaced with context or dynamic state
  const [currentUnitId, setCurrentUnitId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Attempt to get from local storage or eventually from context
    const storedUnitId = localStorage.getItem('currentUnitId');
    // If not valid UUID or null, we might leave it undefined and let service handle it (return empty)
    if (storedUnitId && storedUnitId.length > 10) {
      setCurrentUnitId(storedUnitId);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000 * 60);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [kpiData, classData, alertData] = await Promise.all([
          getKPIs(currentUnitId),
          getUpcomingClasses(currentUnitId),
          getAlerts(currentUnitId)
        ]);
        setKpis(kpiData);
        setUpcomingClasses(classData);
        setAlerts(alertData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (isClient) { // Only fetch on client
      fetchData();
    }
  }, [isClient, currentUnitId]);

  const liveClass = useMemo(() => {
    if (!isClient) return null;
    // Simple find logic for now
    return upcomingClasses.find(item => {
      // Assuming item.date is a Date object from service
      const startTime = new Date(item.date || new Date());
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Assume 1 hour duration
      return now >= startTime && now < endTime;
    });
  }, [now, isClient, upcomingClasses]);


  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check local storage for welcome flag
    const welcomeSeen = localStorage.getItem('beegym_welcome_seen');
    if (!welcomeSeen) {
      // Get user name for personalization
      const getUser = async () => {
        const { data } = await import('@/lib/supabase/client').then(m => m.createClient().auth.getUser());
        if (data.user) {
          setUserName(data.user.user_metadata?.full_name?.split(' ')[0] || '');
          setShowWelcome(true);
        }
      };
      getUser();
    }
  }, []);

  const handleCloseWelcome = (goToSettings: boolean) => {
    setShowWelcome(false);
    localStorage.setItem('beegym_welcome_seen', 'true');
    if (goToSettings) {
      // Logic handled via Link
    }
  };

  return (
    <div className="space-y-8">
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#00173F]">Bem-vindo ao BeeGym! 🚀</DialogTitle>
            <DialogDescription className="pt-2">
              Obrigado por escolher o BeeGym <span className="font-bold text-[#00173F]">{userName}</span>, que tal iniciar a configuração do seu Sistema?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => handleCloseWelcome(false)} className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200">
              Agora Não
            </Button>
            <Link href="/dashboard/settings" onClick={() => handleCloseWelcome(true)}>
              <Button className="bg-[#ff8c00] hover:bg-[#e67e00] text-white font-bold">
                Sim, configurar
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <TooltipProvider>
        {/* Live Class Card - Placeholder logic for now since we need live data */}
        {isClient && liveClass && (
          <LiveClassCard
            liveClass={liveClass}
            getIconForClass={getIconForClass}
            liveClassStudents={[]} // Mocked empty for now as it requires another service call
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center text-muted-foreground py-10">Carregando KPIs...</div>
          ) : kpis.map((kpi, i) => {
            const isGoingUp = kpi.change === 'N/A' ? true : parseFloat(kpi.change) >= 0;
            const ArrowComponent = isGoingUp ? ArrowUpRight : ArrowDownLeft;
            const IconComponent = getIconComponent(kpi.iconName);

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
                  <IconComponent className={`h-6 w-6 ${kpi.iconColor}`} />
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
                      {isLoading ? (
                        <tr><td colSpan={5} className="py-4 text-center">Carregando aulas...</td></tr>
                      ) : upcomingClasses.length === 0 ? (
                        <tr><td colSpan={5} className="py-4 text-center">Nenhuma aula agendada.</td></tr>
                      ) : upcomingClasses.map(item => (
                        <DialogTrigger asChild key={item.name + item.time}>
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
                    <div className={`absolute bottom-0 left-0 w-full rounded-t-xl transition-all duration-500 ${item.isToday ? 'bg-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]' : 'bg-muted-foreground/20'}`} style={{ height: `${item.value}%` }}></div>
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
              {isLoading ? (
                <div className="text-center text-muted-foreground text-sm">Carregando alertas...</div>
              ) : alerts.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm">Nenhum alerta.</div>
              ) : alerts.map(alert => {
                const AlertIcon = getIconComponent(alert.iconName);
                return (
                  <div key={alert.title} className={`flex gap-4 p-4 rounded-xl ${alert.color === 'destructive' ? 'bg-destructive/10' : alert.color === 'yellow' ? 'bg-orange-400/10' : 'bg-blue-400/10'} border-l-4 ${alert.color === 'destructive' ? 'border-destructive' : alert.color === 'yellow' ? 'border-orange-400' : 'border-blue-400'}`}>
                    <div className={`mt-1 flex-shrink-0 ${alert.color === 'destructive' ? 'text-destructive' : alert.color === 'yellow' ? 'text-orange-500' : 'text-blue-500'}`}>
                      <AlertIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold text-foreground`}>{alert.title}</h4>
                      <p className={`text-xs text-muted-foreground mt-1 mb-2`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(alert.description) }}></p>
                      <Link href={alert.href || '#'}>
                        <button className={`text-xs font-semibold hover:underline ${alert.color === 'destructive' ? 'text-destructive' : alert.color === 'yellow' ? 'text-orange-600' : 'text-blue-600'} uppercase tracking-wide`}>{alert.action}</button>
                      </Link>
                    </div>
                  </div>
                )
              })}
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
