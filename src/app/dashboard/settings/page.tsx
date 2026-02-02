
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Upload, User, Bell, Shield, LogOut, History, Search, Calendar as CalendarIcon, Bot, Monitor, Edit, Plus, Trash2, Move, ShieldCheck, Settings, Users, Briefcase, MapPin, ClipboardList, Dumbbell, Activity, CreditCard, MessageSquare, BarChart3, Globe, Link as LinkIcon, AtSign, Smartphone, Building, MoreHorizontal, Check, ChevronsUpDown, Mail as MailIcon, KeyRound, UserPlus, BookUser, Filter, Bookmark, Tags, Ticket, Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, startOfDay, endOfDay, formatDistanceToNow, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { logAction } from '@/lib/logger';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from 'zod';
import { initialSystemPlans } from '@/lib/plans';


export type LogEntry = {
    id: string;
    timestamp: string;
    user: string;
    origin: 'professional' | 'student' | 'system';
    entity: 'Aluno' | 'Aula' | 'Treino' | 'Pagamento' | 'Plano' | 'Agenda' | 'Perfil' | 'Notificações' | 'Configurações' | 'Usuários' | 'Instrutores' | 'Unidades' | 'Salas';
    entityId: string;
    action: 'Criação' | 'Edição' | 'Exclusão' | 'Movimentação' | 'Status Change' | 'Convite';
    description: string;
    unitId?: string;
    details?: {
        before: any;
        after: any;
    };
};

const initialLogs: LogEntry[] = [
    {
        id: 'log-1',
        timestamp: '2024-07-26T14:30:00Z',
        user: 'Kristin Watson',
        origin: 'professional',
        entity: 'Agenda',
        entityId: 'evt-123',
        action: 'Movimentação',
        description: 'Aula "HIIT & Cardio Blast" movida.',
        unitId: 'unit-1',
        details: { before: { date: '2024-07-26', time: '10:30' }, after: { date: '2024-07-26', time: '11:00' } }
    },
    {
        id: 'log-2',
        timestamp: '2024-07-26T11:05:00Z',
        user: 'Ana Clara',
        origin: 'student',
        entity: 'Treino',
        entityId: 'wrk-456',
        action: 'Status Change',
        description: 'Treino "Treino de Força" marcado como "Realizado".',
        unitId: 'unit-1',
        details: { before: { status: 'Pendente' }, after: { status: 'Realizado' } }
    },
    {
        id: 'log-3',
        timestamp: '2024-07-25T18:00:00Z',
        user: 'Sistema',
        origin: 'system',
        entity: 'Pagamento',
        entityId: 'pay-789',
        action: 'Status Change',
        description: 'Fatura de Jovana Pavlovic marcada como "Vencido".',
        unitId: 'unit-2',
        details: { before: { status: 'Pendente' }, after: { status: 'Vencido' } }
    },
    {
        id: 'log-4',
        timestamp: '2024-07-25T09:15:00Z',
        user: 'Kristin Watson',
        origin: 'professional',
        entity: 'Aluno',
        entityId: 'std-001',
        action: 'Criação',
        description: 'Novo aluno "Milos Vasiljevic" criado.',
        unitId: 'unit-1',
        details: { before: {}, after: { name: 'Milos Vasiljevic', plan: 'Gold' } }
    }
];

const initialSystemUsers = [
    { id: 'usr-1', name: 'Kristin Watson', email: 'kristin.watson@beegym.pro', avatar: 'https://i.pravatar.cc/150?img=32', roleId: 'role-owner', status: 'Ativo', lastLogin: '2024-07-26T14:30:00Z', createdAt: '2023-01-15T09:00:00Z' },
    { id: 'usr-2', name: 'John Doe', email: 'john.doe@beegym.pro', avatar: 'https://i.pravatar.cc/150?img=60', roleId: 'role-instructor', status: 'Ativo', lastLogin: '2024-07-25T11:00:00Z', createdAt: '2023-02-20T10:00:00Z' },
    { id: 'usr-3', name: 'Sarah Jenkins', email: 'sarah.jenkins@beegym.pro', avatar: 'https://i.pravatar.cc/150?img=31', roleId: 'role-reception', status: 'Inativo', lastLogin: '2024-06-10T18:00:00Z', createdAt: '2023-03-10T14:00:00Z' },
    { id: 'usr-4', name: 'Mike Ross', email: 'mike.ross@beegym.pro', avatar: '', roleId: 'role-instructor', status: 'Convite Pendente', lastLogin: null, createdAt: '2024-07-27T10:00:00Z' }
];

const initialInstructors = [
  {
    id: 'inst-1',
    userId: 'usr-1',
    name: 'Kristin Watson',
    phone: '(11) 99999-1111',
    avatar: 'https://i.pravatar.cc/150?img=32',
    bio: 'Especialista em treino funcional e reabilitação. Foco em movimento de qualidade.',
    skills: ['Funcional', 'Reabilitação', 'Pilates'],
    certifications: [
      { id: 'cert-1', name: 'CREF', fileUrl: '#', expiresAt: '2025-12-31T00:00:00Z' }
    ],
    status: 'Ativo',
    availability: {
      recurring: [
        { weekday: 1, start: '08:00', end: '12:00' },
        { weekday: 1, start: '14:00', end: '18:00' },
        { weekday: 3, start: '08:00', end: '12:00' },
      ],
      exceptions: [
        { startAt: '2024-12-20T00:00:00Z', endAt: '2025-01-05T23:59:59Z', reason: 'Férias' }
      ],
      capacityPerSlot: 2,
    },
    createdAt: '2023-01-15T09:00:00Z'
  },
  {
    id: 'inst-2',
    userId: 'usr-2',
    name: 'John Doe',
    phone: '(11) 98888-2222',
    avatar: 'https://i.pravatar.cc/150?img=60',
    bio: 'Focado em hipertrofia e preparação para competições de fisiculturismo.',
    skills: ['Musculação', 'Hipertrofia', 'Nutrição Esportiva'],
    certifications: [
      { id: 'cert-2', name: 'CREF', fileUrl: '#', expiresAt: '2026-06-30T00:00:00Z' }
    ],
    status: 'Ativo',
    availability: {
      recurring: [
        { weekday: 2, start: '10:00', end: '20:00' },
        { weekday: 4, start: '10:00', end: '20:00' },
        { weekday: 5, start: '08:00', end: '14:00' },
      ],
      exceptions: [],
      capacityPerSlot: 1,
    },
    createdAt: '2023-02-20T10:00:00Z'
  },
  {
    id: 'inst-3',
    userId: null,
    name: 'Sarah Jenkins',
    phone: '(11) 97777-3333',
    avatar: 'https://i.pravatar.cc/150?img=31',
    bio: 'Instrutora de Yoga e Pilates, com 10 anos de experiência em bem-estar e mindfulness.',
    skills: ['Yoga', 'Pilates', 'Meditação'],
    certifications: [],
    status: 'Inativo',
    availability: {
      recurring: [],
      exceptions: [],
      capacityPerSlot: 1,
    },
    createdAt: '2023-03-10T14:00:00Z'
  }
];

const allSkills = ['Funcional', 'Reabilitação', 'Pilates', 'Musculação', 'Hipertrofia', 'Nutrição Esportiva', 'Yoga', 'Meditação', 'Crossfit', 'LPO'];

const initialRoles = [
    { id: 'role-owner', name: 'Owner', description: 'Acesso total a todas as configurações e dados.', permissions: ['*'], isDefault: true, color: 'bg-red-500 text-white' },
    { id: 'role-admin', name: 'Admin', description: 'Acesso administrativo, exceto configurações de propriedade.', permissions: ['dashboard.view', 'agenda.view', 'students.view', 'students.edit'], isDefault: true, color: 'bg-purple-500 text-white' },
    { id: 'role-manager', name: 'Gerente', description: 'Gerencia operações diárias, aulas e instrutores.', permissions: [], isDefault: true, color: 'bg-blue-500 text-white' },
    { id: 'role-instructor', name: 'Instrutor', description: 'Gerencia suas próprias aulas e alunos.', permissions: [], isDefault: false, color: 'bg-green-500 text-white' },
    { id: 'role-reception', name: 'Recepção', description: 'Gerencia agendamentos e atendimento.', permissions: [], isDefault: false, color: 'bg-yellow-500 text-black' },
];

const permissionsMatrix: { [key: string]: { label: string; actions: { key: string; label: string }[] } } = {
    dashboard: { label: 'Dashboard', actions: [{ key: 'view', label: 'Visualizar' }, { key: 'edit', label: 'Editar' }] },
    agenda: { label: 'Agenda', actions: [{ key: 'view', label: 'Visualizar' }, { key: 'create', label: 'Criar' }, { key: 'edit', label: 'Editar' }, { key: 'delete', label: 'Excluir' }, { key: 'dragdrop', label: 'Mover' }] },
    students: { label: 'Alunos', actions: [{ key: 'view', label: 'Visualizar' }, { key: 'create', label: 'Criar' }, { key: 'edit', label: 'Editar' }, { key: 'delete', label: 'Excluir' }] },
    payments: { label: 'Pagamentos', actions: [{ key: 'view', label: 'Visualizar' }, { key: 'edit', label: 'Editar' }, { key: 'refund', label: 'Reembolsar' }, { key: 'generate', label: 'Gerar Fatura' }] },
    settings: { label: 'Configurações', actions: [{ key: 'general.edit', label: 'Editar Geral' }, { key: 'users.manage', label: 'Gerenciar Usuários' }] },
    logs: { label: 'Logs', actions: [{ key: 'view', label: 'Visualizar' }] }
};

const initialUnits = [
    { id: 'unit-1', name: 'BeeGym - Unidade Centro', address: 'Rua Principal, 123, Centro, São Paulo, SP', status: 'Ativo' },
    { id: 'unit-2', name: 'BeeGym - Unidade Sul (Inativa)', address: 'Av. Secundária, 456, Bairro Sul, São Paulo, SP', status: 'Inativo' },
];
const initialEspacos = [
    { id: 'spc-1', unitId: 'unit-1', name: 'Studio Pilates', capacity: 10, type: 'Studio', color: 'bg-purple-200' },
    { id: 'spc-2', unitId: 'unit-1', name: 'Box Crossfit', capacity: 20, type: 'Box', color: 'bg-red-200' },
    { id: 'spc-3', unitId: 'unit-1', name: 'Sala Funcional', capacity: 15, type: 'Sala', color: 'bg-blue-200' },
];


const actionIcons: { [key: string]: React.ReactNode } = {
    'Criação': <Plus className="h-4 w-4" />,
    'Edição': <Edit className="h-4 w-4" />,
    'Exclusão': <Trash2 className="h-4 w-4" />,
    'Movimentação': <Move className="h-4 w-4" />,
    'Status Change': <ShieldCheck className="h-4 w-4" />,
    'Convite': <MailIcon className="h-4 w-4" />,
};

const originIcons: { [key: string]: React.ReactNode } = {
    professional: <User className="h-4 w-4" />,
    student: <User className="h-4 w-4" />,
    system: <Bot className="h-4 w-4" />,
};

function ProfileTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
    const { toast } = useToast();
    const router = useRouter();

    const [name, setName] = useState("Kristin Watson");
    const [title, setTitle] = useState("Personal Trainer");
    const [bio, setBio] = useState("Personal Trainer especialista em treinos de força e hipertrofia. Focada em ajudar você a atingir seu máximo potencial.");
    const [isPublic, setIsPublic] = useState(true);
    const [instagram, setInstagram] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [website, setWebsite] = useState("");
    const [email, setEmail] = useState("kristin@beegym.pro");
    const [phone, setPhone] = useState("(11) 98765-4321");
    const [lastLogin, setLastLogin] = useState<string | null>(null);

    useEffect(() => {
        // This will only run on the client, after hydration
        setLastLogin(format(new Date(), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR }));
    }, []);

    const handleSave = () => {
        if (!name || !email) {
            toast({ title: "Campos obrigatórios", description: "Nome e email são obrigatórios.", variant: "destructive" });
            return;
        }
        
        logAction({
            user: 'Kristin Watson',
            origin: 'professional',
            entity: 'Perfil',
            entityId: 'user-123',
            action: 'Edição',
            description: 'Perfil de usuário atualizado.',
            details: {
                before: { name: 'Kristin W.' },
                after: { name }
            }
        });

        toast({ title: "Perfil salvo!", description: "Suas informações foram atualizadas." });
        router.back();
    };

    const handleCancel = () => {
        router.back();
    }

    return (
        <>
            <div className="relative">
                <div className="h-32 md:h-40 bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-2xl" />
                <div className="absolute top-0 left-0 p-6 w-full">
                    <Avatar className="h-28 w-28 border-4 border-card shadow-lg -mt-14">
                        <AvatarImage src="https://i.pravatar.cc/150?img=32" alt="Avatar" />
                        <AvatarFallback>KW</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            <div className="p-6 pt-16 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Perfil Público</CardTitle>
                        <CardDescription>Esta informação será exibida para seus alunos. A capa do perfil é definida pela cor do seu plano.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="flex items-start justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium">Mostrar perfil público?</Label>
                                <p className="text-sm text-muted-foreground">Se desativado, seu perfil, foto e bio não aparecerão para os alunos.</p>
                            </div>
                            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nome Completo *</Label>
                                <Input id="fullName" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="professionalTitle">Cargo / Título Profissional</Label>
                                <Input id="professionalTitle" placeholder="Ex: Personal Trainer" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio / Descrição</Label>
                            <Textarea id="bio" className="min-h-[120px]" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={1000}/>
                            <p className="text-xs text-muted-foreground text-right">{1000 - bio.length} caracteres restantes</p>
                        </div>
                        <div>
                            <Label className="mb-2 block">Redes Sociais</Label>
                            <div className="space-y-3">
                                <div className="relative group"><LinkIcon className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground h-full w-4" /><Input className="pl-10" placeholder="https://instagram.com/seu-usuario" value={instagram} onChange={(e) => setInstagram(e.target.value)} /></div>
                                <div className="relative group"><LinkIcon className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground h-full w-4" /><Input className="pl-10" placeholder="https://linkedin.com/in/seu-perfil" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} /></div>
                                <div className="relative group"><Globe className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground h-full w-4" /><Input className="pl-10" placeholder="https://seu-site.com.br" value={website} onChange={(e) => setWebsite(e.target.value)} /></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dados de Contato e Preferências</CardTitle>
                        <CardDescription>Informações privadas usadas para login, notificações e gerenciamento.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="email">Email de Login *</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                <div className="flex items-center gap-2 text-xs">
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">Verificado</Badge>
                                    <p className="text-muted-foreground">Para alterar, uma verificação será enviada.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                        </div>
                         <div className="space-y-4">
                             <div className="flex items-start justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-medium">Exibir horário de atendimento</Label>
                                    <p className="text-sm text-muted-foreground">Mostra seus horários de trabalho no seu perfil público.</p>
                                </div>
                                <Switch/>
                            </div>
                             <div className="flex items-start justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-medium">Disponível para novos alunos</Label>
                                    <p className="text-sm text-muted-foreground">Indica se você está aceitando novos clientes no momento.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                         </div>
                     </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Segurança da Conta</CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-4">
                         <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-semibold">Senha</p>
                                <p className="text-sm text-muted-foreground">••••••••</p>
                            </div>
                            <Button variant="outline" onClick={() => setActiveTab('security')}>Alterar Senha</Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {lastLogin ? <p>Último login: {lastLogin}</p> : <div className="h-4 w-48 bg-muted rounded animate-pulse"/>}
                            <p>ID do Usuário: user-123 (apenas para referência)</p>
                        </div>
                     </CardContent>
                </Card>

            </div>
            <CardFooter className="justify-end gap-2 border-t pt-6">
                <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar Alterações</Button>
            </CardFooter>
        </>
    );
}

function NotificationsTab() {
    const { toast } = useToast();
    const [prefs, setPrefs] = useState({
        master_enabled: true,
        channel_in_app: true,
        channel_push: true,
        channel_email: false,
        reminders_student_60: false,
        reminders_student_30: true,
        reminders_student_15: false,
        reminders_pro_30: false,
        reminders_pro_10: true,
        agenda_start: true,
        agenda_end: false,
        agenda_pending: true,
        agenda_pending_repeat: false,
        agenda_cancel_student: true,
        agenda_cancel_penalty: true,
        agenda_dnd_student: true,
        agenda_dnd_conflict: true,
        workouts_created: true,
        workouts_updated: false,
        workouts_pending: true,
        workouts_finished: true,
        workouts_missed: true,
        workouts_viewed: false,
        workouts_feedback: true,
        payments_new: true,
        payments_due: '5',
        payments_overdue: true,
        payments_paid: true,
        payments_canceled: false,
        payments_manual: true,
        payments_value_change: true,
        messages_new: true,
        messages_reaction: false,
        messages_forwarded: false,
        messages_sector: true,
        messages_summary: false,
        delivery_frequency: 'real_time',
        dnd_enabled: true,
        dnd_start: '22:00',
        dnd_end: '07:00',
        active_days: ['1','2','3','4','5'],
    });

    const handlePrefChange = (key: keyof typeof prefs, value: any) => {
        const oldValue = prefs[key];
        setPrefs(prev => ({ ...prev, [key]: value }));
        
        toast({
            title: "Preferência atualizada",
        });

        logAction({
            user: 'Kristin Watson',
            origin: 'professional',
            entity: 'Notificações',
            entityId: 'user-123',
            action: 'Edição',
            description: `Preferência de notificação '${key}' alterada.`,
            details: { before: oldValue, after: value }
        });
    };
    
    const timeSlots = Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 2);
        const minute = (i % 2) * 30;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    });

    return (
        <>
            <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Gerencie como e quando você recebe notificações do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <Card>
                    <CardHeader><CardTitle className="text-base">Preferências Gerais</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <Label htmlFor="master_enabled" className="font-medium">Ativar notificações do sistema</Label>
                            <Switch id="master_enabled" checked={prefs.master_enabled} onCheckedChange={(v) => handlePrefChange('master_enabled', v)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Canais de Notificação</Label>
                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex items-center gap-2"><Switch id="channel_in_app" checked={prefs.channel_in_app} onCheckedChange={(v) => handlePrefChange('channel_in_app', v)} /><Label htmlFor="channel_in_app">In-App</Label></div>
                                <div className="flex items-center gap-2"><Switch id="channel_push" checked={prefs.channel_push} onCheckedChange={(v) => handlePrefChange('channel_push', v)} /><Label htmlFor="channel_push">Push (Mobile)</Label></div>
                                <div className="flex items-center gap-2"><Switch id="channel_email" checked={prefs.channel_email} onCheckedChange={(v) => handlePrefChange('channel_email', v)} /><Label htmlFor="channel_email">E-mail</Label></div>
                                <div className="flex items-center gap-2"><Switch disabled /><Label className="text-muted-foreground">WhatsApp (em breve)</Label></div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">Algumas notificações críticas de segurança não podem ser desativadas.</p>
                    </CardContent>
                </Card>

                <Accordion type="multiple" defaultValue={['item-1']} className="w-full space-y-6">
                    <AccordionItem value="item-1" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Agenda e Aulas</AccordionTrigger>
                        <AccordionContent>
                            <div className="px-6 pb-6">
                                <div className="border-t pt-6 space-y-6">
                                    <div className="space-y-3">
                                        <Label className="font-semibold">Lembretes de Aulas (Aluno)</Label>
                                        <div className="flex flex-wrap gap-4 items-center rounded-lg border p-4">
                                            <div className="flex items-center gap-2"><Switch id="reminders_student_60" checked={prefs.reminders_student_60} onCheckedChange={(v) => handlePrefChange('reminders_student_60', v)} /><Label htmlFor="reminders_student_60">60 min antes</Label></div>
                                            <div className="flex items-center gap-2"><Switch id="reminders_student_30" checked={prefs.reminders_student_30} onCheckedChange={(v) => handlePrefChange('reminders_student_30', v)} /><Label htmlFor="reminders_student_30">30 min antes</Label></div>
                                            <div className="flex items-center gap-2"><Switch id="reminders_student_15" checked={prefs.reminders_student_15} onCheckedChange={(v) => handlePrefChange('reminders_student_15', v)} /><Label htmlFor="reminders_student_15">15 min antes</Label></div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="font-semibold">Lembretes de Aulas (Profissional)</Label>
                                        <div className="flex flex-wrap gap-4 items-center rounded-lg border p-4">
                                            <div className="flex items-center gap-2"><Switch id="reminders_pro_30" checked={prefs.reminders_pro_30} onCheckedChange={(v) => handlePrefChange('reminders_pro_30', v)} /><Label htmlFor="reminders_pro_30">30 min antes</Label></div>
                                            <div className="flex items-center gap-2"><Switch id="reminders_pro_10" checked={prefs.reminders_pro_10} onCheckedChange={(v) => handlePrefChange('reminders_pro_10', v)} /><Label htmlFor="reminders_pro_10">10 min antes</Label></div>
                                        </div>
                                    </div>
                                    <Separator/>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <Label htmlFor="agenda_start" className="font-medium">Notificar início da aula</Label>
                                        <Switch id="agenda_start" checked={prefs.agenda_start} onCheckedChange={(v) => handlePrefChange('agenda_start', v)} />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <Label htmlFor="agenda_end" className="font-medium">Notificar término da aula</Label>
                                        <Switch id="agenda_end" checked={prefs.agenda_end} onCheckedChange={(v) => handlePrefChange('agenda_end', v)} />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <Label htmlFor="agenda_pending" className="font-medium">Aula tornou-se "Pendente"</Label>
                                        <Switch id="agenda_pending" checked={prefs.agenda_pending} onCheckedChange={(v) => handlePrefChange('agenda_pending', v)} />
                                    </div>
                                    <div className="pl-6">
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <Label htmlFor="agenda_pending_repeat" className="font-medium">Repetir alerta diário até resolver</Label>
                                            <Switch id="agenda_pending_repeat" checked={prefs.agenda_pending_repeat} onCheckedChange={(v) => handlePrefChange('agenda_pending_repeat', v)} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <Label htmlFor="agenda_cancel_student" className="font-medium">Aluno cancelou uma aula</Label>
                                        <Switch id="agenda_cancel_student" checked={prefs.agenda_cancel_student} onCheckedChange={(v) => handlePrefChange('agenda_cancel_student', v)} />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <Label htmlFor="agenda_cancel_penalty" className="font-medium">Cancelamento gerou falta/penalidade</Label>
                                        <Switch id="agenda_cancel_penalty" checked={prefs.agenda_cancel_penalty} onCheckedChange={(v) => handlePrefChange('agenda_cancel_penalty', v)} />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <Label htmlFor="agenda_dnd_student" className="font-medium">Notificar alunos sobre reagendamento (Drag & Drop)</Label>
                                        <Switch id="agenda_dnd_student" checked={prefs.agenda_dnd_student} onCheckedChange={(v) => handlePrefChange('agenda_dnd_student', v)} />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <Label htmlFor="agenda_dnd_conflict" className="font-medium">Alertar sobre conflito evitado (Overbooking)</Label>
                                        <Switch id="agenda_dnd_conflict" checked={prefs.agenda_dnd_conflict} onCheckedChange={(v) => handlePrefChange('agenda_dnd_conflict', v)} />
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Treinos</AccordionTrigger>
                        <AccordionContent>
                            <div className="px-6 pb-6">
                                <div className="border-t pt-6 space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Treino criado</Label><Switch checked={prefs.workouts_created} onCheckedChange={(v) => handlePrefChange('workouts_created', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Treino alterado</Label><Switch checked={prefs.workouts_updated} onCheckedChange={(v) => handlePrefChange('workouts_updated', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Pendente de finalização</Label><Switch checked={prefs.workouts_pending} onCheckedChange={(v) => handlePrefChange('workouts_pending', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Finalizado</Label><Switch checked={prefs.workouts_finished} onCheckedChange={(v) => handlePrefChange('workouts_finished', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Marcado como falta</Label><Switch checked={prefs.workouts_missed} onCheckedChange={(v) => handlePrefChange('workouts_missed', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Aluno visualizou</Label><Switch checked={prefs.workouts_viewed} onCheckedChange={(v) => handlePrefChange('workouts_viewed', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Aluno registrou feedback</Label><Switch checked={prefs.workouts_feedback} onCheckedChange={(v) => handlePrefChange('workouts_feedback', v)} /></div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-3" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Financeiro e Pagamentos</AccordionTrigger>
                        <AccordionContent>
                            <div className="px-6 pb-6">
                                <div className="border-t pt-6 space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Nova fatura gerada</Label><Switch checked={prefs.payments_new} onCheckedChange={(v) => handlePrefChange('payments_new', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <Label>Fatura próxima do vencimento</Label>
                                        <Select value={prefs.payments_due} onValueChange={(v) => handlePrefChange('payments_due', v)}>
                                            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="3">3 dias antes</SelectItem><SelectItem value="5">5 dias antes</SelectItem><SelectItem value="10">10 dias antes</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Fatura vencida (Atrasada)</Label><Switch checked={prefs.payments_overdue} onCheckedChange={(v) => handlePrefChange('payments_overdue', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Fatura paga</Label><Switch checked={prefs.payments_paid} onCheckedChange={(v) => handlePrefChange('payments_paid', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Fatura cancelada</Label><Switch checked={prefs.payments_canceled} onCheckedChange={(v) => handlePrefChange('payments_canceled', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Pagamento lançado manualmente</Label><Switch checked={prefs.payments_manual} onCheckedChange={(v) => handlePrefChange('payments_manual', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Alteração de valor (juros/multa)</Label><Switch checked={prefs.payments_value_change} onCheckedChange={(v) => handlePrefChange('payments_value_change', v)} /></div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Conversas e Mensagens</AccordionTrigger>
                        <AccordionContent>
                            <div className="px-6 pb-6">
                                <div className="border-t pt-6 space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Nova mensagem recebida</Label><Switch checked={prefs.messages_new} onCheckedChange={(v) => handlePrefChange('messages_new', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Reação em mensagem</Label><Switch checked={prefs.messages_reaction} onCheckedChange={(v) => handlePrefChange('messages_reaction', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Mensagem encaminhada</Label><Switch checked={prefs.messages_forwarded} onCheckedChange={(v) => handlePrefChange('messages_forwarded', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Mensagem de setor</Label><Switch checked={prefs.messages_sector} onCheckedChange={(v) => handlePrefChange('messages_sector', v)} /></div>
                                    <div className="flex items-center justify-between rounded-lg border p-4"><Label>Resumo diário de mensagens não lidas</Label><Switch checked={prefs.messages_summary} onCheckedChange={(v) => handlePrefChange('messages_summary', v)} /></div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                     
                    <AccordionItem value="item-5" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Frequência e Agrupamento</AccordionTrigger>
                        <AccordionContent>
                            <div className="px-6 pb-6">
                                <div className="border-t pt-6 space-y-6">
                                    <div className="space-y-3">
                                        <Label>Frequência de Entrega</Label>
                                        <RadioGroup value={prefs.delivery_frequency} onValueChange={(v) => handlePrefChange('delivery_frequency', v)} className="flex gap-4">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="real_time" id="freq_real_time" /><Label htmlFor="freq_real_time" className="font-normal">Tempo real</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="15_min" id="freq_15_min" /><Label htmlFor="freq_15_min" className="font-normal">Agrupar a cada 15 min</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="daily_summary" id="freq_daily" /><Label htmlFor="freq_daily" className="font-normal">Resumo diário</Label></div>
                                        </RadioGroup>
                                    </div>
                                    <Separator />
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="dnd_enabled" className="font-medium">Janela de Silêncio (Não Perturbe)</Label>
                                            <Switch id="dnd_enabled" checked={prefs.dnd_enabled} onCheckedChange={(v) => handlePrefChange('dnd_enabled', v)} />
                                        </div>
                                        {prefs.dnd_enabled && (
                                            <div className="grid grid-cols-2 gap-4 items-center pl-6 pt-2">
                                                <div className="space-y-2"><Label>De</Label><Select value={prefs.dnd_start} onValueChange={(v) => handlePrefChange('dnd_start', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="max-h-60">{timeSlots.map(t => <SelectItem key={`start-${t}`} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                                                <div className="space-y-2"><Label>Até</Label><Select value={prefs.dnd_end} onValueChange={(v) => handlePrefChange('dnd_end', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="max-h-60">{timeSlots.map(t => <SelectItem key={`end-${t}`} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                                            </div>
                                        )}
                                    </div>
                                    <Separator />
                                    <div className="space-y-3">
                                        <Label>Receber notificações apenas nestes dias</Label>
                                        <ToggleGroup type="multiple" variant="outline" value={prefs.active_days} onValueChange={(v) => handlePrefChange('active_days', v)} className="flex flex-wrap gap-2 justify-start">
                                            <ToggleGroupItem value="1">Seg</ToggleGroupItem><ToggleGroupItem value="2">Ter</ToggleGroupItem><ToggleGroupItem value="3">Qua</ToggleGroupItem><ToggleGroupItem value="4">Qui</ToggleGroupItem><ToggleGroupItem value="5">Sex</ToggleGroupItem><ToggleGroupItem value="6">Sáb</ToggleGroupItem><ToggleGroupItem value="0">Dom</ToggleGroupItem>
                                        </ToggleGroup>
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                 <Card>
                    <CardHeader><CardTitle className="text-base font-semibold text-destructive">Sistema e Segurança</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Notificações de segurança são obrigatórias e não podem ser desativadas.</p>
                         <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> Novo login detectado</div>
                            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> Alteração de senha ou email</div>
                            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> Alterações de permissões</div>
                         </div>
                    </CardContent>
                 </Card>
            </CardContent>
        </>
    );
}

function GeneralTab() {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        businessName: 'BeeGym Pro',
        businessType: 'studio',
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        logoUrl: '',
        weekStart: 'monday',
        openingHours: {
            mon: { open: '08:00', close: '21:00', enabled: true },
            tue: { open: '08:00', close: '21:00', enabled: true },
            wed: { open: '08:00', close: '21:00', enabled: true },
            thu: { open: '08:00', close: '21:00', enabled: true },
            fri: { open: '08:00', close: '20:00', enabled: true },
            sat: { open: '09:00', close: '14:00', enabled: true },
            sun: { open: '', close: '', enabled: false },
        },
        slotMinutes: 30,
        allowOverbooking: false,
        invoiceMask: 'YYYYMM####',
        invoiceGenerateDay: 'onEnrollment',
        invoiceGenerateDayFixed: 5,
        invoiceGenerateBeforeDays: 10,
        firstPaymentPolicy: 'on_enrollment',
        cancellationWindowMinutes: 120,
        language: 'pt-BR',
        dateFormat: 'DD/MM/YYYY'
    });

    const handleSettingChange = (key: keyof typeof settings, value: any) => {
        const previousValue = settings[key];
        setSettings(prev => ({...prev, [key]: value}));
        
        toast({
            title: "Preferência atualizada",
        });

        logAction({
            user: 'Kristin Watson',
            origin: 'professional',
            entity: 'Configurações',
            entityId: 'general',
            action: 'Edição',
            description: `Configuração geral '${key}' alterada.`,
            details: { before: previousValue, after: value }
        });
    };

    const handleOpeningHoursChange = (day: string, field: 'open' | 'close' | 'enabled', value: any) => {
         const previousHours = settings.openingHours;
         setSettings(prev => ({
             ...prev,
             openingHours: {
                 ...prev.openingHours,
                 [day]: { ...prev.openingHours[day as keyof typeof prev.openingHours], [field]: value }
             }
         }));
         toast({ title: "Horário de funcionamento atualizado" });
         logAction({
            user: 'Kristin Watson',
            origin: 'professional',
            entity: 'Configurações',
            entityId: 'general-opening-hours',
            action: 'Edição',
            description: `Horário de funcionamento para '${day}' alterado.`,
            details: { before: previousHours, after: settings.openingHours }
        });
    }

    const weekDays = [
        { key: 'mon', label: 'Segunda-feira' },
        { key: 'tue', label: 'Terça-feira' },
        { key: 'wed', label: 'Quarta-feira' },
        { key: 'thu', label: 'Quinta-feira' },
        { key: 'fri', label: 'Sexta-feira' },
        { key: 'sat', label: 'Sábado' },
        { key: 'sun', label: 'Domingo' },
    ];
    
    return (
      <>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
          <CardDescription>Defina o comportamento global do sistema para seu negócio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><Building className="h-4 w-4"/> Identidade do Negócio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessName">Nome do Negócio</Label>
                            <Input id="businessName" value={settings.businessName} onChange={(e) => handleSettingChange('businessName', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                             <Label>Tipo de Negócio</Label>
                             <Select value={settings.businessType} onValueChange={(v) => handleSettingChange('businessType', v)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="personal">Personal Trainer</SelectItem>
                                    <SelectItem value="studio">Studio</SelectItem>
                                    <SelectItem value="school">Escola</SelectItem>
                                    <SelectItem value="gym">Academia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <Label>Fuso Horário</Label>
                             <Select value={settings.timezone} onValueChange={(v) => handleSettingChange('timezone', v)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="America/Sao_Paulo">(GMT-03:00) São Paulo</SelectItem>
                                    <SelectItem value="America/New_York">(GMT-05:00) Nova Iorque</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Moeda</Label>
                            <Select value={settings.currency} onValueChange={(v) => handleSettingChange('currency', v)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BRL">BRL (Real)</SelectItem>
                                    <SelectItem value="USD">USD (Dólar Americano)</SelectItem>
                                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><CalendarIcon className="h-4 w-4"/> Operação e Agenda</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Horário de Funcionamento</Label>
                        <div className="space-y-2 rounded-lg border p-4">
                            {weekDays.map(day => (
                                <div key={day.key} className="grid grid-cols-3 md:grid-cols-4 items-center gap-2">
                                    <div className="flex items-center gap-2 col-span-3 md:col-span-1">
                                        <Switch id={`enabled-${day.key}`} checked={settings.openingHours[day.key as keyof typeof settings.openingHours].enabled} onCheckedChange={v => handleOpeningHoursChange(day.key, 'enabled', v)} />
                                        <Label htmlFor={`enabled-${day.key}`} className="">{day.label}</Label>
                                    </div>
                                    <div className="col-span-3 md:col-span-3 grid grid-cols-2 gap-2">
                                        <Input type="time" disabled={!settings.openingHours[day.key as keyof typeof settings.openingHours].enabled} value={settings.openingHours[day.key as keyof typeof settings.openingHours].open} onChange={e => handleOpeningHoursChange(day.key, 'open', e.target.value)} />
                                        <Input type="time" disabled={!settings.openingHours[day.key as keyof typeof settings.openingHours].enabled} value={settings.openingHours[day.key as keyof typeof settings.openingHours].close} onChange={e => handleOpeningHoursChange(day.key, 'close', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Semana Inicia em</Label>
                            <RadioGroup value={settings.weekStart} onValueChange={(v) => handleSettingChange('weekStart', v)} className="flex gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="monday" id="monday" /><Label htmlFor="monday" className="font-normal">Segunda</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="sunday" id="sunday" /><Label htmlFor="sunday" className="font-normal">Domingo</Label></div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                             <Label>Granularidade da Agenda</Label>
                             <Select value={String(settings.slotMinutes)} onValueChange={(v) => handleSettingChange('slotMinutes', Number(v))}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 minutos</SelectItem>
                                    <SelectItem value="30">30 minutos</SelectItem>
                                    <SelectItem value="60">60 minutos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="allowOverbooking" className="font-medium">Permitir Overbooking</Label>
                            <p className="text-xs text-muted-foreground">Permitir agendar múltiplos eventos no mesmo horário para o mesmo local/instrutor.</p>
                        </div>
                        <Switch id="allowOverbooking" checked={settings.allowOverbooking} onCheckedChange={(v) => handleSettingChange('allowOverbooking', v)} />
                    </div>
                 </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4"/> Faturamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Dia Padrão de Geração de Fatura</Label>
                         <RadioGroup value={settings.invoiceGenerateDay} onValueChange={(v) => handleSettingChange('invoiceGenerateDay', v)} className="space-y-2">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="onEnrollment" id="onEnrollment"/><Label htmlFor="onEnrollment" className="font-normal">No dia da matrícula (ex: se matriculou dia 13, vence todo dia 13)</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="fixedDay" id="fixedDay"/><Label htmlFor="fixedDay" className="font-normal">Dia fixo do mês</Label></div>
                        </RadioGroup>
                        {settings.invoiceGenerateDay === 'fixedDay' && (
                            <div className="pl-6 pt-2">
                                <Select value={String(settings.invoiceGenerateDayFixed)} onValueChange={(v) => handleSettingChange('invoiceGenerateDayFixed', Number(v))}>
                                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>{Array.from({length:28}, (_,i)=> i+1).map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Máscara da Fatura</Label>
                        <Input value={settings.invoiceMask} onChange={e => handleSettingChange('invoiceMask', e.target.value)} />
                        <p className="text-xs text-muted-foreground">Use YYYY para ano, MM para mês e # para número sequencial.</p>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4"/> Políticas de Agendamento</CardTitle>
                </CardHeader>
                 <CardContent>
                      <div className="space-y-2">
                            <Label>Janela de Cancelamento sem Penalidade</Label>
                            <Select value={String(settings.cancellationWindowMinutes)} onValueChange={(v) => handleSettingChange('cancellationWindowMinutes', Number(v))}>
                                <SelectTrigger className="w-full md:w-1/2"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="60">1 hora antes</SelectItem>
                                    <SelectItem value="120">2 horas antes</SelectItem>
                                    <SelectItem value="240">4 horas antes</SelectItem>
                                    <SelectItem value="1440">24 horas antes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                 </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><LinkIcon className="h-4 w-4"/> Integrações</CardTitle>
                </CardHeader>
                 <CardContent>
                     <p className="text-sm text-muted-foreground">Configurações para gateways de pagamento, calendários externos, etc. (Em desenvolvimento)</p>
                 </CardContent>
            </Card>
        </CardContent>
      </>
    );
}

function LogsTab({ users, units }: { users: any[]; units: any[] }) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [filters, setFilters] = useState({
        searchTerm: '',
        dateRange: { from: undefined, to: undefined } as DateRange,
        unitFilter: 'all',
        userFilter: 'all',
        actionFilter: 'all',
        entityFilter: 'all',
    });
    const [isFilterDialogOpen, setFilterDialogOpen] = useState(false);
    const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        try {
            const storedLogs = localStorage.getItem('system_logs');
            setLogs(storedLogs ? JSON.parse(storedLogs) : initialLogs);
            const activeUnitId = localStorage.getItem('currentUnitId');
            setCurrentUnitId(activeUnitId);
            setFilters(f => ({ ...f, unitFilter: activeUnitId || 'all' }));
        } catch (error) {
            console.error("Failed to load logs:", error);
            setLogs(initialLogs);
        }
    }, []);

    const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
    };

    const paginatedLogs = useMemo(() => {
        const filtered = logs
            .filter(log => {
                const logDate = parseISO(log.timestamp);
                const inDateRange = filters.dateRange.from && filters.dateRange.to
                    ? isWithinInterval(logDate, { start: startOfDay(new Date(filters.dateRange.from)), end: endOfDay(new Date(filters.dateRange.to)) })
                    : true;

                const unitMatch = filters.unitFilter === 'all' || log.unitId === filters.unitFilter;
                const userMatch = filters.userFilter === 'all' || log.user === filters.userFilter;
                const actionMatch = filters.actionFilter === 'all' || log.action === filters.actionFilter;
                const entityMatch = filters.entityFilter === 'all' || log.entity === filters.entityFilter;
                const searchMatch = filters.searchTerm
                    ? log.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) || log.user.toLowerCase().includes(filters.searchTerm.toLowerCase())
                    : true;

                return inDateRange && unitMatch && userMatch && actionMatch && entityMatch && searchMatch;
            })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filtered.slice(startIndex, startIndex + itemsPerPage);
    }, [logs, filters, currentPage]);

    const renderDetails = (details: any) => {
        if (!details) return <p className="text-sm text-muted-foreground">Nenhum detalhe técnico disponível.</p>;
        const { before, after } = details;
        const allKeys = Array.from(new Set([...Object.keys(before || {}), ...Object.keys(after || {})]));
        if (allKeys.length === 0) return <p className="text-sm text-muted-foreground">Nenhum detalhe técnico disponível.</p>;
        
        return (
            <Table>
                <TableHeader><TableRow><TableHead>Campo</TableHead><TableHead>Antes</TableHead><TableHead>Depois</TableHead></TableRow></TableHeader>
                <TableBody>
                    {allKeys.map(key => {
                        const beforeValue = JSON.stringify(before?.[key]);
                        const afterValue = JSON.stringify(after?.[key]);
                        const isChanged = beforeValue !== afterValue;
                        return (
                             <TableRow key={key} className={cn(isChanged && "bg-primary/5")}>
                                <TableCell className="font-semibold">{key}</TableCell>
                                <TableCell className="font-mono text-xs text-red-600">{beforeValue || 'N/A'}</TableCell>
                                <TableCell className="font-mono text-xs text-green-600">{afterValue || 'N/A'}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        );
    };

    const userOptions = useMemo(() => ['all', ...Array.from(new Set(logs.map(l => l.user)))], [logs]);
    const actionOptions = useMemo(() => ['all', ...Array.from(new Set(logs.map(l => l.action)))], [logs]);
    const entityOptions = useMemo(() => ['all', ...Array.from(new Set(logs.map(l => l.entity)))], [logs]);

    return (
        <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedLog(null)}>
            <CardHeader>
                <CardTitle>Logs do Sistema</CardTitle>
                <CardDescription>Histórico de todas as ações realizadas no sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar na descrição ou usuário..." className="pl-10" value={filters.searchTerm} onChange={e => handleFilterChange('searchTerm', e.target.value)} />
                    </div>
                    <Button variant="outline" onClick={() => setFilterDialogOpen(true)}><Filter className="mr-2 h-4 w-4"/>Filtros Avançados</Button>
                </div>
                 <Table>
                    <TableHeader><TableRow><TableHead className="w-[180px]">Data</TableHead><TableHead>Ação</TableHead><TableHead>Usuário</TableHead><TableHead>Origem</TableHead><TableHead className="text-right">Entidade</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {paginatedLogs.map(log => {
                            const user = users.find(u => u.name === log.user);
                            return (
                                <DialogTrigger asChild key={log.id}>
                                    <TableRow onClick={() => setSelectedLog(log)} className="cursor-pointer">
                                        <TableCell className="font-mono text-xs">{format(parseISO(log.timestamp), "dd/MM/yy HH:mm:ss", { locale: ptBR })}</TableCell>
                                        <TableCell><div className="flex items-center gap-2"><div className="text-muted-foreground">{actionIcons[log.action]}</div><span className="font-semibold">{log.description}</span></div></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6"><AvatarImage src={user?.avatar}/><AvatarFallback>{log.user.charAt(0)}</AvatarFallback></Avatar>
                                                <span className="text-muted-foreground text-xs">{log.user}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground"><div className="flex items-center gap-2">{originIcons[log.origin]}{log.origin === 'professional' ? 'Web' : log.origin === 'student' ? 'App' : 'Sistema'}</div></TableCell>
                                        <TableCell className="text-right"><Badge variant="secondary">{log.entity}</Badge></TableCell>
                                    </TableRow>
                                </DialogTrigger>
                            )
                        })}
                    </TableBody>
                </Table>
                <div className="flex justify-center items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>Anterior</Button>
                    <span className="text-sm text-muted-foreground">Página {currentPage}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={paginatedLogs.length < itemsPerPage}>Próximo</Button>
                </div>
            </CardContent>
             {selectedLog && (
                <DialogContent className="max-w-4xl">
                    <DialogHeader><DialogTitle>Detalhes do Log</DialogTitle><DialogDescription>{selectedLog.description}</DialogDescription></DialogHeader>
                    <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><p className="font-semibold text-muted-foreground">Data</p><p>{format(parseISO(selectedLog.timestamp), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}</p></div>
                            <div><p className="font-semibold text-muted-foreground">Usuário</p><p>{selectedLog.user}</p></div>
                            <div><p className="font-semibold text-muted-foreground">Ação</p><p>{selectedLog.action}</p></div>
                            <div><p className="font-semibold text-muted-foreground">Entidade</p><p>{selectedLog.entity} (ID: {selectedLog.entityId})</p></div>
                        </div>
                        <div><h4 className="font-semibold text-muted-foreground mb-2">Dados da Alteração</h4>{renderDetails(selectedLog.details)}</div>
                    </div>
                </DialogContent>
            )}
            <Dialog open={isFilterDialogOpen} onOpenChange={setFilterDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Filtros Avançados</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Período</Label>
                            <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4"/>{filters.dateRange.from ? filters.dateRange.to ? `${format(new Date(filters.dateRange.from), "LLL dd, y")} - ${format(new Date(filters.dateRange.to), "LLL dd, y")}`: format(new Date(filters.dateRange.from), "LLL dd, y"): "Selecione o período"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="range" selected={filters.dateRange} onSelect={(range) => handleFilterChange('dateRange', range)}/></PopoverContent></Popover>
                        </div>
                         <div className="space-y-2">
                            <Label>Unidade</Label>
                            <Select value={filters.unitFilter} onValueChange={(v) => handleFilterChange('unitFilter', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as Unidades</SelectItem>{units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Usuário</Label>
                            <Select value={filters.userFilter} onValueChange={(v) => handleFilterChange('userFilter', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{userOptions.slice(1).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ação</Label>
                                <Select value={filters.actionFilter} onValueChange={(v) => handleFilterChange('actionFilter', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{actionOptions.slice(1).map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Entidade</Label>
                                <Select value={filters.entityFilter} onValueChange={(v) => handleFilterChange('entityFilter', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{entityOptions.slice(1).map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setFilters({ searchTerm: '', dateRange: { from: undefined, to: undefined }, unitFilter: currentUnitId || 'all', userFilter: 'all', actionFilter: 'all', entityFilter: 'all' })}>Limpar Filtros</Button>
                        <Button onClick={() => setFilterDialogOpen(false)}>Aplicar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}

function UsersAndProfilesTab({ users, setUsers, roles, setRoles } : { users: any[], setUsers: (users: any[]) => void, roles: any[], setRoles: (roles: any[]) => void }) {
  const [activeSubTab, setActiveSubTab] = useState('users');
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const { toast } = useToast();

  const handleSaveUser = (userData: any) => {
    let updatedUsers;
    if (editingUser) {
      updatedUsers = users.map(u => u.id === userData.id ? userData : u);
       logAction({ user: 'Kristin Watson', origin: 'professional', entity: 'Usuários', entityId: userData.id, action: 'Edição', description: `Usuário ${userData.name} atualizado.` });
    } else {
      const newUser = { ...userData, id: `usr-${Date.now()}`, createdAt: new Date().toISOString(), status: 'Convite Pendente' };
      updatedUsers = [newUser, ...users];
      logAction({ user: 'Kristin Watson', origin: 'professional', entity: 'Usuários', entityId: newUser.id, action: 'Criação', description: `Usuário ${newUser.name} convidado.` });
    }
    setUsers(updatedUsers);
    localStorage.setItem('system_users', JSON.stringify(updatedUsers));
    setUserModalOpen(false);
    setEditingUser(null);
    toast({ title: editingUser ? 'Usuário atualizado!' : 'Convite enviado!' });
  };
  
  const handleSaveRole = (roleData: any) => {
    let updatedRoles;
    if (editingRole) {
        updatedRoles = roles.map(r => r.id === roleData.id ? roleData : r);
        logAction({ user: 'Kristin Watson', origin: 'professional', entity: 'Configurações', entityId: roleData.id, action: 'Edição', description: `Perfil ${roleData.name} atualizado.` });
    } else {
        const newRole = { ...roleData, id: `role-${Date.now()}` };
        updatedRoles = [...roles, newRole];
        logAction({ user: 'Kristin Watson', origin: 'professional', entity: 'Configurações', entityId: newRole.id, action: 'Criação', description: `Perfil ${newRole.name} criado.` });
    }
    setRoles(updatedRoles);
    localStorage.setItem('system_roles', JSON.stringify(updatedRoles));
    setRoleModalOpen(false);
    setEditingRole(null);
    toast({ title: 'Perfil salvo com sucesso!' });
  }

  const openUserModal = (user: any | null = null) => {
    setEditingUser(user);
    setUserModalOpen(true);
  }

  const openRoleModal = (role: any | null = null) => {
    setEditingRole(role);
    setRoleModalOpen(true);
  }

  const userStatusOptions = ['Ativo', 'Inativo', 'Convite Pendente'];
  const roleOptions = roles.map(r => ({ value: r.id, label: r.name }));

  const UsersTabContent = () => {
    const [filters, setFilters] = useState({ search: '', role: 'all', status: 'all' });

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchMatch = user.name.toLowerCase().includes(filters.search.toLowerCase()) || user.email.toLowerCase().includes(filters.search.toLowerCase());
            const roleMatch = filters.role === 'all' || user.roleId === filters.role;
            const statusMatch = filters.status === 'all' || user.status === filters.status;
            return searchMatch && roleMatch && statusMatch;
        });
    }, [users, filters]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex flex-col md:flex-row gap-2">
                    <Input placeholder="Buscar por nome ou email..." className="max-w-xs" value={filters.search} onChange={e => setFilters(f => ({...f, search: e.target.value}))}/>
                    <Select value={filters.role} onValueChange={v => setFilters(f => ({...f, role: v}))}>
                        <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por perfil..." /></SelectTrigger>
                        <SelectContent><SelectItem value="all">Todos os Perfis</SelectItem>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                    </Select>
                     <Select value={filters.status} onValueChange={v => setFilters(f => ({...f, status: v}))}>
                        <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por status..." /></SelectTrigger>
                        <SelectContent><SelectItem value="all">Todos os Status</SelectItem>{userStatusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <Button onClick={() => openUserModal()}><UserPlus className="mr-2 h-4 w-4"/>Convidar Usuário</Button>
            </div>
            <Table>
                <TableHeader><TableRow><TableHead>Usuário</TableHead><TableHead>Perfil</TableHead><TableHead>Último Login</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                    {filteredUsers.map(user => {
                        const role = roles.find(r => r.id === user.roleId);
                        return (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10"><AvatarImage src={user.avatar} /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><Badge variant="outline" style={{backgroundColor: role?.color.replace('bg-', 'var(--')}}>{role?.name || 'N/A'}</Badge></TableCell>
                                <TableCell className="text-muted-foreground text-xs">{user.lastLogin ? formatDistanceToNow(parseISO(user.lastLogin), { addSuffix: true, locale: ptBR }) : 'Nunca'}</TableCell>
                                <TableCell><Badge variant={user.status === 'Ativo' ? 'default' : 'secondary'} className={cn(user.status === 'Ativo' && 'bg-green-100 text-green-700', user.status === 'Inativo' && 'bg-gray-100 text-gray-600', user.status === 'Convite Pendente' && 'bg-yellow-100 text-yellow-700' )}>{user.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent><DropdownMenuItem onSelect={() => openUserModal(user)}>Editar</DropdownMenuItem><DropdownMenuItem>Resetar Senha</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem className="text-red-500">Desativar</DropdownMenuItem></DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
  }
  
  const RolesTabContent = () => (
     <div className="space-y-4">
        <div className="flex justify-end">
            <Button onClick={() => openRoleModal()}><Plus className="mr-2 h-4 w-4"/>Novo Perfil</Button>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map(role => (
                <Card key={role.id}>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <Badge className={role.color}>{role.name}</Badge>
                                {role.isDefault && <Badge variant="outline">Padrão</Badge>}
                            </span>
                             <Button variant="ghost" size="icon" onClick={() => openRoleModal(role)}><Edit className="h-4 w-4"/></Button>
                        </CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Permissões Chave</p>
                        <div className="space-y-1 text-sm">
                           {role.permissions[0] === '*' ? <p>Acesso Total</p> : role.permissions.slice(0,3).map((p:string) => <p key={p} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> {p}</p>)}
                           {role.permissions.length > 3 && <p>e mais...</p>}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
     </div>
  )

  return (
    <>
      <CardHeader>
        <CardTitle>Usuários e Perfis</CardTitle>
        <CardDescription>Gerencie os usuários da sua equipe, seus papéis e permissões de acesso ao sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="users" onValueChange={setActiveSubTab} value={activeSubTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="roles">Perfis e Permissões</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="mt-6"><UsersTabContent /></TabsContent>
          <TabsContent value="roles" className="mt-6"><RolesTabContent /></TabsContent>
        </Tabs>
      </CardContent>
      <Dialog open={isUserModalOpen} onOpenChange={setUserModalOpen}>
        <UserFormDialog user={editingUser} roles={roles} onSubmit={handleSaveUser} onClose={() => setUserModalOpen(false)} />
      </Dialog>
      <Dialog open={isRoleModalOpen} onOpenChange={setRoleModalOpen}>
         <RoleFormDialog role={editingRole} onSubmit={handleSaveRole} onClose={() => setRoleModalOpen(false)} />
      </Dialog>
    </>
  );
}

const UserFormDialog = ({ user, roles, onSubmit, onClose }: { user: any, roles: any[], onSubmit: (data: any) => void, onClose: () => void }) => {
    const [formData, setFormData] = useState({ id: '', name: '', email: '', roleId: '' });

    useEffect(() => {
        if (user) {
            setFormData({ id: user.id, name: user.name, email: user.email, roleId: user.roleId });
        } else {
            setFormData({ id: '', name: '', email: '', roleId: '' });
        }
    }, [user]);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{user ? 'Editar Usuário' : 'Convidar Novo Usuário'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label htmlFor="name">Nome Completo</Label><Input id="name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} /></div>
                <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))} /></div>
                <div className="grid gap-2"><Label htmlFor="roleId">Perfil</Label>
                    <Select value={formData.roleId} onValueChange={v => setFormData(f => ({...f, roleId: v}))}>
                        <SelectTrigger><SelectValue placeholder="Selecione um perfil"/></SelectTrigger>
                        <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={() => onSubmit(formData)}>Salvar</Button>
            </DialogFooter>
        </DialogContent>
    )
}

const RoleFormDialog = ({ role, onSubmit, onClose }: { role: any, onSubmit: (data: any) => void, onClose: () => void }) => {
    const [formData, setFormData] = useState({ id: '', name: '', description: '', permissions: [] as string[] });

     useEffect(() => {
        if (role) {
            setFormData({ id: role.id, name: role.name, description: role.description, permissions: role.permissions[0] === '*' ? Object.keys(permissionsMatrix).flatMap(m => permissionsMatrix[m].actions.map(a => `${m}.${a.key}`)) : role.permissions });
        } else {
            setFormData({ id: '', name: '', description: '', permissions: [] });
        }
    }, [role]);

    const handlePermissionChange = (perm: string, checked: boolean) => {
        setFormData(f => ({
            ...f,
            permissions: checked ? [...f.permissions, perm] : f.permissions.filter(p => p !== perm)
        }));
    };

    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{role ? 'Editar Perfil' : 'Criar Novo Perfil'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2"><Label htmlFor="role-name">Nome do Perfil</Label><Input id="role-name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} /></div>
                    <div className="grid gap-2"><Label htmlFor="role-desc">Descrição</Label><Input id="role-desc" value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))} /></div>
                </div>
                 <div className="space-y-4">
                     <Label>Permissões</Label>
                     <Accordion type="multiple" className="w-full">
                         {Object.entries(permissionsMatrix).map(([moduleKey, module]) => (
                             <AccordionItem key={moduleKey} value={moduleKey}>
                                 <AccordionTrigger>{module.label}</AccordionTrigger>
                                 <AccordionContent>
                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                                         {module.actions.map(action => (
                                             <div key={action.key} className="flex items-center space-x-2">
                                                 <Checkbox 
                                                     id={`${moduleKey}-${action.key}`} 
                                                     checked={formData.permissions.includes(`${moduleKey}.${action.key}`)}
                                                     onCheckedChange={(checked) => handlePermissionChange(`${moduleKey}.${action.key}`, !!checked)}
                                                 />
                                                 <label htmlFor={`${moduleKey}-${action.key}`} className="text-sm font-medium leading-none">{action.label}</label>
                                             </div>
                                         ))}
                                     </div>
                                 </AccordionContent>
                             </AccordionItem>
                         ))}
                     </Accordion>
                 </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={() => onSubmit(formData)}>Salvar Perfil</Button>
            </DialogFooter>
        </DialogContent>
    )
}

function InstructorsTab({ users }: { users: any[] }) {
    const [instructors, setInstructors] = useState<any[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState<any | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const stored = localStorage.getItem('instructors_data');
            setInstructors(stored ? JSON.parse(stored) : initialInstructors);
        } catch (e) {
            console.error(e);
            setInstructors(initialInstructors);
        }
    }, []);
    
    const handleSaveInstructor = (data: any) => {
        let updatedList;
        if (editingInstructor) {
            updatedList = instructors.map(i => i.id === data.id ? data : i);
             logAction({ user: 'Kristin Watson', origin: 'professional', entity: 'Instrutores', entityId: data.id, action: 'Edição', description: `Instrutor ${data.name} atualizado.` });
        } else {
            const newInstructor = { ...data, id: `inst-${Date.now()}`, createdAt: new Date().toISOString() };
            updatedList = [newInstructor, ...instructors];
            logAction({ user: 'Kristin Watson', origin: 'professional', entity: 'Instrutores', entityId: newInstructor.id, action: 'Criação', description: `Instrutor ${newInstructor.name} criado.` });
        }
        setInstructors(updatedList);
        localStorage.setItem('instructors_data', JSON.stringify(updatedList));
        setModalOpen(false);
        setEditingInstructor(null);
        toast({ title: `Instrutor ${editingInstructor ? 'atualizado' : 'criado'} com sucesso!` });
    };

    const openModal = (instructor: any | null = null) => {
        setEditingInstructor(instructor);
        setModalOpen(true);
    };
    
    return (
        <>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Instrutores</CardTitle>
                        <CardDescription>Gerencie os instrutores como recursos operacionais. Eles não possuem acesso ao sistema.</CardDescription>
                    </div>
                    <Button onClick={() => openModal()}><Plus className="mr-2 h-4 w-4" /> Novo Instrutor</Button>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader><TableRow><TableHead>Instrutor</TableHead><TableHead>Especialidades</TableHead><TableHead>Usuário Vinculado</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {instructors.map(inst => {
                            const linkedUser = users.find(u => u.id === inst.userId);
                            return (
                                <TableRow key={inst.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar><AvatarImage src={inst.avatar} /><AvatarFallback>{inst.name.charAt(0)}</AvatarFallback></Avatar>
                                            <div>
                                                <p className="font-semibold">{inst.name}</p>
                                                <p className="text-xs text-muted-foreground">{inst.phone}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {(inst.skills || []).slice(0, 2).map((skill: string) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                                            {(inst.skills?.length || 0) > 2 && <Badge variant="outline">+{inst.skills.length - 2}</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {linkedUser ? 
                                            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/>{linkedUser.name}</div> 
                                            : <span className="text-muted-foreground">Nenhum</span>}
                                    </TableCell>
                                    <TableCell><Badge variant={inst.status === 'Ativo' ? 'default' : 'secondary'} className={cn(inst.status === 'Ativo' && 'bg-green-100 text-green-700')}>{inst.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={() => openModal(inst)}>Editar</DropdownMenuItem>
                                                <DropdownMenuItem>Ver Disponibilidade</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500">Desativar</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
            <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
                <InstructorFormDialog instructor={editingInstructor} users={users} onSubmit={handleSaveInstructor} onClose={() => setModalOpen(false)} />
            </Dialog>
        </>
    );
}

const InstructorFormDialog = ({ instructor, users, onSubmit, onClose }: { instructor: any, users: any[], onSubmit: (data: any) => void, onClose: () => void }) => {
    const defaultAvailability = { recurring: [], exceptions: [], capacityPerSlot: 1 };
    const [formData, setFormData] = useState({ 
        id: '', name: '', userId: null, phone: '', bio: '', skills: [], status: 'Ativo', 
        availability: defaultAvailability, certifications: [] as {id: string, name: string, expiresAt: string | null}[]
    });
    const [skillSearch, setSkillSearch] = useState('');

    useEffect(() => {
        if (instructor) {
            setFormData({ ...instructor, userId: instructor.userId || null, availability: instructor.availability || defaultAvailability, certifications: instructor.certifications || [] });
        } else {
            setFormData({ id: '', name: '', userId: null, phone: '', bio: '', skills: [], status: 'Ativo', availability: defaultAvailability, certifications: [] });
        }
    }, [instructor]);
    
    const handleRecurringChange = (dayIndex: number, field: 'start' | 'end', value: string) => {
        const updatedRecurring = formData.availability.recurring.map(item =>
            item.weekday === dayIndex ? { ...item, [field]: value } : item
        );
        setFormData(f => ({ ...f, availability: { ...f.availability, recurring: updatedRecurring } }));
    };

    const toggleRecurringDay = (dayIndex: number, checked: boolean) => {
        let updatedRecurring = [...formData.availability.recurring];
        if (checked) {
            if (!updatedRecurring.some(item => item.weekday === dayIndex)) {
                updatedRecurring.push({ weekday: dayIndex, start: '09:00', end: '18:00' });
            }
        } else {
            updatedRecurring = updatedRecurring.filter(item => item.weekday !== dayIndex);
        }
        setFormData(f => ({ ...f, availability: { ...f.availability, recurring: updatedRecurring } }));
    }
    
    const handleSkillToggle = (skill: string) => {
        setFormData(f => ({...f, skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill]}));
    }

    const handleCertificationChange = (index: number, field: 'name' | 'expiresAt', value: string) => {
        const updatedCerts = [...formData.certifications];
        updatedCerts[index] = {...updatedCerts[index], [field]: value};
        setFormData(f => ({...f, certifications: updatedCerts}));
    }

    const addCertification = () => {
        setFormData(f => ({...f, certifications: [...f.certifications, {id: `cert-${Date.now()}`, name: '', expiresAt: null}]}));
    }
    
    const removeCertification = (index: number) => {
        const updatedCerts = [...formData.certifications];
        updatedCerts.splice(index, 1);
        setFormData(f => ({...f, certifications: updatedCerts}));
    }

    const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    return (
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>{instructor ? 'Editar Instrutor' : 'Novo Instrutor'}</DialogTitle>
                <DialogDescription>Gerencie os dados operacionais, especialidades e disponibilidade do instrutor.</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="personal" className="pt-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                    <TabsTrigger value="skills">Especialidades</TabsTrigger>
                    <TabsTrigger value="certifications">Certificações</TabsTrigger>
                    <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
                    <TabsTrigger value="advanced">Avançado</TabsTrigger>
                </TabsList>
                <TabsContent value="personal" className="py-4 space-y-4">
                    <div className="grid gap-2"><Label>Nome</Label><Input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label>Telefone (Contato)</Label><Input value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} /></div>
                        <div className="grid gap-2">
                            <Label>Vincular a um usuário do sistema</Label>
                            <Select value={formData.userId || ''} onValueChange={v => setFormData(f => ({ ...f, userId: v === 'none' ? null : v }))}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhum</SelectItem>
                                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2"><Label>Bio</Label><Textarea value={formData.bio} onChange={e => setFormData(f => ({...f, bio: e.target.value}))}/></div>
                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={v => setFormData(f => ({ ...f, status: v }))}>
                            <SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Ativo">Ativo</SelectItem>
                                <SelectItem value="Inativo">Inativo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </TabsContent>
                <TabsContent value="skills" className="py-4 space-y-4">
                     <Command className="rounded-lg border shadow-md">
                        <CommandInput placeholder="Buscar especialidade..." value={skillSearch} onValueChange={setSkillSearch}/>
                        <CommandList>
                            <CommandEmpty>Nenhuma especialidade encontrada.</CommandEmpty>
                            <CommandGroup heading="Especialidades">
                                {allSkills.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).map(skill => (
                                    <CommandItem key={skill} onSelect={() => handleSkillToggle(skill)} className="flex justify-between">
                                        {skill}
                                        <Checkbox checked={formData.skills.includes(skill)} />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </TabsContent>
                 <TabsContent value="certifications" className="py-4 space-y-4">
                     <Button type="button" variant="outline" size="sm" onClick={addCertification}><Plus className="mr-2 h-4 w-4"/> Adicionar Certificação</Button>
                     <div className="space-y-3">
                         {formData.certifications.map((cert, index) => (
                             <div key={cert.id} className="grid grid-cols-[1fr_auto_auto] items-end gap-2 p-3 border rounded-lg">
                                 <div className="grid gap-2">
                                    <Label>Nome da Certificação</Label>
                                    <Input value={cert.name} onChange={e => handleCertificationChange(index, 'name', e.target.value)} />
                                 </div>
                                  <div className="grid gap-2">
                                     <Label>Data de Expiração</Label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-[200px] justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{cert.expiresAt ? format(parseISO(cert.expiresAt), "dd/MM/yyyy") : <span>Selecione</span>}</Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={cert.expiresAt ? parseISO(cert.expiresAt) : undefined} onSelect={d => handleCertificationChange(index, 'expiresAt', d ? format(d, 'yyyy-MM-dd') : '')}/></PopoverContent>
                                    </Popover>
                                  </div>
                                 <Button variant="ghost" size="icon" onClick={() => removeCertification(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                             </div>
                         ))}
                     </div>
                </TabsContent>
                <TabsContent value="availability" className="py-4 space-y-4">
                    <div className="space-y-3">
                        <Label>Disponibilidade Recorrente</Label>
                        <div className="p-4 border rounded-lg space-y-3">
                        {weekDays.map((day, index) => {
                            const currentDay = formData.availability.recurring.find(d => d.weekday === index);
                            return (
                                <div key={index} className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                                    <Switch checked={!!currentDay} onCheckedChange={(c) => toggleRecurringDay(index, c)} />
                                    <Label>{day}</Label>
                                    {currentDay && (
                                        <div className="flex gap-2">
                                            <Input type="time" value={currentDay.start} onChange={e => handleRecurringChange(index, 'start', e.target.value)} />
                                            <Input type="time" value={currentDay.end} onChange={e => handleRecurringChange(index, 'end', e.target.value)} />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        </div>
                    </div>
                </TabsContent>
                 <TabsContent value="advanced" className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Capacidade por Slot</Label>
                        <Input type="number" value={formData.availability.capacityPerSlot} onChange={e => setFormData(f => ({...f, availability: {...f.availability, capacityPerSlot: Number(e.target.value)}}))} />
                        <p className="text-xs text-muted-foreground">Quantas aulas/treinos o instrutor pode ministrar simultaneamente.</p>
                      </div>
                </TabsContent>
            </Tabs>
            <DialogFooter>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={() => onSubmit(formData)}>Salvar</Button>
            </DialogFooter>
        </DialogContent>
    );
};

function UnitsTab() {
    const { toast } = useToast();
    const [units, setUnits] = useState<any[]>([]);
    const [isUnitModalOpen, setUnitModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<any | null>(null);

    useEffect(() => {
        const syncData = () => {
             try {
                const storedUnits = localStorage.getItem('units_data');
                setUnits(storedUnits ? JSON.parse(storedUnits) : initialUnits);
            } catch (e) {
                console.error(e);
                setUnits(initialUnits);
            }
        };
        syncData();

        window.addEventListener('storage-update', syncData);
        return () => window.removeEventListener('storage-update', syncData);
    }, []);

    const openUnitModal = (unit: any | null = null) => {
        setEditingUnit(unit);
        setUnitModalOpen(true);
    };

    const handleSaveUnit = (data: any) => {
        let updatedList;
        if (editingUnit) {
            updatedList = units.map(l => l.id === data.id ? data : l);
            logAction({ user: 'Kristin Watson', origin: 'professional', entity: 'Unidades', entityId: data.id, action: 'Edição', description: `Unidade ${data.name} atualizada.` });
        } else {
            const newUnit = { ...data, id: `unit-${Date.now()}` };
            updatedList = [newUnit, ...units];
            logAction({ user: 'Kristin Watson', origin: 'professional', entity: 'Unidades', entityId: newUnit.id, action: 'Criação', description: `Unidade ${newUnit.name} criada.` });
        }
        setUnits(updatedList);
        localStorage.setItem('units_data', JSON.stringify(updatedList));
        window.dispatchEvent(new CustomEvent('storage-update', { detail: { key: 'units_data' } }));
        setUnitModalOpen(false);
        setEditingUnit(null);
        toast({ title: `Unidade ${editingUnit ? 'atualizada' : 'criada'} com sucesso!` });
    };

    return (
        <>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Unidades</CardTitle>
                        <CardDescription>Cadastre e gerencie as unidades (filiais) do seu negócio.</CardDescription>
                    </div>
                    <Button onClick={() => openUnitModal()}><Plus className="mr-2 h-4 w-4" /> Nova Unidade</Button>
                </div>
            </CardHeader>
            <CardContent>
                {units.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                        <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Nenhuma unidade cadastrada</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Adicione sua primeira unidade para começar a organizar seus espaços.</p>
                        <Button className="mt-6" onClick={() => openUnitModal()}><Plus className="mr-2 h-4 w-4" /> Criar Unidade</Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome da Unidade</TableHead>
                                <TableHead>Endereço</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {units.map(unit => (
                                <TableRow key={unit.id}>
                                    <TableCell className="font-semibold">{unit.name}</TableCell>
                                    <TableCell>{unit.address}</TableCell>
                                    <TableCell>
                                        <Badge variant={unit.status === 'Ativo' ? 'default' : 'destructive'} className={cn(unit.status === 'Ativo' && 'bg-green-100 text-green-700')}>{unit.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openUnitModal(unit)}><Edit className="h-4 w-4"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={isUnitModalOpen} onOpenChange={setUnitModalOpen}>
                <UnitFormDialog unit={editingUnit} onSubmit={handleSaveUnit} onClose={() => setUnitModalOpen(false)} />
            </Dialog>
        </>
    );
}

function RoomsTab() {
  const { toast } = useToast();
  const [units, setUnits] = useState<any[]>([]);
  const [allEspacos, setAllEspacos] = useState<any[]>([]);
  const [isEspacoModalOpen, setEspacoModalOpen] = useState(false);
  const [editingEspaco, setEditingEspaco] = useState<any | null>(null);
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);
  
  useEffect(() => {
    const syncData = () => {
        try {
            const storedUnits = localStorage.getItem('units_data');
            const storedEspacos = localStorage.getItem('espacos_data');
            const storedUnitId = localStorage.getItem('currentUnitId');

            setUnits(storedUnits ? JSON.parse(storedUnits) : initialUnits);
            setAllEspacos(storedEspacos ? JSON.parse(storedEspacos) : initialEspacos);
            setCurrentUnitId(storedUnitId);
        } catch (e) {
            console.error(e);
            setUnits(initialUnits);
            setAllEspacos(initialEspacos);
        }
    };
    syncData();
    window.addEventListener('storage-update', syncData);
    return () => window.removeEventListener('storage-update', syncData);
  }, []);

  const openEspacoModal = (espaco: any | null = null) => {
    setEditingEspaco(espaco);
    setEspacoModalOpen(true);
  };

  const handleSaveEspaco = (data: any) => {
    let updatedList;
    if (editingEspaco) {
        updatedList = allEspacos.map(s => s.id === data.id ? data : s);
        logAction({ user: 'Kristin Watson', origin: 'professional', entity: 'Salas', entityId: data.id, action: 'Edição', description: `Sala ${data.name} atualizada.`, unitId: data.unitId });
    } else {
        const newEspaco = { ...data, id: `spc-${Date.now()}` };
        updatedList = [newEspaco, ...allEspacos];
        logAction({ user: 'Kristin Watson', origin: 'professional', entity: 'Salas', entityId: newEspaco.id, action: 'Criação', description: `Sala ${newEspaco.name} criada.`, unitId: data.unitId });
    }
    setAllEspacos(updatedList);
    localStorage.setItem('espacos_data', JSON.stringify(updatedList));
    setEspacoModalOpen(false);
    setEditingEspaco(null);
    toast({ title: `Sala ${editingEspaco ? 'atualizada' : 'criada'} com sucesso!` });
  }
  
  const currentUnit = units.find(u => u.id === currentUnitId);
  const filteredEspacos = allEspacos.filter(e => e.unitId === currentUnitId);

  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Salas</CardTitle>
            {currentUnit && <CardDescription>Gerenciando salas da unidade: {currentUnit.name}</CardDescription>}
          </div>
          <Button onClick={() => openEspacoModal()} disabled={!currentUnit}><Plus className="mr-2 h-4 w-4"/>Nova Sala</Button>
        </div>
      </CardHeader>
      <CardContent>
        {!currentUnit ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma unidade selecionada</h3>
                <p className="mt-1 text-sm text-muted-foreground">Selecione uma unidade na barra superior para gerenciar suas salas.</p>
            </div>
        ) : (
        <>
            {filteredEspacos.length === 0 ? (
                 <div className="text-center py-10 border-2 border-dashed rounded-xl">
                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhuma sala cadastrada</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Adicione a primeira sala para esta unidade.</p>
                    <Button className="mt-6" onClick={() => openEspacoModal()}><Plus className="mr-2 h-4 w-4" /> Criar Sala</Button>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sala</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Capacidade</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEspacos.map(espaco => (
                            <TableRow key={espaco.id}>
                                <TableCell><div className="flex items-center gap-2"><div className={cn("w-3 h-3 rounded-full", espaco.color)} />{espaco.name}</div></TableCell>
                                <TableCell>{espaco.type}</TableCell>
                                <TableCell>{espaco.capacity}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEspacoModal(espaco)}><Edit className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
        )}
      </CardContent>
      <Dialog open={isEspacoModalOpen} onOpenChange={setEspacoModalOpen}>
        <EspacoFormDialog espaco={editingEspaco} unitId={currentUnitId} onSubmit={handleSaveEspaco} onClose={() => setEspacoModalOpen(false)} />
      </Dialog>
    </>
  );
}


function UnitFormDialog({ unit, onSubmit, onClose }: { unit: any, onSubmit: (data: any) => void, onClose: () => void }) {
    const [formData, setFormData] = useState({ id: '', name: '', address: '', status: 'Ativo' });

    useEffect(() => {
        if (unit) {
            setFormData(unit);
        } else {
            setFormData({ id: '', name: '', address: '', status: 'Ativo' });
        }
    }, [unit]);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{unit ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label htmlFor="loc-name">Nome da Unidade</Label><Input id="loc-name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))}/></div>
                <div className="grid gap-2"><Label htmlFor="loc-address">Endereço</Label><Input id="loc-address" value={formData.address} onChange={e => setFormData(f => ({...f, address: e.target.value}))}/></div>
                <div className="grid gap-2"><Label htmlFor="loc-status">Status</Label>
                    <Select value={formData.status} onValueChange={v => setFormData(f => ({...f, status: v}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Inativo">Inativo</SelectItem></SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={() => onSubmit(formData)}>{unit ? 'Salvar Alterações' : 'Criar Unidade'}</Button>
            </DialogFooter>
        </DialogContent>
    );
}

function EspacoFormDialog({ espaco, unitId, onSubmit, onClose }: { espaco: any, unitId: string | null, onSubmit: (data: any) => void, onClose: () => void }) {
    const [formData, setFormData] = useState({ id: '', name: '', unitId: '', capacity: 1, type: 'Sala', color: 'bg-gray-200' });

    useEffect(() => {
        if (espaco) {
            setFormData(espaco);
        } else {
            setFormData({ id: '', name: '', unitId: unitId || '', capacity: 1, type: 'Sala', color: 'bg-gray-200' });
        }
    }, [espaco, unitId]);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{espaco ? 'Editar Sala' : 'Nova Sala'}</DialogTitle>
                <DialogDescription>
                    Salas são os ambientes internos de uma unidade onde as aulas acontecem.
                </DialogDescription>
            </DialogHeader>
             <div className="grid gap-4 py-4">
                 <div className="grid gap-2"><Label htmlFor="spc-name">Nome da Sala</Label><Input id="spc-name" placeholder="Ex: Sala de Yoga, Spinning 1" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} /></div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2"><Label htmlFor="spc-capacity">Capacidade Máxima</Label><Input id="spc-capacity" type="number" min="1" value={formData.capacity} onChange={e => setFormData(f => ({...f, capacity: parseInt(e.target.value) || 1}))} /></div>
                     <div className="grid gap-2"><Label htmlFor="spc-type">Tipo</Label>
                        <Select value={formData.type} onValueChange={v => setFormData(f => ({...f, type: v}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="Sala">Sala</SelectItem><SelectItem value="Studio">Studio</SelectItem><SelectItem value="Box">Box</SelectItem><SelectItem value="Externo">Externo</SelectItem><SelectItem value="Piscina">Piscina</SelectItem><SelectItem value="Quadra">Quadra</SelectItem></SelectContent>
                        </Select>
                     </div>
                 </div>
                 <div className="grid gap-2"><Label>Cor na Agenda</Label>
                     <RadioGroup value={formData.color} onValueChange={(v) => setFormData(f => ({...f, color: v}))} className="flex gap-2">
                        {['bg-blue-200', 'bg-green-200', 'bg-red-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200'].map(c => (
                            <RadioGroupItem key={c} value={c} id={c} className="sr-only" />
                        ))}
                        {['bg-blue-200', 'bg-green-200', 'bg-red-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200'].map(c => (
                             <Label key={`l-${c}`} htmlFor={c} className={cn("w-8 h-8 rounded-full cursor-pointer border-2", c, formData.color === c ? 'border-primary ring-2 ring-primary' : 'border-transparent')}></Label>
                        ))}
                    </RadioGroup>
                 </div>
             </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={() => onSubmit(formData)}>{espaco ? 'Salvar Alterações' : 'Criar Sala'}</Button>
            </DialogFooter>
        </DialogContent>
    );
}

function ClassesTab({ isReadOnly }: { isReadOnly: boolean }) {
    const { toast } = useToast();
    const [units, setUnits] = useState<any[]>([]);
    const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);

    const defaultSettings = useMemo(() => ({
        enabled: true,
        defaultCapacity: 20,
        defaultDuration: 60,
        minInterval: 15,
        allowOverbooking: false,
        overbookingLimit: 0,
        enrollmentLeadTime: 60,
        cancellationLeadTime: 240,
        noShowPenalty: 'mark_absence',
        waitlistEnabled: true,
        waitlistSize: 10,
        waitlistAutoEnroll: true,
        checkinEnabled: true,
        checkinWindowStart: 30,
        checkinWindowEnd: 15,
        checkinRequired: true,
        instructorManualCheckin: true,
        requirePlan: true,
        allowSinglePaidClass: true,
        defaultSingleClassPrice: 30.00,
        blockDelinquent: true,
        notifyStudentEnrollment: true,
        notifyStudentWaitlist: true,
        notifyStudentEnrolledFromWaitlist: true,
        notifyStudentCancellation: true,
        notifyInstructorNewClass: true,
        notifyInstructorChange: true,
        notifyInstructorCancellation: true,
    }), []);

    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        const handleStorageChange = () => {
            const storedUnitId = localStorage.getItem('currentUnitId');
            setCurrentUnitId(storedUnitId);

            if (storedUnitId) {
                try {
                    const allSettings = JSON.parse(localStorage.getItem('class_settings') || '{}');
                    const unitSettings = allSettings[storedUnitId];
                    setSettings({ ...defaultSettings, ...(unitSettings || {}) });
                } catch (e) {
                    console.error("Failed to load class settings", e);
                    setSettings(defaultSettings);
                }
            } else {
                setSettings(defaultSettings);
            }
             const storedUnits = JSON.parse(localStorage.getItem('units_data') || '[]');
             setUnits(storedUnits);
        };

        handleStorageChange();
        window.addEventListener('storage-update', handleStorageChange);
        return () => window.removeEventListener('storage-update', handleStorageChange);
    }, [defaultSettings]);

    const handleSettingChange = (key: keyof typeof settings, value: any) => {
        if (isReadOnly) return;
        const oldValue = settings[key];
        setSettings(prev => {
            const newState = { ...prev, [key]: value };
            
            try {
                if (currentUnitId) {
                    const allSettings = JSON.parse(localStorage.getItem('class_settings') || '{}');
                    allSettings[currentUnitId] = newState;
                    localStorage.setItem('class_settings', JSON.stringify(allSettings));
                }
            } catch (e) {
                console.error("Failed to save class settings", e);
            }
            
            return newState;
        });

        logAction({
            user: 'Kristin Watson',
            origin: 'professional',
            entity: 'Configurações',
            entityId: `class_rules_${currentUnitId}`,
            action: 'Edição',
            description: `Regra de aula '${key}' alterada para a unidade.`,
            unitId: currentUnitId || undefined,
            details: { before: { [key]: oldValue }, after: { [key]: value } }
        });

        toast({ title: "Configuração atualizada!" });
    };
    
    const currentUnit = units.find(u => u.id === currentUnitId);
    
    if (!currentUnit) {
        return (
            <>
            <CardHeader>
                <CardTitle>Aulas</CardTitle>
                <CardDescription>Defina regras e padrões para as aulas coletivas.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhuma unidade selecionada</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Selecione uma unidade na barra superior para gerenciar as regras das aulas.</p>
                </div>
            </CardContent>
            </>
        )
    }

    return (
        <>
            <CardHeader>
                <CardTitle>Aulas</CardTitle>
                 <CardDescription>Gerencie as regras e padrões para as aulas coletivas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <Card>
                    <CardHeader><CardTitle className="text-base">Regras Gerais</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4"><Label htmlFor="enabled">Permitir aulas coletivas nesta unidade</Label><Switch id="enabled" checked={settings.enabled} onCheckedChange={v => handleSettingChange('enabled', v)} disabled={isReadOnly} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div className="space-y-2"><Label htmlFor="defaultCapacity">Capacidade Padrão</Label><Input id="defaultCapacity" type="number" value={settings.defaultCapacity} onChange={e => handleSettingChange('defaultCapacity', Number(e.target.value))} disabled={isReadOnly} /></div>
                            <div className="space-y-2"><Label>Duração Padrão (min)</Label><Select value={String(settings.defaultDuration)} onValueChange={v => handleSettingChange('defaultDuration', Number(v))} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="30">30</SelectItem><SelectItem value="45">45</SelectItem><SelectItem value="50">50</SelectItem><SelectItem value="60">60</SelectItem><SelectItem value="75">75</SelectItem><SelectItem value="90">90</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label>Intervalo Mínimo (min)</Label><Select value={String(settings.minInterval)} onValueChange={v => handleSettingChange('minInterval', Number(v))} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="0">0</SelectItem><SelectItem value="5">5</SelectItem><SelectItem value="10">10</SelectItem><SelectItem value="15">15</SelectItem></SelectContent></Select></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Inscrição e Cancelamento</CardTitle></CardHeader>
                     <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2"><Label>Antecedência mín. inscrição (min)</Label><Input type="number" value={settings.enrollmentLeadTime} onChange={e => handleSettingChange('enrollmentLeadTime', Number(e.target.value))} disabled={isReadOnly} /></div>
                           <div className="space-y-2"><Label>Antecedência mín. cancelamento (min)</Label><Input type="number" value={settings.cancellationLeadTime} onChange={e => handleSettingChange('cancellationLeadTime', Number(e.target.value))} disabled={isReadOnly} /></div>
                        </div>
                        <div className="space-y-2"><Label>Penalidade por Falta</Label><Select value={settings.noShowPenalty} onValueChange={v => handleSettingChange('noShowPenalty', v)} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="none">Nenhuma</SelectItem><SelectItem value="mark_absence">Marcar falta</SelectItem><SelectItem value="block_1_day">Bloquear por 1 dia</SelectItem></SelectContent></Select></div>
                        <div className="flex items-center justify-between rounded-lg border p-4"><Label>Habilitar lista de espera</Label><Switch checked={settings.waitlistEnabled} onCheckedChange={v => handleSettingChange('waitlistEnabled', v)} disabled={isReadOnly} /></div>
                        {settings.waitlistEnabled && <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6"><div className="space-y-2"><Label>Tamanho da fila</Label><Input type="number" value={settings.waitlistSize} onChange={e => handleSettingChange('waitlistSize', Number(e.target.value))} disabled={isReadOnly} /></div><div className="flex items-end pb-2"><Checkbox id="waitlistAutoEnroll" checked={settings.waitlistAutoEnroll} onCheckedChange={v => handleSettingChange('waitlistAutoEnroll', !!v)} disabled={isReadOnly} /><Label htmlFor="waitlistAutoEnroll" className="ml-2 font-normal">Inscrever aluno automaticamente</Label></div></div>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-base">Check-in e Presença</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4"><Label>Permitir check-in</Label><Switch checked={settings.checkinEnabled} onCheckedChange={v => handleSettingChange('checkinEnabled', v)} disabled={isReadOnly} /></div>
                        {settings.checkinEnabled && <>
                            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Liberar check-in (min antes)</Label><Input type="number" value={settings.checkinWindowStart} onChange={e => handleSettingChange('checkinWindowStart', Number(e.target.value))} disabled={isReadOnly} /></div><div className="space-y-2"><Label>Bloquear check-in (min após)</Label><Input type="number" value={settings.checkinWindowEnd} onChange={e => handleSettingChange('checkinWindowEnd', Number(e.target.value))} disabled={isReadOnly} /></div></div>
                            <div className="flex items-center space-x-2"><Checkbox id="checkinRequired" checked={settings.checkinRequired} onCheckedChange={v => handleSettingChange('checkinRequired', !!v)} disabled={isReadOnly}/><Label htmlFor="checkinRequired" className="font-normal">Obrigar check-in para contar frequência</Label></div>
                            <div className="flex items-center space-x-2"><Checkbox id="instructorManualCheckin" checked={settings.instructorManualCheckin} onCheckedChange={v => handleSettingChange('instructorManualCheckin', !!v)} disabled={isReadOnly}/><Label htmlFor="instructorManualCheckin" className="font-normal">Instrutor pode validar presença manualmente</Label></div>
                            <p className="text-sm text-muted-foreground pt-2">A funcionalidade de Check-in por QR Code é um placeholder.</p>
                        </>}
                    </CardContent>
                 </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-base">Regras Financeiras da Aula</CardTitle></CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4"><Label>Exigir plano ativo para inscrição</Label><Switch checked={settings.requirePlan} onCheckedChange={v => handleSettingChange('requirePlan', v)} disabled={isReadOnly}/></div>
                        <div className="flex items-center justify-between rounded-lg border p-4"><Label>Bloquear inscrição de aluno inadimplente</Label><Switch checked={settings.blockDelinquent} onCheckedChange={v => handleSettingChange('blockDelinquent', v)} disabled={isReadOnly}/></div>
                        <div className="flex items-center justify-between rounded-lg border p-4"><Label>Permitir aula avulsa paga</Label><Switch checked={settings.allowSinglePaidClass} onCheckedChange={v => handleSettingChange('allowSinglePaidClass', v)} disabled={isReadOnly}/></div>
                        {settings.allowSinglePaidClass && <div className="pl-6"><Label>Valor Padrão Aula Avulsa</Label><Input type="number" value={settings.defaultSingleClassPrice} onChange={e => handleSettingChange('defaultSingleClassPrice', Number(e.target.value))} disabled={isReadOnly} className="w-48 mt-2"/></div>}
                    </CardContent>
                </Card>
            </CardContent>
            <CardFooter className="border-t pt-6 justify-end">
                <p className="text-xs text-muted-foreground">As alterações são salvas automaticamente.</p>
            </CardFooter>
        </>
    )
}

function WorkoutsTab({ isReadOnly }: { isReadOnly: boolean }) {
    const { toast } = useToast();
    const [units, setUnits] = useState<any[]>([]);
    const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);

    const defaultSettings = useMemo(() => ({
        allowIndividualWorkouts: true,
        allowGroupWorkouts: true,
        minInterval: 15,
        blockOutsideHours: true,
        allowNoRoom: false,
        allowInstructorOverlap: false,
        enrollmentLeadTime: 60,
        cancellationLeadTime: 240,
        noShowPenalty: 'none',
        waitlistEnabled: false,
        waitlistSize: 5,
        checkinEnabled: true,
        checkinWindowStart: 15,
        checkinWindowEnd: 10,
        checkinRequired: true,
        instructorManualCheckin: true,
        noCheckinIsAbsence: false,
        requirePlan: true,
        allowDropIn: false,
        dropInPrice: 0,
        isFree: false,
        blockDelinquent: true,
        allowDelinquentWithWarning: false,
    }), []);

    const [settings, setSettings] = useState(defaultSettings);
    const [workoutTypes, setWorkoutTypes] = useState<any[]>([]);
    const [isWorkoutTypeModalOpen, setWorkoutTypeModalOpen] = useState(false);
    const [editingWorkoutType, setEditingWorkoutType] = useState<any | null>(null);

    useEffect(() => {
        const handleStorageChange = () => {
            const storedUnitId = localStorage.getItem('currentUnitId');
            setCurrentUnitId(storedUnitId);

            if (storedUnitId) {
                try {
                    const allWorkoutSettings = JSON.parse(localStorage.getItem('workout_settings') || '{}');
                    const unitWorkoutSettings = allWorkoutSettings[storedUnitId];
                    setSettings({ ...defaultSettings, ...(unitWorkoutSettings || {}) });

                    const allWorkoutTypes = JSON.parse(localStorage.getItem('workout_types') || '{}');
                    const unitWorkoutTypes = allWorkoutTypes[storedUnitId] || [];
                    setWorkoutTypes(unitWorkoutTypes);
                } catch (e) {
                    console.error("Failed to load workout settings/types", e);
                    setSettings(defaultSettings);
                    setWorkoutTypes([]);
                }
            } else {
                setSettings(defaultSettings);
                setWorkoutTypes([]);
            }
            const storedUnits = JSON.parse(localStorage.getItem('units_data') || '[]');
            setUnits(storedUnits);
        };

        handleStorageChange();
        window.addEventListener('storage-update', handleStorageChange);
        return () => window.removeEventListener('storage-update', handleStorageChange);
    }, [defaultSettings]);

    const handleSettingChange = (key: keyof typeof settings, value: any) => {
        if (isReadOnly) return;
        const oldValue = settings[key];
        setSettings(prev => {
            const newState = { ...prev, [key]: value };
            if (currentUnitId) {
                try {
                    const allSettings = JSON.parse(localStorage.getItem('workout_settings') || '{}');
                    allSettings[currentUnitId] = newState;
                    localStorage.setItem('workout_settings', JSON.stringify(allSettings));
                } catch (e) { console.error("Failed to save workout settings", e); }
            }
            return newState;
        });

        logAction({
            user: 'Kristin Watson', origin: 'professional', entity: 'Configurações', entityId: `workout_rules_${currentUnitId}`,
            action: 'Edição', description: `Regra de treino '${key}' alterada.`, unitId: currentUnitId || undefined,
            details: { before: { [key]: oldValue }, after: { [key]: value } }
        });
        toast({ title: "Configuração atualizada!" });
    };
    
    const openWorkoutTypeModal = (type: any | null = null) => {
        setEditingWorkoutType(type);
        setWorkoutTypeModalOpen(true);
    };

    const handleSaveWorkoutType = (data: any) => {
        if (!currentUnitId) return;
        let updatedList;
        const allTypes = JSON.parse(localStorage.getItem('workout_types') || '{}');
        const unitTypes = allTypes[currentUnitId] || [];

        if (editingWorkoutType) {
            updatedList = unitTypes.map((t: any) => (t.id === data.id ? data : t));
        } else {
            const newType = { ...data, id: `wkt-${Date.now()}` };
            updatedList = [...unitTypes, newType];
        }
        
        allTypes[currentUnitId] = updatedList;
        localStorage.setItem('workout_types', JSON.stringify(allTypes));
        setWorkoutTypes(updatedList);
        setWorkoutTypeModalOpen(false);
        setEditingWorkoutType(null);
        toast({ title: `Tipo de treino ${editingWorkoutType ? 'atualizado' : 'criado'}!` });
    };

    const currentUnit = units.find(u => u.id === currentUnitId);

    if (!currentUnit) {
        return (
            <>
            <CardHeader><CardTitle>Treinos</CardTitle><CardDescription>Defina regras e padrões para os treinos.</CardDescription></CardHeader>
            <CardContent><div className="text-center py-12 border-2 border-dashed rounded-xl"><Building className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">Nenhuma unidade selecionada</h3><p className="mt-1 text-sm text-muted-foreground">Selecione uma unidade para gerenciar as regras dos treinos.</p></div></CardContent>
            </>
        )
    }

    return (
        <>
            <CardHeader>
                <CardTitle>Treinos</CardTitle>
                <CardDescription>Defina os tipos de treino, regras e padrões da unidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Tipos de Treino</CardTitle>
                             <Button onClick={() => openWorkoutTypeModal()} disabled={isReadOnly}><Plus className="mr-2 h-4 w-4" /> Novo Tipo</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {workoutTypes.length > 0 ? (
                            <Table>
                                <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Categoria</TableHead><TableHead>Duração</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {workoutTypes.map((type) => (
                                        <TableRow key={type.id}>
                                            <TableCell className="font-medium">{type.name}</TableCell>
                                            <TableCell>{type.category}</TableCell>
                                            <TableCell>{type.defaultDuration} min</TableCell>
                                            <TableCell><Badge variant={type.status === 'Ativo' ? 'default' : 'destructive'}>{type.status}</Badge></TableCell>
                                            <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => openWorkoutTypeModal(type)}><Edit className="h-4 w-4"/></Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhum tipo de treino cadastrado nesta unidade.</p>
                        )}
                    </CardContent>
                </Card>
                
                <Accordion type="multiple" defaultValue={['general_rules']} className="w-full space-y-6">
                    <AccordionItem value="general_rules" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Regras Gerais de Treinos</AccordionTrigger>
                        <AccordionContent>
                        <div className="px-6 pb-6 border-t pt-6 space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4"><Label>Permitir treinos individuais</Label><Switch checked={settings.allowIndividualWorkouts} onCheckedChange={v => handleSettingChange('allowIndividualWorkouts', v)} disabled={isReadOnly} /></div>
                            <div className="flex items-center justify-between rounded-lg border p-4"><Label>Permitir treinos em grupo</Label><Switch checked={settings.allowGroupWorkouts} onCheckedChange={v => handleSettingChange('allowGroupWorkouts', v)} disabled={isReadOnly} /></div>
                            <div className="flex items-center justify-between rounded-lg border p-4"><Label>Permitir sobreposição de treinos do mesmo instrutor</Label><Switch checked={settings.allowInstructorOverlap} onCheckedChange={v => handleSettingChange('allowInstructorOverlap', v)} disabled={isReadOnly} /></div>
                            <div className="flex items-center justify-between rounded-lg border p-4"><Label>Permitir criação de treinos sem sala definida</Label><Switch checked={settings.allowNoRoom} onCheckedChange={v => handleSettingChange('allowNoRoom', v)} disabled={isReadOnly} /></div>
                        </div>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="enrollment_rules" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Inscrição e Cancelamento</AccordionTrigger>
                        <AccordionContent>
                            <div className="px-6 pb-6 border-t pt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Antecedência mín. inscrição (min)</Label><Input type="number" value={settings.enrollmentLeadTime} onChange={e => handleSettingChange('enrollmentLeadTime', Number(e.target.value))} disabled={isReadOnly} /></div>
                                    <div className="space-y-2"><Label>Antecedência mín. cancelamento (min)</Label><Input type="number" value={settings.cancellationLeadTime} onChange={e => handleSettingChange('cancellationLeadTime', Number(e.target.value))} disabled={isReadOnly} /></div>
                                </div>
                                <div className="space-y-2"><Label>Penalidade por Falta</Label><Select value={settings.noShowPenalty} onValueChange={v => handleSettingChange('noShowPenalty', v)} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="none">Nenhuma</SelectItem><SelectItem value="mark_absence">Marcar falta</SelectItem><SelectItem value="block_1_day">Bloquear por 1 dia</SelectItem></SelectContent></Select></div>
                                <div className="flex items-center justify-between rounded-lg border p-4"><Label>Habilitar lista de espera (treinos em grupo)</Label><Switch checked={settings.waitlistEnabled} onCheckedChange={v => handleSettingChange('waitlistEnabled', v)} disabled={isReadOnly} /></div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter className="border-t pt-6 justify-end"><p className="text-xs text-muted-foreground">As alterações são salvas automaticamente.</p></CardFooter>
            <Dialog open={isWorkoutTypeModalOpen} onOpenChange={setWorkoutTypeModalOpen}><WorkoutTypeFormDialog workoutType={editingWorkoutType} unitId={currentUnitId} onSubmit={handleSaveWorkoutType} onClose={() => setWorkoutTypeModalOpen(false)} /></Dialog>
        </>
    );
}

const WorkoutTypeFormDialog = ({ workoutType, unitId, onSubmit, onClose }: { workoutType: any, unitId: string | null, onSubmit: (data: any) => void, onClose: () => void }) => {
    const [formData, setFormData] = useState({ id: '', name: '', description: '', category: 'Individual', defaultDuration: 60, color: '#3b82f6', status: 'Ativo', allowedInstructors: [], allowedRooms: [], defaultCapacity: 1, allowCapacityOverride: false });

    useEffect(() => {
        if (workoutType) setFormData(workoutType);
        else setFormData({ id: '', name: '', unitId: unitId || '', description: '', category: 'Individual', defaultDuration: 60, color: '#3b82f6', status: 'Ativo', allowedInstructors: [], allowedRooms: [], defaultCapacity: 1, allowCapacityOverride: false });
    }, [workoutType, unitId]);

    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>{workoutType ? 'Editar Tipo de Treino' : 'Novo Tipo de Treino'}</DialogTitle></DialogHeader>
            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2"><Label>Nome</Label><Input value={formData.name} onChange={e => handleFormChange('name', e.target.value)} /></div>
                <div className="space-y-2"><Label>Descrição</Label><Textarea value={formData.description} onChange={e => handleFormChange('description', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Categoria</Label><Select value={formData.category} onValueChange={v => handleFormChange('category', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Individual">Individual</SelectItem><SelectItem value="Em dupla">Em dupla</SelectItem><SelectItem value="Pequeno grupo">Pequeno grupo</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Duração Padrão (min)</Label><Input type="number" value={formData.defaultDuration} onChange={e => handleFormChange('defaultDuration', Number(e.target.value))} /></div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Cor na Agenda</Label><Input type="color" value={formData.color} onChange={e => handleFormChange('color', e.target.value)} className="h-10"/></div>
                    <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={v => handleFormChange('status', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Inativo">Inativo</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Capacidade Padrão</Label><Input type="number" value={formData.defaultCapacity} onChange={e => handleFormChange('defaultCapacity', Number(e.target.value))} /></div>
                    <div className="flex items-end pb-2"><div className="flex items-center space-x-2"><Checkbox id="allow-override" checked={formData.allowCapacityOverride} onCheckedChange={v => handleFormChange('allowCapacityOverride', !!v)}/><Label htmlFor="allow-override" className="font-normal">Permitir sobrescrever</Label></div></div>
                </div>
                 <p className="text-xs text-muted-foreground">Em breve: seleção de instrutores e salas permitidas.</p>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={() => onSubmit(formData)}>Salvar</Button>
            </DialogFooter>
        </DialogContent>
    )
}

function AttendanceTab({ isReadOnly }: { isReadOnly: boolean }) {
    const { toast } = useToast();
    const [units, setUnits] = useState<any[]>([]);
    const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);

    const defaultSettings = useMemo(() => ({
        defaultCheckinMethod: 'instructor',
        minPresencePercentage: 80,
        lateCheckinPolicy: 'allow',
        absenceOnLateCancel: true,
        penaltyForAbsence: 'warning',
        penaltyThresholdCount: 3,
        penaltyThresholdDays: 30,
        absenceResetPolicy: 'monthly',
        alertOnInactivityDays: 30,
        alertOnFrequencyDrop: true,
        alertOnConsecutiveAbsences: 3,
    }), []);

    const [settings, setSettings] = useState(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const handleStorageChange = () => {
            const storedUnitId = localStorage.getItem('currentUnitId');
            setCurrentUnitId(storedUnitId);

            if (storedUnitId) {
                try {
                    const allSettings = JSON.parse(localStorage.getItem('attendance_settings') || '{}');
                    const unitSettings = allSettings[storedUnitId];
                    setSettings({ ...defaultSettings, ...(unitSettings || {}) });
                } catch (e) {
                    console.error("Failed to load attendance settings", e);
                    setSettings(defaultSettings);
                }
            } else {
                setSettings(defaultSettings);
            }
             const storedUnits = JSON.parse(localStorage.getItem('units_data') || '[]');
             setUnits(storedUnits);
             setHasChanges(false);
        };

        handleStorageChange();
        window.addEventListener('storage-update', handleStorageChange);
        return () => window.removeEventListener('storage-update', handleStorageChange);
    }, [defaultSettings]);

    const handleSettingChange = (key: keyof typeof settings, value: any) => {
        if (isReadOnly) return;
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = () => {
        if (isReadOnly || !currentUnitId) return;
        try {
            const allSettings = JSON.parse(localStorage.getItem('attendance_settings') || '{}');
            allSettings[currentUnitId] = settings;
            localStorage.setItem('attendance_settings', JSON.stringify(allSettings));
            logAction({
                user: 'Kristin Watson', origin: 'professional', entity: 'Configurações', entityId: `attendance_rules_${currentUnitId}`,
                action: 'Edição', description: `Regras de frequência atualizadas para a unidade.`, unitId: currentUnitId,
                details: { before: "...", after: "..." }
            });
            toast({ title: "Configurações salvas com sucesso!" });
            setHasChanges(false);
        } catch(e) {
            console.error("Failed to save settings", e);
            toast({ title: "Erro ao salvar", variant: 'destructive'});
        }
    }
    
    const currentUnit = units.find(u => u.id === currentUnitId);
    
    if (!currentUnit) {
        return (
            <>
                <CardHeader><CardTitle>Frequência</CardTitle><CardDescription>Defina as regras para controle de presença e faltas.</CardDescription></CardHeader>
                <CardContent><div className="text-center py-12 border-2 border-dashed rounded-xl"><Building className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">Nenhuma unidade selecionada</h3><p className="mt-1 text-sm text-muted-foreground">Selecione uma unidade para gerenciar as regras de frequência.</p></div></CardContent>
            </>
        )
    }

    return (
        <>
            <CardHeader><CardTitle>Frequência</CardTitle><CardDescription>Defina as regras de controle e impacto da presença dos alunos na unidade.</CardDescription></CardHeader>
            <CardContent className="space-y-8">
                <Card>
                    <CardHeader><CardTitle className="text-base">Regras de Presença</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2"><Label>Método Padrão de Controle</Label><Select value={settings.defaultCheckinMethod} onValueChange={(v) => handleSettingChange('defaultCheckinMethod', v)} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="instructor">Check-in manual pelo instrutor</SelectItem><SelectItem value="student">Check-in pelo aluno (app)</SelectItem><SelectItem value="auto">Check-in automático no horário</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Tempo Mínimo para Presença (%)</Label><Input type="number" value={settings.minPresencePercentage} onChange={(e) => handleSettingChange('minPresencePercentage', parseInt(e.target.value))} disabled={isReadOnly} /></div>
                        <div className="space-y-2"><Label>Política de Check-in Atrasado</Label><Select value={settings.lateCheckinPolicy} onValueChange={(v) => handleSettingChange('lateCheckinPolicy', v)} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="allow">Permitir normalmente</SelectItem><SelectItem value="partial">Marcar como presença parcial</SelectItem><SelectItem value="absence">Considerar como falta</SelectItem></SelectContent></Select></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Faltas e Penalidades</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center space-x-2"><Checkbox id="absenceOnLateCancel" checked={settings.absenceOnLateCancel} onCheckedChange={(c) => handleSettingChange('absenceOnLateCancel', !!c)} disabled={isReadOnly} /><Label htmlFor="absenceOnLateCancel" className="font-normal">Considerar cancelamento fora do prazo como falta</Label></div>
                        <div className="space-y-2"><Label>Penalidade por Acúmulo de Faltas</Label><Select value={settings.penaltyForAbsence} onValueChange={(v) => handleSettingChange('penaltyForAbsence', v)} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="none">Nenhuma</SelectItem><SelectItem value="warning">Enviar advertência</SelectItem><SelectItem value="block_scheduling">Bloquear novos agendamentos</SelectItem></SelectContent></Select></div>
                        {settings.penaltyForAbsence !== 'none' && (<div className="grid grid-cols-2 gap-4 pl-6"><div className="space-y-2"><Label>Nº de faltas para penalidade</Label><Input type="number" value={settings.penaltyThresholdCount} onChange={(e) => handleSettingChange('penaltyThresholdCount', parseInt(e.target.value))} disabled={isReadOnly} /></div><div className="space-y-2"><Label>Dentro de (dias)</Label><Input type="number" value={settings.penaltyThresholdDays} onChange={(e) => handleSettingChange('penaltyThresholdDays', parseInt(e.target.value))} disabled={isReadOnly} /></div></div>)}
                        <div className="space-y-2"><Label>Reset Automático do Contador de Faltas</Label><Select value={settings.absenceResetPolicy} onValueChange={(v) => handleSettingChange('absenceResetPolicy', v)} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="manual">Manual</SelectItem><SelectItem value="monthly">Mensalmente</SelectItem><SelectItem value="quarterly">Trimestralmente</SelectItem><SelectItem value="yearly">Anualmente</SelectItem></SelectContent></Select></div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-base">Alertas Automáticos de Frequência</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2"><Label>Alertar aluno com inatividade de (dias)</Label><Input type="number" value={settings.alertOnInactivityDays} onChange={(e) => handleSettingChange('alertOnInactivityDays', parseInt(e.target.value))} disabled={isReadOnly} /></div>
                        <div className="flex items-center space-x-2"><Checkbox id="alertOnFrequencyDrop" checked={settings.alertOnFrequencyDrop} onCheckedChange={(c) => handleSettingChange('alertOnFrequencyDrop', !!c)} disabled={isReadOnly}/><Label htmlFor="alertOnFrequencyDrop" className="font-normal">Alertar sobre queda de frequência</Label></div>
                        <div className="space-y-2"><Label>Alertar após (faltas consecutivas)</Label><Input type="number" value={settings.alertOnConsecutiveAbsences} onChange={(e) => handleSettingChange('alertOnConsecutiveAbsences', parseInt(e.target.value))} disabled={isReadOnly} /></div>
                    </CardContent>
                 </Card>
            </CardContent>
            <CardFooter className="border-t pt-6 justify-end gap-2">
                {hasChanges && <p className="text-sm text-muted-foreground mr-auto">Você tem alterações não salvas.</p>}
                <Button variant="ghost" onClick={() => { setSettings(defaultSettings); setHasChanges(false); }}>Cancelar</Button>
                <Button onClick={handleSave} disabled={!hasChanges || isReadOnly}>Salvar Alterações</Button>
            </CardFooter>
        </>
    );
}

function PaymentsTab({ isReadOnly }: { isReadOnly: boolean }) {
    const { toast } = useToast();
    const [units, setUnits] = useState<any[]>([]);
    const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);

    const defaultSettings = useMemo(() => ({
        autoBillingEnabled: true,
        defaultDueDays: 15,
        defaultInvoiceNotes: 'Obrigado por treinar conosco!',
        invoiceNumberFormat: '{YYYY}{MM}{SEQ4}',
        autoGenerateInvoices: true,
        autoGenerateDaysBefore: 10,
        daysUntilOverdue: 1,
        daysUntilCancelled: 30,
        lateFeeType: 'percentage',
        lateFeeValue: 2,
        interestRate: 0.03,
        allowPartialPayments: false,
        sendReminderDaysBefore: [7, 3, 1],
    }), []);
    
    const [settings, setSettings] = useState(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const handleStorageChange = () => {
            const storedUnitId = localStorage.getItem('currentUnitId');
            setCurrentUnitId(storedUnitId);

            if (storedUnitId) {
                try {
                    const allSettings = JSON.parse(localStorage.getItem('payment_settings') || '{}');
                    const unitSettings = allSettings[storedUnitId];
                    setSettings({ ...defaultSettings, ...(unitSettings || {}) });
                } catch (e) {
                    console.error("Failed to load payment settings", e);
                    setSettings(defaultSettings);
                }
            } else {
                setSettings(defaultSettings);
            }
             const storedUnits = JSON.parse(localStorage.getItem('units_data') || '[]');
             setUnits(storedUnits);
             setHasChanges(false);
        };

        handleStorageChange();
        window.addEventListener('storage-update', handleStorageChange);
        return () => window.removeEventListener('storage-update', handleStorageChange);
    }, [defaultSettings]);

    const handleSettingChange = (key: keyof typeof settings, value: any) => {
        if (isReadOnly) return;
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = () => {
        if (isReadOnly || !currentUnitId) return;
        try {
            const allSettings = JSON.parse(localStorage.getItem('payment_settings') || '{}');
            allSettings[currentUnitId] = settings;
            localStorage.setItem('payment_settings', JSON.stringify(allSettings));
            logAction({
                user: 'Kristin Watson', origin: 'professional', entity: 'Configurações', entityId: `payment_rules_${currentUnitId}`,
                action: 'Edição', description: `Regras de pagamento atualizadas para a unidade.`, unitId: currentUnitId,
                details: { before: "...", after: "..." }
            });
            toast({ title: "Configurações salvas com sucesso!" });
            setHasChanges(false);
        } catch(e) {
            console.error("Failed to save settings", e);
            toast({ title: "Erro ao salvar", variant: 'destructive'});
        }
    }
    
    const currentUnit = units.find(u => u.id === currentUnitId);
    
    if (!currentUnit) {
        return (
            <>
                <CardHeader><CardTitle>Pagamentos e Faturamento</CardTitle><CardDescription>Configure as regras de faturamento e pagamentos.</CardDescription></CardHeader>
                <CardContent><div className="text-center py-12 border-2 border-dashed rounded-xl"><Building className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">Nenhuma unidade selecionada</h3><p className="mt-1 text-sm text-muted-foreground">Selecione uma unidade para gerenciar as regras de pagamento.</p></div></CardContent>
            </>
        )
    }

    return (
        <>
            <CardHeader><CardTitle>Pagamentos e Faturamento</CardTitle><CardDescription>Defina as regras de faturamento, cobrança e automações financeiras da unidade.</CardDescription></CardHeader>
            <CardContent className="space-y-8">
                <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full space-y-6">
                    <AccordionItem value="item-1" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Geração de Faturas</AccordionTrigger>
                        <AccordionContent>
                        <div className="px-6 pb-6 border-t pt-6 space-y-6">
                            <div className="flex items-center justify-between rounded-lg border p-4"><Label>Habilitar faturamento automático</Label><Switch checked={settings.autoBillingEnabled} onCheckedChange={(v) => handleSettingChange('autoBillingEnabled', v)} disabled={isReadOnly} /></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Gerar fatura X dias antes do venc.</Label><Input type="number" value={settings.autoGenerateDaysBefore} onChange={(e) => handleSettingChange('autoGenerateDaysBefore', parseInt(e.target.value))} disabled={isReadOnly} /></div>
                                <div className="space-y-2"><Label>Formato do Nº da Fatura</Label><Input value={settings.invoiceNumberFormat} onChange={(e) => handleSettingChange('invoiceNumberFormat', e.target.value)} disabled={isReadOnly} /></div>
                            </div>
                            <div className="space-y-2"><Label>Observações Padrão da Fatura</Label><Textarea value={settings.defaultInvoiceNotes} onChange={(e) => handleSettingChange('defaultInvoiceNotes', e.target.value)} disabled={isReadOnly} /></div>
                        </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Juros e Multas por Atraso</AccordionTrigger>
                        <AccordionContent>
                        <div className="px-6 pb-6 border-t pt-6 space-y-6">
                            <div className="space-y-2"><Label>Tipo de Multa</Label><Select value={settings.lateFeeType} onValueChange={(v) => handleSettingChange('lateFeeType', v)} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="percentage">Percentual (%)</SelectItem><SelectItem value="fixed">Valor Fixo (R$)</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label>Valor da Multa</Label><Input type="number" value={settings.lateFeeValue} onChange={(e) => handleSettingChange('lateFeeValue', parseFloat(e.target.value))} disabled={isReadOnly} /></div>
                            <div className="space-y-2"><Label>Juros por Atraso (% ao dia)</Label><Input type="number" value={settings.interestRate} onChange={(e) => handleSettingChange('interestRate', parseFloat(e.target.value))} disabled={isReadOnly} /></div>
                        </div>
                        </AccordionContent>
                    </AccordionItem>

                     <AccordionItem value="item-3" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Transições de Status</AccordionTrigger>
                        <AccordionContent>
                        <div className="px-6 pb-6 border-t pt-6 space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Marcar como "Atrasado" após (dias)</Label><Input type="number" value={settings.daysUntilOverdue} onChange={(e) => handleSettingChange('daysUntilOverdue', parseInt(e.target.value))} disabled={isReadOnly} /></div>
                                <div className="space-y-2"><Label>Cancelar fatura atrasada após (dias)</Label><Input type="number" value={settings.daysUntilCancelled} onChange={(e) => handleSettingChange('daysUntilCancelled', parseInt(e.target.value))} disabled={isReadOnly} /></div>
                             </div>
                        </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter className="border-t pt-6 justify-end gap-2">
                {hasChanges && <p className="text-sm text-muted-foreground mr-auto">Você tem alterações não salvas.</p>}
                <Button variant="ghost" onClick={() => { setSettings(defaultSettings); setHasChanges(false); }}>Cancelar</Button>
                <Button onClick={handleSave} disabled={!hasChanges || isReadOnly}>Salvar Alterações</Button>
            </CardFooter>
        </>
    );
}

function ConversationsTab({ isReadOnly }: { isReadOnly: boolean }) {
    const { toast } = useToast();
    const [units, setUnits] = useState<any[]>([]);
    const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);

    const defaultSettings = useMemo(() => ({
        conversationsEnabled: true,
        whoCanTalk: 'pro_student_pro_pro',
        departmentConversationsEnabled: false,
        initialRouting: 'choose_department',
        allowForwarding: true,
        allowAttachments: true,
        maxImageSize: 5,
        maxDocSize: 10,
        allowAudio: false,
        maxAudioMinutes: 2,
        allowReactions: true,
        deletePolicy: 'placeholder',
        allowArchive: true,
        showReadStatus: true,
        showTypingIndicator: true,
        retentionPeriod: 'unlimited',
        notifyOnNewMessage: true,
        whatsappIntegrationEnabled: false,
    }), []);
    
    const [settings, setSettings] = useState(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const handleStorageChange = () => {
            const storedUnitId = localStorage.getItem('currentUnitId');
            setCurrentUnitId(storedUnitId);

            if (storedUnitId) {
                try {
                    const allSettings = JSON.parse(localStorage.getItem('conversation_settings') || '{}');
                    const unitSettings = allSettings[storedUnitId];
                    setSettings({ ...defaultSettings, ...(unitSettings || {}) });
                } catch (e) {
                    console.error("Failed to load conversation settings", e);
                    setSettings(defaultSettings);
                }
            } else {
                setSettings(defaultSettings);
            }
             const storedUnits = JSON.parse(localStorage.getItem('units_data') || '[]');
             setUnits(storedUnits);
             setHasChanges(false);
        };

        handleStorageChange();
        window.addEventListener('storage-update', handleStorageChange);
        return () => window.removeEventListener('storage-update', handleStorageChange);
    }, [defaultSettings]);

    const handleSettingChange = (key: keyof typeof settings, value: any) => {
        if (isReadOnly) return;
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = () => {
        if (isReadOnly || !currentUnitId) return;
        try {
            const allSettings = JSON.parse(localStorage.getItem('conversation_settings') || '{}');
            allSettings[currentUnitId] = settings;
            localStorage.setItem('conversation_settings', JSON.stringify(allSettings));
            logAction({
                user: 'Kristin Watson', origin: 'professional', entity: 'Configurações', entityId: `conversation_rules_${currentUnitId}`,
                action: 'Edição', description: `Regras de conversas atualizadas para a unidade.`, unitId: currentUnitId,
                details: { before: "...", after: "..." }
            });
            toast({ title: "Configurações salvas com sucesso!" });
            setHasChanges(false);
        } catch(e) {
            console.error("Failed to save settings", e);
            toast({ title: "Erro ao salvar", variant: 'destructive'});
        }
    }
    
    const currentUnit = units.find(u => u.id === currentUnitId);
    
    if (!currentUnit) {
        return (
            <>
                <CardHeader><CardTitle>Conversas</CardTitle><CardDescription>Gerencie as regras de comunicação e mensagens.</CardDescription></CardHeader>
                <CardContent><div className="text-center py-12 border-2 border-dashed rounded-xl"><Building className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">Nenhuma unidade selecionada</h3><p className="mt-1 text-sm text-muted-foreground">Selecione uma unidade para gerenciar as regras do sistema de conversas.</p></div></CardContent>
            </>
        )
    }

    return (
        <>
            <CardHeader><CardTitle>Conversas</CardTitle><CardDescription>Gerencie as regras e comportamentos do sistema de mensagens para a unidade.</CardDescription></CardHeader>
            <CardContent className="space-y-8">
                <Accordion type="multiple" defaultValue={['item-1']} className="w-full space-y-6">
                    <AccordionItem value="item-1" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Regras Gerais de Comunicação</AccordionTrigger>
                        <AccordionContent>
                            <div className="px-6 pb-6 border-t pt-6 space-y-6">
                                <div className="flex items-center justify-between rounded-lg border p-4"><Label>Habilitar módulo de Conversas</Label><Switch checked={settings.conversationsEnabled} onCheckedChange={v => handleSettingChange('conversationsEnabled', v)} disabled={isReadOnly} /></div>
                                <div className="space-y-2"><Label>Quem pode conversar com quem</Label><Select value={settings.whoCanTalk} onValueChange={(v) => handleSettingChange('whoCanTalk', v)} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="pro_student_pro_pro">Profissional ↔ Aluno e Profissional ↔ Profissional</SelectItem><SelectItem value="pro_student_only">Apenas Profissional ↔ Aluno</SelectItem></SelectContent></Select></div>
                                <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 bg-muted"><Checkbox defaultChecked disabled /><div className="space-y-1 leading-none"><Label className="text-muted-foreground">Aluno não pode conversar com outro aluno (Regra do sistema)</Label></div></div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Conteúdo, Anexos e Ações</AccordionTrigger>
                        <AccordionContent>
                            <div className="px-6 pb-6 border-t pt-6 space-y-6">
                                <div className="flex items-center justify-between rounded-lg border p-4"><Label>Permitir reações com emojis</Label><Switch checked={settings.allowReactions} onCheckedChange={v => handleSettingChange('allowReactions', v)} disabled={isReadOnly} /></div>
                                <div className="flex items-center justify-between rounded-lg border p-4"><Label>Permitir envio de anexos (imagens e docs)</Label><Switch checked={settings.allowAttachments} onCheckedChange={v => handleSettingChange('allowAttachments', v)} disabled={isReadOnly} /></div>
                                {settings.allowAttachments && <div className="grid grid-cols-2 gap-4 pl-6"><div className="space-y-2"><Label>Tam. máx imagem (MB)</Label><Input type="number" value={settings.maxImageSize} onChange={e => handleSettingChange('maxImageSize', Number(e.target.value))} disabled={isReadOnly} /></div><div className="space-y-2"><Label>Tam. máx documento (MB)</Label><Input type="number" value={settings.maxDocSize} onChange={e => handleSettingChange('maxDocSize', Number(e.target.value))} disabled={isReadOnly} /></div></div>}
                                <div className="flex items-center justify-between rounded-lg border p-4"><Label>Permitir envio de áudio</Label><Switch checked={settings.allowAudio} onCheckedChange={v => handleSettingChange('allowAudio', v)} disabled={isReadOnly} /></div>
                                <div className="space-y-2"><Label>Ao excluir uma mensagem</Label><Select value={settings.deletePolicy} onValueChange={(v) => handleSettingChange('deletePolicy', v)} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="placeholder">Substituir por "Mensagem removida"</SelectItem><SelectItem value="delete_fully">Remover completamente (não recomendado)</SelectItem></SelectContent></Select></div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Retenção e Status</AccordionTrigger>
                        <AccordionContent>
                            <div className="px-6 pb-6 border-t pt-6 space-y-6">
                                <div className="flex items-center justify-between rounded-lg border p-4"><Label>Mostrar status de leitura (enviado/lido)</Label><Switch checked={settings.showReadStatus} onCheckedChange={v => handleSettingChange('showReadStatus', v)} disabled={isReadOnly} /></div>
                                <div className="flex items-center justify-between rounded-lg border p-4"><Label>Mostrar indicador "digitando..."</Label><Switch checked={settings.showTypingIndicator} onCheckedChange={v => handleSettingChange('showTypingIndicator', v)} disabled={isReadOnly} /></div>
                                <div className="space-y-2"><Label>Tempo de retenção de mensagens</Label><Select value={settings.retentionPeriod} onValueChange={(v) => handleSettingChange('retentionPeriod', v)} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="unlimited">Ilimitado</SelectItem><SelectItem value="1y">1 ano</SelectItem><SelectItem value="5y">5 anos</SelectItem></SelectContent></Select></div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Integração WhatsApp (Placeholder)</AccordionTrigger>
                        <AccordionContent>
                             <div className="px-6 pb-6 border-t pt-6 space-y-6">
                                 <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50"><Label className="text-muted-foreground">Habilitar integração com WhatsApp</Label><Switch disabled checked={settings.whatsappIntegrationEnabled} onCheckedChange={v => handleSettingChange('whatsappIntegrationEnabled', v)} /></div>
                                 <p className="text-sm text-muted-foreground text-center">Funcionalidade em desenvolvimento.</p>
                             </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter className="border-t pt-6 justify-end gap-2">
                {hasChanges && <p className="text-sm text-muted-foreground mr-auto">Você tem alterações não salvas.</p>}
                <Button variant="ghost" onClick={() => { setSettings(defaultSettings); setHasChanges(false); }}>Cancelar</Button>
                <Button onClick={handleSave} disabled={!hasChanges || isReadOnly}>Salvar Alterações</Button>
            </CardFooter>
        </>
    );
}

function ReportsTab({ isReadOnly }: { isReadOnly: boolean }) {
    const { toast } = useToast();
    const [units, setUnits] = useState<any[]>([]);
    const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);

    const defaultSettings = useMemo(() => ({
        enabledReportTypes: ['financeiro', 'aulas', 'frequencia', 'alunos', 'agenda', 'operacional'],
        allowedPeriods: ['this_month', 'last_month', 'this_year', 'last_year'],
        allowComparison: true,
        allowedFilters: ['status', 'paymentMethod', 'instructor', 'classType', 'studentStatus', 'plan'],
        allowedVisualizations: ['chart', 'table'],
        defaultVisualization: 'chart',
        revenueDefinition: 'paid_only',
        includeCancelledInvoices: false,
        includeFeesInRevenue: false,
        allowSavingTemplates: true,
        maxTemplatesPerUser: 10,
        allowExportPdf: true,
        allowExportCsv: true,
        whoCanExport: 'admin_owner',
        aiAnalysisEnabled: false,
        aiTone: 'technical',
        scheduledReportsEnabled: false,
    }), []);

    const [settings, setSettings] = useState(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const handleStorageChange = () => {
            const storedUnitId = localStorage.getItem('currentUnitId');
            setCurrentUnitId(storedUnitId);

            if (storedUnitId) {
                try {
                    const allSettings = JSON.parse(localStorage.getItem('report_settings') || '{}');
                    const unitSettings = allSettings[storedUnitId];
                    setSettings({ ...defaultSettings, ...(unitSettings || {}) });
                } catch (e) {
                    console.error("Failed to load report settings", e);
                    setSettings(defaultSettings);
                }
            } else {
                setSettings(defaultSettings);
            }
             const storedUnits = JSON.parse(localStorage.getItem('units_data') || '[]');
             setUnits(storedUnits);
             setHasChanges(false);
        };

        handleStorageChange();
        window.addEventListener('storage-update', handleStorageChange);
        return () => window.removeEventListener('storage-update', handleStorageChange);
    }, [defaultSettings]);

    const handleSettingChange = (key: keyof typeof settings, value: any) => {
        if (isReadOnly) return;
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleMultiSelectChange = (key: keyof typeof settings, value: string) => {
        if (isReadOnly) return;
        const currentValues = settings[key] as string[];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        setSettings(prev => ({ ...prev, [key]: newValues }));
        setHasChanges(true);
    };

    const handleSave = () => {
        if (isReadOnly || !currentUnitId) return;
        try {
            const allSettings = JSON.parse(localStorage.getItem('report_settings') || '{}');
            allSettings[currentUnitId] = settings;
            localStorage.setItem('report_settings', JSON.stringify(allSettings));
            logAction({
                user: 'Kristin Watson', origin: 'professional', entity: 'Configurações', entityId: `report_rules_${currentUnitId}`,
                action: 'Edição', description: `Regras de relatórios atualizadas para a unidade.`, unitId: currentUnitId,
                details: { before: "...", after: "..." }
            });
            toast({ title: "Configurações salvas com sucesso!" });
            setHasChanges(false);
        } catch(e) {
            console.error("Failed to save settings", e);
            toast({ title: "Erro ao salvar", variant: 'destructive'});
        }
    }
    
    const reportTypeOptions = [
      { id: 'financeiro', label: 'Financeiros' },
      { id: 'aulas', label: 'Aulas' },
      { id: 'frequencia', label: 'Frequência' },
      { id: 'alunos', label: 'Alunos' },
      { id: 'agenda', label: 'Agenda' },
      { id: 'operacional', label: 'Operacional' },
    ];
    
    const currentUnit = units.find(u => u.id === currentUnitId);
    
    if (!currentUnit) {
        return (
            <>
                <CardHeader><CardTitle>Relatórios</CardTitle><CardDescription>Defina regras e padrões para a geração de relatórios.</CardDescription></CardHeader>
                <CardContent><div className="text-center py-12 border-2 border-dashed rounded-xl"><Building className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">Nenhuma unidade selecionada</h3><p className="mt-1 text-sm text-muted-foreground">Selecione uma unidade para gerenciar as regras de relatórios.</p></div></CardContent>
            </>
        )
    }

    return (
        <>
            <CardHeader><CardTitle>Relatórios</CardTitle><CardDescription>Defina as regras e padrões para os relatórios da unidade.</CardDescription></CardHeader>
            <CardContent className="space-y-8">
                <Accordion type="multiple" defaultValue={['item-1']} className="w-full space-y-6">
                     <AccordionItem value="item-1" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Disponibilidade e Padrões</AccordionTrigger>
                        <AccordionContent>
                            <div className="px-6 pb-6 border-t pt-6 space-y-6">
                                <div className="space-y-3">
                                    <Label>Tipos de Relatórios Disponíveis</Label>
                                    <div className="p-4 border rounded-lg grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {reportTypeOptions.map(opt => (
                                            <div key={opt.id} className="flex items-center space-x-2">
                                                <Checkbox id={`type-${opt.id}`} checked={settings.enabledReportTypes.includes(opt.id)} onCheckedChange={() => handleMultiSelectChange('enabledReportTypes', opt.id)} disabled={isReadOnly} />
                                                <Label htmlFor={`type-${opt.id}`} className="font-normal">{opt.label}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Visualização Padrão</Label>
                                    <Select value={settings.defaultVisualization} onValueChange={v => handleSettingChange('defaultVisualization', v)} disabled={isReadOnly}><SelectTrigger className="w-full md:w-1/2"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="chart">Gráfico</SelectItem><SelectItem value="table">Tabela</SelectItem></SelectContent></Select>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Regras de Dados e Cálculo</AccordionTrigger>
                        <AccordionContent>
                            <div className="px-6 pb-6 border-t pt-6 space-y-4">
                                <div className="space-y-2"><Label>Definição de Receita</Label><Select value={settings.revenueDefinition} onValueChange={v => handleSettingChange('revenueDefinition', v)} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="paid_only">Apenas Faturas Pagas</SelectItem><SelectItem value="paid_and_pending">Pagas + Pendentes</SelectItem></SelectContent></Select></div>
                                <div className="flex items-center space-x-2"><Checkbox id="include-fees" checked={settings.includeFeesInRevenue} onCheckedChange={v => handleSettingChange('includeFeesInRevenue', !!v)} disabled={isReadOnly}/><Label htmlFor="include-fees" className="font-normal">Incluir juros e multas nos cálculos de receita</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="include-cancelled" checked={settings.includeCancelledInvoices} onCheckedChange={v => handleSettingChange('includeCancelledInvoices', !!v)} disabled={isReadOnly}/><Label htmlFor="include-cancelled" className="font-normal">Incluir faturas canceladas em visualizações históricas</Label></div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Exportação e Templates</AccordionTrigger>
                        <AccordionContent>
                            <div className="px-6 pb-6 border-t pt-6 space-y-6">
                                <div className="space-y-2"><Label>Quem pode exportar relatórios</Label><Select value={settings.whoCanExport} onValueChange={v => handleSettingChange('whoCanExport', v)} disabled={isReadOnly}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="admin_owner">Apenas Admin/Owner</SelectItem><SelectItem value="manager">Gerentes e acima</SelectItem></SelectContent></Select></div>
                                <div className="flex items-center justify-between rounded-lg border p-4"><Label>Permitir salvar relatórios como modelos</Label><Switch checked={settings.allowSavingTemplates} onCheckedChange={v => handleSettingChange('allowSavingTemplates', v)} disabled={isReadOnly} /></div>
                                <div className="flex items-center justify-between rounded-lg border p-4"><Label>Permitir exportação para PDF</Label><Switch checked={settings.allowExportPdf} onCheckedChange={v => handleSettingChange('allowExportPdf', v)} disabled={isReadOnly} /></div>
                                <div className="flex items-center justify-between rounded-lg border p-4"><Label>Permitir exportação para CSV</Label><Switch checked={settings.allowExportCsv} onCheckedChange={v => handleSettingChange('allowExportCsv', v)} disabled={isReadOnly} /></div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border rounded-xl shadow-sm bg-card overflow-hidden">
                        <AccordionTrigger className="p-6 text-base font-semibold w-full hover:no-underline justify-between">Análise com IA (Placeholder)</AccordionTrigger>
                        <AccordionContent>
                             <div className="px-6 pb-6 border-t pt-6 space-y-6">
                                 <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50"><Label className="text-muted-foreground">Habilitar análise qualitativa com IA</Label><Switch disabled checked={settings.aiAnalysisEnabled} onCheckedChange={v => handleSettingChange('aiAnalysisEnabled', v)} /></div>
                                 <div className="space-y-2"><Label className="text-muted-foreground">Tom do relatório de IA</Label><Select disabled value={settings.aiTone} onValueChange={v => handleSettingChange('aiTone', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="technical">Técnico</SelectItem><SelectItem value="executive">Executivo</SelectItem></SelectContent></Select></div>
                             </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter className="border-t pt-6 justify-end gap-2">
                {hasChanges && <p className="text-sm text-muted-foreground mr-auto">Você tem alterações não salvas.</p>}
                <Button variant="ghost" onClick={() => { setSettings(defaultSettings); setHasChanges(false); }}>Cancelar</Button>
                <Button onClick={handleSave} disabled={!hasChanges || isReadOnly}>Salvar Alterações</Button>
            </CardFooter>
        </>
    );
}

const planSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "O nome do plano é obrigatório."),
    code: z.string().optional(),
    type: z.enum(['limitado', 'assinatura', 'ilimitado', 'trial', 'voucher', 'pack']),
    price: z.number().min(0, "O preço deve ser positivo."),
    billingCycle: z.enum(['monthly', 'quarterly', 'annual', 'none']),
    validityDays: z.number().nullable(),
    sessionsIncluded: z.number().nullable(),
    unitScope: z.enum(['global', 'specific']).default('specific'),
    units: z.array(z.string()),
    status: z.enum(['active', 'inactive', 'archived']),
    color: z.string(),
    icon: z.string(),
  }).refine((data) => {
      if (data.unitScope === 'specific') {
          return data.units.length > 0;
      }
      return true;
  }, {
      message: "Selecione ao menos uma unidade para planos específicos.",
      path: ["units"],
  });

function PlanFormDialog({ plan, units, onSubmit, onClose }: { plan: any | null, units: any[], onSubmit: (data: any) => void, onClose: () => void }) {
    const form = useForm<z.infer<typeof planSchema>>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: '',
            code: '',
            type: 'assinatura',
            price: 0,
            billingCycle: 'monthly',
            validityDays: null,
            sessionsIncluded: null,
            unitScope: 'specific',
            units: [],
            status: 'active',
            color: '#3B82F6',
            icon: 'Bookmark',
        }
    });
    
    useEffect(() => {
        if(plan) {
            form.reset({
                ...plan,
                price: plan.price || 0,
                unitScope: plan.units.length === units.length ? 'global' : 'specific',
            });
        }
    }, [plan, form, units]);

    const onFormSubmit = (data: z.infer<typeof planSchema>) => {
        const finalData = {
            ...data,
            units: data.unitScope === 'global' ? units.map(u => u.id) : data.units,
        };
        onSubmit(finalData);
    };
    
    const unitScope = form.watch('unitScope');

    return (
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>{plan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
            </DialogHeader>
             <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
                    <Tabs defaultValue="general">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="general">Geral</TabsTrigger>
                            <TabsTrigger value="rules">Regras</TabsTrigger>
                            <TabsTrigger value="billing">Faturamento</TabsTrigger>
                            <TabsTrigger value="access">Acesso</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general" className="py-4 space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Nome do Plano</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="code" render={({ field }) => <FormItem><FormLabel>Código (SKU)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>} />
                                <FormField control={form.control} name="type" render={({ field }) => <FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="assinatura">Assinatura</SelectItem><SelectItem value="limitado">Pacote de Aulas</SelectItem><SelectItem value="ilimitado">Ilimitado</SelectItem></SelectContent></Select><FormMessage/></FormItem>} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="color" render={({ field }) => <FormItem><FormLabel>Cor</FormLabel><FormControl><Input type="color" {...field} className="h-10"/></FormControl><FormMessage/></FormItem>} />
                                <FormField control={form.control} name="status" render={({ field }) => <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Ativo</SelectItem><SelectItem value="inactive">Inativo</SelectItem></SelectContent></Select><FormMessage/></FormItem>} />
                            </div>
                        </TabsContent>
                        <TabsContent value="rules" className="py-4 space-y-4">
                            <FormField control={form.control} name="sessionsIncluded" render={({ field }) => <FormItem><FormLabel>Nº de Sessões (deixe 0 para ilimitado)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} /></FormControl><FormMessage/></FormItem>} />
                            <FormField control={form.control} name="validityDays" render={({ field }) => <FormItem><FormLabel>Validade (dias, deixe 0 para sem validade)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} /></FormControl><FormMessage/></FormItem>} />
                        </TabsContent>
                        <TabsContent value="billing" className="py-4 space-y-4">
                            <FormField control={form.control} name="price" render={({ field }) => <FormItem><FormLabel>Preço (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage/></FormItem>} />
                            <FormField control={form.control} name="billingCycle" render={({ field }) => <FormItem><FormLabel>Ciclo de Cobrança</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="none">Nenhum</SelectItem><SelectItem value="monthly">Mensal</SelectItem><SelectItem value="quarterly">Trimestral</SelectItem><SelectItem value="annual">Anual</SelectItem></SelectContent></Select><FormMessage/></FormItem>} />
                        </TabsContent>
                        <TabsContent value="access" className="py-4 space-y-4">
                            <FormField control={form.control} name="unitScope" render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Aplicável em</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="global" /></FormControl><FormLabel className="font-normal">Todas as Unidades</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="specific" /></FormControl><FormLabel className="font-normal">Unidades Específicas</FormLabel></FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )} />
                            {unitScope === 'specific' && (
                                <FormField control={form.control} name="units" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unidades</FormLabel>
                                        <FormControl>
                                            <Command className="rounded-lg border">
                                                <CommandInput placeholder="Buscar unidade..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>
                                                    <CommandGroup className="max-h-40 overflow-y-auto">
                                                        {units.map(unit => (
                                                            <CommandItem key={unit.id} onSelect={() => {
                                                                const newValue = field.value?.includes(unit.id) ? field.value.filter(id => id !== unit.id) : [...(field.value || []), unit.id];
                                                                field.onChange(newValue);
                                                            }}>
                                                                <Check className={cn("mr-2 h-4 w-4", field.value?.includes(unit.id) ? "opacity-100" : "opacity-0")} />
                                                                {unit.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )} />
                            )}
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Salvar Plano</Button>
                    </DialogFooter>
                </form>
             </FormProvider>
        </DialogContent>
    )
}

function PlansTab({ isReadOnly, users, units }: { isReadOnly: boolean, users: any[], units: any[] }) {
    const { toast } = useToast();
    const [plans, setPlans] = useState<any[]>([]);
    const [isPlanModalOpen, setPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any | null>(null);

    useEffect(() => {
        try {
            const storedPlans = localStorage.getItem('system_plans');
            setPlans(storedPlans ? JSON.parse(storedPlans) : initialSystemPlans);
        } catch (e) {
            console.error(e);
            setPlans(initialSystemPlans);
        }
    }, []);

    const openPlanModal = (plan: any | null = null) => {
        setEditingPlan(plan);
        setPlanModalOpen(true);
    };

    const handleSavePlan = (data: any) => {
        let updatedList;
        if (editingPlan) {
            updatedList = plans.map(p => p.id === data.id ? data : p);
            logAction({ user: 'Kristin Watson', origin: 'professional', entity: 'Plano', entityId: data.id, action: 'Edição', description: `Plano ${data.name} atualizado.` });
        } else {
            const newPlan = { ...data, id: `plan-${Date.now()}` };
            updatedList = [newPlan, ...plans];
            logAction({ user: 'Kristin Watson', origin: 'professional', entity: 'Plano', entityId: newPlan.id, action: 'Criação', description: `Plano ${newPlan.name} criado.` });
        }
        setPlans(updatedList);
        localStorage.setItem('system_plans', JSON.stringify(updatedList));
        setPlanModalOpen(false);
        setEditingPlan(null);
        toast({ title: `Plano ${editingPlan ? 'atualizado' : 'criado'} com sucesso!` });
    };

    return (
        <>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Planos</CardTitle>
                        <CardDescription>Gerencie os planos e assinaturas que seu negócio oferece.</CardDescription>
                    </div>
                    <Button onClick={() => openPlanModal()} disabled={isReadOnly}><Plus className="mr-2 h-4 w-4" /> Novo Plano</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Plano</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Unidades</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans.map(plan => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-semibold">{plan.name}</TableCell>
                                <TableCell>{plan.type}</TableCell>
                                <TableCell>R$ {plan.price.toFixed(2)}</TableCell>
                                <TableCell>
                                    {plan.unitScope === 'global' ? <Badge variant="outline">Todas</Badge> : 
                                    <div className="flex flex-wrap gap-1">
                                        {(plan.units || []).slice(0, 2).map((unitId: string) => <Badge key={unitId} variant="secondary">{units.find(u => u.id === unitId)?.name || unitId}</Badge>)}
                                        {plan.units.length > 2 && <Badge variant="outline">+{plan.units.length - 2}</Badge>}
                                    </div>
                                    }
                                </TableCell>
                                <TableCell><Badge variant={plan.status === 'active' ? 'default' : 'secondary'} className={cn(plan.status === 'active' && 'bg-green-100 text-green-700')}>{plan.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onSelect={() => openPlanModal(plan)}>Editar</DropdownMenuItem>
                                            <DropdownMenuItem>Duplicar</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-500">Arquivar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <Dialog open={isPlanModalOpen} onOpenChange={setPlanModalOpen}>
                <PlanFormDialog plan={editingPlan} units={units} onSubmit={handleSavePlan} onClose={() => setPlanModalOpen(false)} />
            </Dialog>
        </>
    );
}


export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<string>('profile');
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    
    useEffect(() => {
        try {
            const storedUsers = localStorage.getItem('system_users');
            setUsers(storedUsers ? JSON.parse(storedUsers) : initialSystemUsers);
            const storedRoles = localStorage.getItem('system_roles');
            setRoles(storedRoles ? JSON.parse(storedRoles) : initialRoles);
            const storedUnits = localStorage.getItem('units_data');
            setUnits(storedUnits ? JSON.parse(storedUnits) : initialUnits);
        } catch (e) {
            console.error(e);
            setUsers(initialSystemUsers);
            setRoles(initialRoles);
            setUnits(initialUnits);
        }
    }, []);

    const userNavItems: { id: string; label: string; icon: ReactNode }[] = [
        { id: 'profile', label: 'Perfil', icon: <User className="mr-3 h-5 w-5" /> },
        { id: 'notifications', label: 'Notificações', icon: <Bell className="mr-3 h-5 w-5" /> },
    ];

    const businessNavItems: { id: string; label: string; icon: ReactNode }[] = [
        { id: 'general', label: 'Geral', icon: <Settings className="mr-3 h-5 w-5" /> },
        { id: 'users', label: 'Usuários e Perfis', icon: <Users className="mr-3 h-5 w-5" /> },
        { id: 'instructors', label: 'Instrutores', icon: <Briefcase className="mr-3 h-5 w-5" /> },
        { id: 'units', label: 'Unidades', icon: <Building className="mr-3 h-5 w-5" /> },
        { id: 'plans', label: 'Planos', icon: <Bookmark className="mr-3 h-5 w-5" /> },
        { id: 'classes', label: 'Aulas', icon: <ClipboardList className="mr-3 h-5 w-5" /> },
        { id: 'rooms', label: 'Salas', icon: <MapPin className="mr-3 h-5 w-5" /> },
        { id: 'workouts', label: 'Treinos', icon: <Dumbbell className="mr-3 h-5 w-5" /> },
        { id: 'attendance', label: 'Frequência', icon: <Activity className="mr-3 h-5 w-5" /> },
        { id: 'payments', label: 'Pagamentos', icon: <CreditCard className="mr-3 h-5 w-5" /> },
        { id: 'conversations', label: 'Conversas', icon: <MessageSquare className="mr-3 h-5 w-5" /> },
        { id: 'reports', label: 'Relatórios', icon: <BarChart3 className="mr-3 h-5 w-5" /> },
        { id: 'logs', label: 'Logs do Sistema', icon: <History className="mr-3 h-5 w-5" /> },
    ];
    
    const userRole = 'OWNER';
    const isReadOnly = userRole !== 'OWNER' && userRole !== 'ADMIN';

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileTab setActiveTab={setActiveTab} />;
            case 'notifications': return <NotificationsTab />;
            case 'general': return <GeneralTab />;
            case 'users': return <UsersAndProfilesTab users={users} setUsers={setUsers} roles={roles} setRoles={setRoles} />;
            case 'instructors': return <InstructorsTab users={users} />;
            case 'units': return <UnitsTab />;
            case 'rooms': return <RoomsTab />;
            case 'plans': return <PlansTab isReadOnly={isReadOnly} users={users} units={units} />;
            case 'classes': return <ClassesTab isReadOnly={isReadOnly}/>;
            case 'workouts': return <WorkoutsTab isReadOnly={isReadOnly} />;
            case 'attendance': return <AttendanceTab isReadOnly={isReadOnly} />;
            case 'payments': return <PaymentsTab isReadOnly={isReadOnly} />;
            case 'conversations': return <ConversationsTab isReadOnly={isReadOnly} />;
            case 'reports': return <ReportsTab isReadOnly={isReadOnly} />;
            case 'logs': return <LogsTab users={users} units={units} />;
            default: return <ProfileTab setActiveTab={setActiveTab} />;
        }
    };
    
    const PlaceholderTab = ({ title, description }: { title: string, description: string }) => (
        <>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Em breve...</p>
            </CardContent>
        </>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground">Gerencie as preferências da sua conta e do aplicativo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
                <nav className="md:col-span-1 lg:col-span-1 flex flex-col gap-2">
                    <div>
                        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Minha Conta</h3>
                        {userNavItems.map(item => (
                            <Button 
                                key={item.id}
                                variant="ghost" 
                                className={cn("justify-start w-full pl-3 pr-4 py-2 h-auto", activeTab === item.id ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-accent")}
                                onClick={() => setActiveTab(item.id)}
                            >
                                {item.icon} {item.label}
                            </Button>
                        ))}
                    </div>
                    <Separator className="my-2" />
                    <div>
                        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configurações do Negócio</h3>
                        {businessNavItems.map(item => (
                             <Button 
                                key={item.id}
                                variant="ghost" 
                                className={cn("justify-start w-full pl-3 pr-4 py-2 h-auto", activeTab === item.id ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-accent")}
                                onClick={() => setActiveTab(item.id)}
                            >
                                {item.icon} {item.label}
                            </Button>
                        ))}
                    </div>
                     <Separator className="my-2"/>
                     <Button variant="ghost" className="justify-start pl-3 pr-4 py-2 h-auto text-destructive hover:text-destructive hover:bg-destructive/5">
                        <LogOut className="mr-3 h-5 w-5" /> Sair
                    </Button>
                </nav>

                <main className="md:col-span-3 lg:col-span-4">
                    <Card className="shadow-soft rounded-2xl min-h-[600px] flex flex-col">
                        {renderContent()}
                    </Card>
                </main>
            </div>
        </div>
    );
}

// ... more component definitions ...


    