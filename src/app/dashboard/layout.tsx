'use client';
import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { BottomBar } from "@/components/dashboard/bottom-bar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";





export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isConversationsPage = pathname.startsWith('/dashboard/conversations');
  const isSettingsPage = pathname.startsWith('/dashboard/settings');


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
          {children}
        </main>
        <BottomBar />
      </div>
    </div>
  );
}
