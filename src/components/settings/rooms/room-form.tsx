'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const roomSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    unit_id: z.string().uuid('Selecione uma unidade válida'),
    capacity: z.coerce.number().min(1, 'Capacidade deve ser de pelo menos 1 pessoa'),
    description: z.string().optional().or(z.literal('')),
});

export type RoomFormValues = z.infer<typeof roomSchema>;

interface RoomFormProps {
    initialData?: any;
    units: Array<{ id: string; name: string }>;
    onSubmit: (values: RoomFormValues) => void;
    isLoading?: boolean;
}

export function RoomForm({ initialData, units, onSubmit, isLoading }: RoomFormProps) {
    const form = useForm<RoomFormValues>({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            name: initialData?.name || '',
            unit_id: initialData?.unit_id || '',
            capacity: initialData?.capacity || 10,
            description: initialData?.description || '',
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome da Sala</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Sala de Bike Indoor" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="unit_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unidade</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a unidade" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {units.map((unit) => (
                                        <SelectItem key={unit.id} value={unit.id}>
                                            {unit.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Unidade à qual esta sala pertence.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Capacidade Máxima</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Ex: 15"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Número máximo de alunos permitidos simultaneamente.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição (Opcional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Descreva os equipamentos ou características desta sala..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                        {isLoading ? 'Salvando...' : 'Salvar Sala'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
