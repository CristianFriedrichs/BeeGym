'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    User, Bell, History, Search, Calendar as CalendarIcon, Bot, Edit, Plus, Trash2, Move, ShieldCheck, Settings, Users, Briefcase, MapPin, ClipboardList, Dumbbell, Activity, CreditCard, MessageSquare, BarChart3, Globe, Link as LinkIcon, Building, MoreHorizontal, Check, Mail as MailIcon, Filter, Bookmark, Star
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

    return (
        <div className="flex flex-col h-full">
            <div className="relative">
                <div className="h-32 md:h-40 bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-2xl" />
                <div className="absolute top-0 left-0 p-6 w-full">
                    <Avatar className="h-28 w-28 border-4 border-card shadow-lg -mt-14">
                        <AvatarImage src="https://i.pravatar.cc/150?img=32" alt="Avatar" />
                        <AvatarFallback>KW</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            <div className="p-6 pt-16 space-y-8 flex-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Perfil Público</CardTitle>
                        <CardDescription>Esta informação será exibida para seus alunos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="flex items-start justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base font-medium">Mostrar perfil público?</Label>
                                <p className="text-sm text-muted-foreground">Se desativado, seu perfil não aparecerá para os alunos.</p>
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
                        </div>
                    </CardContent>
                </Card>
            </div>
            <CardFooter className="justify-end gap-2 border-t p-6">
                <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar Alterações</Button>
            </CardFooter>
        </div>
    );
}

function NotificationsTab() {
    const { toast } = useToast();
    const [prefs, setPrefs] = useState({
        master_enabled: true,
        channel_in_app: true,
        channel_push: true,
        channel_email: false,
    });

    const handlePrefChange = (key: keyof typeof prefs, value: any) => {
        setPrefs(prev => ({ ...prev, [key]: value }));
        toast({ title: "Preferência atualizada" });
    };

    return (
        <div className="p-6 space-y-6">
            <CardHeader className="px-0">
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Gerencie como você recebe alertas do sistema.</CardDescription>
            </CardHeader>
            <Accordion type="multiple" defaultValue={['general']} className="w-full space-y-4">
                <AccordionItem value="general" className="border rounded-xl px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline">Preferências Gerais</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label>Ativar todas as notificações</Label>
                            <Switch checked={prefs.master_enabled} onCheckedChange={(v) => handlePrefChange('master_enabled', v)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2"><Switch checked={prefs.channel_in_app} onCheckedChange={v => handlePrefChange('channel_in_app', v)} /><Label>In-App</Label></div>
                            <div className="flex items-center gap-2"><Switch checked={prefs.channel_push} onCheckedChange={v => handlePrefChange('channel_push', v)} /><Label>Push</Label></div>
                            <div className="flex items-center gap-2"><Switch checked={prefs.channel_email} onCheckedChange={v => handlePrefChange('channel_email', v)} /><Label>E-mail</Label></div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}

function GeneralTab() {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        businessName: 'BeeGym Pro',
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
    });

    const handleSave = () => {
        toast({ title: "Configurações salvas!" });
    };

    return (
        <div className="p-6 space-y-6">
            <CardHeader className="px-0">
                <CardTitle>Geral</CardTitle>
                <CardDescription>Configurações básicas do seu negócio.</CardDescription>
            </CardHeader>
            <div className="grid gap-4">
                <div className="space-y-2">
                    <Label>Nome do Negócio</Label>
                    <Input value={settings.businessName} onChange={e => setSettings(s => ({...s, businessName: e.target.value}))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Moeda</Label>
                        <Select value={settings.currency} onValueChange={v => setSettings(s => ({...s, currency: v}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="BRL">Real (R$)</SelectItem><SelectItem value="USD">Dólar ($)</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Fuso Horário</Label>
                        <Select value={settings.timezone} onValueChange={v => setSettings(s => ({...s, timezone: v}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="America/Sao_Paulo">São Paulo</SelectItem></SelectContent>
                        </Select>
                    </div>
                </div>
                <Button onClick={handleSave} className="w-fit ml-auto">Salvar</Button>
            </div>
        </div>
    );
}

function LogsTab({ users, units }: { users: any[]; units: any[] }) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [filters, setFilters] = useState({
        searchTerm: '',
        dateRange: { from: undefined, to: undefined } as DateRange,
        unitFilter: 'all',
    });

    useEffect(() => {
        const storedLogs = localStorage.getItem('system_logs');
        setLogs(storedLogs ? JSON.parse(storedLogs) : initialLogs);
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const matchesSearch = log.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) || log.user.toLowerCase().includes(filters.searchTerm.toLowerCase());
            const matchesUnit = filters.unitFilter === 'all' || log.unitId === filters.unitFilter;
            return matchesSearch && matchesUnit;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [logs, filters]);

    return (
        <Dialog onOpenChange={(open) => !open && setSelectedLog(null)}>
            <CardHeader>
                <CardTitle>Logs do Sistema</CardTitle>
                <CardDescription>Audit trail de todas as ações.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar logs..." className="pl-10" value={filters.searchTerm} onChange={e => setFilters(f => ({...f, searchTerm: e.target.value}))} />
                    </div>
                    <Select value={filters.unitFilter} onValueChange={v => setFilters(f => ({...f, unitFilter: v}))}>
                        <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="all">Todas Unidades</SelectItem>{units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <Table>
                    <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Ação</TableHead><TableHead>Usuário</TableHead><TableHead className="text-right">Entidade</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {filteredLogs.map(log => (
                            <DialogTrigger asChild key={log.id}>
                                <TableRow onClick={() => setSelectedLog(log)} className="cursor-pointer">
                                    <TableCell className="text-xs font-mono">{format(parseISO(log.timestamp), "dd/MM HH:mm")}</TableCell>
                                    <TableCell className="font-medium text-xs">{log.description}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{log.user}</TableCell>
                                    <TableCell className="text-right"><Badge variant="outline">{log.entity}</Badge></TableCell>
                                </TableRow>
                            </DialogTrigger>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            {selectedLog && (
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Detalhes do Log</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="font-bold">Usuário</p><p>{selectedLog.user}</p></div>
                            <div><p className="font-bold">Data/Hora</p><p>{format(parseISO(selectedLog.timestamp), "dd/MM/yyyy HH:mm:ss")}</p></div>
                        </div>
                        <div><p className="font-bold">Descrição</p><p>{selectedLog.description}</p></div>
                        <div className="p-4 bg-muted rounded-lg font-mono text-xs overflow-auto max-h-40">
                            {JSON.stringify(selectedLog.details, null, 2)}
                        </div>
                    </div>
                </DialogContent>
            )}
        </Dialog>
    );
}

function UsersAndProfilesTab({ users, setUsers, roles, setRoles } : { users: any[], setUsers: (u: any[]) => void, roles: any[], setRoles: (r: any[]) => void }) {
    return (
        <div className="p-6 space-y-6">
            <CardHeader className="px-0">
                <CardTitle>Usuários e Perfis</CardTitle>
                <CardDescription>Gerencie sua equipe.</CardDescription>
            </CardHeader>
            <Table>
                <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Papel</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                    {users.map(u => (
                        <TableRow key={u.id}>
                            <TableCell className="font-bold">{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell><Badge>{roles.find(r => r.id === u.roleId)?.name}</Badge></TableCell>
                            <TableCell><Badge variant="outline">{u.status}</Badge></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function InstructorsTab({ users }: { users: any[] }) {
    return (
        <div className="p-6">
            <CardHeader className="px-0">
                <CardTitle>Instrutores</CardTitle>
                <CardDescription>Gerenciamento de recursos técnicos.</CardDescription>
            </CardHeader>
            <p className="text-sm text-muted-foreground">Listagem de instrutores...</p>
        </div>
    );
}

function UnitsTab() {
    return (
        <div className="p-6">
            <CardHeader className="px-0">
                <CardTitle>Unidades</CardTitle>
                <CardDescription>Configuração de filiais.</CardDescription>
            </CardHeader>
            <p className="text-sm text-muted-foreground">Gerencie suas unidades...</p>
        </div>
    );
}

function RoomsTab() {
    return (
        <div className="p-6">
            <CardHeader className="px-0">
                <CardTitle>Salas</CardTitle>
                <CardDescription>Espaços físicos por unidade.</CardDescription>
            </CardHeader>
            <p className="text-sm text-muted-foreground">Gerencie as salas da unidade ativa...</p>
        </div>
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
            name: plan?.name || '',
            code: plan?.code || '',
            type: plan?.type || 'assinatura',
            price: plan?.price || 0,
            billingCycle: plan?.billingCycle || 'monthly',
            validityDays: plan?.validityDays || null,
            sessionsIncluded: plan?.sessionsIncluded || null,
            unitScope: plan?.unitScope || (plan?.units?.length === units.length ? 'global' : 'specific'),
            units: plan?.units || [],
            status: plan?.status || 'active',
            color: plan?.color || '#3B82F6',
            icon: plan?.icon || 'Bookmark',
        }
    });

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
            <DialogHeader><DialogTitle>{plan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle></DialogHeader>
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
                        </TabsContent>
                        <TabsContent value="rules" className="py-4 space-y-4">
                            <FormField control={form.control} name="sessionsIncluded" render={({ field }) => <FormItem><FormLabel>Nº de Sessões</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} /></FormControl><FormMessage/></FormItem>} />
                            <FormField control={form.control} name="validityDays" render={({ field }) => <FormItem><FormLabel>Validade (dias)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} /></FormControl><FormMessage/></FormItem>} />
                        </TabsContent>
                        <TabsContent value="billing" className="py-4 space-y-4">
                            <FormField control={form.control} name="price" render={({ field }) => <FormItem><FormLabel>Preço (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage/></FormItem>} />
                            <FormField control={form.control} name="billingCycle" render={({ field }) => <FormItem><FormLabel>Ciclo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="none">Nenhum</SelectItem><SelectItem value="monthly">Mensal</SelectItem><SelectItem value="annual">Anual</SelectItem></SelectContent></Select><FormMessage/></FormItem>} />
                        </TabsContent>
                        <TabsContent value="access" className="py-4 space-y-4">
                            <FormField control={form.control} name="unitScope" render={({ field }) => <FormItem><FormLabel>Aplicável em</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="global" id="global" /><Label htmlFor="global">Global</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="specific" id="specific" /><Label htmlFor="specific">Específico</Label></div></RadioGroup></FormControl></FormItem>} />
                            {unitScope === 'specific' && (
                                <FormField control={form.control} name="units" render={({ field }) => (
                                    <FormItem><FormLabel>Unidades</FormLabel>
                                        <div className="p-2 border rounded-lg max-h-40 overflow-y-auto space-y-2">
                                            {units.map(u => (
                                                <div key={u.id} className="flex items-center space-x-2">
                                                    <Checkbox id={`u-${u.id}`} checked={field.value.includes(u.id)} onCheckedChange={(checked) => {
                                                        const newVal = checked ? [...field.value, u.id] : field.value.filter((id: string) => id !== u.id);
                                                        field.onChange(newVal);
                                                    }} />
                                                    <Label htmlFor={`u-${u.id}`}>{u.name}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </FormItem>
                                )} />
                            )}
                        </TabsContent>
                    </Tabs>
                    <DialogFooter><Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
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
        const stored = localStorage.getItem('system_plans');
        setPlans(stored ? JSON.parse(stored) : initialSystemPlans);
    }, []);

    const handleSavePlan = (data: any) => {
        const updated = editingPlan ? plans.map(p => p.id === editingPlan.id ? {...data, id: p.id} : p) : [{...data, id: `plan-${Date.now()}`}, ...plans];
        setPlans(updated);
        localStorage.setItem('system_plans', JSON.stringify(updated));
        setPlanModalOpen(false);
        setEditingPlan(null);
        toast({ title: "Plano salvo!" });
    };

    return (
        <div className="p-6 space-y-6">
            <CardHeader className="px-0 flex flex-row items-center justify-between">
                <div><CardTitle>Planos</CardTitle><CardDescription>Gerencie assinaturas e pacotes.</CardDescription></div>
                <Button onClick={() => { setEditingPlan(null); setPlanModalOpen(true); }} disabled={isReadOnly}><Plus className="h-4 w-4 mr-2" /> Novo Plano</Button>
            </CardHeader>
            <Table>
                <TableHeader><TableRow><TableHead>Plano</TableHead><TableHead>Preço</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                    {plans.map(p => (
                        <TableRow key={p.id}>
                            <TableCell className="font-bold">{p.name}</TableCell>
                            <TableCell>R$ {p.price.toFixed(2)}</TableCell>
                            <TableCell><Badge variant={p.status === 'active' ? 'default' : 'outline'}>{p.status}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => { setEditingPlan(p); setPlanModalOpen(true); }}><Edit className="h-4 w-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Dialog open={isPlanModalOpen} onOpenChange={setPlanModalOpen}>
                <PlanFormDialog plan={editingPlan} units={units} onSubmit={handleSavePlan} onClose={() => setPlanModalOpen(false)} />
            </Dialog>
        </div>
    );
}

function ClassesTab({ isReadOnly }: { isReadOnly: boolean }) {
    return <div className="p-6"><CardTitle>Aulas</CardTitle><p className="text-sm text-muted-foreground mt-2">Regras de aulas coletivas por unidade...</p></div>;
}

function WorkoutsTab({ isReadOnly }: { isReadOnly: boolean }) {
    return <div className="p-6"><CardTitle>Treinos</CardTitle><p className="text-sm text-muted-foreground mt-2">Regras de treinos individuais/grupo...</p></div>;
}

function AttendanceTab({ isReadOnly }: { isReadOnly: boolean }) {
    return <div className="p-6"><CardTitle>Frequência</CardTitle><p className="text-sm text-muted-foreground mt-2">Regras de presença e faltas...</p></div>;
}

function PaymentsTab({ isReadOnly }: { isReadOnly: boolean }) {
    return <div className="p-6"><CardTitle>Pagamentos</CardTitle><p className="text-sm text-muted-foreground mt-2">Regras de faturamento e cobrança...</p></div>;
}

function ConversationsTab({ isReadOnly }: { isReadOnly: boolean }) {
    return <div className="p-6"><CardTitle>Conversas</CardTitle><p className="text-sm text-muted-foreground mt-2">Regras de comunicação interna...</p></div>;
}

function ReportsTab({ isReadOnly }: { isReadOnly: boolean }) {
    return <div className="p-6"><CardTitle>Relatórios</CardTitle><p className="text-sm text-muted-foreground mt-2">Configuração de indicadores e exportação...</p></div>;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<string>('profile');
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    
    useEffect(() => {
        setUsers(initialSystemUsers);
        setRoles(initialRoles);
        const storedUnits = localStorage.getItem('units_data');
        setUnits(storedUnits ? JSON.parse(storedUnits) : initialUnits);
    }, []);

    const userNavItems = [
        { id: 'profile', label: 'Perfil', icon: <User className="mr-3 h-5 w-5" /> },
        { id: 'notifications', label: 'Notificações', icon: <Bell className="mr-3 h-5 w-5" /> },
    ];

    const businessNavItems = [
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
    
    const isReadOnly = false; // Mock

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
                </nav>

                <main className="md:col-span-3 lg:col-span-4">
                    <Card className="shadow-soft rounded-2xl min-h-[600px] flex flex-col overflow-hidden">
                        {renderContent()}
                    </Card>
                </main>
            </div>
        </div>
    );
}
