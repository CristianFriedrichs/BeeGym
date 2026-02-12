'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, MapPin, User, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreateRecurringClassModal } from '@/components/dashboard/modals/create-recurring-class-modal';
import { createClient } from '@/lib/supabase/client';
import { getClassType } from '@/lib/class-definitions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface ClassEvent {
  id: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  type: string | null;
  status: string;
  instructor: {
    name: string;
  } | null;
  room: {
    name: string;
  } | null;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data: userData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (userData?.organization_id) {
        // Get start of today to show classes that happened earlier today as well
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
          .from('calendar_events')
          .select(`
                    id,
                    title,
                    start_datetime,
                    end_datetime,
                    type,
                    status,
                    instructor:instructors (name),
                    room:rooms (name)
                `)
          .eq('organization_id', userData.organization_id)
          .gte('start_datetime', today.toISOString())
          .order('start_datetime', { ascending: true });

        if (error) throw error;

        setClasses((data || []) as unknown as ClassEvent[]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: 'Erro ao carregar aulas',
        description: 'Não foi possível carregar a lista de aulas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    // TODO: Implement delete
    toast({
      title: 'Ainda não implementado',
      description: 'Função de deletar será implementada em breve.',
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aulas Agendadas</h1>
          <p className="text-muted-foreground">Próximas aulas coletivas do calendário</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Nova Aula
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Aulas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aula</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Instrutor</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Carregando aulas...
                  </TableCell>
                </TableRow>
              ) : classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma aula agendada encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => {
                  const classTypeData = getClassType(cls.type);
                  const Icon = classTypeData.icon;
                  const dateParams = { locale: ptBR };
                  const startDate = new Date(cls.start_datetime);

                  return (
                    <TableRow key={cls.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: classTypeData.color + '20' }}>
                            <Icon className="h-5 w-5" style={{ color: classTypeData.color }} />
                          </div>
                          <div>
                            <span className="font-medium block">{cls.title}</span>
                            <span className="text-xs text-muted-foreground">{classTypeData.label}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <div className="flex items-center gap-1 font-medium">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                            {format(startDate, "dd 'de' MMM", dateParams)}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(startDate, "HH:mm", dateParams)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {cls.instructor ? (
                            <>
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{cls.instructor.name || 'Instrutor'}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground text-sm italic">Sem instrutor</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {cls.room ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{cls.room.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">Local não definido</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cls.status === 'SCHEDULED' ? 'default' : cls.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                          {cls.status === 'SCHEDULED' ? 'Agendada' :
                            cls.status === 'CANCELLED' ? 'Cancelada' :
                              cls.status === 'COMPLETED' ? 'Realizada' : cls.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(cls.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal */}
      <CreateRecurringClassModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          fetchClasses();
        }}
      />
    </div>
  );
}
