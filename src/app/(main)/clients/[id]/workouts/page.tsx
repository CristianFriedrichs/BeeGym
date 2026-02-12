'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Calendar as CalendarIcon, Dumbbell, GripVertical, Sparkles, Trash2, MoreHorizontal, Edit, Check } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { exercises as exerciseLibrary, Exercise } from '@/lib/exercises';
import { generateWorkout, GenerateWorkoutInput } from '@/ai/flows/generate-workout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';


// Mock data matching the one from the client detail page
const students = [
    {
        id: 1,
        name: 'Milos Vasiljevic',
        goals: 'Hipertrofia e definição muscular.',
        restrictions: 'Nenhuma restrição física conhecida.',
        avatar: 'https://i.pravatar.cc/150?img=13'
    },
    {
        id: 2,
        name: 'Jovana Pavlovic',
        goals: 'Perda de peso e melhora do condicionamento cardiovascular.',
        restrictions: 'Leve desconforto no joelho direito.',
        avatar: 'https://i.pravatar.cc/150?img=16'
    },
    {
        id: 3,
        name: 'Nikola Vujinovic',
        goals: 'Aumentar a disposição e reduzir o estresse.',
        restrictions: 'Nenhuma.',
        avatar: 'https://i.pravatar.cc/150?img=15'
    },
    {
        id: 4,
        name: "Ana Clara",
        goals: "Hipertrofia e definição muscular.",
        restrictions: "Nenhuma restrição física conhecida.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop"
    }
];

const weekDays = [
    { value: "1", label: "S" },
    { value: "2", label: "T" },
    { value: "3", label: "Q" },
    { value: "4", label: "Q" },
    { value: "5", label: "S" },
    { value: "6", label: "S" },
    { value: "0", label: "D" },
];

const durationOptions = [
    { value: 30, label: '30 dias' },
    { value: 60, label: '60 dias' },
    { value: 90, label: '90 dias' },
];

const timeSlots: string[] = [];
for (let h = 6; h < 23; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`);
    timeSlots.push(`${String(h).padStart(2, '0')}:30`);
}

const WorkoutEditor = () => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const studentId = parseInt(params.id as string, 10);
    const workoutId = searchParams.get('workoutId');
    const isEditing = !!workoutId;
    const student = students.find(s => s.id === studentId);

    // Form states
    const [workoutName, setWorkoutName] = useState('');
    const [workoutStatus, setWorkoutStatus] = useState<'Planejado' | 'Realizado'>('Planejado');
    const [workoutNotes, setWorkoutNotes] = useState('');
    const [selectedExercises, setSelectedExercises] = useState<{ name: string, sets: string, reps: string, done: boolean }[]>([]);

    // Scheduling states
    const [scheduleType, setScheduleType] = useState<'date' | 'recurring'>('date');
    const [singleDate, setSingleDate] = useState<Date | undefined>(new Date());
    const [singleTime, setSingleTime] = useState<string>('09:00');
    const [singleDateDuration, setSingleDateDuration] = useState<string>('60');
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [duration, setDuration] = useState<number>(30);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    // Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Exercise[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [allExercises, setAllExercises] = useState<Exercise[]>([]);

    // New Exercise Dialog State
    const [isCreateExDialogOpen, setCreateExDialogOpen] = useState(false);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseDescription, setNewExerciseDescription] = useState('');
    const [newExerciseTags, setNewExerciseTags] = useState('');

    // AI Generation State
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiObjective, setAiObjective] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);


    useEffect(() => {
        const userExercises = JSON.parse(localStorage.getItem('user_exercises') || '[]');
        setAllExercises([...exerciseLibrary, ...userExercises]);

        if (isEditing) {
            const workoutsKey = `workouts_${studentId}`;
            const existingWorkouts: any[] = JSON.parse(localStorage.getItem(workoutsKey) || '[]');
            const workoutToEdit = existingWorkouts.find(w => w.id === Number(workoutId));

            if (workoutToEdit) {
                setWorkoutName(workoutToEdit.name);
                setWorkoutStatus(workoutToEdit.status);
                setWorkoutNotes(workoutToEdit.notes);
                setSelectedExercises(workoutToEdit.exercises.map((ex: any) => ({ name: ex.name, sets: String(ex.sets), reps: ex.reps, done: ex.done ?? workoutToEdit.status === 'Realizado' })));

                const { scheduling } = workoutToEdit;
                if (scheduling?.type === 'date' && scheduling.date) {
                    setScheduleType('date');
                    setSingleDate(new Date(scheduling.date.replace(/-/g, '/')));
                    setSingleTime(scheduling.time || '09:00');
                    setSingleDateDuration(String(scheduling.duration || '60'));
                } else if (scheduling?.type === 'recurring') {
                    setScheduleType('recurring');
                    setStartDate(new Date(scheduling.startDate.replace(/-/g, '/')));
                    setDuration(scheduling.duration || 30);
                    setSelectedDays(scheduling.daysOfWeek || []);
                }
            }
        }
    }, [isEditing, studentId, workoutId]);

    useEffect(() => {
        if (searchTerm.length > 1) {
            const results = allExercises.filter(ex =>
                !selectedExercises.some(wEx => wEx.name === ex.name) &&
                (ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ex.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ex.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, allExercises, selectedExercises]);


    const handleAddExercise = (exerciseName: string) => {
        if (selectedExercises.some(ex => ex.name === exerciseName)) {
            toast({
                title: "Exercício já adicionado",
                description: "Este exercício já faz parte do treino.",
                variant: "destructive"
            });
            return;
        }
        setSelectedExercises([...selectedExercises, { name: exerciseName, sets: '3', reps: '12', done: false }]);
        setSearchTerm('');
        setSearchResults([]);
    }

    const handleRemoveExercise = (index: number) => {
        const updatedExercises = [...selectedExercises];
        updatedExercises.splice(index, 1);
        setSelectedExercises(updatedExercises);
    }

    const handleSaveNewExercise = () => {
        if (!newExerciseName) {
            toast({ title: "Nome do exercício é obrigatório", variant: "destructive" });
            return;
        }

        const newExercise: Exercise = {
            name: newExerciseName,
            description: newExerciseDescription,
            tags: newExerciseTags.split(',').map(t => t.trim()),
            icon: React.createElement(Dumbbell, { className: "h-6 w-6 text-orange-400" }),
            type: 'user',
        };

        const userExercises = JSON.parse(localStorage.getItem('user_exercises') || '[]');
        const updatedUserExercises = [...userExercises, newExercise];
        localStorage.setItem('user_exercises', JSON.stringify(updatedUserExercises));

        setAllExercises(prev => [...prev, newExercise]);
        setSelectedExercises(prev => [...prev, { name: newExercise.name, sets: '3', reps: '12', done: false }]);

        setNewExerciseName('');
        setNewExerciseDescription('');
        setNewExerciseTags('');
        setCreateExDialogOpen(false);
        toast({ title: "Exercício criado e adicionado!" });
    };

    const handleGenerateWorkout = async () => {
        if (!aiObjective.trim()) {
            toast({ title: "Objetivo necessário", description: "Por favor, descreva o objetivo do treino.", variant: "destructive" });
            return;
        }
        setIsGenerating(true);

        try {
            const studentInfo = students.find(s => s.id === studentId);

            const workoutInput: GenerateWorkoutInput = {
                objective: aiObjective,
                studentGoals: studentInfo?.goals || 'Não informado',
                studentRestrictions: studentInfo?.restrictions || 'Nenhuma',
                exerciseLibrary: allExercises.map(e => ({ name: e.name, description: e.description, tags: e.tags })),
            };

            const response = await generateWorkout(workoutInput);

            setWorkoutName(response.workoutName);
            setSelectedExercises(response.exercises.map(ex => ({ ...ex, done: false })));
            setWorkoutNotes(response.notes);

            toast({
                title: "Treino gerado pela IA!",
                description: "O treino foi preenchido. Revise e salve as alterações.",
            });

        } catch (error) {
            console.error("Error generating workout with AI:", error);
            toast({
                title: "Erro ao gerar treino",
                description: "Não foi possível gerar o treino com a IA. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
            setIsAiModalOpen(false);
        }
    };


    const handleSaveWorkout = () => {
        if (!workoutName) {
            toast({ title: 'Campos obrigatórios', description: 'O nome do treino é obrigatório.', variant: 'destructive' });
            return;
        }
        if (selectedExercises.length === 0) {
            toast({ title: 'Campos obrigatórios', description: 'Para planejar um treino, adicione ao menos um exercício.', variant: 'destructive' });
            return;
        }

        let scheduling;
        if (scheduleType === 'date') {
            if (!singleDate || !singleTime) {
                toast({ title: 'Campos obrigatórios', description: 'Por favor, selecione data e horário.', variant: 'destructive' });
                return;
            }
            scheduling = { type: 'date', date: format(singleDate, 'yyyy-MM-dd'), time: singleTime, duration: Number(singleDateDuration) };
        } else {
            if (!startDate || selectedDays.length === 0) {
                toast({ title: 'Campos obrigatórios', description: 'Para treinos recorrentes, preencha data de início, duração e dias da semana.', variant: 'destructive' });
                return;
            }
            const endDate = addDays(startDate, duration);
            scheduling = {
                type: 'recurring',
                daysOfWeek: selectedDays,
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
                duration: duration
            };
        }

        const workoutData = {
            id: isEditing ? Number(workoutId) : Date.now(),
            studentId,
            name: workoutName,
            status: workoutStatus,
            notes: workoutNotes,
            exercises: selectedExercises.map((ex, i) => ({
                id: i, name: ex.name, sets: parseInt(ex.sets) || 0, reps: ex.reps, done: workoutStatus === 'Realizado' ? ex.done : false
            })),
            scheduling,
        };

        try {
            const workoutsKey = `workouts_${studentId}`;
            const existingWorkouts = JSON.parse(localStorage.getItem(workoutsKey) || '[]');
            let updatedWorkouts;

            if (isEditing) {
                updatedWorkouts = existingWorkouts.map((w: any) => w.id === Number(workoutId) ? workoutData : w);
            } else {
                updatedWorkouts = [...existingWorkouts, workoutData];
            }

            localStorage.setItem(workoutsKey, JSON.stringify(updatedWorkouts));
        } catch (error) {
            console.error("Failed to save workout to localStorage", error);
            toast({ title: "Erro ao salvar", description: "Não foi possível salvar o treino. Tente novamente.", variant: "destructive" });
            return;
        }

        toast({ title: 'Treino Salvo!', description: `O treino "${workoutName}" foi salvo com sucesso.` });
        router.push(`/dashboard/clients/${studentId}/workouts`);
    };

    if (!student) {
        return <div className="p-8">Aluno não encontrado.</div>;
    }

    const subtitle = isEditing ? "Editando treino" : "Novo treino";

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar} alt={student.name} />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
                    <p className="text-muted-foreground">{subtitle}</p>
                </div>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Identificação do Treino</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="workout-name">Nome do Treino</Label>
                            <Input id="workout-name" placeholder="Ex: Treino A - Superiores" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={workoutStatus} onValueChange={(v) => setWorkoutStatus(v as 'Planejado' | 'Realizado')}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status do treino" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Planejado">Planejado</SelectItem>
                                    <SelectItem value="Realizado">Realizado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card">
                    <CardHeader><CardTitle className="text-lg font-semibold">Agendamento</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <RadioGroup value={scheduleType} onValueChange={(v) => setScheduleType(v as 'date' | 'recurring')} className="flex gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="date" id="date" /><Label htmlFor="date">Data Única</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="recurring" id="recurring" /><Label htmlFor="recurring">Recorrente</Label></div>
                        </RadioGroup>

                        {scheduleType === 'date' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Data</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !singleDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {singleDate ? format(singleDate, "PPP", { locale: ptBR }) : <span>Escolha a data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={singleDate} onSelect={setSingleDate} initialFocus /></PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Horário</Label>
                                    <Select value={singleTime} onValueChange={setSingleTime}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um horário" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeSlots.map(slot => (
                                                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Duração (minutos)</Label>
                                    <Select value={singleDateDuration} onValueChange={setSingleDateDuration}>
                                        <SelectTrigger><SelectValue placeholder="Duração" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30 minutos</SelectItem>
                                            <SelectItem value="45">45 minutos</SelectItem>
                                            <SelectItem value="60">60 minutos</SelectItem>
                                            <SelectItem value="90">90 minutos</SelectItem>
                                            <SelectItem value="120">120 minutos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Data de Início</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "PPP", { locale: ptBR }) : <span>Início</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Duração</Label>
                                        <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                                            <SelectTrigger><SelectValue placeholder="Duração" /></SelectTrigger>
                                            <SelectContent>
                                                {durationOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Dias da Semana</Label>
                                    <ToggleGroup type="multiple" variant="outline" value={selectedDays} onValueChange={setSelectedDays} className="flex flex-wrap gap-2 justify-start">
                                        {weekDays.map(day => <ToggleGroupItem key={day.value} value={day.value} className="w-10 h-10 rounded-full">{day.label}</ToggleGroupItem>)}
                                    </ToggleGroup>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-lg">Exercícios</CardTitle>
                            <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Gerar com IA
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Gerar Treino com IA</DialogTitle>
                                        <DialogDescription>Descreva o objetivo do treino para a IA. Ex: Hipertrofia de membros inferiores, para aluna intermediária.</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Textarea
                                            placeholder="Ex: Hipertrofia de membros inferiores com foco em glúteos, para aluna intermediária com leve desconforto no joelho."
                                            value={aiObjective}
                                            onChange={(e) => setAiObjective(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setIsAiModalOpen(false)}>Cancelar</Button>
                                        <Button onClick={handleGenerateWorkout} disabled={isGenerating}>
                                            {isGenerating ? 'Gerando...' : 'Gerar Treino'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Input
                                id="search-exercise"
                                placeholder="Buscar por nome, músculo ou equipamento..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                autoComplete="off"
                                className="w-full"
                            />
                            {isSearchFocused && searchTerm.length > 1 && (
                                <div className="absolute z-10 w-full mt-1 bg-card border rounded-xl shadow-lg max-h-80 overflow-y-auto">
                                    {searchResults.length === 0 ? (
                                        <p className="p-4 text-center text-sm text-muted-foreground">Nenhum exercício encontrado.</p>
                                    ) : (
                                        <ul className="divide-y">
                                            {searchResults.map(ex => (
                                                <li
                                                    key={ex.name}
                                                    onMouseDown={() => handleAddExercise(ex.name)}
                                                    className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-sm">{ex.name}</p>
                                                        <p className="text-xs text-muted-foreground">{ex.description}</p>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary shrink-0">
                                                        <Plus className="h-4 w-4 mr-1" /> Adicionar
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                        <Dialog open={isCreateExDialogOpen} onOpenChange={setCreateExDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Novo Exercício na Base
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Criar Novo Exercício</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-ex-name">Nome do Exercício</Label>
                                        <Input id="new-ex-name" value={newExerciseName} onChange={e => setNewExerciseName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-ex-desc">Descrição (Músculos)</Label>
                                        <Input id="new-ex-desc" value={newExerciseDescription} onChange={e => setNewExerciseDescription(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-ex-tags">Tags (separadas por vírgula)</Label>
                                        <Input id="new-ex-tags" value={newExerciseTags} onChange={e => setNewExerciseTags(e.target.value)} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                                    <Button onClick={handleSaveNewExercise}>Salvar e Adicionar</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <div className="pt-6 border-t">
                            <Label className="text-base font-semibold">Exercícios no Treino ({selectedExercises.length})</Label>
                            <div className="mt-4 space-y-3">
                                {selectedExercises.length > 0 ? selectedExercises.map((exercise, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab mt-2" />
                                        <div className="flex-1">
                                            <p className="font-semibold">{exercise.name}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor={`sets-${index}`} className="text-xs">Séries</Label>
                                                    <Input id={`sets-${index}`} className="h-8 w-20" placeholder="3" value={exercise.sets} onChange={(e) => {
                                                        const updated = [...selectedExercises];
                                                        updated[index].sets = e.target.value;
                                                        setSelectedExercises(updated);
                                                    }} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor={`reps-${index}`} className="text-xs">Reps/Tempo</Label>
                                                    <Input id={`reps-${index}`} className="h-8 w-24" placeholder="8-12" value={exercise.reps} onChange={(e) => {
                                                        const updated = [...selectedExercises];
                                                        updated[index].reps = e.target.value;
                                                        setSelectedExercises(updated);
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveExercise(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 border-2 border-dashed rounded-xl">
                                        <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground" />
                                        <h4 className="mt-2 font-semibold">Monte seu treino</h4>
                                        <p className="text-sm text-muted-foreground">Use a busca acima para adicionar exercícios.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Observações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea id="workout-notes" placeholder="Instruções gerais, tempo de descanso, etc." value={workoutNotes} onChange={(e) => setWorkoutNotes(e.target.value)} />
                    </CardContent>
                </Card>

            </div>

            <div className="flex items-center justify-end gap-2 p-4">
                <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
                <Button onClick={() => handleSaveWorkout()}>Salvar Treino</Button>
            </div>
        </div>
    );
};


const WorkoutVerificationModal = ({ workout, student, setIsOpen, onUpdate }: { workout: any, student: any, setIsOpen: (isOpen: boolean) => void, onUpdate: () => void }) => {
    const { toast } = useToast();
    const [finalNotes, setFinalNotes] = useState(workout.notes || '');
    const [verifiedExercises, setVerifiedExercises] = useState(workout.exercises.map((ex: any) => ({ ...ex, done: false })));

    const handleSave = (finalStatus: 'Realizado' | 'Falta') => {
        const workoutData = {
            ...workout,
            status: finalStatus,
            notes: finalNotes,
            exercises: finalStatus === 'Realizado' ? verifiedExercises.map((ex: any) => ({
                id: ex.id, name: ex.name, sets: parseInt(ex.sets) || 0, reps: ex.reps, done: ex.done
            })) : workout.exercises, // Keep original exercises if "Falta"
        };

        try {
            const workoutsKey = `workouts_${student.id}`;
            const existingWorkouts = JSON.parse(localStorage.getItem(workoutsKey) || '[]');
            const updatedWorkouts = existingWorkouts.map((w: any) => w.id === workout.id ? workoutData : w);
            localStorage.setItem(workoutsKey, JSON.stringify(updatedWorkouts));

            toast({ title: "Aula verificada!", description: `A aula de ${workout.name} foi marcada como "${finalStatus}".` });
            onUpdate();
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to save verification to localStorage", error);
            toast({ title: "Erro ao salvar", description: "Não foi possível salvar a verificação.", variant: "destructive" });
        }
    }

    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Verificar Aula: {workout.name}</DialogTitle>
                <DialogDescription>
                    Confirme se a aula foi realizada e preencha os detalhes, ou marque como falta.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                    <Label className="text-base font-semibold">Exercícios Realizados</Label>
                    <div className="space-y-3">
                        {verifiedExercises.map((exercise: any, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                                <Checkbox
                                    id={`done-${index}`}
                                    className="mt-1"
                                    checked={exercise.done}
                                    onCheckedChange={(checked) => {
                                        const updated = [...verifiedExercises];
                                        updated[index].done = !!checked;
                                        setVerifiedExercises(updated);
                                    }}
                                />
                                <div className="flex-1 grid gap-2">
                                    <Label htmlFor={`done-${index}`} className="font-semibold cursor-pointer">{exercise.name}</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`sets-${index}`} className="text-xs">Séries</Label>
                                            <Input id={`sets-${index}`} className="h-8 w-20" placeholder="3" value={exercise.sets} onChange={(e) => {
                                                const updated = [...verifiedExercises];
                                                updated[index].sets = e.target.value;
                                                setVerifiedExercises(updated);
                                            }} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`reps-${index}`} className="text-xs">Reps/Tempo</Label>
                                            <Input id={`reps-${index}`} className="h-8 w-24" placeholder="8-12" value={exercise.reps} onChange={(e) => {
                                                const updated = [...verifiedExercises];
                                                updated[index].reps = e.target.value;
                                                setVerifiedExercises(updated);
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="final-notes" className="text-base font-semibold">Observações Finais</Label>
                    <Textarea id="final-notes" placeholder="Feedback sobre a aula, performance do aluno, etc." value={finalNotes} onChange={(e) => setFinalNotes(e.target.value)} />
                </div>
            </div>
            <DialogFooter>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" type="button" className="mr-auto">Marcar como Falta</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Marcar como falta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação marcará a aula como não realizada. O aluno poderá ser notificado. Deseja continuar?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleSave('Falta')} className={cn(buttonVariants({ variant: 'destructive' }))}>Confirmar Falta</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                <Button onClick={() => handleSave('Realizado')}>Confirmar Aula Realizada</Button>
            </DialogFooter>
        </DialogContent>
    );
};

const WorkoutListPage = () => {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const studentId = parseInt(params.id as string, 10);
    const student = students.find(s => s.id === studentId);

    const [workouts, setWorkouts] = useState<any[]>([]);
    const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
    const [workoutToVerify, setWorkoutToVerify] = useState<any | null>(null);

    const handleNewWorkoutClick = () => {
        router.push(`/dashboard/clients/${studentId}/workouts?action=new`);
    };

    const fetchWorkouts = () => {
        if (typeof window === 'undefined' || !studentId) return;
        const workoutsKey = `workouts_${studentId}`;
        const storedWorkouts: any[] = JSON.parse(localStorage.getItem(workoutsKey) || '[]');

        const now = new Date();

        const processedWorkouts = storedWorkouts.map(workout => {
            let effectiveStatus = workout.status;
            if (workout.status === 'Planejado' && workout.scheduling?.type === 'date' && workout.scheduling.date && workout.scheduling.time) {
                const workoutDateTime = new Date(`${workout.scheduling.date}T${workout.scheduling.time}:00`);
                const durationInMs = (workout.scheduling.duration || 60) * 60 * 1000;
                const workoutEndTime = new Date(workoutDateTime.getTime() + durationInMs);

                if (now > workoutEndTime) {
                    effectiveStatus = 'Pendente';
                } else if (now >= workoutDateTime && now <= workoutEndTime) {
                    effectiveStatus = 'Em Execução';
                }
            }
            return { ...workout, status: effectiveStatus };
        });

        const sortedWorkouts = processedWorkouts.sort((a, b) => {
            const dateA = a.scheduling?.date ? new Date(`${a.scheduling.date}T${a.scheduling.time || '00:00'}`).getTime() : 0;
            const dateB = b.scheduling?.date ? new Date(`${b.scheduling.date}T${b.scheduling.time || '00:00'}`).getTime() : 0;
            return dateB - dateA;
        });

        setWorkouts(sortedWorkouts);
    };

    useEffect(() => {
        fetchWorkouts();
    }, [studentId]);

    const handleVerifyClick = (workout: any) => {
        setWorkoutToVerify(workout);
        setVerificationModalOpen(true);
    };

    const handleDelete = (workoutId: number) => {
        const workoutsKey = `workouts_${studentId}`;
        const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
        localStorage.setItem(workoutsKey, JSON.stringify(updatedWorkouts));
        fetchWorkouts(); // re-fetch to update state
        toast({ title: 'Treino excluído com sucesso!' });
    };

    if (!student) {
        return <div className="p-8">Aluno não encontrado.</div>;
    }

    const formatScheduling = (scheduling: any) => {
        if (scheduling?.type === 'date' && scheduling.date) {
            try {
                const date = new Date(scheduling.date.replace(/-/g, '/'));
                return format(date, 'dd/MM/yyyy', { locale: ptBR });
            } catch (e) {
                return scheduling.date;
            }
        }
        if (scheduling?.type === 'recurring' && scheduling.daysOfWeek?.length) {
            const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
            const days = scheduling.daysOfWeek.map((d: string) => dayLabels[parseInt(d)]).join(', ');
            return `Recorrente (${days})`;
        }
        return 'Não agendado';
    };

    return (
        <Dialog open={isVerificationModalOpen} onOpenChange={setVerificationModalOpen}>
            <div className="space-y-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/dashboard/clients/${student.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={student.avatar} alt={student.name} />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
                            <p className="text-muted-foreground">Gerenciamento de Treinos</p>
                        </div>
                    </div>
                    <Button onClick={handleNewWorkoutClick}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Treino
                    </Button>
                </div>

                <Card className="shadow-soft rounded-2xl">
                    <CardHeader>
                        <CardTitle>Treinos Registrados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {workouts.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed rounded-xl">
                                <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">Nenhum treino registrado</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Crie o primeiro treino para {student.name}.
                                </p>
                                <Button className="mt-6" onClick={handleNewWorkoutClick}>
                                    <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Treino
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome do Treino</TableHead>
                                        <TableHead>Agendamento</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workouts.map((workout) => (
                                        <TableRow key={workout.id}>
                                            <TableCell className="font-medium">{workout.name}</TableCell>
                                            <TableCell>{formatScheduling(workout.scheduling)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'font-semibold',
                                                        workout.status === 'Realizado' && 'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                                        workout.status === 'Pendente' && 'border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                                                        workout.status === 'Em Execução' && 'border-transparent bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                                                        workout.status === 'Planejado' && 'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                                        workout.status === 'Falta' && 'border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    )}
                                                >
                                                    {workout.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {workout.status === 'Pendente' ? (
                                                            <DropdownMenuItem onSelect={() => handleVerifyClick(workout)}>
                                                                <Check className="mr-2 h-4 w-4" /> Verificar Aula
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/dashboard/clients/${student.id}/workouts?workoutId=${workout.id}`}>
                                                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o treino.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(workout.id)} className={cn(buttonVariants({ variant: 'destructive' }))}>Excluir</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
            {workoutToVerify && (
                <WorkoutVerificationModal
                    workout={workoutToVerify}
                    student={student}
                    setIsOpen={setVerificationModalOpen}
                    onUpdate={fetchWorkouts}
                />
            )}
        </Dialog>
    );
};


const WorkoutsRouterPage = () => {
    const searchParams = useSearchParams();
    const workoutId = searchParams.get('workoutId');
    const action = searchParams.get('action');

    // If we are creating or editing, show the form
    if (workoutId || action === 'new') {
        return <WorkoutEditor />;
    }

    // Otherwise, show the list of workouts
    return <WorkoutListPage />;
};

export default WorkoutsRouterPage;
