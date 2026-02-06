
import { createClient } from "@/lib/supabase/client";
import { format, isToday, parseISO } from "date-fns";

export type KPI = {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    description: string;
    iconName: string; // We'll map this to Lucide icons in the UI
    iconBgColor: string;
    iconColor: string;
}

export type ScheduleItem = {
    time: string;
    name: string;
    type: string;
    trainer: string;
    capacity: string;
    status: string;
    statusColor: string;
    classType: 'individual' | 'group' | 'open';
    date: Date; // Added for correct sorting/filtering
}

export type Alert = {
    title: string;
    description: string;
    iconName: string;
    color: 'destructive' | 'yellow' | 'blue';
    action: string;
    href: string;
}

export async function getKPIs(unitId?: string): Promise<KPI[]> {
    const supabase = createClient();

    // If no unitId provided, try to get the first one for the user
    if (!unitId) {
        // This is a server-side or service call, so we rely on what's passed or try to infer.
        // For Dashboard, the client usually passes it. If not, we return empty or safe defaults.
        // Returning zeros/empty for now if no unitId to avoid invalid UUID.
    }

    // 1. Active Students
    let studentsQuery = supabase.from('students').select('id', { count: 'exact' }).eq('status', 'ACTIVE');
    if (unitId) studentsQuery = studentsQuery.eq('unit_id', unitId);
    const { count: activeStudents } = await studentsQuery;

    // 2. Scheduled Workouts / Events Today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let eventsQuery = supabase
        .from('calendar_events')
        .select('id', { count: 'exact' })
        .gte('start_datetime', startOfDay.toISOString())
        .lte('start_datetime', endOfDay.toISOString());

    if (unitId) eventsQuery = eventsQuery.eq('unit_id', unitId);
    const { count: eventsToday } = await eventsQuery;

    // Mocking Revenue and Payments as they depend on Plan Pricing which isn't in schema yet
    return [
        {
            title: 'Alunos Ativos',
            value: (activeStudents || 0).toString(),
            change: '+2', // Mocked change
            changeType: 'positive',
            description: 'total cadastrado',
            iconName: 'UserCheck',
            iconBgColor: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-500 dark:text-blue-400',
        },
        {
            title: 'Receita Mensal',
            value: 'R$ 12.5K', // Mocked
            change: '+8.2%',
            changeType: 'positive',
            description: 'estimado',
            iconName: 'BarChart3',
            iconBgColor: 'bg-primary/10',
            iconColor: 'text-primary',
        },
        {
            title: 'Pagamentos Pendentes',
            value: 'R$ 1.2K', // Mocked - will be replaced with real data
            change: '-5.4%',
            changeType: 'negative',
            description: 'em relação ao mês anterior',
            iconName: 'AlertTriangle',
            iconBgColor: 'bg-yellow-500/10',
            iconColor: 'text-yellow-500',
        },
        {
            title: 'Aulas Hoje',
            value: (eventsToday || 0).toString(),
            change: '0',
            changeType: 'neutral',
            description: 'agendadas',
            iconName: 'List',
            iconBgColor: 'bg-secondary',
            iconColor: 'text-secondary-foreground',
        }
    ];
}

import { QueryData } from '@supabase/supabase-js';

export async function getUpcomingClasses(unitId?: string): Promise<ScheduleItem[]> {
    const supabase = createClient();
    const now = new Date().toISOString();

    let query = supabase
        .from('calendar_events')
        .select(`
            id,
            start_datetime,
            status,
            class_templates (
                title,
                icon,
                color
            ),
            instructors (
                name
            ),
            rooms (
                capacity
            )
        `)
        .gte('start_datetime', now)
        .order('start_datetime', { ascending: true })
        .limit(10);

    // Only apply filter if unitId is a valid UUID string (simple validation)
    if (unitId && unitId.length > 10) {
        query = query.eq('unit_id', unitId);
    }

    type ClassesResponse = QueryData<typeof query>;

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching classes:", error);
        // Don't throw to avoid crashing whole dashboard, return empty with error log
        return [];
    }

    if (!data) return [];

    const events: ClassesResponse = data;

    return events.map((event) => {
        const date = new Date(event.start_datetime);
        const template = event.class_templates;
        const instructor = event.instructors;
        const room = event.rooms;

        return {
            time: format(date, 'HH:mm'),
            name: template ? template.title : 'Aula sem título',
            type: template ? template.title : 'Geral',
            trainer: instructor ? instructor.name : 'Instrutor',
            capacity: room ? `0/${room.capacity}` : 'Livre',
            status: event.status === 'PREVISTA' ? 'Em Breve' : event.status,
            statusColor: 'bg-secondary text-secondary-foreground', // detailed mapping could be added
            classType: 'group',
            date: date
        };
    });
}

export async function getAlerts(unitId?: string): Promise<Alert[]> {
    const supabase = createClient();

    // Example Alert: Inactive Students
    let query = supabase
        .from('students')
        .select(`id, full_name, status`)
        .eq('status', 'INACTIVE')
        .limit(3);

    if (unitId && unitId.length > 10) query = query.eq('unit_id', unitId);
    const { data: inactiveStudents } = await query;

    const alerts: Alert[] = [];

    if (inactiveStudents && inactiveStudents.length > 0) {
        alerts.push({
            title: 'Alunos Inativos',
            description: `${inactiveStudents.length} alunos estão marcados como inativos.`,
            iconName: 'UserX',
            color: 'yellow',
            action: 'Ver Lista',
            href: '/dashboard/clients'
        });
    }

    return alerts;
}
