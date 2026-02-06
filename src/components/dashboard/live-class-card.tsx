'use client';

import { useState, useEffect } from 'react';
import { MapPin, Timer, ChevronLeft, ChevronRight, GraduationCap, Dumbbell, Calendar, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface LiveEvent {
    id: string;
    name: string;
    event_type: 'AULA' | 'TREINO';
    start_time: string;
    end_time: string;
    capacity: number;
    instructor: {
        id: string;
        full_name: string;
        avatar_url: string | null;
    };
    unit: {
        id: string;
        name: string;
    } | null;
    room: {
        id: string;
        name: string;
    } | null;
    attendees: Array<{
        student: {
            id: string;
            full_name: string;
            avatar_url: string | null;
        };
        status: string;
        confirmed_by_user: boolean;
    }>;
}

// Hook for independent timer per event
function useElapsedTime(startTime: string) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const start = new Date(startTime).getTime();

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.floor((now - start) / 1000);
            setElapsed(diff >= 0 ? diff : 0);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    return {
        formatted: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        minutes,
        seconds
    };
}

export function LiveClassCard() {
    const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    const currentEvent = liveEvents[currentEventIndex];
    const elapsedTime = useElapsedTime(currentEvent?.start_time || new Date().toISOString());

    useEffect(() => {
        async function fetchLiveEvents() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: userData } = await supabase
                    .from('users')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (!userData?.organization_id) return;

                const now = new Date();
                const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS
                const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

                // Query events happening NOW
                const { data: events, error } = await supabase
                    .from('calendar_events')
                    .select(`
            id,
            name,
            event_type,
            start_time,
            end_time,
            date,
            capacity,
            instructor:users!instructor_id(id, full_name, avatar_url),
            unit:units(id, name),
            room:rooms(id, name),
            attendees:attendance_logs(
              student:students(id, full_name, avatar_url),
              status,
              confirmed_by_user
            )
          `)
                    .eq('organization_id', userData.organization_id)
                    .eq('date', currentDate)
                    .lte('start_time', currentTime)
                    .gte('end_time', currentTime)
                    .in('status', ['SCHEDULED', 'IN_PROGRESS'])
                    .order('start_time');

                if (error) {
                    console.error('Error fetching live events:', error);
                    return;
                }

                setLiveEvents(events || []);
            } catch (error) {
                console.error('Error in fetchLiveEvents:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLiveEvents();

        // Refresh every 30 seconds
        const interval = setInterval(fetchLiveEvents, 30000);
        return () => clearInterval(interval);
    }, [supabase]);

    // Carousel navigation
    const nextEvent = () => {
        setCurrentEventIndex((prev) => (prev + 1) % liveEvents.length);
    };

    const prevEvent = () => {
        setCurrentEventIndex((prev) => (prev - 1 + liveEvents.length) % liveEvents.length);
    };

    // Loading state
    if (isLoading) {
        return (
            <Card className="p-8 animate-pulse">
                <div className="h-24 bg-muted rounded-lg"></div>
            </Card>
        );
    }

    // Fallback: No live events
    if (liveEvents.length === 0) {
        return (
            <Card className="p-8 text-center border-dashed">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Nenhuma atividade agora</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Que tal planejar o próximo treino?
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard/agenda')}
                        className="mt-2"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Agendar Aula
                    </Button>
                </div>
            </Card>
        );
    }

    // Get event type badge configuration
    const getEventBadge = (type: 'AULA' | 'TREINO') => {
        if (type === 'AULA') {
            return {
                variant: 'default' as const,
                icon: <GraduationCap className="w-3 h-3 mr-1" />,
                label: 'AULA',
                className: 'bg-blue-500 hover:bg-blue-600'
            };
        }
        return {
            variant: 'warning' as const,
            icon: <Dumbbell className="w-3 h-3 mr-1" />,
            label: 'TREINO',
            className: 'bg-orange-500 hover:bg-orange-600'
        };
    };

    const eventBadge = getEventBadge(currentEvent.event_type);
    const presentStudents = currentEvent.attendees.filter(a => a.status === 'PRESENT');

    return (
        <TooltipProvider>
            <section className="bg-card rounded-3xl p-6 shadow-soft relative overflow-hidden flex flex-col gap-6 border">
                {/* Accent bar */}
                <div className="absolute left-0 top-0 h-full w-2 bg-primary"></div>

                {/* Header with carousel navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold uppercase tracking-wide">
                            Ao Vivo Agora
                        </span>
                        <Badge className={cn("text-white", eventBadge.className)}>
                            {eventBadge.icon}
                            {eventBadge.label}
                        </Badge>
                    </div>

                    {/* Carousel controls */}
                    {liveEvents.length > 1 && (
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={prevEvent}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground font-medium min-w-[40px] text-center">
                                {currentEventIndex + 1} / {liveEvents.length}
                            </span>
                            <Button
                                onClick={nextEvent}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Main content */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    {/* Event info */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                            {currentEvent.name || 'Aula sem nome'}
                        </h2>

                        <div className="flex flex-col gap-2">
                            {/* Instructor */}
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={currentEvent.instructor?.avatar_url || undefined} />
                                    <AvatarFallback className="text-xs">
                                        {currentEvent.instructor?.full_name
                                            ?.split(' ')
                                            .map(n => n[0])
                                            .join('')
                                            .toUpperCase() || 'IN'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs text-muted-foreground">Instrutor</p>
                                    <p className="text-sm font-medium">
                                        {currentEvent.instructor?.full_name || 'Não definido'}
                                    </p>
                                </div>
                            </div>

                            {/* Location */}
                            {currentEvent.unit && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                        {currentEvent.unit.name}
                                        {currentEvent.room && ` - ${currentEvent.room.name}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats panel */}
                    <div className="flex items-center gap-6 bg-muted/50 p-4 rounded-2xl border min-w-[300px]">
                        {/* Students */}
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                                Alunos
                            </p>
                            <div className="flex -space-x-2 mb-2">
                                {currentEvent.attendees.slice(0, 5).map((attendee) => (
                                    <Tooltip key={attendee.student.id}>
                                        <TooltipTrigger asChild>
                                            <Avatar
                                                className={cn(
                                                    "h-8 w-8 border-2",
                                                    attendee.status === 'PRESENT'
                                                        ? "border-green-500"
                                                        : "border-gray-300"
                                                )}
                                            >
                                                <AvatarImage src={attendee.student.avatar_url || undefined} />
                                                <AvatarFallback className="text-xs">
                                                    {attendee.student.full_name
                                                        ?.split(' ')
                                                        .map(n => n[0])
                                                        .join('')
                                                        .toUpperCase() || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{attendee.student.full_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {attendee.status === 'PRESENT' ? '✓ Presente' : 'Agendado'}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                                {currentEvent.attendees.length > 5 && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="h-8 w-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                +{currentEvent.attendees.length - 5}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <ul className="text-sm space-y-1">
                                                {currentEvent.attendees.slice(5).map(attendee => (
                                                    <li key={attendee.student.id}>
                                                        {attendee.student.full_name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                            <p className="text-xs font-bold text-foreground">
                                {presentStudents.length}/{currentEvent.attendees.length} Presentes
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="h-16 w-px bg-border"></div>

                        {/* Timer */}
                        <div className="text-center min-w-[100px]">
                            <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                                Tempo Decorrido
                            </p>
                            <div className="flex items-center justify-center gap-2 text-2xl font-mono font-bold text-primary">
                                <Timer className="w-5 h-5" />
                                {elapsedTime.formatted}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </TooltipProvider>
    );
}
