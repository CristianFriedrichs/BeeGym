'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Trash2, Users, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ManageParticipantsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventId?: string;
    eventName?: string;
    eventDate?: string;
    eventTime?: string;
    capacityLimit?: number;
    onSuccess?: () => void;
}

interface Participant {
    id: string;
    student_id: string;
    name: string;
    avatar_url: string | null;
}

interface Student {
    id: string;
    name: string;
    avatar_url: string | null;
}

export function ManageParticipantsModal({
    open,
    onOpenChange,
    eventId,
    eventName,
    eventDate,
    eventTime,
    capacityLimit = 0,
    onSuccess
}: ManageParticipantsModalProps) {
    const { toast } = useToast();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState('');

    useEffect(() => {
        if (open && eventId) {
            fetchData();
        }
    }, [open, eventId]);

    async function fetchData() {
        await Promise.all([fetchParticipants(), fetchStudents()]);
    }

    async function fetchParticipants() {
        if (!eventId) return;

        try {
            const { data, error } = await supabase
                .from('event_participants')
                .select(`
                    id,
                    student_id,
                    students (
                        id,
                        name,
                        avatar_url
                    )
                `)
                .eq('event_id', eventId);

            if (error) throw error;

            if (data) {
                setParticipants(data.map((p: any) => ({
                    id: p.id,
                    student_id: p.student_id,
                    name: p.students?.name || 'Desconhecido',
                    avatar_url: p.students?.avatar_url || null
                })));
            }
        } catch (error) {
            console.error('Error fetching participants:', error);
            toast({
                title: 'Erro ao carregar participantes',
                description: 'Não foi possível carregar a lista de inscritos.',
                variant: 'destructive',
            });
        }
    }

    async function fetchStudents() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: userData } = await supabase
                .from('users')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!userData?.organization_id) return;

            const { data, error } = await supabase
                .from('students')
                .select('id, name, avatar_url')
                .eq('organization_id', userData.organization_id)
                .order('name');

            if (error) throw error;
            if (data) setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    }

    async function handleAdd() {
        if (!selectedStudent || !eventId || isFull) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('add_participant_to_event', {
                p_event_id: eventId,
                p_student_id: selectedStudent
            });

            if (error) throw error;

            const result = typeof data === 'string' ? JSON.parse(data) : data;

            if (!result.success) {
                toast({
                    title: 'Erro',
                    description: result.message || 'Não foi possível adicionar o aluno.',
                    variant: 'destructive',
                });
                return;
            }

            toast({
                title: 'Aluno adicionado!',
                description: 'O aluno foi inscrito no treino com sucesso.',
            });

            setSelectedStudent('');
            await fetchParticipants();
            onSuccess?.();
        } catch (error) {
            console.error('Error adding participant:', error);
            toast({
                title: 'Erro ao adicionar aluno',
                description: 'Não foi possível inscrever o aluno. Tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove(studentId: string) {
        if (!eventId) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('remove_participant_from_event', {
                p_event_id: eventId,
                p_student_id: studentId
            });

            if (error) throw error;

            const result = typeof data === 'string' ? JSON.parse(data) : data;

            if (!result.success) {
                toast({
                    title: 'Erro',
                    description: result.message || 'Não foi possível remover o aluno.',
                    variant: 'destructive',
                });
                return;
            }

            toast({
                title: 'Aluno removido',
                description: 'O aluno foi removido do treino.',
            });

            await fetchParticipants();
            onSuccess?.();
        } catch (error) {
            console.error('Error removing participant:', error);
            toast({
                title: 'Erro ao remover aluno',
                description: 'Não foi possível remover o aluno. Tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

    const isFull = participants.length >= capacityLimit;
    const availableStudents = students.filter(
        student => !participants.some(p => p.student_id === student.id)
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display font-bold text-xl text-deep-midnight flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        Gerenciar Participantes
                    </DialogTitle>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="space-y-1">
                            <p className="font-sans font-medium text-deep-midnight">{eventName}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    {eventDate && format(new Date(eventDate), 'PPP', { locale: ptBR })}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {eventTime}
                                </span>
                            </div>
                        </div>
                        <Badge
                            className={cn(
                                'font-semibold text-sm px-3 py-1',
                                isFull
                                    ? 'bg-destructive text-destructive-foreground'
                                    : 'bg-primary text-primary-foreground'
                            )}
                        >
                            {participants.length}/{capacityLimit} Vagas
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Lista de Inscritos */}
                    <div className="space-y-3">
                        <Label className="font-sans font-medium text-sm text-deep-midnight">
                            Alunos Inscritos ({participants.length})
                        </Label>
                        {participants.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Nenhum aluno inscrito ainda.</p>
                            </div>
                        ) : (
                            <div className="border rounded-md divide-y max-h-[250px] overflow-y-auto">
                                {participants.map((participant) => (
                                    <div key={participant.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={participant.avatar_url || undefined} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                    {participant.name[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-sans">{participant.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemove(participant.student_id)}
                                            disabled={loading}
                                            className="hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Adicionar Aluno */}
                    <div className="space-y-3">
                        <Label className="font-sans font-medium text-sm text-deep-midnight">
                            Adicionar Aluno
                        </Label>
                        <div className="flex gap-2">
                            <Select
                                value={selectedStudent}
                                onValueChange={setSelectedStudent}
                                disabled={isFull || loading}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Selecione um aluno" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableStudents.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            Todos os alunos já estão inscritos
                                        </div>
                                    ) : (
                                        availableStudents.map((student) => (
                                            <SelectItem key={student.id} value={student.id}>
                                                {student.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleAdd}
                                disabled={!selectedStudent || isFull || loading}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                            >
                                {loading ? 'Adicionando...' : 'Adicionar'}
                            </Button>
                        </div>
                        {isFull && (
                            <p className="text-sm text-destructive font-medium">
                                ⚠️ Capacidade máxima atingida
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
