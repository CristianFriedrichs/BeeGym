'use client';

import {
  Card,
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
import { getClients, Client } from '@/services/supabase/clients';

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Mock Unit ID for now - in a real app this would come from Auth Context
  const currentUnitId = "unit-1";

  useEffect(() => {
    async function fetchClients() {
      setIsLoading(true);
      try {
        // Fetch clients for the current unit (mocked ID for now until Auth is ready)
        // Pass searchTerm to the service to let Supabase handle filtering if desired,
        // or filter locally. The service supports server-side search.
        const data = await getClients(undefined, searchTerm); // undefined unitId to fetch all for now or currentUnitId
        setClients(data);
      } catch (error) {
        console.error("Failed to fetch clients", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Debounce search could be added here
    const timer = setTimeout(() => {
      fetchClients();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewDetails = (clientId: string) => {
    router.push(`/dashboard/clients/${clientId}`);
  };

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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhum aluno encontrado.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow
                  key={client.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(client.id)}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      {client.avatar ? (
                        <Image
                          src={client.avatar}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          alt={client.name}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}

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
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${client.status === 'Ativo'
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

