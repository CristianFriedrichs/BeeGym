'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Weight, User as UserIcon, Percent, Ruler, Plus, ArrowUpRight, ArrowDownLeft, Calendar as CalendarIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const students = [
    { id: 1, name: 'Milos Vasiljevic', height: 182, avatar: 'https://i.pravatar.cc/150?img=13' },
    { id: 2, name: 'Jovana Pavlovic', height: 168, avatar: 'https://i.pravatar.cc/150?img=16' },
    { id: 3, name: 'Nikola Vujinovic', height: 175, avatar: 'https://i.pravatar.cc/150?img=15' },
    { id: 4, name: "Ana Clara", height: 165, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop" },
];

export type Measurement = {
    date: string; // "yyyy-MM-dd"
    peso?: number;
    imc?: number;
    gordura?: number;
    dobra?: number;
    peitoral?: number;
    cintura?: number;
    quadril?: number;
    braco?: number;
    coxa?: number;
};

const initialMeasurements: Measurement[] = [
    { date: '2024-03-01', peso: 70.0, imc: 25.7, gordura: 24, dobra: 20, peitoral: 100, cintura: 80, quadril: 102, braco: 35, coxa: 60 },
    { date: '2024-03-08', peso: 69.5, imc: 25.5, gordura: 23.5, dobra: 19, peitoral: 99, cintura: 79, quadril: 101, braco: 35, coxa: 59 },
    { date: '2024-03-15', peso: 69.0, imc: 25.3, gordura: 23, dobra: 18, peitoral: 99, cintura: 78, quadril: 101, braco: 34.5, coxa: 59 },
    { date: '2024-03-22', peso: 68.8, imc: 25.2, gordura: 22.5, dobra: 17, peitoral: 98, cintura: 78, quadril: 100, braco: 34.5, coxa: 58.5 },
    { date: '2024-03-29', peso: 68.5, imc: 25.1, gordura: 22, dobra: 16, peitoral: 98, cintura: 77, quadril: 100, braco: 34, coxa: 58 },
    { date: '2024-04-05', peso: 68.2, imc: 25.0, gordura: 21.8, dobra: 15, peitoral: 97, cintura: 76, quadril: 99, braco: 34, coxa: 58 },
];

const MeasurementListPage = () => {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const studentId = parseInt(params.id as string, 10);
    const student = students.find(s => s.id === studentId);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [tableView, setTableView] = useState<'composition' | 'circumference'>('composition');

    const fetchMeasurements = () => {
        if (!student) return;
        try {
            const measurementKey = `measurements_${studentId}`;
            const storedMeasurementsJSON = localStorage.getItem(measurementKey);
            if (storedMeasurementsJSON) {
                const parsed = JSON.parse(storedMeasurementsJSON);
                if (Array.isArray(parsed)) {
                    setMeasurements(parsed);
                } else {
                    const defaultData = student.id === 4 ? initialMeasurements : [];
                    localStorage.setItem(measurementKey, JSON.stringify(defaultData));
                    setMeasurements(defaultData);
                }
            } else {
                const defaultData = student.id === 4 ? initialMeasurements : [];
                localStorage.setItem(measurementKey, JSON.stringify(defaultData));
                setMeasurements(defaultData);
            }
        } catch (error) {
            console.error("Failed to load measurements from localStorage", error);
            setMeasurements(student?.id === 4 ? initialMeasurements : []);
        }
    }

    useEffect(() => {
        fetchMeasurements();
    }, [student]);

    const handleDelete = (dateToDelete: string) => {
        const measurementKey = `measurements_${studentId}`;
        const updatedMeasurements = measurements.filter(m => m.date !== dateToDelete);
        localStorage.setItem(measurementKey, JSON.stringify(updatedMeasurements));
        fetchMeasurements(); // re-fetch to update state
        toast({ title: 'Medida excluída com sucesso!' });
    };

    if (!student) {
        return <div className="p-8">Aluno não encontrado.</div>;
    }
    
    const sortedMeasurements = useMemo(() => {
        return [...measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [measurements]);

    const getChange = (key: keyof Measurement, unit: string = '') => {
        const latestMeasurement = sortedMeasurements[0];
        const secondLatestMeasurement = sortedMeasurements[1];

        if (!latestMeasurement || !secondLatestMeasurement) return { change: 'N/A', changeType: 'neutral' };
        
        const latestValue = latestMeasurement[key] as number | undefined;
        const secondLatestValue = secondLatestMeasurement[key] as number | undefined;

        if (latestValue === undefined || secondLatestValue === undefined) return { change: 'N/A', changeType: 'neutral' };

        const change = latestValue - secondLatestValue;
        const isGood = change <= 0; // Assuming lower is better for all metrics shown
        const unitWithSpace = unit ? ` ${unit}` : '';

        return {
            change: `${change > 0 ? '+' : ''}${change.toFixed(1)}${unitWithSpace}`,
            changeType: isGood ? 'positive' : 'negative',
        };
    }

    const kpiMetrics = [
        { title: 'Peso', key: 'peso', unit: ' kg', icon: Weight, iconBgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-500 dark:text-blue-400', change: getChange('peso', 'kg') },
        { title: 'IMC', key: 'imc', unit: '', icon: UserIcon, iconBgColor: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-500 dark:text-green-400', change: getChange('imc') },
        { title: '% Gordura', key: 'gordura', unit: '%', icon: Percent, iconBgColor: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-500 dark:text-yellow-400', change: getChange('gordura', '%') },
        { title: 'Dobra Cutânea', key: 'dobra', unit: ' mm', icon: Ruler, iconBgColor: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-400', change: getChange('dobra', 'mm') },
    ];
    
    const latestMeasurementsKPIs = kpiMetrics.map(metric => {
        const latestMeasurement = sortedMeasurements[0];
        const value = latestMeasurement?.[metric.key as keyof Measurement] as number | undefined;
        return {
            ...metric,
            value: value !== undefined ? `${value.toFixed(1)}${metric.unit}` : 'N/A',
            description: 'vs último registro',
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/clients/${student.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={student.avatar} alt={student.name}/>
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
                        <p className="text-muted-foreground">Histórico de Medidas</p>
                    </div>
                </div>
                 <Button asChild>
                    <Link href={`/dashboard/clients/${student.id}/measurements?action=new`}>
                        <Plus className="mr-2 h-4 w-4" /> Nova Medida
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {latestMeasurementsKPIs.map((kpi, index) => {
                    const isGoingUp = kpi.change.change === 'N/A' ? true : parseFloat(kpi.change.change) >= 0;
                    const ArrowComponent = isGoingUp ? ArrowUpRight : ArrowDownLeft;
                    return (
                        <Card key={index} className="shadow-soft p-5 flex items-start justify-between">
                            <div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">{kpi.title}</p>
                                <h3 className="text-3xl font-bold text-foreground mb-2">{kpi.value}</h3>
                                {kpi.change.change !== 'N/A' && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <span className={`font-bold flex items-center mr-2 ${kpi.change.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                                    <ArrowComponent className="h-4 w-4"/>
                                    {kpi.change.change}
                                    </span>
                                    {kpi.description}
                                </div>
                                )}
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.iconBgColor}`}>
                                <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Card className="shadow-soft rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Histórico de Medidas</CardTitle>
                        <CardDescription>Todas as medidas registradas para {student.name}.</CardDescription>
                    </div>
                    <Select value={tableView} onValueChange={(value) => setTableView(value as 'composition' | 'circumference')}>
                        <SelectTrigger className="w-auto min-w-[220px]">
                            <SelectValue placeholder="Tipo de Medida" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="composition">Composição Corporal</SelectItem>
                            <SelectItem value="circumference">Circunferências</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                   {sortedMeasurements.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                {tableView === 'composition' ? (
                                    <>
                                        <TableHead className="text-right">Peso (kg)</TableHead>
                                        <TableHead className="text-right">IMC</TableHead>
                                        <TableHead className="text-right">% Gordura</TableHead>
                                        <TableHead className="text-right">Dobra (mm)</TableHead>
                                    </>
                                ) : (
                                    <>
                                        <TableHead className="text-right">Peitoral (cm)</TableHead>
                                        <TableHead className="text-right">Cintura (cm)</TableHead>
                                        <TableHead className="text-right">Quadril (cm)</TableHead>
                                        <TableHead className="text-right hidden md:table-cell">Braço (cm)</TableHead>
                                        <TableHead className="text-right hidden md:table-cell">Coxa (cm)</TableHead>
                                    </>
                                )}
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedMeasurements.map((row) => (
                                <TableRow key={row.date}>
                                    <TableCell className="font-medium">{format(parseISO(row.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                                    {tableView === 'composition' ? (
                                        <>
                                            <TableCell className="text-right">{row.peso?.toFixed(1) ?? 'N/A'}</TableCell>
                                            <TableCell className="text-right">{row.imc?.toFixed(1) ?? 'N/A'}</TableCell>
                                            <TableCell className="text-right">{row.gordura?.toFixed(1) ?? 'N/A'}</TableCell>
                                            <TableCell className="text-right">{row.dobra ?? 'N/A'}</TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="text-right">{row.peitoral ?? 'N/A'}</TableCell>
                                            <TableCell className="text-right">{row.cintura ?? 'N/A'}</TableCell>
                                            <TableCell className="text-right">{row.quadril ?? 'N/A'}</TableCell>
                                            <TableCell className="text-right hidden md:table-cell">{row.braco ?? 'N/A'}</TableCell>
                                            <TableCell className="text-right hidden md:table-cell">{row.coxa ?? 'N/A'}</TableCell>
                                        </>
                                    )}
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <Link href={`/dashboard/clients/${student.id}/measurements?date=${row.date}`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro de medida do dia {format(parseISO(row.date), 'dd/MM/yyyy', { locale: ptBR })}.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(row.date)}>Excluir</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                   ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-xl">
                        <Ruler className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Nenhuma medida registrada</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Adicione a primeira medida para {student.name}.
                        </p>
                        <Button className="mt-6" asChild>
                             <Link href={`/dashboard/clients/${student.id}/measurements?action=new`}>
                                <Plus className="mr-2 h-4 w-4" /> Adicionar Primeira Medida
                            </Link>
                        </Button>
                    </div>
                   )}
                </CardContent>
            </Card>
        </div>
    );
};


const MeasurementEditorPage = () => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const studentId = parseInt(params.id as string, 10);
    const editingDate = searchParams.get('date');
    const isEditing = !!editingDate;

    const student = students.find(s => s.id === studentId);

    const [formState, setFormState] = useState<Partial<Measurement>>({
        date: editingDate || format(new Date(), 'yyyy-MM-dd'),
    });

     useEffect(() => {
        if (isEditing) {
            const measurementKey = `measurements_${studentId}`;
            const existingMeasurements: Measurement[] = JSON.parse(localStorage.getItem(measurementKey) || '[]');
            const measurementToEdit = existingMeasurements.find(m => m.date === editingDate);
            if (measurementToEdit) {
                setFormState(measurementToEdit);
            }
        }
    }, [isEditing, editingDate, studentId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
    };

    const handleSave = () => {
        if (!formState.date || formState.peso === undefined) {
            toast({ title: "Campos Obrigatórios", description: "Data e Peso são obrigatórios.", variant: "destructive" });
            return;
        }
    
        const heightInMeters = (student?.height || 0) / 100;
        const imc = heightInMeters > 0 && formState.peso ? formState.peso / (heightInMeters * heightInMeters) : undefined;
        
        const newMeasurement: Measurement = {
            ...formState,
            date: formState.date,
            peso: formState.peso,
            imc: imc ? parseFloat(imc.toFixed(1)) : undefined,
        };
    
        try {
            const measurementKey = `measurements_${studentId}`;
            let existingMeasurements: Measurement[] = JSON.parse(localStorage.getItem(measurementKey) || '[]');
            
            // If we are editing, remove the original record to handle date changes.
            if (isEditing && editingDate) {
                existingMeasurements = existingMeasurements.filter(m => m.date !== editingDate);
            }
    
            // Check if another record with the new date already exists.
            const newDateExistsIndex = existingMeasurements.findIndex(m => m.date === newMeasurement.date);
    
            if (newDateExistsIndex > -1) {
                // Overwrite the existing record for the new date.
                existingMeasurements[newDateExistsIndex] = newMeasurement;
            } else {
                // Add the new/updated measurement.
                existingMeasurements.push(newMeasurement);
            }
            
            localStorage.setItem(measurementKey, JSON.stringify(existingMeasurements));
        } catch (error) {
            console.error("Failed to save measurement to localStorage", error);
            toast({ title: "Erro ao Salvar", description: "Não foi possível salvar a medição.", variant: "destructive"});
            return;
        }
    
        toast({ title: "Medida Salva!", description: "A medição foi registrada com sucesso." });
        router.push(`/dashboard/clients/${studentId}/measurements`);
    };

    if (!student) {
        return <div className="p-8">Aluno não encontrado.</div>;
    }
    
    const subtitle = isEditing ? 'Editando medida' : 'Nova medida';
    
    const selectedDateObj = formState.date && isValid(parseISO(formState.date)) ? parseISO(formState.date) : new Date();

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                 <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar} alt={student.name}/>
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
                    <p className="text-muted-foreground">{subtitle}</p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6 space-y-8">
                    <div className="space-y-4">
                        <h4 className="text-base font-semibold text-foreground">Dados Principais</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Data da Medição *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formState.date && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formState.date ? format(selectedDateObj, "PPP", { locale: ptBR }) : <span>Escolha a data</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDateObj} onSelect={(d) => setFormState(p => ({...p, date: d ? format(d, 'yyyy-MM-dd') : undefined }))} disabled={(date) => date > new Date()} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="peso">Peso (kg) *</Label>
                                <Input id="peso" name="peso" type="number" placeholder="Ex: 70.5" value={formState.peso || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-base font-semibold text-foreground">Composição Corporal</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="imc">IMC</Label>
                                <Input id="imc" type="number" placeholder="Calculado automaticamente" value={formState.imc?.toFixed(1) || ''} readOnly className="bg-muted"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gordura">% Gordura</Label>
                                <Input id="gordura" name="gordura" type="number" placeholder="Ex: 22.5" value={formState.gordura || ''} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="dobra">Dobra Cutânea (mm)</Label>
                                <Input id="dobra" name="dobra" type="number" placeholder="Ex: 18" value={formState.dobra || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-base font-semibold text-foreground">Circunferências (cm)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            <div className="space-y-2"><Label htmlFor="peitoral">Peitoral</Label><Input id="peitoral" name="peitoral" type="number" value={formState.peitoral || ''} onChange={handleInputChange} /></div>
                            <div className="space-y-2"><Label htmlFor="cintura">Cintura</Label><Input id="cintura" name="cintura" type="number" value={formState.cintura || ''} onChange={handleInputChange} /></div>
                            <div className="space-y-2"><Label htmlFor="quadril">Quadril</Label><Input id="quadril" name="quadril" type="number" value={formState.quadril || ''} onChange={handleInputChange} /></div>
                            <div className="space-y-2"><Label htmlFor="braco">Braço</Label><Input id="braco" name="braco" type="number" value={formState.braco || ''} onChange={handleInputChange} /></div>
                            <div className="space-y-2"><Label htmlFor="coxa">Coxa</Label><Input id="coxa" name="coxa" type="number" value={formState.coxa || ''} onChange={handleInputChange} /></div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar Medidas</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

const MeasurementsRouterPage = () => {
    const searchParams = useSearchParams();
    const action = searchParams.get('action');
    const date = searchParams.get('date');

    if (action === 'new' || date) {
        return <MeasurementEditorPage />;
    }

    return <MeasurementListPage />;
};

export default MeasurementsRouterPage;
