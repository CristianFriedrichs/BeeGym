'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getClients, Client } from '@/services/supabase/clients';
import { cn } from '@/lib/utils';

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchClients() {
      setIsLoading(true);
      try {
        const data = await getClients();
        setClients(data);
      } catch (error) {
        console.error("Failed to fetch clients", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const lowerSearch = searchTerm.toLowerCase();
    return clients.filter(client =>
      client.name.toLowerCase().includes(lowerSearch) ||
      client.email.toLowerCase().includes(lowerSearch)
    );
  }, [clients, searchTerm]);

  const handleViewDetails = (clientId: string) => {
    router.push(`/dashboard/clients/${clientId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#1A1C1E]">Alunos</h1>
          <p className="text-[#64748B] text-sm mt-1">
            Gerenciamento de alunos e matrículas
          </p>
        </div>
        <Button
          asChild
          className="bg-[#FF8800] hover:bg-[#E67A00] text-white font-bold px-6 py-6 rounded-xl transition-all shadow-lg shadow-orange-500/20"
        >
          <Link href="/dashboard/clients/new">
            <Plus className="h-5 w-5 mr-2 stroke-[3px]" /> Novo Aluno
          </Link>
        </Button>
      </div>

      <Card className="shadow-soft rounded-[24px] overflow-hidden border-[#F1F5F9] border-2 bg-white px-2">
        {/* Search Bar Area */}
        <div className="p-6">
          <div className="relative max-w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Buscar aluno..."
              className="pl-12 bg-[#F8F9FA] border-none h-12 rounded-2xl text-md focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Area */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-[#64748B] font-medium h-12">Aluno</TableHead>
              <TableHead className="text-[#64748B] font-medium h-12">Objetivo</TableHead>
              <TableHead className="text-[#64748B] font-medium h-12">Plano</TableHead>
              <TableHead className="text-[#64748B] font-medium h-12">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    Carregando alunos...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Nenhum aluno encontrado para sua busca.
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="hover:bg-[#F8F9FA] transition-all cursor-pointer border-b border-[#F1F5F9] group h-[72px]"
                  onClick={() => handleViewDetails(client.id)}
                >
                  <TableCell className="py-2">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                        <AvatarImage src={client.avatar || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {client.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col">
                        <span className="font-bold text-[#1A1C1E] group-hover:text-primary transition-colors">
                          {client.name}
                        </span>
                        <span className="text-xs text-[#64748B]">
                          {client.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-[#1A1C1E] font-medium">
                    {client.objetivo}
                  </TableCell>

                  <TableCell className="text-[#1A1C1E] font-medium">
                    {client.plan}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-full px-4 py-1.5 text-[10px] font-black uppercase border-none shadow-none",
                        client.status === 'active'
                          ? "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]"
                          : client.status === 'overdue'
                            ? "bg-[#FFEBEE] text-[#D32F2F] hover:bg-[#FFEBEE]"
                            : "bg-[#F5F5F5] text-[#757575] hover:bg-[#F5F5F5]"
                      )}
                    >
                      {client.status === 'active' ? 'ATIVO' : client.status === 'overdue' ? 'INADIMPLENTE' : 'INATIVO'}
                    </Badge>
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

