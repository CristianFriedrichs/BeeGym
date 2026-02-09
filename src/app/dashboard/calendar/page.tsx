'use client';

import { useState, useMemo, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DndContext,
    useDraggable,
    useDroppable,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    pointerWithin,
} from '@dnd-kit/core';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Plus, Users, User, MapPin, Clock, RefreshCw } from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    getDay,
    isToday,
    addMonths,
    subMonths,
    isSameDay,
    startOfWeek,
    endOfWeek,
    subDays,
    addDays,
    parseISO,
    isWithinInterval,
    setHours,
    set,
    isBefore,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { NewTrainingModal } from '@/components/dashboard/modals/new-training-modal';
import { CreateRecurringClassModal } from '@/components/dashboard/modals/create-recurring-class-modal';
import { ManageParticipantsModal } from '@/components/dashboard/modals/manage-participants-modal';
import { SessionManagerModal } from '@/components/dashboard/modals/session-manager-modal';
import { RecurringClass, classColorStyles, getIcon as getClassIcon } from '@/lib/class-definitions';
import { initialClients } from '@/lib/mock-data';
import { logAction } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';


const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const hours = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

// Session status configuration
const statusConfig: { [key: string]: { color: string; label: string; } } = {
    'SCHEDULED': { color: 'bg-blue-500', label: 'Agendado' },
    'PENDING': { color: 'bg-yellow-500', label: 'Pendente' },
    'COMPLETED': { color: 'bg-green-500/50', label: 'Concluído' },
    'MISSED': { color: 'bg-red-500', label: 'Falta' },
    'CANCELED': { color: 'bg-gray-400', label: 'Cancelado' },
    // Legacy statuses for backward compatibility
    'Prevista': { color: 'bg-blue-500', label: 'Prevista' },
    'Em Execução': { color: 'bg-purple-500', label: 'Em Execução' },
    'Pendente': { color: 'bg-orange-500', label: 'Pendente' },
    'Realizada': { color: 'bg-green-500', label: 'Realizada' },
    'Falta': { color: 'bg-red-500', label: 'Falta' },
    'Finalizada': { color: 'bg-gray-500', label: 'Finalizada' },
};

// Calculate dynamic status based on event time
function calculateEventStatus(event: any, now: Date): string {
    // If manually set to final states, keep them
    if (['COMPLETED', 'MISSED', 'CANCELED'].includes(event.status)) {
        return event.status;
    }

    // Parse event end time
    const eventDate = new Date(event.date);
    const endTime = event.end_time || event.time; // Fallback to start time if no end_time
    const [hours, minutes] = endTime.split(':').map(Number);
    const eventEnd = new Date(eventDate);
    eventEnd.setHours(hours, minutes, 0, 0);

    // If event hasn't ended yet, it's SCHEDULED
    if (eventEnd > now) {
        return event.status === 'SCHEDULED' ? 'SCHEDULED' : event.status;
    }

    // If event ended but not finalized, it's PENDING
    if (event.status === 'SCHEDULED') {
        return 'PENDING';
    }

    return event.status;
}


const capitalize = (s: string) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}


export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('week');
    const [now, setNow] = useState(new Date());
    const [isClient, setIsClient] = useState(false);
    const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
    const [scheduledEvents, setScheduledEvents] = useState<any[]>([]);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isRecurringClassModalOpen, setIsRecurringClassModalOpen] = useState(false);
    const [selectedDateForCreation, setSelectedDateForCreation] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);

    const scrollableContainerRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef<number | null>(null);

    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const [activeEvent, setActiveEvent] = useState<any | null>(null);
    const [isManageParticipantsModalOpen, setIsManageParticipantsModalOpen] = useState(false);
    const [selectedEventForParticipants, setSelectedEventForParticipants] = useState<any | null>(null);
    const [isSessionManagerModalOpen, setIsSessionManagerModalOpen] = useState(false);
    const [selectedEventForSession, setSelectedEventForSession] = useState<any | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        const unitId = localStorage.getItem('currentUnitId');
        setCurrentUnitId(unitId);
        const timer = setInterval(() => setNow(new Date()), 60 * 1000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const todayString = useMemo(() => {
        if (!isClient) return '';
        return capitalize(format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR }));
    }, [isClient]);


    useEffect(() => {
        if (!currentUnitId) return;

        const getEventStatus = (event: any, now: Date): string => {
            if (event.status && (event.status === 'Realizada' || event.status === 'Falta')) {
                return event.status;
            }

            const eventDate = new Date(event.date);
            if (isNaN(eventDate.getTime())) return 'Prevista';

            const [hours, minutes] = event.time.split(':').map(Number);
            eventDate.setHours(hours, minutes, 0, 0);

            const endTime = new Date(eventDate.getTime() + (event.duration || 60) * 60 * 1000);

            if (now < eventDate) {
                return 'Prevista';
            }
            if (now >= eventDate && now < endTime) {
                return 'Em Execução';
            }
            if (now > endTime) {
                if (event.eventType === 'treino') {
                    return 'Pendente';
                } else {
                    return 'Finalizada';
                }
            }
            return 'Prevista';
        };

        let allEvents: any[] = [];

        const recurringExceptions = JSON.parse(localStorage.getItem('recurring_exceptions') || '{}');

        // Process individual workouts ('treinos')
        try {
            const storedClassesJSON = localStorage.getItem('scheduled_classes');
            if (storedClassesJSON) {
                const storedClasses = JSON.parse(storedClassesJSON)
                    .filter((c: any) => c.unitId === currentUnitId)
                    .map((c: any) => {
                        const student = initialClients.find(s => s.name === c.client)
                        return {
                            ...c,
                            date: new Date(c.date),
                            eventType: c.eventType || 'treino',
                            student: student,
                            participants: student ? [student] : [],
                            color: c.color || 'bg-primary/80'
                        }
                    });
                allEvents = [...allEvents, ...storedClasses];
            }
        } catch (error) {
            console.error("Failed to load classes from localStorage", error);
        }

        // Fetch events from Supabase (including TREINO_ABERTO with participant counts)
        const fetchSupabaseEvents = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return [];

                const { data: userData } = await supabase
                    .from('users')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (!userData?.organization_id) return [];

                // Busca corrigida usando start_time e end_time
                const { data, error } = await supabase
                    .from('calendar_events')
                    .select(`
                        id,
                        title,
                        start_time,
                        end_time,
                        event_type,
                        status,
                        color,
                        rooms ( name ),
                        students ( full_name )
                    `)
                    .eq('organization_id', userData.organization_id)
                    .gte('start_time', format(startOfWeek(startOfMonth(currentDate), { locale: ptBR }), 'yyyy-MM-dd'))
                    .lte('start_time', format(endOfWeek(endOfMonth(currentDate), { locale: ptBR }), 'yyyy-MM-dd'));

                if (error) {
                    console.error('Error fetching events from Supabase:', error);
                    return [];
                }

                // Mapeamento dos dados para o formato do Calendário
                return (data || []).map((event: any) => {
                    const startDate = new Date(event.start_time);
                    const endDate = new Date(event.end_time);
                    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

                    return {
                        id: event.id,
                        title: event.title,
                        date: startDate, // Objeto Date usado pelo calendário
                        time: format(startDate, 'HH:mm'),
                        end_time: format(endDate, 'HH:mm'), // Necessário para cálculo de status
                        duration: durationMinutes > 0 ? durationMinutes : 60,
                        eventType: event.event_type === 'AULA' ? 'aula' : 'treino',
                        type: event.event_type === 'AULA' ? 'Aula Coletiva' : 'Treino',
                        client: event.students?.full_name || 'Vários alunos', // Usado para exibição do nome
                        name: event.title || event.students?.full_name, // Usado para exibição do nome
                        instructor: 'Instrutor', // Placeholder
                        room: event.rooms?.name || 'Sala Principal',
                        status: event.status === 'SCHEDULED' ? 'Agendado' : event.status,
                        color: event.color || '#FF8C00',
                        participants: [], // Placeholder
                        location: event.rooms?.name || 'Sala Principal'
                    };
                });
            } catch (err) {
                console.error('Unexpected error in calendar:', err);
                return [];
            }
        };

        fetchSupabaseEvents().then(supabaseEvents => {
            allEvents = [...allEvents, ...supabaseEvents];

            // Process recurring group classes ('aulas')
            try {
                const recurringClassesJSON = localStorage.getItem('recurring_classes');
                if (recurringClassesJSON) {
                    const recurringClasses: RecurringClass[] = JSON.parse(recurringClassesJSON).filter((c: RecurringClass) => c.unitId === currentUnitId);
                    const viewInterval = { start: startOfWeek(startOfMonth(currentDate), { locale: ptBR }), end: endOfWeek(endOfMonth(currentDate), { locale: ptBR }) };

                    recurringClasses.forEach(cls => {
                        if (cls.status !== 'active') return;

                        const classInterval = {
                            start: parseISO(cls.startDate),
                            end: cls.endDate ? parseISO(cls.endDate) : viewInterval.end
                        };

                        const daysInView = eachDayOfInterval(viewInterval);

                        daysInView.forEach(day => {
                            const dayOfWeek = getDay(day).toString();
                            const instanceId = `${cls.id}-${format(day, 'yyyy-MM-dd')}`;

                            if (recurringExceptions[instanceId]) {
                                return; // Skip this overridden instance
                            }

                            if (cls.daysOfWeek.includes(dayOfWeek) && isWithinInterval(day, classInterval)) {
                                const colorData = classColorStyles[cls.color as keyof typeof classColorStyles] || classColorStyles.primary;
                                const Icon = getClassIcon(cls.icon)
                                allEvents.push({
                                    id: instanceId,
                                    date: day,
                                    time: cls.time,
                                    duration: cls.duration,
                                    client: cls.name, // For display
                                    name: cls.name,
                                    type: 'Aula Coletiva', // More descriptive
                                    instructor: cls.instructor,
                                    location: cls.location,
                                    color: colorData.background.replace('bg-', 'border-'), // Use border color for indicator
                                    icon: <Icon className={`h-6 w-6 ${colorData.text}`} />,
                                    eventType: 'aula',
                                    participants: initialClients.slice(0, Math.min(initialClients.length, cls.capacity || 5)).map(p => ({ ...p, id: p.id + Math.random() })), // Mock participants
                                });
                            }
                        });
                    });
                }
            } catch (e) {
                console.error("Failed to load recurring classes", e);
            }

            const eventsWithStatus = allEvents.map(event => ({
                ...event,
                status: calculateEventStatus(event, now),
            }))

            setScheduledEvents(eventsWithStatus);
        });
    }, [currentDate, isNewClassModalOpen, now, lastUpdate, currentUnitId]);

    const firstDayOfMonth = useMemo(() => startOfMonth(currentDate), [currentDate]);
    const startingDayIndex = useMemo(() => getDay(firstDayOfMonth), [firstDayOfMonth]);

    const handlePrev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(subDays(currentDate, 7));
        else setCurrentDate(subDays(currentDate, 1));
    };

    const handleNext = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(addDays(currentDate, 7));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const handleToday = () => setCurrentDate(new Date());

    const handleRefresh = () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        setLastUpdate(Date.now());

        setTimeout(() => {
            setIsRefreshing(false);
            toast({
                title: 'Agenda atualizada',
            });
        }, 500);
    };

    const getEventsForDay = (day: Date) => {
        return scheduledEvents
            .filter((event) => event.date && isSameDay(event.date, day))
            .sort((a, b) => a.time.localeCompare(b.time));
    };

    const daysInWeek = useMemo(() => eachDayOfInterval({
        start: startOfWeek(currentDate, { locale: ptBR }),
        end: endOfWeek(currentDate, { locale: ptBR }),
    }), [currentDate]);

    const daysForMonthView = useMemo(() => eachDayOfInterval({
        start: firstDayOfMonth,
        end: endOfMonth(currentDate)
    }), [firstDayOfMonth, currentDate]);

    const handleEmptySlotClick = (date: Date) => {
        setSelectedDateForCreation(date);
        setCreateModalOpen(true);
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const eventData = scheduledEvents.find(e => e.id === active.id);
        setActiveEvent(eventData);
    };

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        setActiveEvent(null);
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        if (scrollableContainerRef.current) {
            scrollPositionRef.current = scrollableContainerRef.current.scrollTop;
        }

        const originalEvent = scheduledEvents.find(e => e.id === active.id);
        if (!originalEvent) return;

        let newDate: Date;
        let newTime: string = originalEvent.time;
        let newStatus = originalEvent.status;

        if (view === 'week') {
            const [dayStr, hourStr] = (over.id as string).replace('timeslot-', '').split('_');
            newDate = set(parseISO(dayStr), { hours: parseInt(hourStr), minutes: 0, seconds: 0 });
            newTime = format(newDate, 'HH:mm');
        } else if (view === 'month') {
            const dayStr = (over.id as string).replace('day-', '');
            const [hour, minute] = originalEvent.time.split(':').map(Number);
            newDate = set(parseISO(dayStr), { hours: hour, minutes: minute, seconds: 0 });
        } else {
            return;
        }

        const conflict = scheduledEvents.find(e =>
            e.id !== originalEvent.id &&
            isSameDay(new Date(e.date), newDate) &&
            e.time === newTime &&
            (e.location === originalEvent.location || e.instructor === originalEvent.instructor)
        );

        if (conflict) {
            toast({
                variant: 'destructive',
                title: 'Conflito de agendamento',
                description: `Horário indisponível para este local/instrutor.`,
            });
            return;
        }

        if (isBefore(newDate, new Date()) && originalEvent.status === 'Prevista') {
            newStatus = 'Pendente';
        }


        try {
            if (originalEvent.eventType === 'treino' || originalEvent.eventType === 'aula_instance') {
                const storedClasses = JSON.parse(localStorage.getItem('scheduled_classes') || '[]');
                const classIndex = storedClasses.findIndex((c: any) => c.id === originalEvent.id);
                if (classIndex > -1) {
                    storedClasses[classIndex].date = newDate.toISOString();
                    storedClasses[classIndex].time = newTime;
                    storedClasses[classIndex].status = newStatus;
                    localStorage.setItem('scheduled_classes', JSON.stringify(storedClasses));
                } else { throw new Error("Workout not found in storage"); }
            } else if (originalEvent.eventType === 'aula') {
                const newInstance = {
                    ...originalEvent,
                    id: Date.now(),
                    date: newDate.toISOString(),
                    time: newTime,
                    status: newStatus,
                    eventType: 'aula_instance',
                    originalRecurringId: originalEvent.id,
                };
                const storedClasses = JSON.parse(localStorage.getItem('scheduled_classes') || '[]');
                storedClasses.push(newInstance);
                localStorage.setItem('scheduled_classes', JSON.stringify(storedClasses));

                const exceptions = JSON.parse(localStorage.getItem('recurring_exceptions') || '{}');
                exceptions[originalEvent.id] = true;
                localStorage.setItem('recurring_exceptions', JSON.stringify(exceptions));
            }

            logAction({
                user: 'Kristin Watson', // Assuming the logged-in user
                origin: 'professional',
                entity: 'Agenda',
                entityId: String(originalEvent.id),
                action: 'Movimentação',
                description: `Evento "${originalEvent.name || originalEvent.client}" reagendado.`,
                details: {
                    before: { date: format(originalEvent.date, 'yyyy-MM-dd'), time: originalEvent.time },
                    after: { date: format(newDate, 'yyyy-MM-dd'), time: newTime }
                }
            });

            toast({
                title: 'Evento reagendado!',
                description: `Evento movido para ${format(newDate, 'dd/MM')} às ${newTime}.`
            });
            setLastUpdate(Date.now());
        } catch (error) {
            console.error("Failed to update event:", error);
            toast({ variant: "destructive", title: "Erro ao reagendar", description: "Não foi possível salvar a alteração." });
        }
    }, [scheduledEvents, view, toast]);

    const EventCard = ({ event }: { event: any }) => {
        const statusInfo = statusConfig[event.status] || { color: 'bg-gray-400', label: 'N/A' };

        const handleCardClick = () => {
            // Handle TREINO_ABERTO events (open participants modal)
            if (event.event_type === 'TREINO_ABERTO') {
                setSelectedEventForParticipants(event);
                setIsManageParticipantsModalOpen(true);
                return;
            }

            // Handle training events (open session manager)
            if (event.eventType === 'treino' || event.event_type === 'TREINO_INDIVIDUAL' || event.event_type === 'TREINO_GRUPO') {
                setSelectedEventForSession(event);
                setIsSessionManagerModalOpen(true);
                return;
            }

            // Legacy behavior for other events
            if (event.status === 'Pendente' && event.eventType === 'treino') {
                alert(`Abrir popup de finalização para: ${event.client}`);
            } else if (event.status === 'Prevista' || event.status === 'Em Execução') {
                if (event.eventType === 'treino') {
                    alert(`Redirecionar para edição do treino: ${event.client}`);
                } else {
                    alert(`Redirecionar para edição da aula: ${event.name}`);
                }
            } else {
                alert(`Visualização somente leitura para: ${event.name || event.client}`);
            }
        };

        return (
            <Card onClick={handleCardClick} className="mb-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex">
                    <div className={`w-2 rounded-l-lg ${statusInfo.color}`}></div>
                    <CardContent className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge className={cn("text-xs mb-2", statusInfo.color)}>{statusInfo.label}</Badge>
                                <p className="font-bold">{event.eventType === 'aula' || event.eventType === 'aula_instance' ? event.name : event.client}</p>
                                <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {event.time}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {event.location || 'N/A'}</span>
                                </div>
                                {(event.eventType === 'aula' || event.eventType === 'aula_instance') && event.instructor && (
                                    <p className="text-sm text-muted-foreground mt-1">com {event.instructor}</p>
                                )}
                                {event.event_type === 'TREINO_ABERTO' && (
                                    <Badge
                                        className={cn(
                                            'mt-2 font-semibold text-xs',
                                            (event.participant_count || 0) >= (event.capacity_limit || 0)
                                                ? 'bg-destructive text-destructive-foreground'
                                                : 'bg-primary text-primary-foreground'
                                        )}
                                    >
                                        {event.participant_count || 0}/{event.capacity_limit || 0} Vagas
                                    </Badge>
                                )}
                            </div>
                            <div className="flex -space-x-2">
                                {event.participants?.slice(0, 3).map((p: any) => (
                                    <Avatar key={p.id} className="h-8 w-8 border-2 border-card">
                                        <AvatarImage src={p.avatar} />
                                        <AvatarFallback>{p.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                ))}
                                {event.participants?.length > 3 && (
                                    <Avatar className="h-8 w-8 border-2 border-card">
                                        <AvatarFallback>+{event.participants.length - 3}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Card>
        )
    }

    const DraggableEvent = ({ event, children }: { event: any, children: React.ReactNode }) => {
        const isDragDisabled = ['Realizada', 'Falta', 'Em Execução'].includes(event.status);

        const { attributes, listeners, setNodeRef, transform } = useDraggable({
            id: event.id,
            disabled: isDragDisabled,
        });

        const style = transform ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            zIndex: 100,
            cursor: isDragDisabled ? 'not-allowed' : 'grab',
        } : {
            cursor: isDragDisabled ? 'not-allowed' : 'grab',
        };

        const eventWrapper = (
            <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
                {children}
            </div>
        );

        if (isDragDisabled) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>{eventWrapper}</TooltipTrigger>
                    <TooltipContent><p>Este evento não pode ser reagendado</p></TooltipContent>
                </Tooltip>
            );
        }
        return eventWrapper;
    };

    const DroppableSlot = ({ id, className, children, onClick }: { id: string; className: string; children?: React.ReactNode; onClick?: () => void }) => {
        const { isOver, setNodeRef } = useDroppable({ id });
        return (
            <div ref={setNodeRef} onClick={onClick} className={cn(className, isOver && 'bg-primary/20 transition-colors')}>
                {children}
            </div>
        );
    };

    useLayoutEffect(() => {
        if (scrollableContainerRef.current && scrollPositionRef.current !== null) {
            scrollableContainerRef.current.scrollTop = scrollPositionRef.current;
            scrollPositionRef.current = null; // Reset after restoring
        }
    }, [lastUpdate]);


    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
            <TooltipProvider>
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
                            <p className="text-muted-foreground">
                                {todayString}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <NewTrainingModal
                                open={isNewClassModalOpen}
                                onOpenChange={setIsNewClassModalOpen}
                                onSuccess={() => setLastUpdate(Date.now())}
                            />
                            <Button onClick={() => setIsNewClassModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Treino
                            </Button>
                            <Button onClick={() => setIsRecurringClassModalOpen(true)} className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" />
                                Aula
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col flex-1 bg-card rounded-2xl shadow-soft border h-[calc(100vh-14rem)]">
                        <header className="flex items-center justify-between p-4 px-6 border-b">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <h2 className="text-xl font-bold tracking-tight capitalize">
                                        {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrev}><ChevronLeft className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="sm" onClick={handleToday} className="h-8">Hoje</Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext}><ChevronRight className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleRefresh} disabled={isRefreshing}>
                                            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Atualizar agenda</p>
                                    </TooltipContent>
                                </Tooltip>
                                <div className="h-8 w-px bg-border mx-2"></div>
                                <Button variant={view === 'day' ? 'default' : 'outline'} onClick={() => setView('day')}>Dia</Button>
                                <Button variant={view === 'week' ? 'default' : 'outline'} onClick={() => setView('week')}>Semana</Button>
                                <Button variant={view === 'month' ? 'default' : 'outline'} onClick={() => setView('month')}>Mês</Button>
                            </div>
                        </header>

                        <div ref={scrollableContainerRef} className="flex-1 overflow-auto">
                            {view === 'month' && (
                                <div className="grid grid-cols-7 flex-1">
                                    {weekDays.map((day) => (
                                        <div key={day} className="text-center font-bold text-xs p-2 border-r border-b bg-card text-muted-foreground uppercase">{day}</div>
                                    ))}
                                    {Array.from({ length: startingDayIndex }).map((_, index) => (<div key={`empty-${index}`} className="border-r border-b bg-muted/30"></div>))}
                                    {daysForMonthView.map((day) => {
                                        const eventsForDay = getEventsForDay(day);
                                        const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                                        return (
                                            <DroppableSlot key={day.toString()} id={`day-${format(day, 'yyyy-MM-dd')}`} className="relative p-2 h-36 border-r border-b bg-card hover:bg-muted/50 transition-colors duration-200 ease-in-out overflow-hidden" onClick={() => handleEmptySlotClick(day)}>
                                                <time dateTime={format(day, 'yyyy-MM-dd')} className={cn('text-sm font-medium', isClient && isToday(day) ? 'flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 text-orange-600' : '', isWeekend && 'text-red-500')}>
                                                    {format(day, 'd')}
                                                </time>
                                                <div className="mt-1 space-y-1">
                                                    {eventsForDay.map((event) => {
                                                        const statusInfo = statusConfig[event.status] || { color: 'bg-gray-400' };
                                                        return (
                                                            <DraggableEvent key={event.id} event={event}>
                                                                <Tooltip>
                                                                    <TooltipTrigger className="w-full">
                                                                        <div className={cn('text-white text-[10px] rounded-md px-1.5 py-0.5 flex items-center', statusInfo.color)}>
                                                                            <span className="font-bold mr-1">{event.time}</span>
                                                                            <span className="truncate">{event.name || event.client}</span>
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p className="font-bold">{event.name || event.client}</p>
                                                                        <p>{event.type} com {event.instructor || 'N/A'}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </DraggableEvent>
                                                        )
                                                    })}
                                                </div>
                                            </DroppableSlot>
                                        );
                                    })}
                                </div>
                            )}

                            {view === 'week' && (
                                <div className="grid grid-cols-[auto_1fr] h-full">
                                    <div className="w-16 border-r">
                                        <div className="h-14 border-b"></div>
                                        {hours.map(hour => (
                                            <div key={hour} className="h-20 text-right pr-2 pt-2 border-b">
                                                <span className="text-xs text-muted-foreground">{hour}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7">
                                        {daysInWeek.map((day) => {
                                            const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                                            return (
                                                <div key={day.toString()} className={cn("border-r relative", isClient && isToday(day) && 'bg-orange-50')}>
                                                    <div className="h-14 text-center border-b p-2">
                                                        <p className={cn("text-xs text-muted-foreground uppercase", isWeekend && "text-red-500")}>{format(day, 'EEE', { locale: ptBR })}</p>
                                                        <p className={cn("text-lg font-bold", isClient && isToday(day) && "text-orange-600", isWeekend && "text-red-500")}>{format(day, 'd')}</p>
                                                    </div>
                                                    <div className="relative">
                                                        {hours.map(hour => (
                                                            <DroppableSlot key={`${day.toString()}-${hour}`} id={`timeslot-${format(day, 'yyyy-MM-dd')}_${parseInt(hour)}`} className="h-20 border-b" onClick={() => handleEmptySlotClick(setHours(day, parseInt(hour)))}></DroppableSlot>
                                                        ))}
                                                        {getEventsForDay(day).map(event => {
                                                            const [startHour, startMinute] = event.time.split(':').map(Number);
                                                            const topOffset = (startMinute / 60) * 80;
                                                            const top = (startHour - 7) * 80 + topOffset;
                                                            const height = (event.duration / 60) * 80;
                                                            const statusInfo = statusConfig[event.status] || { color: 'bg-gray-400' };

                                                            return (
                                                                <DraggableEvent key={event.id} event={event}>
                                                                    <div style={{ top: `${top}px`, height: `${height - 4}px`, position: 'absolute', left: '4px', right: '4px' }}>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <div className={cn("w-full h-full p-2 rounded-lg text-white", statusInfo.color)}>
                                                                                    <p className="text-xs font-bold truncate">{event.name || event.client}</p>
                                                                                    <p className="text-[10px]">{event.type}</p>
                                                                                    <p className="text-[10px] font-mono">{event.time}</p>
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p className="font-bold">{event.name || event.client}</p>
                                                                                <p>{event.type} com {event.instructor || 'N/A'}</p>
                                                                                <p>Status: {event.status}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </div>
                                                                </DraggableEvent>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {view === 'day' && (
                                <div className="divide-y">
                                    {isClient && (() => {
                                        const day = currentDate;
                                        const events = getEventsForDay(day);
                                        return (
                                            <div className="p-4">
                                                <h2 className={cn('font-bold mb-4', isToday(day) ? 'text-orange-600' : '')}>
                                                    {capitalize(format(day, "EEEE, d 'de' MMMM", { locale: ptBR }))}
                                                </h2>
                                                {events.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {events.map((event) => <EventCard key={event.id} event={event} />)}
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground text-sm pt-4">Nenhum evento agendado para este dia.</p>
                                                )}
                                            </div>
                                        )
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                    <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Criar Novo Evento</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 grid grid-cols-2 gap-4">
                                <Button onClick={() => { setCreateModalOpen(false); setIsNewClassModalOpen(true); }}>Novo Treino</Button>
                                <Button asChild><Link href={`/dashboard/classes/new?date=${selectedDateForCreation ? format(selectedDateForCreation, 'yyyy-MM-dd') : ''}`}>Nova Aula</Link></Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <DragOverlay>
                        {activeEvent ? (
                            <div className="p-2 rounded-lg text-white" style={{ backgroundColor: statusConfig[activeEvent.status]?.color || 'bg-gray-400', width: activeEvent.dragWidth || 200 }}>
                                <p className="text-xs font-bold truncate">{activeEvent.name || activeEvent.client}</p>
                                <p className="text-[10px]">{activeEvent.type}</p>
                            </div>
                        ) : null}
                    </DragOverlay>

                    {/* Recurring Class Modal */}
                    <CreateRecurringClassModal
                        open={isRecurringClassModalOpen}
                        onOpenChange={setIsRecurringClassModalOpen}
                        onSuccess={() => {
                            setLastUpdate(Date.now());
                        }}
                    />

                    {/* Manage Participants Modal */}
                    <ManageParticipantsModal
                        open={isManageParticipantsModalOpen}
                        onOpenChange={setIsManageParticipantsModalOpen}
                        eventId={selectedEventForParticipants?.id}
                        eventName={selectedEventForParticipants?.name}
                        eventDate={selectedEventForParticipants?.date}
                        eventTime={selectedEventForParticipants?.time}
                        capacityLimit={selectedEventForParticipants?.capacity_limit}
                        onSuccess={() => {
                            setLastUpdate(Date.now());
                        }}
                    />

                    {/* Session Manager Modal */}
                    <SessionManagerModal
                        open={isSessionManagerModalOpen}
                        onOpenChange={setIsSessionManagerModalOpen}
                        eventId={selectedEventForSession?.id}
                        eventName={selectedEventForSession?.name || selectedEventForSession?.client}
                        eventDate={selectedEventForSession?.date}
                        eventTime={selectedEventForSession?.time}
                        endTime={selectedEventForSession?.end_time || selectedEventForSession?.time}
                        location={selectedEventForSession?.location}
                        studentIds={selectedEventForSession?.student_id ? [selectedEventForSession.student_id] : []}
                        onSuccess={() => {
                            setLastUpdate(Date.now());
                        }}
                    />
                </div>
            </TooltipProvider>
        </DndContext>
    );
}
