'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { CalendarIcon, Clock, User, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface NewWorkoutModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface Student {
    id: string;
    full_name: string;
    avatar_url: string | null;
}

interface Instructor {
    id: string;
    full_name: string;
    avatar_url: string | null;
}

const DURATION_OPTIONS = [
    { value: '30', label: '30 minutos' },
    { value: '60', label: '1 hora' },
    { value: '90', label: '1 hora e 30 minutos' },
    { value: '120', label: '2 horas' },
];

const TIME_SLOTS = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

export function NewWorkoutModal({ open, onOpenChange, onSuccess }: NewWorkoutModalProps) {
    const { toast } = useToast();
    const supabase = createClient();

    const [students, setStudents] = useState<Student[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [selectedInstructor, setSelectedInstructor] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedDuration, setSelectedDuration] = useState<string>('60');

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
            const { data: studentsData } = await (supabase
                .from('students')
                .select('id, full_name' as any)
                .eq('organization_id', userData.organization_id)
                .eq('status', 'ACTIVE')
                .order('full_name') as any);

            if (studentsData) setStudents((studentsData as any[]).map(s => ({
                id: s.id,
                full_name: s.full_name,
                avatar_url: null
            })));

            // Fetch instructors (profiles with instructor role or relevant data)
            const { data: instructorsData } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('organization_id', userData.organization_id)
                .order('full_name');

            if (instructorsData) setInstructors((instructorsData as any[]).map(i => ({
                id: i.id,
                full_name: i.full_name || 'Instrutor',
                avatar_url: null
            })));
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Erro ao carregar dados',
                description: 'Não foi possível carregar alunos e instrutores.',
                variant: 'destructive',
            });
        }
    }

    async function handleSubmit() {
        // Validation
        if (!selectedStudent || !selectedInstructor || !selectedDate || !selectedTime || !selectedDuration) {
            toast({
                title: 'Campos obrigatórios',
                description: 'Por favor, preencha todos os campos.',
                variant: 'destructive',
            });
            return;
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

            const startDateTime = new Date(selectedDate);
            const [hours, minutes] = selectedTime.split(':').map(Number);
            startDateTime.setHours(hours, minutes, 0, 0);

            const endDateTime = new Date(startDateTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + parseInt(selectedDuration));

            const { data: eventData, error: eventError } = await (supabase
                .from('calendar_events') as any)
                .insert({
                    title: 'Treino Individual',
                    instructor_id: selectedInstructor,
                    organization_id: userData.organization_id,
                    start_datetime: startDateTime.toISOString(),
                    end_datetime: endDateTime.toISOString(),
                    type: 'TRAINING',
                    status: 'SCHEDULED',
                })
                .select()
                .single();

            if (eventError) throw eventError;

            // Insert into attendance_logs to link student
            if (eventData) {
                const { error: attendanceError } = await (supabase
                    .from('attendance_logs' as any) as any)
                    .insert({
                        event_id: eventData.id,
                        student_id: selectedStudent,
                        present: false
                    });

                if (attendanceError) throw attendanceError;
            }

            toast({
                title: 'Treino agendado!',
                description: 'O treino foi criado com sucesso.',
            });

            // Reset form
            setSelectedStudent('');
            setSelectedInstructor('');
            setSelectedDate(undefined);
            setSelectedTime('');
            setSelectedDuration('60');

            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error('Error creating workout:', error);
            toast({
                title: 'Erro ao criar treino',
                description: 'Não foi possível agendar o treino. Tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="font-display font-bold text-xl text-deep-midnight">
                        Novo Treino
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Student Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="student" className="font-sans text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Aluno *
                        </Label>
                        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                            <SelectTrigger id="student">
                                <SelectValue placeholder="Selecione um aluno" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map((student) => (
                                    <SelectItem key={student.id} value={student.id}>
                                        {student.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Instructor Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="instructor" className="font-sans text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Instrutor *
                        </Label>
                        <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                            <SelectTrigger id="instructor">
                                <SelectValue placeholder="Selecione um instrutor" />
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

                    {/* Date Selection */}
                    <div className="space-y-2">
                        <Label className="font-sans text-sm font-medium flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            Data *
                        </Label>
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
                                    {selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
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

                    {/* Time Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="time" className="font-sans text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            Horário *
                        </Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                            <SelectTrigger id="time">
                                <SelectValue placeholder="Selecione um horário" />
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

                    {/* Duration Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="duration" className="font-sans text-sm font-medium">
                            Duração *
                        </Label>
                        <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                            <SelectTrigger id="duration">
                                <SelectValue placeholder="Selecione a duração" />
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
                        {loading ? 'Criando...' : 'Criar Treino'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
