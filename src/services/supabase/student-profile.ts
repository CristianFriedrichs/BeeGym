import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/services/logger";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
export type StudentProfileData = {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'OVERDUE';
    objective: string | null;
    created_at: string;
    unit_id: string;
    organization_id: string;
    plan: {
        id: string;
        name: string;
        color: string;
        price: number;
    } | null;
    unit: {
        id: string;
        name: string;
    } | null;
    latest_assessment: {
        height: number | null;
        weight: number | null;
    } | null;
};

export type EvolutionMetric = 'weight' | 'bmi' | 'body_fat' | 'muscle_mass';

export type EvolutionDataPoint = {
    date: string;
    value: number;
};

export type FrequencyEvent = {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
    event_type: 'CLASS' | 'TRAINING';
    class_template?: {
        name: string;
    };
};

export type PaymentInvoice = {
    id: string;
    amount: number;
    due_date: string;
    status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
    payment_date: string | null;
};

export type ActiveWorkout = {
    id: string;
    name: string;
    created_at: string;
    schedule_type: 'RECURRING' | 'ONE_TIME';
    next_occurrence: string | null;
};

/**
 * Busca dados completos do perfil do aluno
 */
export async function getStudentProfile(studentId: string): Promise<StudentProfileData | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('students')
        .select(`
      id,
      full_name,
      status,
      created_at,
      organization_id
    `)
        .eq('id', studentId)
        .single();

    if (error || !data) {
        console.error('Error fetching student profile:', error);
        return null;
    }

    // Get latest physical assessment
    const { data: assessmentData } = await supabase
        .from('physical_assessments')
        .select('height, weight')
        .eq('student_id', studentId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    return {
        id: data.id,
        full_name: data.full_name,
        email: null,
        phone: null,
        avatar_url: null,
        status: data.status as 'ACTIVE' | 'INACTIVE' | 'OVERDUE',
        objective: null,
        created_at: data.created_at || new Date().toISOString(),
        unit_id: '',
        organization_id: data.organization_id || '',
        plan: null,
        unit: null,
        latest_assessment: assessmentData ? {
            height: assessmentData.height,
            weight: assessmentData.weight,
        } : null,
    };
}

/**
 * Busca evolução de métricas do aluno (últimos 5 registros)
 */
export async function getStudentEvolution(
    studentId: string,
    metric: EvolutionMetric = 'weight'
): Promise<EvolutionDataPoint[]> {
    const supabase = createClient();

    const columnMap: Record<EvolutionMetric, string> = {
        weight: 'weight',
        bmi: 'bmi',
        body_fat: 'body_fat',
        muscle_mass: 'muscle_mass', // Note: Check if these columns exist in DB
    };

    const column = columnMap[metric];

    const { data, error } = await supabase
        .from('physical_assessments')
        .select(`recorded_at, ${column}`)
        .eq('student_id', studentId)
        .order('recorded_at', { ascending: true })
        .limit(5);

    if (error || !data) {
        console.error('Error fetching student evolution:', error);
        return [];
    }

    return (data as any[])
        .filter((item) => item[column] !== null)
        .map((item) => ({
            date: item.recorded_at ? format(new Date(item.recorded_at), 'dd/MM', { locale: ptBR }) : '',
            value: item[column],
        }));
}

/**
 * Busca frequência do aluno (últimos 5 eventos)
 */
export async function getStudentFrequency(studentId: string): Promise<FrequencyEvent[]> {
    const supabase = createClient();

    // Note: This query uses attendance_logs!inner to filter by student frequency
    const { data, error } = await supabase
        .from('calendar_events')
        .select(`
      id,
      start_datetime,
      end_datetime,
      status,
      type,
      class_templates (
        title
      ),
      attendance_logs!inner (
        student_id
      )
    `)
        .eq('attendance_logs.student_id', studentId)
        .order('start_datetime', { ascending: false })
        .limit(5);

    if (error || !data) {
        console.error('Error fetching student frequency:', error);
        return [];
    }

    return (data as any[]).map((event) => ({
        id: event.id,
        date: event.start_datetime ? format(new Date(event.start_datetime), 'yyyy-MM-dd') : '',
        start_time: event.start_datetime ? format(new Date(event.start_datetime), 'HH:mm') : '',
        end_time: event.end_datetime ? format(new Date(event.end_datetime), 'HH:mm') : '',
        status: event.status as any,
        event_type: event.type === 'CLASS' ? 'CLASS' : 'TRAINING',
        class_template: event.class_templates ? {
            name: event.class_templates.title,
        } : undefined,
    }));
}

/**
 * Busca últimos pagamentos do aluno (últimas 3 faturas)
 */
export async function getStudentPayments(studentId: string): Promise<PaymentInvoice[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('invoices')
        .select('id, amount, due_date, status, paid_at')
        .eq('student_id', studentId)
        .order('due_date', { ascending: false })
        .limit(3);

    if (error || !data) {
        console.error('Error fetching student payments:', error);
        return [];
    }

    return (data as any[]).map(invoice => ({
        id: invoice.id,
        amount: invoice.amount,
        due_date: invoice.due_date,
        status: invoice.status as any,
        payment_date: invoice.paid_at,
    }));
}

/**
 * Busca treinos ativos do aluno
 */
export async function getStudentActiveWorkouts(studentId: string): Promise<ActiveWorkout[]> {
    // Note: Table 'workouts' currently does not exist in the database.
    // Returning empty array to prevent build errors until schema is updated.
    return [];
}

/**
 * Atualiza o status do aluno (ativar/inativar)
 */
export async function updateStudentStatus(
    studentId: string,
    status: 'ACTIVE' | 'INACTIVE',
    reason?: string
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('students')
        .update({ status: status as any })
        .eq('id', studentId);

    if (error) {
        console.error('Error updating student status:', error);
        return false;
    }

    // Optionally log the reason for inactivation
    if (status === 'INACTIVE' && reason) {
        await logActivity({
            action: 'UPDATE',
            resource: 'students',
            details: `Inativou o aluno (ID: ${studentId}). Motivo: ${reason}`,
            metadata: { student_id: studentId, reason },
        });
    }

    return true;
}
