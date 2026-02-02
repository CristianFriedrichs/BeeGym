'use client';
import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { BottomBar } from "@/components/dashboard/bottom-bar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Building, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";


function NoUnitsPlaceholder() {
  // Assuming OWNER role for simplicity, otherwise this check should be more robust
  const userRole = 'OWNER'; 

  return (
    <div className="flex flex-1 h-full items-center justify-center p-4">
      <Card className="text-center p-8 shadow-soft border max-w-lg">
        <div className="mx-auto w-fit p-4 bg-primary/10 rounded-2xl">
          <Building className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-bold">Nenhuma unidade criada</h2>
        {userRole === 'OWNER' ? (
          <>
            <p className="mt-2 text-muted-foreground">
              Para começar a usar o sistema, você precisa cadastrar sua primeira unidade. Todos os alunos, aulas e dados financeiros serão organizados por unidade.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/settings">
                <Plus className="mr-2 h-4 w-4" /> Criar Primeira Unidade
              </Link>
            </Button>
          </>
        ) : (
          <p className="mt-2 text-muted-foreground">
            Sua organização ainda não possui unidades cadastradas. Por favor, entre em contato com o proprietário da conta para configurar a primeira unidade.
          </p>
        )}
      </Card>
    </div>
  )
}


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isConversationsPage = pathname.startsWith('/dashboard/conversations');
  const isSettingsPage = pathname.startsWith('/dashboard/settings');
  const [hasUnits, setHasUnits] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUnits = () => {
        // This check runs only on the client-side
        const storedUnits = JSON.parse(localStorage.getItem('units_data') || '[]');
        setHasUnits(storedUnits.length > 0);
    };
    checkUnits();

    // Listen for custom event when units are updated in settings
    window.addEventListener('storage-update', checkUnits);

    return () => {
        window.removeEventListener('storage-update', checkUnits);
    };
  }, []);

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className={cn(
          "flex-1 flex flex-col",
          isConversationsPage
            ? 'overflow-hidden' 
            : 'overflow-y-auto p-6 md:p-8 pb-24 md:pb-8'
        )}>
          {hasUnits === null ? (
            <div className="flex flex-1 items-center justify-center">
              <p>Carregando...</p>
            </div>
          ) : hasUnits || isSettingsPage ? children : <NoUnitsPlaceholder />}
        </main>
        <BottomBar />
      </div>
    </div>
  );
}
