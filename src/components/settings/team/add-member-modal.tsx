'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UserPlus } from 'lucide-react';
import { createTeamMemberAction } from '@/actions/team';

const formSchema = z.object({
    fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    role: z.enum(['ADMIN', 'INSTRUCTOR', 'STAFF', 'OWNER', 'MANAGER']),
    hasSystemAccess: z.boolean().default(true),
});

interface AddMemberModalProps {
    organizationId: string;
}

export function AddMemberModal({ organizationId }: AddMemberModalProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            role: 'STAFF',
            hasSystemAccess: true,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const result = await createTeamMemberAction({
                ...values,
                organizationId,
            });

            if (result.success) {
                toast({
                    title: 'Sucesso',
                    description: 'Membro da equipe criado com sucesso!',
                });
                setOpen(false);
                form.reset();
            } else {
                toast({
                    title: 'Erro',
                    description: result.error || 'Erro ao criar membro da equipe',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Ocorreu um erro inesperado',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Adicionar Membro
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Membro da Equipe</DialogTitle>
                    <DialogDescription>
                        Adicione um novo colaborador à sua organização. Eles receberão um convite por email.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: João Silva" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Profissional</FormLabel>
                                    <FormControl>
                                        <Input placeholder="joao@exemplo.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha Inicial</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Min. 6 caracteres" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cargo / Perfil</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um cargo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Administrador</SelectItem>
                                            <SelectItem value="INSTRUCTOR">Instrutor</SelectItem>
                                            <SelectItem value="STAFF">Staff / Recepção</SelectItem>
                                            <SelectItem value="MANAGER">Gerente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hasSystemAccess"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Acesso ao Sistema</FormLabel>
                                        <FormDescription>
                                            Permitir que o usuário faça login no BeeGym.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Salvar Membro'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
