'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    User,
    Bell,
    Settings,
    Users,
    GraduationCap,
    Building2,
    CreditCard,
    CalendarDays,
    DoorOpen,
    Dumbbell,
    Activity,
    Wallet,
    MessageSquare,
    BarChart3,
    ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuSections = [
    {
        title: 'CONFIGURAÇÕES DO NEGÓCIO',
        items: [
            { label: 'Geral', href: '/dashboard/settings/general', icon: Settings },
            { label: 'Usuários e Perfis', href: '/dashboard/settings/users', icon: Users },
            { label: 'Instrutores', href: '/dashboard/settings/instructors', icon: GraduationCap },
            { label: 'Unidades', href: '/dashboard/settings/units', icon: Building2 },
            { label: 'Planos', href: '/dashboard/settings/plans', icon: CreditCard },
            { label: 'Aulas', href: '/dashboard/settings/classes', icon: CalendarDays },
            { label: 'Salas', href: '/dashboard/settings/rooms', icon: DoorOpen },
            { label: 'Treinos', href: '/dashboard/settings/workouts', icon: Dumbbell },
            { label: 'Frequência', href: '/dashboard/settings/attendance', icon: Activity },
            { label: 'Pagamentos', href: '/dashboard/settings/payments', icon: Wallet },
            { label: 'Conversas', href: '/dashboard/settings/chat-settings', icon: MessageSquare },
            { label: 'Relatórios', href: '/dashboard/settings/reports-settings', icon: BarChart3 },
            { label: 'Logs do Sistema', href: '/dashboard/settings/logs', icon: ScrollText },
        ],
    },
];

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#00173F]">Configurações</h2>
                <p className="text-muted-foreground">Gerencie as preferências da sua conta e do aplicativo.</p>
            </div>

            {/* Main Content with Sidebar */}
            <div className="flex gap-0">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 border-r bg-background pr-6">
                    <nav className="space-y-6">
                        {menuSections.map((section) => (
                            <div key={section.title}>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                    {section.title}
                                </h3>
                                <ul className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        const Icon = item.icon;
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                                        isActive
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    )}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {item.label}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="flex-1 pl-8 min-h-[calc(100vh-theme(spacing.40))]">
                    {children}
                </main>
            </div>
        </div>
    );
}
