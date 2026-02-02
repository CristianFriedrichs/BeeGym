'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RecurringClass, getIcon, classColorStyles } from '@/lib/class-definitions';

export default function ClassesPage() {
  const [classes, setClasses] = useState<RecurringClass[]>([]);

  useEffect(() => {
    const storedClasses = JSON.parse(localStorage.getItem('recurring_classes') || '[]');
    setClasses(storedClasses);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aulas</h1>
          <p className="text-muted-foreground">Gerenciamento de aulas coletivas</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/classes/new">
            <Plus className="h-4 w-4 mr-2" /> Nova Aula
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aulas Criadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aula</TableHead>
                <TableHead>Instrutor</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhuma aula criada.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => {
                  const Icon = getIcon(cls.icon);
                  const colorData = classColorStyles[cls.color as keyof typeof classColorStyles] || classColorStyles.primary;

                  return (
                    <TableRow key={cls.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorData.background}`}>
                            <Icon className={`h-6 w-6 ${colorData.text}`} />
                          </div>
                          <span className="font-medium">{cls.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{cls.instructor}</TableCell>
                      <TableCell>{cls.location}</TableCell>
                      <TableCell>
                        <Badge variant={cls.status === 'active' ? 'default' : 'destructive'}>
                          {cls.status === 'active' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
