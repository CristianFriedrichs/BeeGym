'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { students } from '../page'; // Re-using from parent
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


// More detailed mock data for this page, sorted in descending chronological order
const frequencyHistory = [
    { 
        date: "2024-07-15", 
        name: "Treino A - Peito e Tríceps",
        status: "Realizado",
        type: "Musculação",
        details: [
            { exercise: 'Supino Reto', sets: 4, reps: 10, load: '80kg' },
            { exercise: 'Supino Inclinado com Halteres', sets: 3, reps: 12, load: '30kg cada' },
            { exercise: 'Tríceps Pulley', sets: 3, reps: 15, load: '25kg' },
        ] 
    },
    { 
        date: "2024-07-12",
        name: "HIIT Cardio",
        status: "Realizado",
        type: "Cardio",
        details: [
            { exercise: 'Esteira', time: '20min', distance: '3km', intensity: 'Alta' },
            { exercise: 'Bicicleta', time: '15min', distance: '5km', intensity: 'Moderada' },
        ]
    },
    { 
        date: "2024-07-10", 
        name: "Treino B - Costas e Bíceps",
        status: "Realizado",
        type: "Musculação",
        details: [
            { exercise: 'Remada Curvada', sets: 4, reps: 8, load: '70kg' },
            { exercise: 'Puxada Alta', sets: 3, reps: 12, load: '60kg' },
            { exercise: 'Rosca Direta', sets: 3, reps: 15, load: '20kg' },
        ]
    },
    { 
        date: "2024-07-08",
        name: "Treino A - Peito e Tríceps",
        status: "Falta",
        type: "Musculação",
        details: []
    },
    { 
        date: "2024-07-05",
        name: "Treino Funcional",
        status: "Realizado",
        type: "Funcional",
        details: [
            { exercise: 'Agachamento com Salto', time: '45s', rounds: '3' },
            { exercise: 'Burpees', time: '45s', rounds: '3' },
            { exercise: 'Prancha', time: '60s', rounds: '3' },
        ]
    },
];

const FrequencyHistoryPage = () => {
    const params = useParams();
    const studentId = parseInt(params.id as string, 10);
    const student = students.find(s => s.id === studentId);

    if (!student) {
        return <div className="p-8">Aluno não encontrado.</div>;
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
                    <AvatarImage src={student.avatar} alt={student.name}/>
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
                    <p className="text-muted-foreground">Histórico de Frequência</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Todos os Agendamentos</CardTitle>
                    <CardDescription>Clique em um item para ver os detalhes do treino.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {frequencyHistory.map((item, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-4">
                                        {item.status === 'Realizado' 
                                            ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                            : <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                                        }
                                        <div>
                                            <p className="font-semibold">{format(parseISO(item.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                                            <p className="text-sm text-muted-foreground">{item.name}</p>
                                        </div>
                                    </div>
                                    <Badge variant={item.status === "Realizado" ? "default" : "destructive"} className={cn('ml-auto', item.status === "Realizado" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-500/20")}>
                                        {item.status}
                                    </Badge>
                                </AccordionTrigger>
                                <AccordionContent className="pl-12">
                                    {item.status === 'Falta' ? (
                                        <p className="text-muted-foreground">Treino não realizado.</p>
                                    ) : (
                                        <div className="border-l pl-4 py-2">
                                            <h4 className="font-semibold mb-2">Detalhes do Treino</h4>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Exercício</TableHead>
                                                        {item.type === 'Musculação' && <>
                                                            <TableHead>Séries</TableHead>
                                                            <TableHead>Reps</TableHead>
                                                            <TableHead>Carga</TableHead>
                                                        </>}
                                                        {item.type === 'Cardio' && <>
                                                            <TableHead>Tempo</TableHead>
                                                            <TableHead>Distância</TableHead>
                                                            <TableHead>Intensidade</TableHead>
                                                        </>}
                                                        {item.type === 'Funcional' && <>
                                                            <TableHead>Rounds</TableHead>
                                                            <TableHead>Tempo/Reps</TableHead>
                                                        </>}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {item.details.map((detail, detailIndex) => (
                                                        <TableRow key={detailIndex}>
                                                            <TableCell className="font-medium">{(detail as any).exercise}</TableCell>
                                                            {item.type === 'Musculação' && <>
                                                                <TableCell>{(detail as any).sets}</TableCell>
                                                                <TableCell>{(detail as any).reps}</TableCell>
                                                                <TableCell>{(detail as any).load}</TableCell>
                                                            </>}
                                                            {item.type === 'Cardio' && <>
                                                                <TableCell>{(detail as any).time}</TableCell>
                                                                <TableCell>{(detail as any).distance}</TableCell>
                                                                <TableCell>{(detail as any).intensity}</TableCell>
                                                            </>}
                                                            {item.type === 'Funcional' && <>
                                                                <TableCell>{(detail as any).rounds}</TableCell>
                                                                <TableCell>{(detail as any).time}</TableCell>
                                                            </>}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
};

export default FrequencyHistoryPage;
