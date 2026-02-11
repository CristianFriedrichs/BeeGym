'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Loader2 } from 'lucide-react';
import { updateTeamMemberAction } from '@/actions/team';
import { getRolesAction } from '@/actions/roles';
import type { AppRole } from '@/types/permissions';

const formSchema = z.object({
    fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    jobTitle: z.string().optional(),
    isInstructor: z.boolean().default(false),
    roleId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditMemberModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: any | null;
    organizationId: string;
}

export function EditMemberModal({ open, onOpenChange, member, organizationId }: EditMemberModalProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState<AppRole[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            jobTitle: '',
            isInstructor: false,
            roleId: '',
        },
    });

    useEffect(() => {
        if (member && open) {
            form.reset({
                fullName: member.full_name || member.name || '',
                jobTitle: member.job_title || '',
                isInstructor: member.is_instructor || false,
                roleId: member.role_id || '',
            });

            getRolesAction().then((result) => {
                if (result.success && result.data) {
                    setRoles(result.data as AppRole[]);
                }
            });
        }
    }, [member, open, form]);

    async function onSubmit(values: FormValues) {
        if (!member) return;
        setIsSubmitting(true);
        try {
            const result = await updateTeamMemberAction({
                profileId: member.id,
                fullName: values.fullName,
                jobTitle: values.jobTitle,
                isInstructor: values.isInstructor,
                roleId: values.roleId || undefined,
                organizationId,
            });

            if (result.success) {
                toast({ title: 'Sucesso', description: 'Membro atualizado com sucesso!' });

                onOpenChange(false);

                setTimeout(() => {
                    router.refresh();
                }, 300);
            } else {
                toast({ title: 'Erro', description: result.error, variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Erro', description: 'Ocorreu um erro inesperado', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] h-[85vh] flex flex-col p-0">
                <div className="px-6 pt-6">
                    <DialogHeader>
                        <DialogTitle>Editar Membro</DialogTitle>
                        <DialogDescription>
                            Atualize as informações de {member?.name || 'membro'}.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 overflow-y-auto px-6 space-y-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Completo</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="jobTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cargo / Título (Crachá)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Recepcionista, Personal Trainer" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Texto livre para identificação visual.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isInstructor"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Pode ministrar aulas?</FormLabel>
                                            <FormDescription className="text-xs">
                                                Habilitar como instrutor na agenda.
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

                            {member?.has_system_access && (
                                <FormField
                                    control={form.control}
                                    name="roleId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Perfil de Permissões</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione um perfil..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role.id} value={role.id}>
                                                            {role.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription className="text-xs">
                                                Define o que este membro pode acessar.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="px-6 pb-6 pt-4 border-t">
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        'Salvar Alterações'
                                    )}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
