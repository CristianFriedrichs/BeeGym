'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import {
    CalendarIcon, Clock, Home, Users, Hash, Palette,
    Dumbbell, Heart, Zap, Activity, Target, Flame, Bike, PersonStanding,
    Wind, Waves, Volleyball, Trophy, Swords, Footprints, Sparkles, Smile
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CreateRecurringClassModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface Room {
    id: string;
    name: string;
    capacity: number;
}

interface Instructor {
    id: string;
    full_name: string;
    avatar_url: string | null;
}

const ICON_OPTIONS = [
    { name: 'dumbbell', icon: Dumbbell, label: 'Musculação' },
    { name: 'heart', icon: Heart, label: 'Cardio' },
    { name: 'zap', icon: Zap, label: 'Energia' },
    { name: 'activity', icon: Activity, label: 'Atividade' },
    { name: 'target', icon: Target, label: 'Foco' },
    { name: 'flame', icon: Flame, label: 'Intenso' },
    { name: 'bike', icon: Bike, label: 'Ciclismo' },
    { name: 'run', icon: PersonStanding, label: 'Corrida' },
    { name: 'wind', icon: Wind, label: 'Yoga' },
    { name: 'smile', icon: Smile, label: 'Relax' },
    { name: 'sparkles', icon: Sparkles, label: 'Fisioterapia' },
    { name: 'swords', icon: Swords, label: 'Boxe' },
    { name: 'footprints', icon: Footprints, label: 'Futebol' },
    { name: 'waves', icon: Waves, label: 'Natação' },
    { name: 'volleyball', icon: Volleyball, label: 'Vôlei' },
    { name: 'trophy', icon: Trophy, label: 'Basquete/Tênis' },
];

const COLOR_OPTIONS = [
    { name: 'orange', value: '#FF8C00', label: 'Laranja' },
    { name: 'blue', value: '#3B82F6', label: 'Azul' },
    { name: 'green', value: '#10B981', label: 'Verde' },
    { name: 'purple', value: '#8B5CF6', label: 'Roxo' },
    { name: 'pink', value: '#EC4899', label: 'Rosa' },
    { name: 'red', value: '#EF4444', label: 'Vermelho' },
    { name: 'yellow', value: '#F59E0B', label: 'Amarelo' },
    { name: 'teal', value: '#14B8A6', label: 'Turquesa' },
    { name: 'indigo', value: '#6366F1', label: 'Índigo' },
];

const WEEKDAYS = [
    { value: 1, short: 'Seg', full: 'Segunda' },
    { value: 2, short: 'Ter', full: 'Terça' },
    { value: 3, short: 'Qua', full: 'Quarta' },
    { value: 4, short: 'Qui', full: 'Quinta' },
    { value: 5, short: 'Sex', full: 'Sexta' },
    { value: 6, short: 'Sáb', full: 'Sábado' },
    { value: 0, short: 'Dom', full: 'Domingo' },
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

export function CreateRecurringClassModal({ open, onOpenChange, onSuccess }: CreateRecurringClassModalProps) {
    const { toast } = useToast();
    const supabase = createClient();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(false);

    // Section 1: Basic Info
    const [className, setClassName] = useState<string>('');
    const [selectedInstructor, setSelectedInstructor] = useState<string>('');
    const [selectedRoom, setSelectedRoom] = useState<string>('');

    // Section 2: Visual Identity
    const [selectedIcon, setSelectedIcon] = useState<string>('dumbbell');
    const [selectedColor, setSelectedColor] = useState<string>('orange');

    // Section 3: Recurring Schedule
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedDuration, setSelectedDuration] = useState<string>('60');

    // Section 4: Rules
    const [capacity, setCapacity] = useState<string>('');

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
                .from('users')
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

            if (roomsData) setRooms(roomsData);

            // Fetch instructors
            const { data: instructorsData } = await supabase
                .from('users')
                .select('id, full_name, avatar_url')
                .eq('organization_id', userData.organization_id)
                .order('full_name');

            if (instructorsData) setInstructors(instructorsData as Instructor[]);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Erro ao carregar dados',
                description: 'Não foi possível carregar salas e instrutores.',
                variant: 'destructive',
            });
        }
    }

    function toggleDay(day: number) {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    }

    function generateRecurringEvents(
        start: Date,
        end: Date,
        days: number[],
        time: string,
        duration: number
    ): Date[] {
        const events: Date[] = [];
        const currentDate = new Date(start);
        const finalDate = new Date(end);

        while (currentDate <= finalDate) {
            if (days.includes(currentDate.getDay())) {
                events.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return events;
    }

    async function handleSubmit() {
        // Validation
        if (!className || !selectedInstructor || !selectedRoom || !startDate || !endDate ||
            selectedDays.length === 0 || !selectedTime || !capacity) {
            toast({
                title: 'Campos obrigatórios',
                description: 'Por favor, preencha todos os campos.',
                variant: 'destructive',
            });
            return;
        }

        // Validate end date >= start date
        if (endDate < startDate) {
            toast({
                title: 'Data inválida',
                description: 'A Data de Término deve ser maior ou igual à Data de Início.',
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

        // Check room capacity
        const selectedRoomData = rooms.find(r => r.id === selectedRoom);
        if (selectedRoomData && capacityNum > selectedRoomData.capacity) {
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
                .from('users')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!userData?.organization_id) throw new Error('Organização não encontrada');

            // Generate recurring events
            const eventDates = generateRecurringEvents(
                startDate,
                endDate,
                selectedDays,
                selectedTime,
                parseInt(selectedDuration)
            );

            if (eventDates.length === 0) {
                toast({
                    title: 'Nenhum evento gerado',
                    description: 'Verifique os dias da semana selecionados e o período.',
                    variant: 'destructive',
                });
                setLoading(false);
                return;
            }

            // Insert all events
            const eventsToInsert = eventDates.map(date => ({
                name: className,
                room_id: selectedRoom,
                instructor_id: selectedInstructor,
                organization_id: userData.organization_id,
                date: format(date, 'yyyy-MM-dd'),
                start_time: selectedTime,
                duration: parseInt(selectedDuration),
                capacity_limit: capacityNum,
                event_type: 'AULA',
                status: 'SCHEDULED',
                icon: selectedIcon,
                color: COLOR_OPTIONS.find(c => c.name === selectedColor)?.value || '#FF8C00',
                day_of_week: WEEKDAYS.find(w => w.value === date.getDay())?.full || '',
            }));

            const { error } = await supabase
                .from('calendar_events')
                .insert(eventsToInsert);

            if (error) throw error;

            toast({
                title: 'Aulas criadas!',
                description: `${eventDates.length} aula(s) recorrente(s) foram agendadas com sucesso.`,
            });

            // Reset form
            setClassName('');
            setSelectedInstructor('');
            setSelectedRoom('');
            setSelectedIcon('dumbbell');
            setSelectedColor('orange');
            setStartDate(undefined);
            setEndDate(undefined);
            setSelectedDays([]);
            setSelectedTime('');
            setSelectedDuration('60');
            setCapacity('');

            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error('Error creating recurring class:', error);
            toast({
                title: 'Erro ao criar aulas',
                description: 'Não foi possível agendar as aulas. Tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    const SelectedIconComponent = ICON_OPTIONS.find(i => i.name === selectedIcon)?.icon || Dumbbell;
    const selectedColorValue = COLOR_OPTIONS.find(c => c.name === selectedColor)?.value || '#FF8C00';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display font-bold text-xl text-deep-midnight">
                        Nova Aula Recorrente
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Section 1: Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-display font-bold text-lg text-deep-midnight flex items-center gap-2">
                            <Hash className="h-5 w-5 text-primary" />
                            Informações Básicas
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="className" className="font-sans font-medium text-sm">
                                Nome da Aula *
                            </Label>
                            <Input
                                id="className"
                                placeholder="Ex: Yoga Matinal, Pilates Avançado"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="instructor" className="font-sans font-medium text-sm flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" />
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
                                <Label htmlFor="room" className="font-sans font-medium text-sm flex items-center gap-2">
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
                    </div>

                    <Separator />

                    {/* Section 2: Visual Identity */}
                    <div className="space-y-4">
                        <h3 className="font-display font-bold text-lg text-deep-midnight flex items-center gap-2">
                            <Palette className="h-5 w-5 text-primary" />
                            Identidade Visual
                        </h3>

                        <div className="space-y-2">
                            <Label className="font-sans font-medium text-sm">Ícone *</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {ICON_OPTIONS.map((option) => {
                                    const IconComponent = option.icon;
                                    return (
                                        <Button
                                            key={option.name}
                                            type="button"
                                            variant={selectedIcon === option.name ? "default" : "outline"}
                                            className={cn(
                                                "h-16 flex flex-col gap-1",
                                                selectedIcon === option.name && "bg-primary hover:bg-primary/90"
                                            )}
                                            onClick={() => setSelectedIcon(option.name)}
                                        >
                                            <IconComponent className="h-6 w-6" />
                                            <span className="text-xs">{option.label}</span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color" className="font-sans font-medium text-sm">Cor *</Label>
                            <Select value={selectedColor} onValueChange={setSelectedColor}>
                                <SelectTrigger id="color">
                                    <SelectValue placeholder="Selecione uma cor">
                                        {selectedColor && (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: COLOR_OPTIONS.find(c => c.name === selectedColor)?.value }}
                                                />
                                                <span>{COLOR_OPTIONS.find(c => c.name === selectedColor)?.label}</span>
                                            </div>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {COLOR_OPTIONS.map((option) => (
                                        <SelectItem key={option.name} value={option.name}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: option.value }}
                                                />
                                                <span>{option.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-sans font-medium text-sm">Preview</Label>
                            <Badge
                                className="text-white font-semibold px-4 py-2"
                                style={{ backgroundColor: selectedColorValue }}
                            >
                                <SelectedIconComponent className="h-4 w-4 mr-2" />
                                {className || 'Nome da Aula'}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Section 3: Recurring Schedule */}
                    <div className="space-y-4">
                        <h3 className="font-display font-bold text-lg text-deep-midnight flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            Agendamento Recorrente
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-sans font-medium text-sm">Data de Início *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !startDate && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, 'PPP', { locale: ptBR }) : 'Selecione'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-sans font-medium text-sm">Data de Término *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !endDate && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, 'PPP', { locale: ptBR }) : 'Selecione'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            disabled={(date) => {
                                                const today = new Date(new Date().setHours(0, 0, 0, 0));
                                                return date < today || (startDate ? date < startDate : false);
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-sans font-medium text-sm">Dias da Semana *</Label>
                            <div className="flex gap-2">
                                {WEEKDAYS.map((day) => (
                                    <Button
                                        key={day.value}
                                        type="button"
                                        variant={selectedDays.includes(day.value) ? "default" : "outline"}
                                        className={cn(
                                            "w-12 h-12 p-0",
                                            selectedDays.includes(day.value) && "bg-primary hover:bg-primary/90"
                                        )}
                                        onClick={() => toggleDay(day.value)}
                                    >
                                        {day.short}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="time" className="font-sans font-medium text-sm flex items-center gap-2">
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
                                <Label htmlFor="duration" className="font-sans font-medium text-sm">
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

                    <Separator />

                    {/* Section 4: Rules */}
                    <div className="space-y-4">
                        <h3 className="font-display font-bold text-lg text-deep-midnight flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Regras
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="capacity" className="font-sans font-medium text-sm">
                                Capacidade Máxima *
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
                        {loading ? 'Criando...' : 'Salvar Aula'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
