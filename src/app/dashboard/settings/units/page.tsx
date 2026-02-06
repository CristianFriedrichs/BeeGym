'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Construction } from 'lucide-react';

export default function UnitsPage() {
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
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Construction className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">Funcionalidade em Desenvolvimento</h3>
                        <p className="text-sm text-muted-foreground mt-2 max-w-md">
                            Em breve você poderá adicionar novas unidades, definir endereços e configurar cada filial.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
