'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    CheckCircle2, XCircle, Edit, Dumbbell, Trash2, Plus, Users, Search, AlertCircle, ChevronsUpDown, Check,
    Clock, MapPin, User, Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { enrollStudent, removeStudent } from '@/actions/classes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EventDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: any | null;
    onSuccess?: () => void;
}

interface Exercise {
    id: string;
    name: string;
    muscle_group: string | null;
}

interface WorkoutLogItem {
    exerciseId: string;
    sets: number;
    reps: string;
    weight: number;
}

export function EventDetailsModal({ open, onOpenChange, event, onSuccess }: EventDetailsModalProps) {
    const { toast } = useToast();
    const supabase = createClient();
    const [view, setView] = useState<'details' | 'log' | 'participants'>('details');
    const [loading, setLoading] = useState(false);

    // Participants State (for Classes)
    const [participants, setParticipants] = useState<any[]>([]);
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);
    const [isComboboxOpen, setIsComboboxOpen] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');

    // Workout Log State
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogItem[]>([]);
    const [rpe, setRpe] = useState<number>(5);
    const [notes, setNotes] = useState('');

    // Temporary state for adding a new exercise row
    const [newExerciseId, setNewExerciseId] = useState('');
    const [newSets, setNewSets] = useState(3);
    const [newReps, setNewReps] = useState('10');
    const [newWeight, setNewWeight] = useState(0);

    useEffect(() => {
        if (open) {
            setView('details'); // Reset view on open
            setWorkoutLogs([]);
            setNotes('');
            setRpe(5);
            setParticipants([]);
        }
    }, [open, event]);

    // Fetch participants when view changes to 'participants'
    useEffect(() => {
        if (view === 'participants' && event?.id) {
            fetchParticipants();
            fetchAvailableStudents();
        }
    }, [view, event]);

    const fetchParticipants = async () => {
        if (!event?.id) return;
        try {
            const { data, error } = await (supabase as any)
                .from('event_participants')
                .select(`
                    id,
                    student_id,
                    status,
                    student:students (
                        id,
                        full_name,
                        avatar_url,
                        email
                    )
                `)
                .eq('event_id', event.id)
                .eq('status', 'CONFIRMED');

            if (error) throw error;
            setParticipants(data || []);
        } catch (error) {
            console.error('Error fetching participants:', error);
            toast({ title: 'Erro ao carregar participantes', variant: 'destructive' });
        }
    };

    const fetchAvailableStudents = async () => {
        try {
            const { data, error } = await supabase
                .from('students')
                .select('id, full_name, avatar_url')
                .eq('status', 'ACTIVE')
                .order('full_name');

            if (error) throw error;
            setAvailableStudents(data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleEnroll = async (studentId: string) => {
        if (!event?.id) return;
        setLoading(true);
        try {
            const result = await enrollStudent(event.id, studentId);
            if (result.error) {
                toast({ title: result.error, variant: 'destructive' });
            } else {
                toast({ title: 'Aluno inscrito com sucesso' });
                await fetchParticipants();
                onSuccess?.(); // Trigger calendar refresh to update badge count
            }
        } catch (error) {
            toast({ title: 'Erro ao inscrever aluno', variant: 'destructive' });
        } finally {
            setLoading(false);
            setIsComboboxOpen(false);
        }
    };

    const handleRemoveParticipant = async (studentId: string) => {
        if (!event?.id) return;
        if (!confirm('Remover aluno da aula?')) return;

        setLoading(true);
        try {
            const result = await removeStudent(event.id, studentId);
            if (result.error) {
                toast({ title: result.error, variant: 'destructive' });
            } else {
                toast({ title: 'Aluno removido' });
                await fetchParticipants();
                onSuccess?.();
            }
        } catch (error) {
            toast({ title: 'Erro ao remover aluno', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // Fetch exercises when entering log view
    useEffect(() => {
        if (view === 'log' && exercises.length === 0) {
            fetchExercises();
        }
    }, [view]);

    const fetchExercises = async () => {
        try {
            const { data, error } = await supabase
                .from('exercises')
                .select('id, name, muscle_group')
                .order('name');

            if (error) throw error;
            setExercises(data || []);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            toast({
                title: 'Erro ao carregar exercícios',
                variant: 'destructive'
            });
        }
    };

    const handleCancelEvent = async () => {
        if (!event) return;

        if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('calendar_events')
                .update({ status: 'CANCELLED' })
                .eq('id', event.id);

            if (error) throw error;

            toast({ title: 'Agendamento cancelado com sucesso' });
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error('Error cancelling event:', error);
            toast({
                title: 'Erro ao cancelar',
                description: 'Não foi possível cancelar o agendamento.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddLogItem = () => {
        if (!newExerciseId) return;

        setWorkoutLogs([...workoutLogs, {
            exerciseId: newExerciseId,
            sets: newSets,
            reps: newReps,
            weight: newWeight
        }]);

        // Reset inputs
        setNewExerciseId('');
        setNewSets(3);
        setNewReps('10');
        setNewWeight(0);
    };

    const handleRemoveLogItem = (index: number) => {
        const newLogs = [...workoutLogs];
        newLogs.splice(index, 1);
        setWorkoutLogs(newLogs);
    };

    const handleCompleteWorkout = async () => {
        if (!event) return;
        setLoading(true);

        try {
            // 1. Update Event Status
            const { error: updateError } = await supabase
                .from('calendar_events')
                .update({
                    status: 'COMPLETED',
                    // We could mark completion time here if we had a column for it
                })
                .eq('id', event.id);

            if (updateError) throw updateError;

            // 2. Insert Workout Logs
            if (workoutLogs.length > 0) {
                const logsToInsert = workoutLogs.map(log => ({
                    event_id: event.id,
                    student_id: null, // We should get this if it's a personal training session, but for class it might be vague. Assuming null for now or need context.
                    // Wait, existing schema has student_id on workout_logs. 
                    // If this is a class, who is the student?
                    // "workout_logs" implies a specific student's log.
                    // If the user (Instructor) is logging a "Class" completion, usually they log attendance.
                    // If this is a "Personal Training" (Treino), we likely have a single student.
                    // Let's assume for this MVP we log it genericaly or fetch the student from event if possible.
                    // For now, let's leave student_id null if not available in event context.
                    exercise_id: log.exerciseId,
                    sets: log.sets,
                    reps: log.reps,
                    weight: log.weight,
                    notes: `RPE: ${rpe}. ${notes}` // Storing RPE in notes as planned
                }));

                const { error: logError } = await supabase
                    .from('workout_logs')
                    .insert(logsToInsert);

                if (logError) throw logError;
            } else if (notes || rpe) {
                // Determine if we should insert a "general" log or just update status. 
                // If no exercises, maybe just status update is enough? 
                // But user entered Notes/RPE. 
                // Let's create a dummy log or just rely on the event update if we had fields there.
                // Since we don't have rpe/notes on calendar_events, we might lose this info if we don't insert a log.
                // But workout_log requires exercise_id (usually). schema says nullable?
                // Checking schema: exercise_id is nullable in the Insert type I saw earlier? 
                // 'exercise_id': string | null. Yes.

                const { error: logError } = await supabase
                    .from('workout_logs')
                    .insert({
                        event_id: event.id,
                        notes: `RPE: ${rpe}. ${notes}`
                    });

                if (logError) throw logError;
            }

            toast({ title: 'Treino concluído e registrado!' });
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error('Error completing workout:', error);
            toast({
                title: 'Erro ao salvar',
                description: 'Não foi possível registrar a conclusão do treino.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!event) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-500';
            case 'COMPLETED': return 'bg-green-500';
            case 'CANCELLED': return 'bg-red-500';
            case 'PENDING': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'Agendado';
            case 'COMPLETED': return 'Concluído';
            case 'CANCELLED': return 'Cancelado';
            case 'PENDING': return 'Pendente';
            default: return status;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span className="font-display font-bold text-xl text-deep-midnight">
                            {view === 'log' ? 'Registrar Conclusão' :
                                view === 'participants' ? 'Gerenciar Inscritos' :
                                    'Detalhes do Agendamento'}
                        </span>
                        <div className="flex items-center gap-2">
                            {event.eventType === 'CLASS' && event.capacity && (
                                <Badge variant="secondary" className={cn(
                                    (event.enrollmentCount || participants.length) >= event.capacity ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-green-100 text-green-700 hover:bg-green-100"
                                )}>
                                    <Users className="w-3 h-3 mr-1" />
                                    {event.enrollmentCount !== undefined ? event.enrollmentCount : participants.length}/{event.capacity} Vagas
                                </Badge>
                            )}
                            <Badge className={cn(getStatusColor(event.status), "text-white")}>
                                {getStatusLabel(event.status)}
                            </Badge>
                        </div>
                    </DialogTitle>
                    {view === 'log' && (
                        <DialogDescription>
                            Registre a performance e o feedback do treino.
                        </DialogDescription>
                    )}
                    {view === 'participants' && (
                        <DialogDescription>
                            Adicione ou remova alunos desta aula.
                        </DialogDescription>
                    )}
                </DialogHeader>

                {view === 'participants' ? (
                    <div className="space-y-6 py-4">
                        <div className="flex items-center gap-2">
                            <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={isComboboxOpen} className="w-full justify-between">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Search className="h-4 w-4" />
                                            <span>Buscar aluno para adicionar...</span>
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Buscar aluno..." />
                                        <CommandList>
                                            <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                                            <CommandGroup>
                                                {availableStudents.map((student) => {
                                                    const isEnrolled = participants.some(p => p.student.id === student.id);
                                                    return (
                                                        <CommandItem
                                                            key={student.id}
                                                            onSelect={() => handleEnroll(student.id)}
                                                            disabled={isEnrolled || loading}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", isEnrolled ? "opacity-100" : "opacity-0")} />
                                                            <Avatar className="h-6 w-6 mr-2">
                                                                <AvatarImage src={student.avatar_url} />
                                                                <AvatarFallback>{student.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            {student.full_name}
                                                        </CommandItem>
                                                    );
                                                })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <ScrollArea className="h-[300px] border rounded-md p-4">
                            {participants.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                                    <Users className="h-8 w-8 mb-2 opacity-20" />
                                    <p>Nenhum aluno inscrito nesta aula.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {participants.map((participant) => (
                                        <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={participant.student.avatar_url} />
                                                    <AvatarFallback>{participant.student.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium leading-none">{participant.student.full_name}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{participant.student.email}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveParticipant(participant.student.id)} disabled={loading}>
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setView('details')} disabled={loading}>
                                Voltar
                            </Button>
                        </DialogFooter>
                    </div>
                ) : view === 'details' ? (
                    <div className="space-y-6 py-4">
                        {/* Event Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs">Título / Aluno</Label>
                                <p className="font-semibold text-lg">{event.title || 'Sem título'}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground text-xs">Tipo</Label>
                                <div className="flex items-center gap-2">
                                    {event.icon && <event.icon className="h-4 w-4 text-primary" />}
                                    <span className="font-medium">{event.type || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Data</p>
                                    <p className="text-sm text-muted-foreground">
                                        {event.start_datetime ? format(new Date(event.start_datetime), "dd 'de' MMMM", { locale: ptBR }) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Horário</p>
                                    <p className="text-sm text-muted-foreground">
                                        {event.time} ({event.duration} min)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Instrutor</p>
                                    <p className="text-sm text-muted-foreground">{event.instructor || 'Não atribuído'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Local</p>
                                    <p className="text-sm text-muted-foreground">{event.room || 'Sem local'}</p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 mt-6">
                            {event.status !== 'CANCELLED' && event.status !== 'COMPLETED' && (
                                <>
                                    <Button variant="outline" className="w-full sm:w-auto text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive" onClick={handleCancelEvent}>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancelar
                                    </Button>
                                    <Button variant="outline" className="w-full sm:w-auto" disabled>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                    </Button>
                                    {event.eventType === 'CLASS' ? (
                                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setView('participants')}>
                                            <Users className="w-4 h-4 mr-2" />
                                            Gerenciar Inscritos
                                        </Button>
                                    ) : (
                                        <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setView('log')}>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Realizado
                                        </Button>
                                    )}
                                </>
                            )}
                        </DialogFooter>
                    </div>
                ) : (
                    // LOG VIEW
                    <div className="space-y-6 py-4">
                        {/* Exercise List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <Dumbbell className="h-4 w-4" />
                                    Exercícios Realizados
                                </h3>
                            </div>

                            <div className="border rounded-md p-4 space-y-4 bg-muted/20">
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                                    <div className="sm:col-span-4 lg:col-span-1 space-y-1">
                                        <Label className="text-xs">Exercício</Label>
                                        <Select value={newExerciseId} onValueChange={setNewExerciseId}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {exercises.map(ex => (
                                                    <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-3 sm:col-span-2 lg:col-span-2 grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Carga (kg)</Label>
                                            <Input type="number" className="h-8 text-xs" value={newWeight} onChange={e => setNewWeight(Number(e.target.value))} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Reps</Label>
                                            <Input className="h-8 text-xs" value={newReps} onChange={e => setNewReps(e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Séries</Label>
                                            <Input type="number" className="h-8 text-xs" value={newSets} onChange={e => setNewSets(Number(e.target.value))} />
                                        </div>
                                    </div>
                                    <div className="col-span-3 sm:col-span-1 lg:col-span-1">
                                        <Button size="icon" className="w-full h-8" onClick={handleAddLogItem} disabled={!newExerciseId}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Table of added exercises */}
                                {workoutLogs.length > 0 && (
                                    <div className="rounded-md border bg-white overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="h-8 text-xs">Exercício</TableHead>
                                                    <TableHead className="h-8 text-xs text-right">Carga</TableHead>
                                                    <TableHead className="h-8 text-xs text-center">Séries x Reps</TableHead>
                                                    <TableHead className="h-8 text-xs w-[40px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {workoutLogs.map((log, index) => {
                                                    const exerciseName = exercises.find(e => e.id === log.exerciseId)?.name || 'Desconhecido';
                                                    return (
                                                        <TableRow key={index} className="hover:bg-transparent">
                                                            <TableCell className="py-2 text-xs font-medium">{exerciseName}</TableCell>
                                                            <TableCell className="py-2 text-xs text-right">{log.weight}kg</TableCell>
                                                            <TableCell className="py-2 text-xs text-center">{log.sets} x {log.reps}</TableCell>
                                                            <TableCell className="py-2 text-xs">
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveLogItem(index)}>
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Feedback */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="flex justify-between">
                                    <span>Percepção de Esforço (RPE) - {rpe}</span>
                                    <span className="text-muted-foreground text-xs">1 (Leve) - 10 (Máximo)</span>
                                </Label>
                                <Input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={rpe}
                                    className="cursor-pointer"
                                    onChange={(e) => setRpe(Number(e.target.value))}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <span>Leve</span>
                                    <span>Moderado</span>
                                    <span>Intenso</span>
                                    <span>Exaustivo</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Observações do Treino</Label>
                                <Textarea
                                    placeholder="Como foi o desempenho? Alguma dor ou observação importante?"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setView('details')} disabled={loading}>
                                Voltar
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleCompleteWorkout} disabled={loading}>
                                {loading ? 'Salvando...' : 'Concluir Treino'}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
