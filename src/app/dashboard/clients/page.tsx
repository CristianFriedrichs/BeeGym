'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const initialClients = [
  {
    id: 1,
    name: 'Milos Vasiljevic',
    email: 'milos@example.com',
    objetivo: 'Hipertrofia',
    plan: 'Gold Plan',
    status: 'Ativo',
    avatar: 'https://i.pravatar.cc/150?img=13',
    primaryUnitId: 'unit-1',
  },
  {
    id: 2,
    name: 'Jovana Pavlovic',
    email: 'jovana@example.com',
    objetivo: 'Emagrecimento',
    plan: 'Silver Plan',
    status: 'Inadimplente',
    avatar: 'https://i.pravatar.cc/150?img=16',
    primaryUnitId: 'unit-1',
  },
  {
    id: 3,
    name: 'Nikola Vujinovic',
    email: 'nikola@example.com',
    objetivo: 'Qualidade de Vida',
    plan: 'Gold Plan',
    status: 'Pendente',
    avatar: 'https://i.pravatar.cc/150?img=15',
    primaryUnitId: 'unit-2',
  },
  {
    id: 4,
    name: 'Ana Clara',
    email: 'anaclara@example.com',
    objetivo: 'Definição Muscular',
    plan: 'Plano Pro',
    status: 'Ativo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop',
    primaryUnitId: 'unit-1',
  },
];

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState(initialClients);
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedClients = localStorage.getItem('students_data');
    if (storedClients) {
      setClients(JSON.parse(storedClients));
    }
    const unitId = localStorage.getItem('currentUnitId');
    setCurrentUnitId(unitId);
  }, []);

  const handleViewDetails = (clientId: number) => {
    router.push(`/dashboard/clients/${clientId}`);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.primaryUnitId === currentUnitId &&
      (client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground">
            Gerenciamento de alunos e matrículas
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/new">
            <Plus className="h-4 w-4 mr-2" /> Novo Aluno
          </Link>
        </Button>
      </div>

      <Card className="shadow-soft rounded-2xl overflow-hidden border-gray-100 dark:border-gray-800">
        <div className="p-6 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar aluno..."
              className="pl-10 bg-gray-50 dark:bg-gray-800/50 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/20">
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Objetivo</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow
                key={client.id}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                onClick={() => handleViewDetails(client.id)}
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={client.avatar}
                      width={40}
                      height={40}
                      className="rounded-full"
                      alt={client.name}
                    />
                    <div>
                      <p className="font-bold">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {client.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{client.objetivo}</TableCell>
                <TableCell>{client.plan}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      client.status === 'Ativo'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : client.status === 'Inadimplente'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {client.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
             {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum aluno encontrado para esta unidade.
                  </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

    