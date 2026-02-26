'use client';
import type { ReactNode } from "react";
import { Sidebar } from "@/components/painel/sidebar";
import { Header } from "@/components/painel/header";
import { BottomBar } from "@/components/painel/bottom-bar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UnitProvider } from "@/context/UnitContext";
import { StatusAutomator } from "@/components/global/status-automator";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isConversationsPage = pathname.startsWith('/conversas');
  const isCalendarPage = pathname.startsWith('/agenda');
  const isSettingsPage = pathname.startsWith('/configuracoes');
  const isStudentProfilePage = pathname.startsWith('/alunos/') && pathname !== '/alunos';

  return (
    <UnitProvider>
      <StatusAutomator />
      <div className="flex h-[100dvh] w-full bg-background-light dark:bg-background-dark overflow-hidden">
        <Sidebar className="flex-shrink-0" />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header className="flex-shrink-0" />
          <main className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto overflow-x-hidden pb-20 md:pb-6 relative">
            {children}
          </main>
          <BottomBar />
        </div>
      </div>
    </UnitProvider>
  );
}
