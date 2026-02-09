'use client';

import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  MessageSquare,
  Dumbbell,
  ClipboardList,
  Settings,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BeeGymLogo } from '@/components/ui/beegym-logo';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Agenda', href: '/dashboard/calendar' },
  { icon: ClipboardList, label: 'Aulas', href: '/dashboard/classes' },
  { icon: Users, label: 'Alunos', href: '/dashboard/clients' },
  { icon: MessageSquare, label: 'Conversas', href: '/dashboard/conversations' },
  { icon: CreditCard, label: 'Pagamentos', href: '/dashboard/payments' },
  { icon: Dumbbell, label: 'Exercícios', href: '/dashboard/workouts/library' },
  { icon: BarChart3, label: 'Relatórios', href: '/dashboard/reports' },
  { icon: Users, label: 'Equipe', href: '/dashboard/settings/team' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 border-r bg-card flex-col">
      <div className="p-6">
        <Link href="/dashboard">
          <BeeGymLogo size="md" variant="light" />
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
