import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UnitList } from '@/components/settings/units/unit-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default async function UnitsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get current user's organization from profiles (Source of Truth)
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!profile?.organization_id) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Erro: Usuário sem organização vinculada.
            </div>
        );
    }

    // Fetch units for this organization
    const { data: units } = await supabase
        .from('units')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('is_main', { ascending: false })
        .order('name');

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Unidades</CardTitle>
                            <CardDescription>Gerencie as unidades e filiais do seu negócio.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <UnitList
                        units={units as any[] || []}
                        organizationId={profile.organization_id}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
