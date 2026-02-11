'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, XCircle, FileText, Calendar, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initialClients as students } from '@/lib/mock-data';
import { plans } from '@/lib/plans';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const statusStyles: { [key: string]: string } = {
    'Pago': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-500/20',
    'Atrasado': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-500/20',
    'Pendente': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-500/20',
    'Cancelado': 'bg-foreground text-background',
}

const statusIcons: { [key: string]: React.ReactNode } = {
    'Pago': <CheckCircle className="h-4 w-4" />,
    'Pendente': <Clock className="h-4 w-4" />,
    'Atrasado': <Clock className="h-4 w-4" />,
    'Cancelado': <XCircle className="h-4 w-4" />
}

const PaymentsHistoryPage = () => {
    const params = useParams();
    const studentId = parseInt(params.id as string, 10);
    const student = students.find(s => s.id === studentId);
    const currentPlan = plans.find(p => p.id === student?.plan);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

    useEffect(() => {
        if (!student) return;

        try {
            const storedInvoices = localStorage.getItem('invoices_data');
            if (storedInvoices) {
                const allInvoices = JSON.parse(storedInvoices);

                const now = new Date();
                const processedInvoices = allInvoices.map((inv: any) => {
                    if (inv.status === 'Pendente' && now > parseISO(inv.dueDate)) {
                        return { ...inv, status: 'Atrasado' };
                    }
                    return inv;
                });

                const studentInvoices = processedInvoices
                    .filter((inv: any) => inv.studentId === student.id)
                    .sort((a: any, b: any) => parseISO(b.dueDate).getTime() - parseISO(a.dueDate).getTime());
                setPaymentHistory(studentInvoices);
            }
        } catch (error) {
            console.error("Failed to load invoices from localStorage", error);
        }
    }, [student]);

    const paidInvoices = paymentHistory.filter(p => p.status === 'Pago').length;
    const pendingInvoices = paymentHistory.filter(p => p.status === 'Pendente' || p.status === 'Atrasado').length;

    if (!student || !currentPlan) {
        return <div className="p-8">Aluno ou plano não encontrado.</div>;
    }

    return (
        <div className="space-y-8">
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
                    <p className="text-muted-foreground">Histórico de Pagamentos</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="shadow-soft p-5 flex items-start justify-between">
                    <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">Plano Atual</p>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{currentPlan.name}</h3>
                        <div className="flex items-center gap-2">
                            <Badge variant={student.status === "Ativo" ? "default" : "destructive"} className={cn(student.status === 'Ativo' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400')}>{student.status}</Badge>
                            <p className="text-xs text-muted-foreground">Desde {student.memberSince}</p>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-100 dark:bg-blue-900/30">
                        <Info className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>
                </Card>

                <Card className="shadow-soft p-5 flex items-start justify-between">
                    <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">Faturas Pagas</p>
                        <h3 className="text-3xl font-bold text-foreground mb-2">{paidInvoices}</h3>
                        <p className="text-xs text-muted-foreground">Total de faturas quitadas</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-100 dark:bg-green-900/30">
                        <FileText className="h-6 w-6 text-green-500 dark:text-green-400" />
                    </div>
                </Card>

                <Card className="shadow-soft p-5 flex items-start justify-between">
                    <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">Faturas Pendentes</p>
                        <h3 className="text-3xl font-bold text-foreground mb-2">{pendingInvoices}</h3>
                        <p className="text-xs text-muted-foreground">Faturas vencidas ou em aberto</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/30">
                        <Calendar className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                    </div>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <CardTitle>Todos os Pagamentos</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {paymentHistory.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fatura</TableHead>
                                    <TableHead>Vencimento</TableHead>
                                    <TableHead>Pagamento</TableHead>
                                    <TableHead>Forma</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentHistory.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-semibold">
                                            <div>{item.invoiceNumber}</div>
                                            <div className="text-xs text-muted-foreground">{item.monthYear}</div>
                                        </TableCell>
                                        <TableCell>{format(parseISO(item.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                                        <TableCell>
                                            {item.paymentDate ? format(parseISO(item.paymentDate), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                                        </TableCell>
                                        <TableCell>{item.paymentMethod}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className={cn("font-semibold", statusStyles[item.status])}>
                                                <div className="flex items-center gap-1.5">
                                                    {statusIcons[item.status]}
                                                    {item.status}
                                                </div>
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-xl">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">Nenhum pagamento encontrado</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Este aluno ainda não possui um histórico de pagamentos.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentsHistoryPage;
