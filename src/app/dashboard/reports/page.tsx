'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Save, Settings2, FileDown, FileText, Filter, AreaChart, PieChart, LineChart as LineChartIcon, Users, Activity, GanttChart, List, Bookmark, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, Pie, Cell, LineChart, CartesianGrid } from 'recharts';
import { initialClients as students } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { initialInvoices } from '@/app/dashboard/payments/page';
import { RecurringClass } from '@/lib/class-definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { plans } from '@/lib/plans';


const reportTypes = [
    { value: 'financeiro', label: 'Financeiro', icon: BarChart3 },
    { value: 'aulas', label: 'Aulas', icon: GanttChart },
    { value: 'frequencia', label: 'Frequência', icon: Activity },
    { value: 'alunos', label: 'Alunos', icon: Users },
];

const PIE_CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
        years.push(currentYear - i);
    }
    return years;
};

const getMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: format(new Date(2000, i), 'MMMM', { locale: ptBR })
    }));
};

const uniqueInstructors = Array.from(new Set(students.map(s => 'Kristin Watson'))); // Mock instructor

export default function ReportsPage() {
    const [reportType, setReportType] = useState('financeiro');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [comparePeriod, setComparePeriod] = useState(false);
    const [comparisonMode, setComparisonMode] = useState('previous_period');
    const [filters, setFilters] = useState<any>({});
    const [viewModes, setViewModes] = useState(['chart', 'table']);
    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const { toast } = useToast();
    const [allClasses, setAllClasses] = useState<{ name: string }[]>([]);

    useEffect(() => {
        try {
            const storedTemplates = localStorage.getItem('report_templates');
            if (storedTemplates) {
                setSavedTemplates(JSON.parse(storedTemplates));
            }
        } catch (error) {
            console.error("Failed to load report templates:", error);
        }

        try {
            const recurring: RecurringClass[] = JSON.parse(localStorage.getItem('recurring_classes') || '[]');
            const single: any[] = JSON.parse(localStorage.getItem('scheduled_classes') || '[]');
            const classNames = [...new Set([...recurring.map(c => c.name), ...single.map(c => c.type)])];
            setAllClasses(classNames.map(name => ({ name })));
        } catch (e) {
            console.error('Failed to load classes for filter');
        }

    }, []);

    useEffect(() => {
        setFilters({});
    }, [reportType]);


    const generateFinancialData = (range: DateRange | undefined, currentFilters: any) => {
        const invoices = JSON.parse(localStorage.getItem('invoices_data') || '[]');
        const filtered = invoices.filter((inv: any) => {
            const invDate = parseISO(inv.dueDate);
            const inRange = range?.from && range?.to ? isWithinInterval(invDate, { start: range.from, end: range.to }) : true;
            const matchesStatus = !currentFilters.status || currentFilters.status === 'all' || inv.status === currentFilters.status;
            const matchesPaymentMethod = !currentFilters.paymentMethod || currentFilters.paymentMethod === 'all' || inv.paymentMethod === currentFilters.paymentMethod;
            return inRange && matchesStatus && matchesPaymentMethod;
        });

        const revenue = filtered.filter((i: any) => i.status === 'Pago').reduce((sum: number, i: any) => sum + i.amount, 0);
        const pending = filtered.filter((i: any) => i.status === 'Pendente').reduce((sum: number, i: any) => sum + i.amount, 0);
        const overdue = filtered.filter((i: any) => i.status === 'Atrasado').reduce((sum: number, i: any) => sum + i.amount, 0);

        const monthlyData: { [key: string]: any } = {};
        filtered.forEach((inv: any) => {
            const month = format(parseISO(inv.dueDate), 'MMM/yy', { locale: ptBR });
            if (!monthlyData[month]) monthlyData[month] = { name: month, Pago: 0, Pendente: 0, Atrasado: 0 };
            if (inv.status === 'Pago') monthlyData[month].Pago += inv.amount;
            else if (inv.status === 'Pendente') monthlyData[month].Pendente += inv.amount;
            else if (inv.status === 'Atrasado') monthlyData[month].Atrasado += inv.amount;
        });

        return {
            kpis: [
                { title: 'Receita no Período', value: `R$ ${revenue.toFixed(2)}` },
                { title: 'Pendente', value: `R$ ${pending.toFixed(2)}` },
                { title: 'Atrasado', value: `R$ ${overdue.toFixed(2)}` },
                { title: 'Total de Faturas', value: filtered.length },
            ],
            chartData: Object.values(monthlyData),
            tableData: filtered,
        };
    };

    const generateClassesData = (range: DateRange | undefined, currentFilters: any) => {
        const recurring: RecurringClass[] = JSON.parse(localStorage.getItem('recurring_classes') || '[]');
        const single: any[] = JSON.parse(localStorage.getItem('scheduled_classes') || '[]');

        const allInstances = [...recurring.map(c => ({ ...c, type: c.name, date: c.startDate })), ...single].filter(c => {
            const classDate = c.date ? (typeof c.date === 'string' ? parseISO(c.date) : c.date) : new Date();
            const inRange = range?.from && range?.to ? isWithinInterval(classDate, { start: range.from, end: range.to }) : true;
            const matchesInstructor = !currentFilters.instructor || currentFilters.instructor === 'all' || (c as any).instructor === currentFilters.instructor;
            const matchesClassType = !currentFilters.classType || currentFilters.classType === 'all' || (c.startDate ? 'coletiva' : 'individual') === currentFilters.classType;
            return inRange && matchesInstructor && matchesClassType;
        });

        const classTypes = [...new Set(allInstances.map(c => c.type))];
        const chartData = classTypes.map(type => ({
            name: type,
            value: allInstances.filter(c => c.type === type).length
        }));

        return {
            kpis: [
                { title: 'Aulas Criadas', value: allInstances.length },
                { title: 'Instrutores Ativos', value: [...new Set(allInstances.map(c => (c as any).instructor))].length },
                { title: 'Aulas Recorrentes', value: allInstances.filter(c => c.startDate).length },
                { title: 'Treinos Individuais', value: allInstances.filter(c => !c.startDate).length },
            ],
            chartData: chartData,
            tableData: allInstances.map(c => ({ name: c.name, instructor: (c as any).instructor, location: c.location, type: c.startDate ? 'Recorrente' : 'Individual' })),
        }
    }

    const generateAttendanceData = (range: DateRange | undefined, currentFilters: any) => {
        const attendance = [
            { date: '2024-07-25', student: 'Ana Clara', class: 'Yoga', instructor: 'Kristin Watson', status: 'Presente' },
            { date: '2024-07-25', student: 'Milos Vasiljevic', class: 'Yoga', instructor: 'Kristin Watson', status: 'Presente' },
            { date: '2024-07-24', student: 'Ana Clara', class: 'HIIT', instructor: 'Sarah Jenkins', status: 'Falta' },
        ];

        const filtered = attendance.filter(att => {
            const attDate = parseISO(att.date);
            const inRange = range?.from && range?.to ? isWithinInterval(attDate, { start: range.from, end: range.to }) : true;
            const matchesClass = !currentFilters.class || currentFilters.class === 'all' || att.class === currentFilters.class;
            const matchesInstructor = !currentFilters.instructor || currentFilters.instructor === 'all' || att.instructor === currentFilters.instructor;
            const studentId = students.find(s => s.name === att.student)?.id.toString();
            const matchesStudent = !currentFilters.student || currentFilters.student === 'all' || studentId === currentFilters.student;
            const matchesStatus = !currentFilters.attendanceStatus || currentFilters.attendanceStatus === 'all' || att.status.toLowerCase() === currentFilters.attendanceStatus;

            return inRange && matchesClass && matchesInstructor && matchesStudent && matchesStatus;
        });

        const presenceCount = filtered.filter(a => a.status === 'Presente').length;
        const absenceCount = filtered.filter(a => a.status === 'Falta').length;
        const total = presenceCount + absenceCount;
        const presenceRate = total > 0 ? (presenceCount / total) * 100 : 0;

        return {
            kpis: [
                { title: 'Total de Presenças', value: presenceCount },
                { title: 'Total de Faltas', value: absenceCount },
                { title: 'Taxa de Presença Média', value: `${presenceRate.toFixed(1)}%` },
                { title: 'Aulas no Período', value: [...new Set(filtered.map(a => a.class))].length },
            ],
            chartData: [
                { name: 'Jul', Taxa: 85 },
                { name: 'Ago', Taxa: 92 },
            ],
            tableData: filtered,
        };
    };

    const generateStudentsData = (range: DateRange | undefined, currentFilters: any) => {
        const filtered = students.filter(s => {
            const matchesStatus = !currentFilters.studentStatus || currentFilters.studentStatus === 'all' || s.status === currentFilters.studentStatus;
            const studentPlan = (s as any).plan?.toLowerCase().replace(' plan', '') || 'basic';
            const matchesPlan = !currentFilters.currentPlan || currentFilters.currentPlan === 'all' || plans.find(p => p.name === (s as any).plan)?.id === currentFilters.currentPlan;
            return matchesStatus && matchesPlan;
        });

        const activeStudents = filtered.filter(s => s.status === 'Ativo').length;
        const inactiveStudents = filtered.filter(s => s.status === 'Inativo').length;
        const pendingStudents = filtered.filter(s => s.status === 'Pendente' || s.status === 'Inadimplente').length;

        return {
            kpis: [
                { title: 'Total de Alunos', value: filtered.length },
                { title: 'Alunos Ativos', value: activeStudents },
                { title: 'Alunos Inativos/Pendentes', value: inactiveStudents + pendingStudents },
                { title: 'Taxa de Retenção (mock)', value: '95%' },
            ],
            chartData: [
                { name: 'Ativos', value: activeStudents },
                { name: 'Inativos', value: inactiveStudents },
                { name: 'Pendentes', value: pendingStudents },
            ],
            tableData: filtered.map(s => ({ Nome: s.name, Email: s.email, Plano: (s as any).plan, Status: s.status })),
        };
    };


    const handleGenerateReport = () => {
        setIsLoading(true);
        setReportData(null);
        setShowReport(true);
        setTimeout(() => {
            const from = startOfMonth(new Date(selectedYear, selectedMonth));
            const to = endOfMonth(from);
            const dateRange: DateRange = { from, to };

            let data;
            switch (reportType) {
                case 'financeiro': data = generateFinancialData(dateRange, filters); break;
                case 'aulas': data = generateClassesData(dateRange, filters); break;
                case 'frequencia': data = generateAttendanceData(dateRange, filters); break;
                case 'alunos': data = generateStudentsData(dateRange, filters); break;
                default: data = { kpis: [], chartData: [], tableData: [] };
            }
            setReportData(data);
            setIsLoading(false);
        }, 1000);
    };

    const handleSaveTemplate = () => {
        if (!newTemplateName) {
            toast({ title: "Nome obrigatório", description: "Por favor, dê um nome ao seu modelo.", variant: "destructive" });
            return;
        }
        const newTemplate = { id: Date.now(), name: newTemplateName, reportType, filters, selectedMonth, selectedYear, viewModes };
        const updatedTemplates = [...savedTemplates, newTemplate];
        setSavedTemplates(updatedTemplates);
        localStorage.setItem('report_templates', JSON.stringify(updatedTemplates));
        toast({ title: "Modelo salvo com sucesso!" });
        setNewTemplateName('');
        setIsSaveModalOpen(false);
    };

    const handleLoadTemplate = (template: any) => {
        setReportType(template.reportType);
        setFilters(template.filters);
        setSelectedMonth(template.selectedMonth);
        setSelectedYear(template.selectedYear);
        setViewModes(template.viewModes);
        toast({ title: `Modelo "${template.name}" carregado.`, description: "Clique em 'Gerar Relatório' para ver os dados." });
    };

    const handleFilterChange = (filterName: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [filterName]: value }));
    };

    const ReportFilters = () => {
        switch (reportType) {
            case 'financeiro':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Status do Pagamento</Label>
                            <Select value={filters.status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
                                <SelectTrigger><SelectValue placeholder="Status do Pagamento" /></SelectTrigger>
                                <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="Pago">Pago</SelectItem><SelectItem value="Pendente">Pendente</SelectItem><SelectItem value="Atrasado">Atrasado</SelectItem><SelectItem value="Cancelado">Cancelado</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Forma de Pagamento</Label>
                            <Select value={filters.paymentMethod || 'all'} onValueChange={(v) => handleFilterChange('paymentMethod', v)}>
                                <SelectTrigger><SelectValue placeholder="Forma de Pagamento" /></SelectTrigger>
                                <SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="Pix">Pix</SelectItem><SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem><SelectItem value="Boleto">Boleto</SelectItem><SelectItem value="Dinheiro">Dinheiro</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            case 'aulas':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Instrutor(a)</Label>
                            <Select value={filters.instructor || 'all'} onValueChange={(v) => handleFilterChange('instructor', v)}>
                                <SelectTrigger><SelectValue placeholder="Todos os Instrutores" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {uniqueInstructors.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo de Aula</Label>
                            <Select value={filters.classType || 'all'} onValueChange={(v) => handleFilterChange('classType', v)}>
                                <SelectTrigger><SelectValue placeholder="Todos os Tipos" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="individual">Individual</SelectItem>
                                    <SelectItem value="coletiva">Coletiva</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            case 'frequencia':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Aula Específica</Label>
                            <Select value={filters.class || 'all'} onValueChange={(v) => handleFilterChange('class', v)}>
                                <SelectTrigger><SelectValue placeholder="Todas as Aulas" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Aulas</SelectItem>
                                    {allClasses.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Instrutor(a)</Label>
                            <Select value={filters.instructor || 'all'} onValueChange={(v) => handleFilterChange('instructor', v)}>
                                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {uniqueInstructors.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Aluno</Label>
                            <Select value={filters.student || 'all'} onValueChange={(v) => handleFilterChange('student', v)}>
                                <SelectTrigger><SelectValue placeholder="Todos os Alunos" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Alunos</SelectItem>
                                    {students.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status de Presença</Label>
                            <Select value={filters.attendanceStatus || 'all'} onValueChange={(v) => handleFilterChange('attendanceStatus', v)}>
                                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="presente">Presente</SelectItem>
                                    <SelectItem value="falta">Falta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Frequência Mínima (%)</Label>
                            <Input type="number" placeholder="Ex: 80" value={filters.minFrequency || ''} onChange={(e) => handleFilterChange('minFrequency', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Mínimo de Faltas</Label>
                            <Input type="number" placeholder="Ex: 3" value={filters.minAbsences || ''} onChange={(e) => handleFilterChange('minAbsences', e.target.value)} />
                        </div>
                    </div>
                );
            case 'alunos':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Status do Aluno</Label>
                            <Select value={filters.studentStatus || 'all'} onValueChange={(v) => handleFilterChange('studentStatus', v)}>
                                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="Ativo">Ativo</SelectItem>
                                    <SelectItem value="Inativo">Inativo</SelectItem>
                                    <SelectItem value="Inadimplente">Inadimplente</SelectItem>
                                    <SelectItem value="Pendente">Pendente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Plano Atual</Label>
                            <Select value={filters.currentPlan || 'all'} onValueChange={(v) => handleFilterChange('currentPlan', v)}>
                                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tempo como Aluno</Label>
                            <Select value={filters.timeAsStudent || 'all'} onValueChange={(v) => handleFilterChange('timeAsStudent', v)}>
                                <SelectTrigger><SelectValue placeholder="Qualquer" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Qualquer</SelectItem>
                                    <SelectItem value="lt3m">Menos de 3 meses</SelectItem>
                                    <SelectItem value="3to6m">3-6 meses</SelectItem>
                                    <SelectItem value="gt1y">Mais de 1 ano</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="churn-risk" checked={filters.churnRisk || false} onCheckedChange={(v) => handleFilterChange('churnRisk', Boolean(v))} />
                                <Label htmlFor="churn-risk">Mostrar apenas alunos com risco de churn</Label>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <p className="text-sm text-muted-foreground">Filtros para "{reportType}" aparecerão aqui.</p>
        }
    };

    const renderTable = () => {
        if (!reportData?.tableData || reportData.tableData.length === 0) return <p className="text-center text-muted-foreground">Nenhum dado para exibir.</p>;

        const headers = Object.keys(reportData.tableData[0]);

        return (
            <Table>
                <TableHeader><TableRow>{headers.map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
                <TableBody>
                    {reportData.tableData.map((row: any, rowIndex: number) => (
                        <TableRow key={rowIndex}>
                            {headers.map(header => <TableCell key={`${rowIndex}-${header}`}>{typeof row[header] === 'object' ? JSON.stringify(row[header]) : row[header]}</TableCell>)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    const ReportVisuals = () => {
        if (isLoading) return (
            <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
                </div>
                <Skeleton className="h-96" />
                <Skeleton className="h-48" />
            </div>
        );
        if (!reportData) return null;

        let ChartComponent;
        switch (reportType) {
            case 'financeiro':
                ChartComponent = (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v / 1000}k`} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                            <Bar dataKey="Atrasado" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="Pendente" stackId="a" fill="#f59e0b" />
                            <Bar dataKey="Pago" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
                break;
            case 'aulas':
                ChartComponent = (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={reportData.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {reportData.chartData.map((_entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                        </PieChart>
                    </ResponsiveContainer>
                );
                break;
            case 'frequencia':
                ChartComponent = (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={reportData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                            <Line type="monotone" dataKey="Taxa" name="Taxa de Presença" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                );
                break;
            case 'alunos':
                ChartComponent = (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                            <Bar dataKey="value" name="Alunos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
                break;
            default: ChartComponent = <p>Gráfico não disponível para este tipo de relatório.</p>;
        }

        return (
            <div className="space-y-8">
                {reportData.kpis && reportData.kpis.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {reportData.kpis.map((kpi: any, index: number) => (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                </CardHeader>
                                <CardContent><div className="text-2xl font-bold">{kpi.value}</div></CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                {viewModes.includes('chart') && <div>{ChartComponent}</div>}
                {viewModes.includes('chart') && viewModes.includes('table') && <Separator className="my-8" />}
                {viewModes.includes('table') && (
                    <div>
                        <CardTitle className="text-lg mb-4">Dados Detalhados</CardTitle>
                        {renderTable()}
                    </div>
                )}
            </div>
        );
    }

    const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'all').length;


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
                    <p className="text-muted-foreground">Gere, visualize e exporte insights do seu negócio.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configuração do Relatório</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo de Relatório</Label>
                            <Select value={reportType} onValueChange={setReportType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{reportTypes.map(rt => <SelectItem key={rt.value} value={rt.value}><div className="flex items-center gap-2"><rt.icon className="h-4 w-4" />{rt.label}</div></SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Mês</Label>
                            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(Number(v))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{getMonthOptions().map(opt => <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Ano</Label>
                            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{getYearOptions().map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="compare-period" checked={comparePeriod} onCheckedChange={(checked) => setComparePeriod(Boolean(checked))} />
                            <Label htmlFor="compare-period" className="font-normal">
                                Comparar com período anterior
                            </Label>
                        </div>
                        {comparePeriod && (
                            <div className="pl-6 pt-2">
                                <RadioGroup value={comparisonMode} onValueChange={setComparisonMode} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="previous_period" id="prev_period" />
                                        <Label htmlFor="prev_period" className="font-normal text-sm">Mês anterior</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="same_period_last_year" id="prev_year" />
                                        <Label htmlFor="prev_year" className="font-normal text-sm">Mesmo mês do ano anterior</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        )}
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="advanced-filters">
                            <AccordionTrigger className="text-base font-semibold hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Filtros Avançados
                                    {activeFiltersCount > 0 && <Badge className="ml-2">{activeFiltersCount}</Badge>}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                                <ReportFilters />
                                {activeFiltersCount > 0 && (
                                    <div className="mt-4 flex justify-end">
                                        <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Limpar Filtros
                                        </Button>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <Separator />
                    <div className="space-y-2">
                        <Label>Formato de Visualização</Label>
                        <ToggleGroup type="multiple" value={viewModes} onValueChange={setViewModes} className="justify-start">
                            <ToggleGroupItem value="chart" aria-label="Ver gráfico">
                                <AreaChart className="h-4 w-4" />
                                <span className="ml-2">Gráfico</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem value="table" aria-label="Ver lista">
                                <GanttChart className="h-4 w-4" />
                                <span className="ml-2">Lista</span>
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </CardContent>
                <CardFooter className="justify-between bg-muted/50 py-3 px-6 border-t">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline"><Bookmark className="mr-2 h-4 w-4" /> Carregar Modelo</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {savedTemplates.length > 0 ? savedTemplates.map(template => (
                                <DropdownMenuItem key={template.id} onSelect={() => handleLoadTemplate(template)}>
                                    <p className="font-semibold">{template.name}</p>
                                </DropdownMenuItem>
                            )) : <DropdownMenuItem disabled>Nenhum modelo salvo.</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={handleGenerateReport} disabled={isLoading}>
                        {isLoading ? <><Settings2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...</> : <><Settings2 className="mr-2 h-4 w-4" /> Gerar Relatório</>}
                    </Button>
                </CardFooter>
            </Card>


            {showReport && (
                <Card className="h-full min-h-[500px]">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Visualização do Relatório</CardTitle>
                            <CardDescription>
                                Exibindo relatório de "{reportTypes.find(rt => rt.value === reportType)?.label}" para {getMonthOptions().find(m => m.value === selectedMonth)?.label}/{selectedYear}.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline"><Save className="mr-2 h-4 w-4" />Salvar Modelo</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Salvar Modelo de Relatório</DialogTitle>
                                        <DialogDescription>Dê um nome para este conjunto de filtros para acesso rápido no futuro.</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Label htmlFor="template-name">Nome do Modelo</Label>
                                        <Input id="template-name" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} />
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                                        <Button onClick={handleSaveTemplate}>Salvar</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline"><FileDown className="mr-2 h-4 w-4" />Exportar</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={() => toast({ title: "Exportando como PDF..." })}><FileText className="mr-2 h-4 w-4" />Exportar como PDF (completo)</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => toast({ title: "Exportando como CSV..." })}><BarChart3 className="mr-2 h-4 w-4" />Exportar como CSV (lista)</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ReportVisuals />
                    </CardContent>
                </Card>
            )}

            {!showReport && (
                <Card className="h-full min-h-[500px]">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center h-[500px]">
                        <div className="p-4 bg-muted rounded-full">
                            <Filter className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="mt-6 text-xl font-semibold">Nenhum relatório gerado</h3>
                        <p className="mt-2 text-base text-muted-foreground">
                            Use os filtros acima para começar a analisar os dados do seu negócio.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
