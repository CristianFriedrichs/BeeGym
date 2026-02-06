'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save } from 'lucide-react';

// --- Zod Schema ---
const settingsSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    contact_email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    document: z.string().optional(),
    has_physical_location: z.boolean().default(true),
    address_zip: z.string().optional(),
    address_line1: z.string().optional(),
    address_number: z.string().optional(),
    address_neighborhood: z.string().optional(),
    address_city: z.string().optional(),
    address_state: z.string().optional(),
    opening_hours: z.record(z.object({
        open: z.boolean(),
        start: z.string(),
        end: z.string()
    })).optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const DAYS_OF_WEEK = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
];

const DEFAULT_HOURS = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.key] = { open: true, start: '08:00', end: '18:00' };
    return acc;
}, {} as any);

export default function GeneralSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [orgId, setOrgId] = useState<string | null>(null);
    const [businessType, setBusinessType] = useState<string>('personal');
    const { toast } = useToast();
    const supabase = createClient();

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            has_physical_location: true,
            opening_hours: DEFAULT_HOURS
        }
    });

    const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
    const hasLocation = watch('has_physical_location');
    const openingHours = watch('opening_hours') || DEFAULT_HOURS;

    const formatDocument = (value: string) => {
        value = value.replace(/\D/g, '');
        if (value.length <= 11) {
            return value.replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                .replace(/(-\d{2})\d+?$/, '$1');
        } else {
            return value.replace(/(\d{2})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2')
                .replace(/(-\d{2})\d+?$/, '$1');
        }
    };

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatDocument(e.target.value);
        setValue('document', formatted);
    };

    useEffect(() => {
        async function fetchSettings() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: userData } = await supabase
                    .from('users')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (!userData) return;
                setOrgId(userData.organization_id);

                const { data: org } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', userData.organization_id)
                    .single();

                if (org) {
                    setBusinessType(org.business_type || 'personal');
                    form.reset({
                        name: org.name || '',
                        contact_email: org.contact_email || user.email || '',
                        document: org.document || '',
                        has_physical_location: org.has_physical_location ?? true,
                        address_zip: org.address_zip || '',
                        address_line1: org.address_line1 || '',
                        address_number: org.address_number || '',
                        address_neighborhood: org.address_neighborhood || '',
                        address_city: org.address_city || '',
                        address_state: org.address_state || '',
                        opening_hours: (org.opening_hours as any) || DEFAULT_HOURS,
                    });
                }
            } catch (err) {
                console.error("Error loading settings", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const handleZipBlur = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawZip = e.target.value.replace(/\D/g, '');
        if (rawZip.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${rawZip}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setValue('address_line1', data.logradouro);
                    setValue('address_neighborhood', data.bairro);
                    setValue('address_city', data.localidade);
                    setValue('address_state', data.uf);
                }
            } catch (error) { }
        }
    };

    const onSubmit = async (data: SettingsFormValues) => {
        if (!orgId) return;
        setIsSaving(true);
        try {
            const updates = {
                name: data.name,
                contact_email: data.contact_email,
                document: data.document,
                has_physical_location: data.has_physical_location,
                address_line1: data.address_line1,
                address_number: data.address_number,
                address_neighborhood: data.address_neighborhood,
                address_city: data.address_city,
                address_state: data.address_state,
                address_zip: data.address_zip,
                opening_hours: data.opening_hours,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('organizations')
                .update(updates)
                .eq('id', orgId);

            if (error) throw error;

            toast({
                title: "Configurações Salvas",
                description: "As informações foram atualizadas com sucesso.",
                className: "bg-[#ff8c00] text-white border-none"
            });

            const { data: units } = await supabase.from('units').select('*').eq('organization_id', orgId);
            if (units && units.length === 1) {
                await supabase.from('units').update({ name: data.name }).eq('id', units[0].id);
                units[0].name = data.name;
                localStorage.setItem('units_data', JSON.stringify(units));
            }

            window.location.reload();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erro ao salvar",
                description: error.message || "Tente novamente mais tarde."
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-foreground">Configurações Gerais</h3>
                    <p className="text-sm text-muted-foreground">Dados do negócio, endereço e horários.</p>
                </div>
                <Button onClick={handleSubmit(onSubmit)} disabled={isSaving} className="bg-[#ff8c00] hover:bg-[#e67e00] text-white">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="general">Geral</TabsTrigger>
                    <TabsTrigger value="address">Endereço</TabsTrigger>
                    <TabsTrigger value="hours">Horários</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados do Negócio</CardTitle>
                            <CardDescription>Informações básicas sobre sua operação.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{businessType === 'personal' ? 'Nome Profissional' : 'Razão Social / Nome Fantasia'}</Label>
                                <Input id="name" {...register('name')} placeholder="Ex: BeeGym Academy" />
                                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_email">E-mail de Contato</Label>
                                    <Input id="contact_email" {...register('contact_email')} placeholder="contato@empresa.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="document">CPF / CNPJ</Label>
                                    <Input
                                        id="document"
                                        {...register('document')}
                                        onChange={(e) => {
                                            handleDocumentChange(e);
                                            register('document').onChange(e);
                                        }}
                                        placeholder="000.000.000-00"
                                        maxLength={18}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="address">
                    <Card>
                        <CardHeader>
                            <CardTitle>Localização</CardTitle>
                            <CardDescription>Onde seus alunos podem te encontrar.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2 pb-4">
                                <Checkbox
                                    id="has_physical_location"
                                    checked={!hasLocation}
                                    onCheckedChange={(checked) => setValue('has_physical_location', !checked)}
                                />
                                <Label htmlFor="has_physical_location">Não possuo local fixo</Label>
                            </div>
                            <div className={!hasLocation ? 'opacity-50 pointer-events-none space-y-4' : 'space-y-4'}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address_zip">CEP</Label>
                                        <Input id="address_zip" {...register('address_zip')} onBlur={handleZipBlur} placeholder="00000-000" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="address_line1">Logradouro</Label>
                                        <Input id="address_line1" {...register('address_line1')} placeholder="Rua, Avenida..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address_number">Número</Label>
                                        <Input id="address_number" {...register('address_number')} placeholder="123" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address_neighborhood">Bairro</Label>
                                        <Input id="address_neighborhood" {...register('address_neighborhood')} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="address_city">Cidade</Label>
                                            <Input id="address_city" {...register('address_city')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address_state">UF</Label>
                                            <Input id="address_state" {...register('address_state')} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hours">
                    <Card>
                        <CardHeader>
                            <CardTitle>Horários de Atendimento</CardTitle>
                            <CardDescription>Defina quando você costuma atender.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {DAYS_OF_WEEK.map((day) => (
                                <div key={day.key} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div className="flex items-center space-x-4 w-40">
                                        <Switch
                                            checked={openingHours[day.key]?.open}
                                            onCheckedChange={(checked) => {
                                                const newHours = { ...openingHours };
                                                if (!newHours[day.key]) newHours[day.key] = { open: checked, start: '08:00', end: '18:00' };
                                                else newHours[day.key].open = checked;
                                                setValue('opening_hours', newHours);
                                            }}
                                        />
                                        <Label className="font-medium">{day.label}</Label>
                                    </div>
                                    <div className={`flex items-center gap-2 ${!openingHours[day.key]?.open ? 'opacity-30 pointer-events-none' : ''}`}>
                                        <Input
                                            type="time"
                                            className="w-24"
                                            value={openingHours[day.key]?.start || '08:00'}
                                            onChange={(e) => {
                                                const newHours = { ...openingHours };
                                                newHours[day.key].start = e.target.value;
                                                setValue('opening_hours', newHours);
                                            }}
                                        />
                                        <span className="text-sm text-muted-foreground">até</span>
                                        <Input
                                            type="time"
                                            className="w-24"
                                            value={openingHours[day.key]?.end || '18:00'}
                                            onChange={(e) => {
                                                const newHours = { ...openingHours };
                                                newHours[day.key].end = e.target.value;
                                                setValue('opening_hours', newHours);
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
