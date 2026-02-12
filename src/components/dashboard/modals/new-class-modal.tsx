'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import {
    CalendarIcon,
    Clock,
    Users,
    Home,
    Hash,
    Heart,
    Sparkles,
    Zap,
    Dumbbell,
    Activity,
    Target,
    Waves,
    Music,
    MoreHorizontal,
    type LucideIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface NewClassModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface Room {
    id: string;
    name: string;
    capacity: number | null;
}

interface Instructor {
    id: string;
    full_name: string;
    avatar_url: string | null;
}

interface ClassType {
    value: string;
    label: string;
    icon: LucideIcon;
    color: string;
}

const CLASS_TYPES: ClassType[] = [
    { value: 'yoga', label: 'Yoga', icon: Heart, color: '#10B981' },
    { value: 'pilates', label: 'Pilates', icon: Sparkles, color: '#8B5CF6' },
    { value: 'crossfit', label: 'Crossfit', icon: Zap, color: '#EF4444' },
    { value: 'musculacao', label: 'Musculação', icon: Dumbbell, color: '#F59E0B' },
    { value: 'spinning', label: 'Spinning', icon: Activity, color: '#3B82F6' },
    { value: 'funcional', label: 'Funcional', icon: Target, color: '#EC4899' },
    { value: 'natacao', label: 'Natação', icon: Waves, color: '#06B6D4' },
    { value: 'danca', label: 'Dança', icon: Music, color: '#F97316' },
    { value: 'outro', label: 'Outro', icon: MoreHorizontal, color: '#6B7280' },
];

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

export function NewClassModal({ open, onOpenChange, onSuccess }: NewClassModalProps) {
    const { toast } = useToast();
    const supabase = createClient();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(false);

    const [classType, setClassType] = useState<string>('');
    const [className, setClassName] = useState<string>('');
    const [selectedRoom, setSelectedRoom] = useState<string>('');
    const [selectedInstructor, setSelectedInstructor] = useState<string>('');
    const [capacity, setCapacity] = useState<string>('');
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

            // Fetch rooms
            const { data: roomsData } = await supabase
                .from('rooms')
                .select('id, name, capacity')
                .eq('organization_id', userData.organization_id)
                .order('name');

            if (roomsData) setRooms((roomsData as any[]).map(r => ({
                id: r.id,
                name: r.name,
                capacity: r.capacity || 0
            })));

            // Fetch instructors
            const { data: instructorsData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('organization_id', userData.organization_id)
                .order('full_name');

            if (instructorsData) setInstructors((instructorsData as any[]).map(i => ({
                id: i.id,
                full_name: i.full_name || 'Instrutor',
                avatar_url: i.avatar_url || null
            })));
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Erro ao carregar dados',
                description: 'Não foi possível carregar salas e instrutores.',
                variant: 'destructive',
            });
        }
    }

    async function handleSubmit() {
        // Validation
        if (!classType || !className || !selectedRoom || !selectedInstructor || !capacity || !selectedDate || !selectedTime || !selectedDuration) {
            toast({
                title: 'Campos obrigatórios',
                description: 'Por favor, preencha todos os campos.',
                variant: 'destructive',
            });
            return;
        }

        const capacityNum = parseInt(capacity);
        if (isNaN(capacityNum) || capacityNum <= 0) {
            toast({
                title: 'Capacidade inválida',
                description: 'A capacidade deve ser um número maior que zero.',
                variant: 'destructive',
            });
            return;
        }

        // Check if capacity exceeds room capacity
        const selectedRoomData = rooms.find(r => r.id === selectedRoom);
        const roomCapacity = selectedRoomData?.capacity || 0;
        if (selectedRoomData && capacityNum > roomCapacity) {
            toast({
                title: 'Capacidade excedida',
                description: `A capacidade da sala ${selectedRoomData.name} é de ${selectedRoomData.capacity} pessoas.`,
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

            const { error } = await (supabase
                .from('calendar_events') as any)
                .insert({
                    title: className,
                    room_id: selectedRoom,
                    instructor_id: selectedInstructor,
                    organization_id: userData.organization_id,
                    start_datetime: startDateTime.toISOString(),
                    end_datetime: endDateTime.toISOString(),
                    capacity: capacityNum,
                    type: 'CLASS',
                    status: 'SCHEDULED',
                });

            if (error) throw error;

            toast({
                title: 'Aula criada!',
                description: 'A aula foi agendada com sucesso.',
            });

            // Reset form
            setClassType('');
            setClassName('');
            setSelectedRoom('');
            setSelectedInstructor('');
            setCapacity('');
            setSelectedDate(undefined);
            setSelectedTime('');
            setSelectedDuration('60');

            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error('Error creating class:', error);
            toast({
                title: 'Erro ao criar aula',
                description: 'Não foi possível agendar a aula. Tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display font-bold text-xl text-deep-midnight">
                        Nova Aula
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Class Type */}
                    <div className="space-y-2">
                        <Label htmlFor="classType" className="font-sans text-sm font-medium">
                            Tipo de Aula *
                        </Label>
                        <Select value={classType} onValueChange={setClassType}>
                            <SelectTrigger id="classType">
                                <SelectValue placeholder="Selecione o tipo de aula">
                                    {classType && (() => {
                                        const selected = CLASS_TYPES.find(t => t.value === classType);
                                        if (!selected) return null;
                                        const Icon = selected.icon;
                                        return (
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center justify-center w-6 h-6 rounded" style={{ backgroundColor: selected.color + '20' }}>
                                                    <Icon className="h-4 w-4" style={{ color: selected.color }} />
                                                </div>
                                                <span>{selected.label}</span>
                                            </div>
                                        );
                                    })()}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {CLASS_TYPES.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center justify-center w-6 h-6 rounded" style={{ backgroundColor: type.color + '20' }}>
                                                    <Icon className="h-4 w-4" style={{ color: type.color }} />
                                                </div>
                                                <span>{type.label}</span>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Class Name */}
                    <div className="space-y-2">
                        <Label htmlFor="className" className="font-sans text-sm font-medium flex items-center gap-2">
                            <Hash className="h-4 w-4 text-primary" />
                            Nome da Aula *
                        </Label>
                        <Input
                            id="className"
                            placeholder="Ex: Yoga Matinal, Pilates Avançado"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                        />
                    </div>

                    {/* Room Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="room" className="font-sans text-sm font-medium flex items-center gap-2">
                            <Home className="h-4 w-4 text-primary" />
                            Sala *
                        </Label>
                        <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                            <SelectTrigger id="room">
                                <SelectValue placeholder="Selecione uma sala" />
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

                    {/* Capacity */}
                    <div className="space-y-2">
                        <Label htmlFor="capacity" className="font-sans text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Capacidade *
                        </Label>
                        <Input
                            id="capacity"
                            type="number"
                            min="1"
                            max="100"
                            placeholder="Ex: 10"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                        />
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
                        {loading ? 'Criando...' : 'Criar Aula'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
