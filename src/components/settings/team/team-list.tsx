'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { MoreHorizontal, Mail, Shield, UserCog, Ban, CheckCircle2 } from 'lucide-react';
import { AddMemberModal } from '@/components/settings/team/add-member-modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface TeamListProps {
    initialUsers: any[];
    currentOrgId: string;
}

export function TeamList({ initialUsers, currentOrgId }: TeamListProps) {
    const { toast } = useToast();
    const [users, setUsers] = useState<any[]>(initialUsers);
    const supabase = createClient();

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('users')
            .update({ active: !currentStatus })
            .eq('id', userId);

        if (error) {
            toast({
                title: 'Erro',
                description: 'Erro ao atualizar status do usuário',
                variant: 'destructive',
            });
        } else {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !currentStatus } : u));
            toast({
                title: 'Sucesso',
                description: 'Status atualizado com sucesso',
            });
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'OWNER':
                return <Badge variant="destructive">Proprietário</Badge>;
            case 'ADMIN':
                return <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">Admin</Badge>;
            case 'INSTRUCTOR':
                return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">Instrutor</Badge>;
            case 'MANAGER':
                return <Badge variant="outline" className="border-orange-500 text-orange-500">Gerente</Badge>;
            default:
                return <Badge variant="secondary">Equipe</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#00173F]">Equipe</h2>
                    <p className="text-muted-foreground">Gerencie os membros da sua equipe e suas permissões de acesso.</p>
                </div>
                {currentOrgId && <AddMemberModal organizationId={currentOrgId} />}
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Membros da Organização</CardTitle>
                    <CardDescription>
                        Lista de todos os usuários com acesso ao sistema nesta unidade.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Membro</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        Nenhum membro encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={member.avatar_url || ''} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                        {member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm text-[#00173F]">{member.name}</span>
                                                    <span className="text-xs text-muted-foreground">{member.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getRoleBadge(member.role)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={member.active}
                                                    onCheckedChange={() => toggleUserStatus(member.id, member.active)}
                                                />
                                                <span className="text-xs font-medium">
                                                    {member.active ? (
                                                        <span className="text-green-600 flex items-center gap-1">
                                                            <CheckCircle2 className="h-3 w-3" /> Ativo
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                            <Ban className="h-3 w-3" /> Inativo
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem className="gap-2">
                                                        <UserCog className="h-4 w-4" /> Editar Perfil
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2">
                                                        <Mail className="h-4 w-4" /> Enviar Convite
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {member.active ? (
                                                        <DropdownMenuItem
                                                            className="text-destructive gap-2"
                                                            onClick={() => toggleUserStatus(member.id, member.active)}
                                                        >
                                                            <Ban className="h-4 w-4" /> Desativar Membro
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            className="text-green-600 gap-2"
                                                            onClick={() => toggleUserStatus(member.id, member.active)}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" /> Reativar Membro
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
