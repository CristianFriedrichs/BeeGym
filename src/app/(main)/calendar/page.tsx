'use client';

import { useState, useMemo, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
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
    pointerWithin,
} from '@dnd-kit/core';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Plus, Users, MapPin, Clock, RefreshCw } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { NewTrainingModal } from '@/components/dashboard/modals/new-training-modal';
import { CreateRecurringClassModal } from '@/components/dashboard/modals/create-recurring-class-modal';
import { ManageParticipantsModal } from '@/components/dashboard/modals/manage-participants-modal';
import { SessionManagerModal } from '@/components/dashboard/modals/session-manager-modal';
import { EventDetailsModal } from '@/components/dashboard/modals/event-details-modal';
import { classColorStyles, getClassType } from '@/lib/class-definitions';
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
    'CANCELLED': { color: 'bg-gray-400', label: 'Cancelado' },
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
    if (['COMPLETED', 'MISSED', 'CANCELLED', 'Realizada', 'Falta'].includes(event.status)) {
        return event.status;
    }

    // Parse event end time
    const eventEnd = new Date(event.end_datetime || event.date); // Use end_datetime if available

    // For legacy events with just time string
    if (!event.end_datetime && event.time) {
        const [hours, minutes] = event.time.split(':').map(Number);
        eventEnd.setHours(hours, minutes, 0, 0);
        // Add duration
        eventEnd.setTime(eventEnd.getTime() + (event.duration || 60) * 60 * 1000);
    }


    // If event hasn't ended yet, it's SCHEDULED
    if (eventEnd > now) {
        return event.status === 'SCHEDULED' ? 'SCHEDULED' : event.status;
    }

    // If event ended but not finalized, it's PENDING
    if (event.status === 'SCHEDULED' || event.status === 'Prevista') {
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

    // Event Details Modal State
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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
        // if (!currentUnitId) return; // Allow viewing without unit selected for now, or fetch user's org

        let allEvents: any[] = [];

        // Fetch events from Supabase
        const fetchSupabaseEvents = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return [];

                const { data: userData } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (!userData?.organization_id) return [];

                const startOfView = startOfWeek(startOfMonth(currentDate), { locale: ptBR }).toISOString();
                const endOfView = endOfWeek(endOfMonth(currentDate), { locale: ptBR }).toISOString();

                // Busca corrigida usando start_datetime e end_datetime
                const { data, error } = await supabase
                    .from('calendar_events')
                    .select(`
                        id,
                        title,
                        start_datetime,
                        end_datetime,
                        type,
                        status,
                        capacity,
                        room:rooms ( name ),
                        instructor:instructors ( name )
                    `)
                    .eq('organization_id', userData.organization_id)
                    .gte('start_datetime', startOfView)
                    .lte('start_datetime', endOfView);

                if (error) {
                    console.error('Error fetching events from Supabase:', error);
                    return [];
                }

                // Mapeamento dos dados para o formato do Calendário
                return (data || []).map((event: any) => {
                    const startDate = new Date(event.start_datetime);
                    const endDate = new Date(event.end_datetime);
                    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

                    const classTypeData = getClassType(event.type);
                    const enrollmentCount = 0;

                    return {
                        id: event.id,
                        title: event.title,
                        start: startDate,
                        end: endDate,
                        date: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
                        time: format(startDate, 'HH:mm'),
                        duration: durationMinutes,
                        resourceId: event.room?.name || 'Sem sala',
                        extendedProps: {
                            description: event.title,
                            status: event.status,
                            type: event.type,
                            classType: classTypeData,
                            instructor: event.instructor?.name || 'Sem instrutor',
                            room: event.room?.name || 'Sem sala',
                            capacity: event.capacity,
                            enrollmentCount: enrollmentCount
                        },
                        instructor_id: event.instructor_id,
                        room: event.room?.name || 'Sala Principal',
                        room_id: event.room_id,
                        status: event.status,
                        color: classTypeData.color,
                        location: event.room?.name || 'Sala Principal',
                        icon: classTypeData.icon,
                        capacity: event.capacity, // Fixed from capacity_limit
                        enrollmentCount: enrollmentCount
                    };
                });
            } catch (err) {
                console.error('Unexpected error in calendar:', err);
                return [];
            }
        };

        fetchSupabaseEvents().then(supabaseEvents => {
            allEvents = [...supabaseEvents];

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
        setIsRecurringClassModalOpen(true); // Open class modal by default on click
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const eventData = scheduledEvents.find(e => e.id === active.id);
        setActiveEvent(eventData);
    };

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        // Drag functionality disabled for now as we move to Supabase
        setActiveEvent(null);
    }, []);

    const handleEventClick = (event: any) => {
        setSelectedEvent(event);
        setIsDetailsModalOpen(true);
    };

    const DraggableEvent = ({ event, children }: { event: any, children: React.ReactNode }) => {
        // We removed native dragging for now to rely on simple clicks
        return (
            <div
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    console.log("Clicked event:", event);
                    handleEventClick(event);
                }}
            >
                {children}
            </div>
        );
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
                            {/* Removed "Treino" button for now to focus on Classes */}
                            <Button onClick={() => setIsRecurringClassModalOpen(true)} className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" />
                                Nova Aula
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
                                                        const Icon = event.icon; // Get icon from mapped event
                                                        return (
                                                            <DraggableEvent key={event.id} event={event}>
                                                                <Tooltip>
                                                                    <TooltipTrigger className="w-full">
                                                                        <div className={cn('text-white text-[10px] rounded-md px-1.5 py-0.5 flex items-center justify-between gap-1', statusInfo.color)} style={{ backgroundColor: event.color }}>
                                                                            <div className="flex items-center gap-1 overflow-hidden">
                                                                                {Icon && <Icon className="h-3 w-3 flex-shrink-0" />}
                                                                                <span className="font-bold mr-1">{event.time}</span>
                                                                                <span className="truncate">{event.title || event.client}</span>
                                                                            </div>
                                                                            {event.eventType === 'CLASS' && event.capacity && (
                                                                                <div className={cn(
                                                                                    "flex items-center gap-0.5 px-1 rounded-sm text-[9px]",
                                                                                    event.enrollmentCount >= event.capacity ? "bg-red-500 text-white" : "bg-black/20 text-white"
                                                                                )}>
                                                                                    <Users className="h-2 w-2" />
                                                                                    <span>{event.enrollmentCount}/{event.capacity}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p className="font-bold">{event.title || event.client}</p>
                                                                        <p>{event.type} com {event.instructor || 'N/A'}</p>
                                                                        <p>Local: {event.room}</p>
                                                                        {event.eventType === 'CLASS' && event.capacity && (
                                                                            <p>Vagas: {event.enrollmentCount}/{event.capacity}</p>
                                                                        )}
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
                                                            const Icon = event.icon;

                                                            return (
                                                                <DraggableEvent key={event.id} event={event}>
                                                                    <div style={{ top: `${top}px`, height: `${height - 4}px`, position: 'absolute', left: '4px', right: '4px' }}>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <div className={cn("w-full h-full p-2 rounded-lg text-white gap-1 flex flex-col hover:brightness-110 transition-all cursor-pointer", statusInfo.color)} style={{ backgroundColor: event.color }}>
                                                                                    <div className="flex items-center justify-between gap-1 w-full">
                                                                                        <div className="flex items-center gap-1 truncate">
                                                                                            {Icon && <Icon className="h-3 w-3 flex-shrink-0" />}
                                                                                            <p className="text-xs font-bold truncate">{event.title || event.client}</p>
                                                                                        </div>
                                                                                        {event.eventType === 'CLASS' && event.capacity ? (
                                                                                            <div className={cn(
                                                                                                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium shrink-0",
                                                                                                event.enrollmentCount >= event.capacity ? "bg-red-500 text-white" : "bg-black/20 text-white"
                                                                                            )}>
                                                                                                <Users className="h-3 w-3" />
                                                                                                <span>{event.enrollmentCount}/{event.capacity}</span>
                                                                                            </div>
                                                                                        ) : null}
                                                                                    </div>
                                                                                    <p className="text-[10px] opacity-90">{event.type}</p>
                                                                                    <p className="text-[10px] font-mono opacity-80">{event.time} - {event.room}</p>
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p className="font-bold">{event.title || event.client}</p>
                                                                                <p>{event.type} com {event.instructor || 'N/A'}</p>
                                                                                <p>Status: {event.status}</p>
                                                                                {event.capacity && <p>Inscritos: {event.enrollmentCount}/{event.capacity}</p>}
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
                                <div className="grid grid-cols-[auto_1fr] h-full">
                                    <div className="w-16 border-r">
                                        <div className="h-14 border-b"></div>
                                        {hours.map(hour => (
                                            <div key={hour} className="h-20 text-right pr-2 pt-2 border-b">
                                                <span className="text-xs text-muted-foreground">{hour}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="relative bg-card">
                                        <div className="h-14 text-center border-b p-2">
                                            <p className="text-lg font-bold capitalize">{format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
                                        </div>
                                        <div className="relative">
                                            {hours.map(hour => (
                                                <DroppableSlot key={`day-${hour}`} id={`timeslot-${format(currentDate, 'yyyy-MM-dd')}_${parseInt(hour)}`} className="h-20 border-b" onClick={() => handleEmptySlotClick(setHours(currentDate, parseInt(hour)))}></DroppableSlot>
                                            ))}
                                            {getEventsForDay(currentDate).map(event => {
                                                const [startHour, startMinute] = event.time.split(':').map(Number);
                                                const topOffset = (startMinute / 60) * 80;
                                                const top = (startHour - 7) * 80 + topOffset;
                                                const height = (event.duration / 60) * 80;
                                                const statusInfo = statusConfig[event.status] || { color: 'bg-gray-400' };
                                                const Icon = event.icon;

                                                return (
                                                    <DraggableEvent key={event.id} event={event}>
                                                        <div style={{ top: `${top}px`, height: `${height - 4}px`, position: 'absolute', left: '4px', right: '4px' }}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div className={cn("w-full h-full p-2 rounded-lg text-white flex flex-col gap-1 hover:brightness-110 transition-all cursor-pointer", statusInfo.color)} style={{ backgroundColor: event.color }}>
                                                                        <div className="flex items-center justify-between gap-1 w-full">
                                                                            <div className="flex items-center gap-1 truncate">
                                                                                {Icon && <Icon className="h-3 w-3 flex-shrink-0" />}
                                                                                <p className="text-sm font-bold truncate">{event.title || event.client}</p>
                                                                            </div>
                                                                            {event.eventType === 'CLASS' && event.capacity ? (
                                                                                <div className={cn(
                                                                                    "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium shrink-0",
                                                                                    event.enrollmentCount >= event.capacity ? "bg-red-500 text-white" : "bg-black/20 text-white"
                                                                                )}>
                                                                                    <Users className="h-3 w-3" />
                                                                                    <span>{event.enrollmentCount}/{event.capacity}</span>
                                                                                </div>
                                                                            ) : null}
                                                                        </div>
                                                                        <p className="text-xs">{event.type} com {event.instructor}</p>
                                                                        <p className="text-xs font-mono">{event.time} - {event.room}</p>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="font-bold">{event.title || event.client}</p>
                                                                    <p>{event.type} com {event.instructor || 'N/A'}</p>
                                                                    <p>Local: {event.room}</p>
                                                                    {event.capacity && <p>Vagas: {event.enrollmentCount}/{event.capacity}</p>}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    </DraggableEvent>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <CreateRecurringClassModal
                        open={isRecurringClassModalOpen || isCreateModalOpen}
                        onOpenChange={(open) => {
                            setIsRecurringClassModalOpen(open);
                            setCreateModalOpen(open);
                        }}
                        onSuccess={() => setLastUpdate(Date.now())}
                    />

                    {/* Event Details Modal */}
                    <EventDetailsModal
                        open={isDetailsModalOpen}
                        onOpenChange={setIsDetailsModalOpen}
                        event={selectedEvent}
                        onSuccess={() => setLastUpdate(Date.now())}
                    />
                </div>
            </TooltipProvider>
        </DndContext>
    );
}
