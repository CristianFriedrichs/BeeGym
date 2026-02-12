'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { MultiSelect } from '@/components/ui/multi-select';
import {
    CalendarIcon, Clock, Home, Users as UsersIcon, User, LayoutGrid, Dumbbell
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MultiSelectOption {
    value: string;
    label: string;
}

interface NewTrainingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface Student {
    id: string;
    name: string;
}

interface Instructor {
    id: string;
    full_name: string;
}

interface Room {
    id: string;
    name: string;
    capacity: number;
}

type Modality = 'individual' | 'group' | 'open';

const TIME_SLOTS = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

const DURATION_OPTIONS = [
    { value: '30', label: '30 minutos' },
    { value: '45', label: '45 minutos' },
    { value: '60', label: '1 hora' },
    { value: '90', label: '1 hora e 30 minutos' },
];

export function NewTrainingModal({ open, onOpenChange, onSuccess }: NewTrainingModalProps) {
    const { toast } = useToast();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);
    const [modality, setModality] = useState<Modality>('individual');

    // Data sources
    const [students, setStudents] = useState<Student[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);

    // Form fields
    const [trainingName, setTrainingName] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [capacity, setCapacity] = useState('');
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedDuration, setSelectedDuration] = useState('60');

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    async function fetchData() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: userData } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!userData?.organization_id) return;

            // Fetch students
            const { data: studentsData } = await supabase
                .from('students')
                .select('id, full_name')
                .eq('organization_id', userData.organization_id)
                .order('full_name');

            if (studentsData) setStudents((studentsData as any[]).map(s => ({
                id: s.id,
                name: s.full_name
            })));

            // Fetch instructors from profiles
            const { data: instructorsData } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('organization_id', userData.organization_id)
                .order('full_name');

            if (instructorsData) setInstructors(instructorsData as any[]);

            // Fetch rooms
            const { data: roomsData } = await supabase
                .from('rooms')
                .select('id, name, capacity')
                .eq('organization_id', userData.organization_id)
                .order('name');

            if (roomsData) {
                setRooms(roomsData.map(r => ({
                    ...r,
                    capacity: r.capacity || 0
                })));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Erro ao carregar dados',
                description: 'Não foi possível carregar alunos, instrutores e salas.',
                variant: 'destructive',
            });
        }
    }

    function resetForm() {
        setTrainingName('');
        setSelectedStudent('');
        setSelectedStudents([]);
        setCapacity('');
        setSelectedInstructor('');
        setSelectedRoom('');
        setSelectedDate(undefined);
        setSelectedTime('');
        setSelectedDuration('60');
        setModality('individual');
    }

    async function handleSubmit() {
        // Validation
        if (!trainingName || !selectedInstructor || !selectedRoom || !selectedDate || !selectedTime || !selectedDuration) {
            toast({
                title: 'Campos obrigatórios',
                description: 'Por favor, preencha todos os campos.',
                variant: 'destructive',
            });
            return;
        }

        if (modality === 'individual' && !selectedStudent) {
            toast({
                title: 'Aluno obrigatório',
                description: 'Selecione um aluno para o treino individual.',
                variant: 'destructive',
            });
            return;
        }

        if (modality === 'group' && selectedStudents.length === 0) {
            toast({
                title: 'Alunos obrigatórios',
                description: 'Selecione pelo menos 1 aluno para o grupo definido.',
                variant: 'destructive',
            });
            return;
        }

        if (modality === 'open') {
            const capacityNum = parseInt(capacity);
            if (!capacity || isNaN(capacityNum) || capacityNum <= 0) {
                toast({
                    title: 'Capacidade inválida',
                    description: 'A capacidade deve ser um número maior que zero.',
                    variant: 'destructive',
                });
                return;
            }
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { data: userData } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!userData?.organization_id) throw new Error('Organização não encontrada');

            const startDate = new Date(selectedDate);
            const [hours, minutes] = selectedTime.split(':').map(Number);
            startDate.setHours(hours, minutes, 0, 0);

            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + parseInt(selectedDuration));

            const baseEvent = {
                title: trainingName,
                instructor_id: selectedInstructor,
                room_id: selectedRoom,
                organization_id: userData.organization_id,
                start_datetime: startDate.toISOString(),
                end_datetime: endDate.toISOString(),
                status: 'SCHEDULED',
            };

            if (modality === 'individual') {
                // Individual: insert event then attendance
                const { data: eventData, error: eventError } = await (supabase
                    .from('calendar_events') as any)
                    .insert({
                        ...baseEvent,
                        type: 'TRAINING',
                    })
                    .select()
                    .single();

                if (eventError) throw eventError;

                if (eventData) {
                    await (supabase.from('attendance_logs' as any) as any).insert({
                        event_id: eventData.id,
                        student_id: selectedStudent,
                        present: false
                    });
                }

                toast({
                    title: 'Treino agendado!',
                    description: 'Treino individual criado com sucesso.',
                });
            } else if (modality === 'group') {
                // Grupo Definido: insert event then multiple attendances
                const { data: eventData, error: eventError } = await (supabase
                    .from('calendar_events') as any)
                    .insert({
                        ...baseEvent,
                        type: 'TRAINING',
                    })
                    .select()
                    .single();

                if (eventError) throw eventError;

                if (eventData) {
                    const attendances = selectedStudents.map(studentId => ({
                        event_id: eventData.id,
                        student_id: studentId,
                        present: false
                    }));
                    await (supabase.from('attendance_logs' as any) as any).insert(attendances);
                }

                toast({
                    title: 'Treinos agendados!',
                    description: `${selectedStudents.length} aluno(s) adicionados ao treino.`,
                });
            } else {
                // Grupo Aberto: 1 evento com capacity
                const { error } = await (supabase
                    .from('calendar_events') as any)
                    .insert({
                        ...baseEvent,
                        capacity: parseInt(capacity),
                        type: 'CLASS',
                    });

                if (error) throw error;

                toast({
                    title: 'Treino aberto agendado!',
                    description: `Treino com ${capacity} vagas criado com sucesso.`,
                });
            }

            resetForm();
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error('Error creating training:', error);
            toast({
                title: 'Erro ao agendar treino',
                description: 'Não foi possível criar o treino. Tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    const studentOptions: MultiSelectOption[] = students.map(s => ({
        value: s.id,
        label: s.name,
    }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display font-bold text-xl text-deep-midnight flex items-center gap-2">
                        <Dumbbell className="h-6 w-6 text-primary" />
                        Novo Treino
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Seção 1: Seletor de Modalidade */}
                    <div className="space-y-3">
                        <Label className="font-sans font-medium text-sm text-deep-midnight">
                            Tipo de Treino *
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                            <Card
                                className={cn(
                                    'cursor-pointer transition-all hover:shadow-md',
                                    modality === 'individual' && 'border-primary bg-primary/5 ring-2 ring-primary'
                                )}
                                onClick={() => setModality('individual')}
                            >
                                <CardContent className="flex flex-col items-center gap-2 p-4">
                                    <User className={cn(
                                        'h-8 w-8',
                                        modality === 'individual' ? 'text-primary' : 'text-muted-foreground'
                                    )} />
                                    <span className={cn(
                                        'text-sm font-medium text-center',
                                        modality === 'individual' ? 'text-primary' : 'text-muted-foreground'
                                    )}>
                                        Individual
                                    </span>
                                </CardContent>
                            </Card>

                            <Card
                                className={cn(
                                    'cursor-pointer transition-all hover:shadow-md',
                                    modality === 'group' && 'border-primary bg-primary/5 ring-2 ring-primary'
                                )}
                                onClick={() => setModality('group')}
                            >
                                <CardContent className="flex flex-col items-center gap-2 p-4">
                                    <UsersIcon className={cn(
                                        'h-8 w-8',
                                        modality === 'group' ? 'text-primary' : 'text-muted-foreground'
                                    )} />
                                    <span className={cn(
                                        'text-sm font-medium text-center',
                                        modality === 'group' ? 'text-primary' : 'text-muted-foreground'
                                    )}>
                                        Grupo Definido
                                    </span>
                                </CardContent>
                            </Card>

                            <Card
                                className={cn(
                                    'cursor-pointer transition-all hover:shadow-md',
                                    modality === 'open' && 'border-primary bg-primary/5 ring-2 ring-primary'
                                )}
                                onClick={() => setModality('open')}
                            >
                                <CardContent className="flex flex-col items-center gap-2 p-4">
                                    <LayoutGrid className={cn(
                                        'h-8 w-8',
                                        modality === 'open' ? 'text-primary' : 'text-muted-foreground'
                                    )} />
                                    <span className={cn(
                                        'text-sm font-medium text-center',
                                        modality === 'open' ? 'text-primary' : 'text-muted-foreground'
                                    )}>
                                        Grupo Aberto
                                    </span>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Seção 2: Campos Dinâmicos (Aluno/Alunos/Capacidade) */}
                    <div className="space-y-4">
                        {modality === 'individual' && (
                            <div className="space-y-2">
                                <Label htmlFor="student" className="font-sans font-medium text-sm text-deep-midnight">
                                    Aluno *
                                </Label>
                                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                    <SelectTrigger id="student">
                                        <SelectValue placeholder="Selecione o aluno" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((student) => (
                                            <SelectItem key={student.id} value={student.id}>
                                                {student.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {modality === 'group' && (
                            <div className="space-y-2">
                                <Label className="font-sans font-medium text-sm text-deep-midnight">
                                    Alunos * (múltipla seleção)
                                </Label>
                                <MultiSelect
                                    options={studentOptions}
                                    selected={selectedStudents}
                                    onChange={setSelectedStudents}
                                    placeholder="Selecione os alunos"
                                />
                            </div>
                        )}

                        {modality === 'open' && (
                            <div className="space-y-2">
                                <Label htmlFor="capacity" className="font-sans font-medium text-sm text-deep-midnight">
                                    Capacidade Máxima *
                                </Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min="1"
                                    max="20"
                                    placeholder="Ex: 4"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Seção 3: Campos Comuns */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="trainingName" className="font-sans font-medium text-sm text-deep-midnight">
                                Nome do Treino *
                            </Label>
                            <Input
                                id="trainingName"
                                placeholder="Ex: Treino Funcional, Fisioterapia"
                                value={trainingName}
                                onChange={(e) => setTrainingName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="instructor" className="font-sans font-medium text-sm text-deep-midnight">
                                    Instrutor *
                                </Label>
                                <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                                    <SelectTrigger id="instructor">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {instructors.map((instructor) => (
                                            <SelectItem key={instructor.id} value={instructor.id}>
                                                {instructor.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="room" className="font-sans font-medium text-sm text-deep-midnight flex items-center gap-2">
                                    <Home className="h-4 w-4 text-primary" />
                                    Local *
                                </Label>
                                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                                    <SelectTrigger id="room">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id}>
                                                {room.name} (Cap: {room.capacity})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="font-sans font-medium text-sm text-deep-midnight">Data *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !selectedDate && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : 'Selecione'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="time" className="font-sans font-medium text-sm text-deep-midnight flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    Horário *
                                </Label>
                                <Select value={selectedTime} onValueChange={setSelectedTime}>
                                    <SelectTrigger id="time">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {TIME_SLOTS.map((time) => (
                                            <SelectItem key={time} value={time}>
                                                {time}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration" className="font-sans font-medium text-sm text-deep-midnight">
                                    Duração *
                                </Label>
                                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                                    <SelectTrigger id="duration">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DURATION_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                        {loading ? 'Agendando...' : 'Agendar Treino'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
