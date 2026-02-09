'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Dumbbell, Ruler, Edit, CreditCard, CheckCircle, X,
    Calendar, WalletCards, Repeat, Building, ChevronRight
} from 'lucide-react';

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Custom Components
import { SendMessageDialog } from '@/components/dashboard/dialogs/send-message-dialog';
import { StudentStatusDialog } from '@/components/dashboard/dialogs/student-status-dialog';
import { EvolutionChart } from '@/components/dashboard/charts/evolution-chart';

// Services & Utils
import {
    getStudentProfile,
    getStudentEvolution,
    getStudentFrequency,
    getStudentPayments,
    getStudentActiveWorkouts,
    updateStudentStatus,
    type EvolutionMetric,
    type StudentProfileData,
} from '@/services/supabase/student-profile';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const statusBadgeStyles = {
    PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200',
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
    OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200',
    CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200',
};

const eventStatusStyles = {
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-transparent',
    MISSED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-transparent',
    SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-transparent',
    CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-transparent',
};

export default function StudentProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const studentId = params.id as string;

    // State
    const [profile, setProfile] = useState<StudentProfileData | null>(null);
    const [evolutionData, setEvolutionData] = useState<any[]>([]);
    const [frequencyData, setFrequencyData] = useState<any[]>([]);
    const [paymentsData, setPaymentsData] = useState<any[]>([]);
    const [workoutsData, setWorkoutsData] = useState<any[]>([]);
    const [selectedMetric, setSelectedMetric] = useState<EvolutionMetric>('weight');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all data
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            try {
                const [profileData, evolution, frequency, payments, workouts] = await Promise.all([
                    getStudentProfile(studentId),
                    getStudentEvolution(studentId, selectedMetric),
                    getStudentFrequency(studentId),
                    getStudentPayments(studentId),
                    getStudentActiveWorkouts(studentId),
                ]);

                setProfile(profileData);
                setEvolutionData(evolution);
                setFrequencyData(frequency);
                setPaymentsData(payments);
                setWorkoutsData(workouts);
            } catch (error) {
                console.error('Error fetching student data:', error);
                toast({
                    title: 'Erro ao carregar dados',
                    description: 'Não foi possível carregar os dados do aluno.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [studentId, toast]);

    // Refetch evolution when metric changes
    useEffect(() => {
        async function refetchEvolution() {
            const data = await getStudentEvolution(studentId, selectedMetric);
            setEvolutionData(data);
        }
        refetchEvolution();
    }, [selectedMetric, studentId]);

    // Handlers
    const handleStatusChange = async (newStatus: 'ACTIVE' | 'INACTIVE', reason?: string) => {
        const success = await updateStudentStatus(studentId, newStatus, reason);
        if (success && profile) {
            setProfile({ ...profile, status: newStatus });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Aluno não encontrado</h2>
                    <Button onClick={() => router.push('/dashboard/clients')}>Voltar para lista</Button>
                </div>
            </div>
        );
    }

    // Derived values
    const isActive = profile.status === 'ACTIVE';
    const isOverdue = profile.status === 'OVERDUE';
    const bannerColor = profile.plan?.color || '#94A3B8';
    const memberSince = format(new Date(profile.created_at), "dd 'de' MMM, yyyy", { locale: ptBR });

    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Alert for Overdue Status */}
            {isOverdue && (
                <Alert variant="destructive">
                    <AlertTitle>Pagamento Pendente</AlertTitle>
                    <AlertDescription>
                        Este aluno está inadimplente. O acesso a novas aulas e funcionalidades está restrito até a regularização.
                    </AlertDescription>
                </Alert>
            )}

            {/* Header Card - Social Media Style */}
            <Card className="overflow-hidden shadow-lg rounded-3xl border-none">
                {/* Dynamic Colored Banner */}
                <div
                    className="h-32 md:h-48 relative"
                    style={{
                        background: `linear-gradient(135deg, ${bannerColor}dd 0%, ${bannerColor}66 100%)`,
                    }}
                />

                <CardHeader className="pt-0 pb-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20">
                        {/* Avatar */}
                        <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-background shadow-xl shrink-0">
                            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                            <AvatarFallback className="text-2xl font-bold bg-primary/10">
                                {profile.full_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {/* Info Section */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                                    {profile.full_name}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                                    {profile.plan && (
                                        <Badge
                                            className="font-semibold px-3 py-1 text-sm"
                                            style={{
                                                backgroundColor: `${profile.plan.color}20`,
                                                color: profile.plan.color,
                                                borderColor: `${profile.plan.color}40`,
                                            }}
                                        >
                                            {profile.plan.name}
                                        </Badge>
                                    )}
                                    <Badge variant={isActive ? 'default' : 'destructive'} className="font-semibold">
                                        {isActive ? 'ATIVO' : isOverdue ? 'INADIMPLENTE' : 'INATIVO'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                                {profile.unit && (
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4" />
                                        <span>{profile.unit.name}</span>
                                    </div>
                                )}
                                <span>•</span>
                                <span>Membro desde {memberSince}</span>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="flex gap-6 text-center">
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {profile.latest_assessment?.height
                                        ? `${(profile.latest_assessment.height / 100).toFixed(2)}m`
                                        : 'N/A'}
                                </p>
                                <p className="text-xs text-muted-foreground">Altura</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {profile.latest_assessment?.weight
                                        ? `${profile.latest_assessment.weight.toFixed(1)}kg`
                                        : 'N/A'}
                                </p>
                                <p className="text-xs text-muted-foreground">Peso</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-center md:justify-end gap-2 mt-6">
                        <TooltipProvider delayDuration={100}>
                            {/* Send Message */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <SendMessageDialog studentName={profile.full_name} studentId={studentId} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>Enviar Mensagem</TooltipContent>
                            </Tooltip>

                            {/* Manage Workouts */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-full" asChild>
                                        <Link href={`/dashboard/clients/${studentId}/workouts`}>
                                            <Dumbbell className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Gerenciar Treinos</TooltipContent>
                            </Tooltip>

                            {/* Add Measurements */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-full" asChild>
                                        <Link href={`/dashboard/clients/${studentId}/measurements`}>
                                            <Ruler className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Adicionar Medidas</TooltipContent>
                            </Tooltip>

                            {/* Edit Profile */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-full" asChild>
                                        <Link href={`/dashboard/clients/${studentId}/edit`}>
                                            <Edit className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar Perfil</TooltipContent>
                            </Tooltip>

                            {/* Manage Plan */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-full" asChild>
                                        <Link href={`/dashboard/clients/${studentId}/plan`}>
                                            <CreditCard className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Gerenciar Plano</TooltipContent>
                            </Tooltip>

                            {/* Activate/Deactivate */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <StudentStatusDialog
                                            studentId={studentId}
                                            studentName={profile.full_name}
                                            currentStatus={profile.status}
                                            onStatusChange={handleStatusChange}
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>{isActive ? 'Inativar Aluno' : 'Ativar Aluno'}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
            </Card>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Evolution Chart */}
                <EvolutionChart
                    data={evolutionData}
                    selectedMetric={selectedMetric}
                    onMetricChange={setSelectedMetric}
                />

                {/* Frequency Card */}
                <Card className="shadow-soft rounded-3xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-3">
                                <Calendar className="text-primary h-5 w-5" />
                                Frequência
                            </CardTitle>
                            <CardDescription>Últimos eventos registrados</CardDescription>
                        </div>
                        <Button variant="link" asChild>
                            <Link href={`/dashboard/clients/${studentId}/frequency`}>Ver Todos</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {frequencyData.length > 0 ? (
                            frequencyData.map((event) => (
                                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        {event.status === 'COMPLETED' ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <X className="w-5 h-5 text-red-500" />
                                        )}
                                        <div>
                                            <p className="font-medium">
                                                {format(new Date(event.date), "dd/MM/yyyy", { locale: ptBR })}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {event.class_template?.name || 'Treino Individual'}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={cn('font-semibold', eventStatusStyles[event.status])}>
                                        {event.status === 'COMPLETED' ? 'Realizado' : 'Falta'}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Nenhum registro de frequência encontrado.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Payments Card */}
                <Card className="shadow-soft rounded-3xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-3">
                                <WalletCards className="text-primary h-5 w-5" />
                                Últimos Pagamentos
                            </CardTitle>
                            <CardDescription>Histórico de faturas recentes</CardDescription>
                        </div>
                        <Button variant="link" asChild>
                            <Link href={`/dashboard/clients/${studentId}/payments`}>Ver Todos</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {paymentsData.length > 0 ? (
                            paymentsData.map((payment) => (
                                <div key={payment.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div>
                                        <p className="font-medium">
                                            {format(parseISO(payment.due_date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            R$ {payment.amount.toFixed(2).replace('.', ',')}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={cn('font-semibold', statusBadgeStyles[payment.status])}>
                                        {payment.status === 'PAID' ? 'Pago' : payment.status === 'PENDING' ? 'Pendente' : payment.status === 'OVERDUE' ? 'Atrasado' : 'Cancelado'}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Nenhum pagamento encontrado.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Active Workouts Card */}
                <Card className="shadow-soft rounded-3xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-3">
                                <Repeat className="text-primary h-5 w-5" />
                                Treinos Ativos
                            </CardTitle>
                            <CardDescription>Planos de treino em andamento</CardDescription>
                        </div>
                        <Button variant="link" asChild>
                            <Link href={`/dashboard/clients/${studentId}/workouts`}>Ver Todos</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {workoutsData.length > 0 ? (
                            workoutsData.map((workout) => (
                                <Link
                                    key={workout.id}
                                    href={`/dashboard/clients/${studentId}/workouts?workoutId=${workout.id}`}
                                    className="block"
                                >
                                    <div className="p-3 bg-muted/50 rounded-lg grid grid-cols-[1fr_auto] items-center gap-4 hover:bg-muted transition-colors">
                                        <div className="font-semibold text-foreground">{workout.name}</div>
                                        <ChevronRight className="text-muted-foreground h-5 w-5" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Nenhum treino ativo cadastrado.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}