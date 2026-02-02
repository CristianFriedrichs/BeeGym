
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Download,
  Search,
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  CreditCard,
  FileWarning,
  UserCheck,
  Plus,
  CalendarIcon,
  X,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, getMonth, getYear, isBefore, startOfDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { logAction } from '@/lib/logger';
import { initialClients as students } from '@/app/dashboard/clients/page';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const initialInvoices = [
  { id: 'inv-001', unitId: 'unit-1', invoiceNumber: '2024070001', studentId: 1, student: { name: 'Milos Vasiljevic', avatar: 'https://i.pravatar.cc/150?img=13' }, monthYear: 'Jul/24', issueDate: '2024-07-01T00:00:00.000Z', dueDate: '2024-07-15T00:00:00.000Z', paymentMethod: 'Pix', amount: 150.0, status: 'Pago', paymentDate: '2024-07-15T00:00:00.000Z' },
  { id: 'inv-002', unitId: 'unit-1', invoiceNumber: '2024070002', studentId: 2, student: { name: 'Jovana Pavlovic', avatar: 'https://i.pravatar.cc/150?img=16' }, monthYear: 'Jul/24', issueDate: '2024-07-01T00:00:00.000Z', dueDate: '2024-07-14T00:00:00.000Z', paymentMethod: 'Cartão de Crédito', amount: 120.0, status: 'Atrasado' },
  { id: 'inv-003', unitId: 'unit-2', invoiceNumber: '2024070003', studentId: 3, student: { name: 'Nikola Vujinovic', avatar: 'https://i.pravatar.cc/150?img=15' }, monthYear: 'Jul/24', issueDate: '2024-07-01T00:00:00.000Z', dueDate: '2024-07-13T00:00:00.000Z', paymentMethod: 'Boleto', amount: 150.0, status: 'Pendente' },
  { id: 'inv-004', unitId: 'unit-1', invoiceNumber: '2024070004', studentId: 4, student: { name: 'Ana Clara', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop' }, monthYear: 'Jul/24', issueDate: '2024-07-01T00:00:00.000Z', dueDate: '2024-07-11T00:00:00.000Z', paymentMethod: 'Pix', amount: 180.0, status: 'Pago', paymentDate: '2024-07-10T00:00:00.000Z' },
  { id: 'inv-005', unitId: 'unit-1', invoiceNumber: '2024060001', studentId: 1, student: { name: 'Milos Vasiljevic', avatar: 'https://i.pravatar.cc/150?img=13' }, monthYear: 'Jun/24', issueDate: '2024-06-01T00:00:00.000Z', dueDate: '2024-06-15T00:00:00.000Z', paymentMethod: 'Pix', amount: 150.0, status: 'Pago', paymentDate: '2024-06-15T00:00:00.000Z' },
  { id: 'inv-006', unitId: 'unit-2', invoiceNumber: '2024060002', studentId: 2, student: { name: 'Jovana Pavlovic', avatar: 'https://i.pravatar.cc/150?img=16' }, monthYear: 'Jun/24', issueDate: '2024-06-01T00:00:00.000Z', dueDate: '2024-06-14T00:00:00.000Z', paymentMethod: 'Cartão de Crédito', amount: 120.0, status: 'Pago', paymentDate: '2024-06-13T00:00:00.000Z' },
];

const statusStyles: { [key: string]: string } = {
    'Pago': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Pendente': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Atrasado': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Cancelado': 'bg-foreground text-background',
}

export default function PaymentsPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filters, setFilters] = useState({ search: '', status: 'all', month: 'all', year: 'all' });
  const [isClient, setIsClient] = useState(false);
  const [isNewTransactionOpen, setNewTransactionOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isMarkAsPaidOpen, setMarkAsPaidOpen] = useState(false);
  const [isCancelAlertOpen, setCancelAlertOpen] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const unitId = localStorage.getItem('currentUnitId');
    setCurrentUnitId(unitId);
    try {
      const storedInvoices = localStorage.getItem('invoices_data');
      let invoicesData = [];
      if (storedInvoices) {
        invoicesData = JSON.parse(storedInvoices);
      } else {
        invoicesData = initialInvoices;
        // Initialize counters for mock data
        localStorage.setItem('invoice_counter_2024_07', '4');
        localStorage.setItem('invoice_counter_2024_06', '2');
      }
      
      const now = new Date();
      const newlyCancelledInvoices: any[] = [];
      const updatedInvoicesData = invoicesData.map((inv: any) => {
        let finalStatus = inv.status;
        // From Pending to Overdue
        if (inv.status === 'Pendente' && isBefore(parseISO(inv.dueDate), startOfDay(now))) {
          finalStatus = 'Atrasado';
        }
        // From Overdue to Cancelled (example: after 7 days)
        if (inv.status === 'Atrasado' && isBefore(addDays(parseISO(inv.dueDate), 7), startOfDay(now))) { 
          finalStatus = 'Cancelado';
           newlyCancelledInvoices.push({ ...inv, status: 'Cancelado' });
        }
        return { ...inv, status: finalStatus };
      });

      if (newlyCancelledInvoices.length > 0) {
        newlyCancelledInvoices.forEach(inv => {
            logAction({
                user: 'Sistema',
                origin: 'system',
                entity: 'Pagamento',
                entityId: inv.invoiceNumber,
                action: 'Status Change',
                description: `Fatura "${inv.invoiceNumber}" para ${inv.student.name} cancelada automaticamente por vencimento.`,
                details: {
                    before: { status: 'Pendente' },
                    after: { status: 'Cancelado', reason: 'Vencimento ultrapassado sem pagamento' }
                }
            });
        });
      }


      updateAndSaveInvoices(updatedInvoicesData);

    } catch (error) {
      console.error("Failed to access localStorage", error);
      setInvoices(initialInvoices);
    }
  }, []);

  const updateAndSaveInvoices = (newInvoices: any[]) => {
      setInvoices(newInvoices);
      localStorage.setItem('invoices_data', JSON.stringify(newInvoices));
  }

  const kpiCards = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const unitInvoices = invoices.filter(inv => inv.unitId === currentUnitId);

    const monthlyRevenue = unitInvoices
        .filter(inv => inv.status === 'Pago' && inv.paymentDate && getMonth(parseISO(inv.paymentDate)) === currentMonth && getYear(parseISO(inv.paymentDate)) === currentYear)
        .reduce((acc, inv) => acc + inv.amount, 0);

    const pendingAmount = unitInvoices.filter(inv => inv.status === 'Pendente').reduce((acc, inv) => acc + inv.amount, 0);
    const overdueAmount = unitInvoices.filter(inv => inv.status === 'Atrasado').reduce((acc, inv) => acc + inv.amount, 0);
    
    const paidInvoicesCount = unitInvoices.filter(inv => inv.status === 'Pago').length;
    const totalPaidRevenue = unitInvoices.filter(inv => inv.status === 'Pago').reduce((acc, inv) => acc + inv.amount, 0);
    const averageTicket = paidInvoicesCount > 0 ? totalPaidRevenue / paidInvoicesCount : 0;
    
    return [
      { title: "Receita Total (Mês)", value: `R$ ${monthlyRevenue.toFixed(2).replace('.', ',')}`, change: "+12.5%", changeType: "positive", icon: TrendingUp, iconBgColor: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-500 dark:text-green-400' },
      { title: "Pagamentos Pendentes", value: `R$ ${pendingAmount.toFixed(2).replace('.', ',')}`, change: "-2.1%", changeType: "positive", icon: CreditCard, iconBgColor: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-500 dark:text-yellow-400' },
      { title: "Pagamentos Atrasados", value: `R$ ${overdueAmount.toFixed(2).replace('.', ',')}`, change: "+5.0%", changeType: "negative", icon: FileWarning, iconBgColor: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-500 dark:text-red-400' },
      { title: "Ticket Médio", value: `R$ ${averageTicket.toFixed(2).replace('.', ',')}`, change: "+3.2%", changeType: "positive", icon: UserCheck, iconBgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-500 dark:text-blue-400' },
    ];
  }, [invoices, currentUnitId]);

  const chartData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i);
    const unitInvoices = invoices.filter(inv => inv.unitId === currentUnitId);
    const data = months.map(month => {
        const monthName = format(new Date(2024, month), 'MMM', { locale: ptBR });
        const monthInvoices = unitInvoices.filter(inv => getMonth(parseISO(inv.dueDate)) === month);
        const Pago = monthInvoices.filter(inv => inv.status === 'Pago').reduce((acc, inv) => acc + inv.amount, 0);
        const Pendente = monthInvoices.filter(inv => inv.status === 'Pendente').reduce((acc, inv) => acc + inv.amount, 0);
        const Atrasado = monthInvoices.filter(inv => inv.status === 'Atrasado').reduce((acc, inv) => acc + inv.amount, 0);
        return { name: monthName, Pago, Pendente, Atrasado };
    });
    return data;
  }, [invoices, currentUnitId]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
        const invoiceDate = parseISO(invoice.dueDate);
        const matchesUnit = invoice.unitId === currentUnitId;
        const matchesSearch = invoice.student.name.toLowerCase().includes(filters.search.toLowerCase());
        const matchesStatus = filters.status === 'all' || invoice.status === filters.status;
        const matchesMonth = filters.month === 'all' || getMonth(invoiceDate).toString() === filters.month;
        const matchesYear = filters.year === 'all' || getYear(invoiceDate).toString() === filters.year;
        return matchesUnit && matchesSearch && matchesStatus && matchesMonth && matchesYear;
    }).sort((a, b) => parseISO(b.dueDate).getTime() - parseISO(a.dueDate).getTime());
  }, [invoices, filters, currentUnitId]);

  const handleAction = (action: string, invoice: any) => {
    setSelectedInvoice(invoice);
    if(action === 'details') setDetailsOpen(true);
    else if(action === 'mark_paid') setMarkAsPaidOpen(true);
    else if (action === 'cancel_invoice') setCancelAlertOpen(true);
    else toast({ title: `${action} (em desenvolvimento)` });
  };

  const handleSaveNewTransaction = (newInvoiceData: any) => {
     if (!newInvoiceData.studentId) {
        toast({ title: "Dados incompletos", description: "Por favor, selecione um aluno.", variant: "destructive" });
        return;
     }
     if (!newInvoiceData.amount || !newInvoiceData.dueDate) {
        toast({ title: "Dados incompletos", description: "Valor e data de vencimento são obrigatórios.", variant: "destructive" });
        return;
     }

     const student = students.find(s => s.id === parseInt(newInvoiceData.studentId));
     if (!student) {
        toast({ title: "Erro", description: "Aluno selecionado não encontrado.", variant: "destructive" });
        return;
     }
     
     const dueDate = parseISO(newInvoiceData.dueDate);
     const year = getYear(dueDate);
     const month = getMonth(dueDate) + 1;
     const counterKey = `invoice_counter_${year}_${String(month).padStart(2, '0')}`;
     
     let lastCounter = parseInt(localStorage.getItem(counterKey) || '0');
     const newCounter = lastCounter + 1;
     
     const yearStr = year.toString();
     const monthStr = String(month).padStart(2, '0');
     const seqStr = String(newCounter).padStart(4, '0');
     const invoiceNumber = `${yearStr}${monthStr}${seqStr}`;

     localStorage.setItem(counterKey, String(newCounter));

     const newInvoice = {
        id: `inv-${Date.now()}`,
        unitId: currentUnitId,
        invoiceNumber: invoiceNumber,
        studentId: parseInt(newInvoiceData.studentId),
        student: { name: student?.name || 'Desconhecido', avatar: student?.avatar },
        monthYear: format(dueDate, "MMM/yy", { locale: ptBR }),
        issueDate: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        paymentMethod: newInvoiceData.status === 'Pago' ? newInvoiceData.paymentMethod : '',
        amount: parseFloat(newInvoiceData.amount),
        status: newInvoiceData.status,
        paymentDate: newInvoiceData.status === 'Pago' ? parseISO(newInvoiceData.paymentDate).toISOString() : undefined,
    };
    updateAndSaveInvoices([newInvoice, ...invoices]);
    setNewTransactionOpen(false);
    toast({ title: 'Fatura criada com sucesso!', description: `Fatura ${invoiceNumber} gerada.` });

    logAction({
      user: 'Kristin Watson',
      origin: 'professional',
      entity: 'Pagamento',
      entityId: invoiceNumber,
      action: 'Criação',
      description: `Fatura manual "${invoiceNumber}" criada para ${student?.name}.`,
      details: {
        before: {},
        after: {
            student: student?.name,
            amount: newInvoice.amount,
            dueDate: newInvoice.dueDate,
            status: newInvoice.status,
        }
      }
    });
  }
  
  const handleMarkAsPaid = (paymentDetails: any) => {
      const updatedInvoices = invoices.map(inv => {
          if (inv.id === selectedInvoice.id) {
              return {
                  ...inv,
                  status: 'Pago',
                  paymentDate: parseISO(paymentDetails.paymentDate).toISOString(),
                  paymentMethod: paymentDetails.paymentMethod,
                  amount: parseFloat(paymentDetails.amount) + parseFloat(paymentDetails.penalties || 0)
              };
          }
          return inv;
      });
      
      logAction({
        user: 'Kristin Watson',
        origin: 'professional',
        entity: 'Pagamento',
        entityId: selectedInvoice.invoiceNumber,
        action: 'Status Change',
        description: `Fatura "${selectedInvoice.invoiceNumber}" para ${selectedInvoice.student.name} marcada como Paga.`,
        details: {
            before: { status: selectedInvoice.status, amount: selectedInvoice.amount },
            after: { 
                status: 'Pago', 
                amount: parseFloat(paymentDetails.amount) + parseFloat(paymentDetails.penalties || 0), 
                paymentDate: paymentDetails.paymentDate, 
                paymentMethod: paymentDetails.paymentMethod 
            }
        }
      });
      
      updateAndSaveInvoices(updatedInvoices);
      setMarkAsPaidOpen(false);
      setSelectedInvoice(null);
      toast({ title: 'Fatura marcada como Paga!' });
  };
  
  const handleConfirmCancel = () => {
    if (!selectedInvoice) return;

    const updatedInvoices = invoices.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'Cancelado' } : inv);
    
    logAction({
        user: 'Kristin Watson',
        origin: 'professional',
        entity: 'Pagamento',
        entityId: selectedInvoice.invoiceNumber,
        action: 'Status Change',
        description: `Fatura "${selectedInvoice.invoiceNumber}" para ${selectedInvoice.student.name} cancelada.`,
        details: {
            before: { status: selectedInvoice.status },
            after: { status: 'Cancelado' }
        }
    });

    updateAndSaveInvoices(updatedInvoices);
    toast({ title: 'Fatura Cancelada!' });
    setCancelAlertOpen(false);
    setSelectedInvoice(null);
  };


  if (!isClient) return null;

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div><h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1><p className="text-muted-foreground">Gerencie as finanças do seu negócio.</p></div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setNewTransactionOpen(true)}><Plus className="h-4 w-4 mr-2" />Nova Transação</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {kpiCards.map((kpi, index) => (
              <Card key={index} className="shadow-soft p-5 flex items-start justify-between">
                  <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">{kpi.title}</p>
                  <h3 className="text-3xl font-bold text-foreground mb-2">{kpi.value}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                      <span className={`font-bold flex items-center mr-2 ${kpi.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                      {kpi.changeType === 'positive' ? <ArrowUpRight className="h-4 w-4"/> : <ArrowDownLeft className="h-4 w-4" />}
                      {kpi.change}
                      </span>
                  </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.iconBgColor}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
                  </div>
              </Card>
          ))}
        </div>

        <Card>
            <CardHeader><CardTitle>Visão Geral do Faturamento</CardTitle></CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tickFormatter={(value) => `R$${value/1000}k`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false}/>
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted-foreground) / 0.1)' }}
                            content={({ active, payload, label }) =>
                                active && payload && payload.length ? (
                                <div className="p-2 bg-background border rounded-lg shadow-soft">
                                    <p className="font-bold">{label}</p>
                                    {payload.map((p, i) => (
                                        <p key={i} style={{ color: p.color }}>
                                            {p.name}: R$ {p.value?.toFixed(2)}
                                        </p>
                                    ))}
                                </div>
                                ) : null
                            }
                        />
                        <Legend wrapperStyle={{fontSize: "12px"}}/>
                        <Bar dataKey="Atrasado" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Pendente" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="Pago" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card className="shadow-soft rounded-2xl overflow-hidden">
          <CardHeader className="p-6 border-b">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <CardTitle className="text-lg font-bold">Histórico de Faturas</CardTitle>
                  <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                      <div className="relative flex-1 w-full md:w-auto">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input placeholder="Buscar por aluno..." className="pl-10 bg-gray-50 dark:bg-gray-800/50 border-none w-full" value={filters.search} onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}/>
                      </div>
                      <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}><SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="Pago">Pago</SelectItem><SelectItem value="Pendente">Pendente</SelectItem><SelectItem value="Atrasado">Atrasado</SelectItem><SelectItem value="Cancelado">Cancelado</SelectItem></SelectContent></Select>
                      <Select value={filters.month} onValueChange={(value) => setFilters(prev => ({...prev, month: value}))}><SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Mês" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{Array.from({length: 12}).map((_, i) => <SelectItem key={i} value={i.toString()}>{format(new Date(0, i), 'MMMM', {locale: ptBR})}</SelectItem>)}</SelectContent></Select>
                      <Select value={filters.year} onValueChange={(value) => setFilters(prev => ({...prev, year: value}))}><SelectTrigger className="w-full md:w-[120px]"><SelectValue placeholder="Ano" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="2024">2024</SelectItem><SelectItem value="2023">2023</SelectItem></SelectContent></Select>
                  </div>
              </div>
          </CardHeader>
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/20"><TableRow><TableHead>Aluno</TableHead><TableHead>Mês/Ano</TableHead><TableHead>Vencimento</TableHead><TableHead>Forma de Pag.</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead className="text-right"></TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleAction('details', invoice)}>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={invoice.student.avatar} alt={invoice.student.name} />
                        <AvatarFallback>{invoice.student.name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold">{invoice.student.name}</p>
                        <p className="text-xs text-muted-foreground">{invoice.invoiceNumber}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{invoice.monthYear}</TableCell>
                  <TableCell className="text-muted-foreground">{format(parseISO(invoice.dueDate), 'dd \'de\' MMM, yyyy', {locale: ptBR})}</TableCell>
                  <TableCell className="text-muted-foreground">{invoice.paymentMethod}</TableCell>
                  <TableCell className="font-medium">R$ {invoice.amount.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell><Badge variant="outline" className={`${statusStyles[invoice.status]}`}>{invoice.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onSelect={() => handleAction('details', invoice)}>Ver Detalhes</DropdownMenuItem>
                        { (invoice.status === 'Pendente' || invoice.status === 'Atrasado') && <DropdownMenuItem onSelect={() => handleAction('mark_paid', invoice)}>Marcar como Paga</DropdownMenuItem> }
                        <DropdownMenuItem onSelect={() => handleAction('send_invoice', invoice)}>Enviar Fatura</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {invoice.status !== 'Cancelado' && <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => handleAction('cancel_invoice', invoice)}>Cancelar Fatura</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={isNewTransactionOpen} onOpenChange={setNewTransactionOpen}>
        <NewTransactionDialog onSubmit={handleSaveNewTransaction} onClose={() => setNewTransactionOpen(false)} />
      </Dialog>
      <Dialog open={isDetailsOpen} onOpenChange={setDetailsOpen}>
         <InvoiceDetailsDialog invoice={selectedInvoice} onClose={() => setDetailsOpen(false)} onMarkAsPaid={() => { setDetailsOpen(false); setMarkAsPaidOpen(true); setSelectedInvoice(selectedInvoice); }} />
      </Dialog>
       <Dialog open={isMarkAsPaidOpen} onOpenChange={setMarkAsPaidOpen}>
        <MarkAsPaidDialog invoice={selectedInvoice} onSubmit={handleMarkAsPaid} onClose={() => setMarkAsPaidOpen(false)} />
      </Dialog>
      <AlertDialog open={isCancelAlertOpen} onOpenChange={setCancelAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Cancelar Fatura?</AlertDialogTitle>
                <AlertDialogDescription>
                    Tem certeza que deseja cancelar a fatura {selectedInvoice?.invoiceNumber} para {selectedInvoice?.student.name}? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Voltar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmCancel} className={cn(buttonVariants({variant: 'destructive'}))}>Confirmar Cancelamento</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


function NewTransactionDialog({ onSubmit, onClose }: { onSubmit: (data: any) => void; onClose: () => void }) {
    const [formData, setFormData] = useState({ 
      studentId: '', 
      amount: '', 
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pendente',
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'Pix'
    });
    const [openStudentSelector, setOpenStudentSelector] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState('Aguardando data...');

    useEffect(() => {
        if (formData.dueDate) {
            const dueDate = parseISO(formData.dueDate);
            const year = getYear(dueDate);
            const month = getMonth(dueDate) + 1;
            const counterKey = `invoice_counter_${year}_${String(month).padStart(2, '0')}`;
            
            const lastCounter = parseInt(localStorage.getItem(counterKey) || '0');
            const newCounter = lastCounter + 1;
            
            const yearStr = year.toString();
            const monthStr = String(month).padStart(2, '0');
            const seqStr = String(newCounter).padStart(4, '0');

            setInvoiceNumber(`${yearStr}${monthStr}${seqStr}`);
        } else {
            setInvoiceNumber('Aguardando data...');
        }
    }, [formData.dueDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    const handleDateChange = (date: Date | undefined, field: 'dueDate' | 'paymentDate') => {
        if(date) setFormData(prev => ({ ...prev, [field]: format(date, 'yyyy-MM-dd') }));
    }

    const selectedStudent = students.find(s => s.id.toString() === formData.studentId);
    
    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Fatura Manual</DialogTitle>
              <DialogDescription>
                Gere uma cobrança avulsa para um aluno. Este lançamento é independente do ciclo de faturamento automático do plano.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Aluno *</Label>
                        <Popover open={openStudentSelector} onOpenChange={setOpenStudentSelector} modal={false}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              {selectedStudent
                                ? <div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarImage src={selectedStudent.avatar} /><AvatarFallback>{selectedStudent.name.charAt(0)}</AvatarFallback></Avatar> {selectedStudent.name}</div>
                                : "Selecione um aluno"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Buscar aluno..." />
                              <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                              <CommandGroup>
                                <CommandList>
                                  {students.map((s) => (
                                    <CommandItem
                                      key={s.id}
                                      value={s.name}
                                      onSelect={() => {
                                        setFormData(p => ({...p, studentId: s.id.toString()}));
                                        setOpenStudentSelector(false);
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={s.avatar} />
                                          <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                           <span className="text-sm">{s.name}</span>
                                           <span className="text-xs text-muted-foreground">{s.email}</span>
                                        </div>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandList>
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Nº da Fatura (previsão)</Label>
                      <Input id="invoiceNumber" value={invoiceNumber} readOnly disabled/>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor da Fatura *</Label>
                      <Input id="amount" name="amount" type="number" placeholder="150,00" value={formData.amount} onChange={handleChange}/>
                    </div>
                     <div className="space-y-2">
                        <Label>Data de Vencimento *</Label>
                        <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{formData.dueDate ? format(parseISO(formData.dueDate), 'PPP', { locale: ptBR }) : <span>Escolha a data</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.dueDate ? parseISO(formData.dueDate) : undefined} onSelect={(d) => handleDateChange(d, 'dueDate')} initialFocus /></PopoverContent></Popover>
                    </div>
                </div>

                <div className="space-y-3">
                  <Label>Status Inicial da Fatura</Label>
                  <RadioGroup value={formData.status} onValueChange={(v) => setFormData(p => ({...p, status: v}))} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Pendente" id="r_pending" />
                        <Label htmlFor="r_pending">Pendente</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Pago" id="r_paid" />
                        <Label htmlFor="r_paid">Paga (registrar pagamento agora)</Label>
                      </div>
                  </RadioGroup>
                </div>

                {formData.status === 'Pago' && (
                  <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                    <h4 className="font-semibold text-sm">Registrar Pagamento Imediato</h4>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Data do Pagamento</Label>
                            <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal bg-background"><CalendarIcon className="mr-2 h-4 w-4" />{formData.paymentDate ? format(parseISO(formData.paymentDate), 'PPP', { locale: ptBR }) : <span>Escolha a data</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.paymentDate ? parseISO(formData.paymentDate) : undefined} onSelect={(d) => handleDateChange(d, 'paymentDate')} /></PopoverContent></Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>Forma de Pagamento</Label>
                          <Select name="paymentMethod" value={formData.paymentMethod} onValueChange={(value) => setFormData(p => ({...p, paymentMethod: value}))}>
                            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pix">Pix</SelectItem>
                              <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                              <SelectItem value="Boleto">Boleto</SelectItem>
                              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                    </div>
                  </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={() => onSubmit(formData)}>Criar Fatura</Button>
            </DialogFooter>
        </DialogContent>
    );
}

function InvoiceDetailsDialog({ invoice, onClose, onMarkAsPaid }: { invoice: any, onClose: () => void, onMarkAsPaid: () => void }) {
    if (!invoice) return null;
    const isCancelled = invoice.status === 'Cancelado';
    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Detalhes da Fatura {invoice.invoiceNumber}</DialogTitle>
                <DialogDescription>
                    Status: <Badge variant="outline" className={cn("font-semibold", statusStyles[invoice.status])}>{invoice.status}</Badge>
                    {isCancelled && <p className="text-destructive text-xs mt-2">Esta fatura foi cancelada e não pode ser alterada.</p>}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 text-sm">
                <p><strong>Aluno:</strong> {invoice.student.name}</p>
                <p><strong>Mês/Ano:</strong> {invoice.monthYear}</p>
                <p><strong>Vencimento:</strong> {format(parseISO(invoice.dueDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                <p><strong>Valor:</strong> R$ {invoice.amount.toFixed(2).replace('.', ',')}</p>
                 {invoice.paymentDate && <p><strong>Data Pag.:</strong> {format(parseISO(invoice.paymentDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>}
                {invoice.paymentMethod && <p><strong>Forma Pag.:</strong> {invoice.paymentMethod}</p>}
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onClose}>Fechar</Button>
                {(invoice.status === 'Pendente' || invoice.status === 'Atrasado') && <Button onClick={onMarkAsPaid}>Marcar como Paga</Button>}
            </DialogFooter>
        </DialogContent>
    )
}

function MarkAsPaidDialog({ invoice, onSubmit, onClose }: { invoice: any, onSubmit: (data: any) => void; onClose: () => void }) {
    const [formData, setFormData] = useState({ 
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'Pix',
        amount: 0,
        penalties: ''
    });

    useEffect(() => {
        if (invoice) {
            setFormData({
                paymentDate: format(new Date(), 'yyyy-MM-dd'),
                paymentMethod: invoice.paymentMethod || 'Pix',
                amount: invoice.amount || 0,
                penalties: ''
            });
        }
    }, [invoice]);

    if (!invoice) return null;
    const isOverdue = invoice.status === 'Atrasado';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }
     const handleDateChange = (date: Date | undefined) => {
        if(date) setFormData(prev => ({ ...prev, paymentDate: format(date, 'yyyy-MM-dd') }));
    }
    
    return (
        <DialogContent>
            <DialogHeader><DialogTitle>Marcar Fatura como Paga</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                {isOverdue && <p className="text-sm text-destructive">Esta fatura está atrasada. Verifique a necessidade de adicionar multas/juros.</p>}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="paymentDate" className="text-right">Data Pag.</Label>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="col-span-3 justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{formData.paymentDate ? format(parseISO(formData.paymentDate), 'PPP', { locale: ptBR }) : <span>Escolha a data</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.paymentDate ? parseISO(formData.paymentDate) : undefined} onSelect={handleDateChange} /></PopoverContent></Popover>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="paymentMethod" className="text-right">Forma</Label>
                    <Select name="paymentMethod" value={formData.paymentMethod} onValueChange={(value) => setFormData(p => ({...p, paymentMethod: value}))}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pix">Pix</SelectItem><SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem><SelectItem value="Boleto">Boleto</SelectItem><SelectItem value="Dinheiro">Dinheiro</SelectItem></SelectContent></Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">Valor Pago</Label>
                    <Input id="amount" name="amount" type="number" className="col-span-3" value={formData.amount} onChange={handleChange} />
                </div>
                {isOverdue && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="penalties" className="text-right">Multa/Juros</Label>
                        <Input id="penalties" name="penalties" type="number" placeholder="0.00" className="col-span-3" value={formData.penalties} onChange={handleChange}/>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={() => onSubmit(formData)}>Confirmar Pagamento</Button>
            </DialogFooter>
        </DialogContent>
    );
}
