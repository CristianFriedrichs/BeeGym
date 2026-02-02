'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, CalendarIcon, Upload, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { students } from '../page';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const editStudentSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  cpf: z.string().length(14, 'CPF inválido.'),
  birthDate: z.date({
    required_error: "A date of birth is required.",
  }),
  sex: z.string().optional(),
  email: z.string().email('Por favor, insira um email válido.'),
  phone: z.string().min(10, 'Telefone inválido.'),
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatório'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatório'),
    state: z.string().min(1, 'Estado é obrigatório'),
    zip: z.string().min(8, 'CEP inválido'),
  }),
  objetivo: z.string().optional(),
  goals: z.string().optional(),
  restrictions: z.string().optional(),
  notes: z.string().optional(),
  primaryUnitId: z.string().min(1, 'A unidade é obrigatória'),
});

type EditStudentFormValues = z.infer<typeof editStudentSchema>;


const EditClientPage = () => {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const studentId = parseInt(params.id as string, 10);
    const student = students.find(s => s.id === studentId);
    
    const [units, setUnits] = useState<any[]>([]);

    useEffect(() => {
        const storedUnits = localStorage.getItem('units_data');
        if (storedUnits) {
            setUnits(JSON.parse(storedUnits));
        }
    }, []);

    const form = useForm<EditStudentFormValues>({
        resolver: zodResolver(editStudentSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            cpf: '',
            email: '',
            phone: '',
            sex: '',
            address: {
                street: '',
                number: '',
                complement: '',
                neighborhood: '',
                city: '',
                state: '',
                zip: '',
            },
            objetivo: '',
            goals: '',
            restrictions: '',
            notes: '',
            primaryUnitId: '',
        }
    });

    useEffect(() => {
        if (student) {
            const addressParts = student.address.split(',').map(s => s.trim());
            const [street, number, neighborhood, cityAndState] = addressParts;
            const [city, state, zip] = cityAndState ? cityAndState.match(/(.+)\s([A-Z]{2})\s(\d{5}-\d{3})/)?.slice(1) || [cityAndState, '',''] : ['','',''];


            form.reset({
                name: student.name || '',
                email: student.email || '',
                phone: student.phone || '',
                cpf: student.cpf || '',
                birthDate: student.birthDate ? new Date(student.birthDate) : undefined,
                sex: student.sex || '',
                address: {
                    street: street || '',
                    number: number || '',
                    complement: '',
                    neighborhood: neighborhood || '',
                    city: city || '',
                    state: state || '',
                    zip: zip || '',
                },
                objetivo: student.objetivo || '',
                goals: student.goals || '',
                restrictions: student.restrictions || '',
                notes: student.notes || '',
                primaryUnitId: student.primaryUnitId || '',
            });
        }
    }, [student, form]);


    const onSubmit = (data: EditStudentFormValues) => {
        console.log(data);
        toast({
            title: 'Aluno atualizado com sucesso!',
            description: `Os dados de ${data.name} foram salvos.`,
        });
        // In a real app, you would save this data.
        router.push(`/dashboard/clients/${studentId}`);
    };

    if (!student) {
        return <div className="p-8">Aluno não encontrado.</div>;
    }

    return (
        <FormProvider {...form}>
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
                        <p className="text-muted-foreground">Editando perfil do aluno</p>
                    </div>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Dados Pessoais e Vínculo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={student.avatar} alt={student.name} />
                                    <AvatarFallback>{student.name?.substring(0, 2).toUpperCase() || 'AV'}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-2">
                                    <Button variant="outline" type="button">
                                        <Upload className="mr-2 h-4 w-4"/>
                                        Alterar Foto
                                    </Button>
                                    <p className="text-xs text-muted-foreground">JPG, GIF ou PNG. Máx 800KB.</p>
                                </div>
                            </div>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Nome Completo *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField
                                    control={form.control}
                                    name="cpf"
                                    render={({ field }) => (
                                        <FormItem><FormLabel>CPF *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="birthDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col"><FormLabel>Data de Nascimento *</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                    variant={"outline"}
                                                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                    >
                                                    {field.value ? format(new Date(field.value), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                    initialFocus
                                                />
                                                </PopoverContent>
                                            </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <FormField
                                control={form.control}
                                name="sex"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sexo</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Feminino">Feminino</SelectItem>
                                                <SelectItem value="Masculino">Masculino</SelectItem>
                                                <SelectItem value="Outro">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={form.control}
                                name="primaryUnitId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unidade Principal *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} >
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Selecione a unidade principal" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {units.map(unit => (
                                            <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Contato</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem><FormLabel>E-mail *</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem><FormLabel>Telefone (WhatsApp) *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Endereço</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                                <div className="sm:col-span-4">
                                    <FormField control={form.control} name="address.street" render={({ field }) => (<FormItem><FormLabel>Rua *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <div className="sm:col-span-2">
                                    <FormField control={form.control} name="address.number" render={({ field }) => (<FormItem><FormLabel>Número *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                            <FormField control={form.control} name="address.complement" render={({ field }) => (<FormItem><FormLabel>Complemento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="address.neighborhood" render={({ field }) => (<FormItem><FormLabel>Bairro *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="address.city" render={({ field }) => (<FormItem><FormLabel>Cidade *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="address.state" render={({ field }) => (<FormItem><FormLabel>Estado *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="address.zip" render={({ field }) => (<FormItem><FormLabel>CEP *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader><CardTitle>Objetivos e Condições</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="objetivo" render={({ field }) => (<FormItem><FormLabel>Objetivo Principal</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="goals" render={({ field }) => (<FormItem><FormLabel>Objetivos Secundários</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="restrictions" render={({ field }) => (<FormItem><FormLabel>Limitações Físicas e Médicas</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Observações do Profissional</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="ghost" type="button" onClick={() => router.back()}>Cancelar</Button>
                        <Button type="submit">Salvar Alterações</Button>
                    </div>
                </form>
            </div>
        </FormProvider>
    );
};

export default EditClientPage;

    