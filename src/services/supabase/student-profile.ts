import { createClient } from "@/lib/supabase/client";
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
      email,
      phone,
      avatar_url,
      status,
      objective,
      created_at,
      unit_id,
      organization_id,
      student_plan_assignments!inner (
        plan_name,
        status,
        plans (
          id,
          name,
          color,
          price
        )
      ),
      units (
        id,
        name
      )
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
        .order('assessment_date', { ascending: false })
        .limit(1)
        .single();

    // Find active plan
    const activePlan = Array.isArray(data.student_plan_assignments)
        ? data.student_plan_assignments.find((assignment: any) => assignment.status === 'ACTIVE')
        : null;

    return {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        avatar_url: data.avatar_url,
        status: data.status as 'ACTIVE' | 'INACTIVE' | 'OVERDUE',
        objective: data.objective,
        created_at: data.created_at,
        unit_id: data.unit_id,
        organization_id: data.organization_id,
        plan: activePlan?.plans ? {
            id: activePlan.plans.id,
            name: activePlan.plans.name,
            color: activePlan.plans.color || '#888888',
            price: activePlan.plans.price,
        } : null,
        unit: data.units ? {
            id: data.units.id,
            name: data.units.name,
        } : null,
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
        body_fat: 'body_fat_percentage',
        muscle_mass: 'muscle_mass',
    };

    const column = columnMap[metric];

    const { data, error } = await supabase
        .from('physical_assessments')
        .select(`assessment_date, ${column}`)
        .eq('student_id', studentId)
        .order('assessment_date', { ascending: true })
        .limit(5);

    if (error || !data) {
        console.error('Error fetching student evolution:', error);
        return [];
    }

    return data
        .filter((item: any) => item[column] !== null)
        .map((item: any) => ({
            date: format(new Date(item.assessment_date), 'dd/MM', { locale: ptBR }),
            value: item[column],
        }));
}

/**
 * Busca frequência do aluno (últimos 5 eventos)
 */
export async function getStudentFrequency(studentId: string): Promise<FrequencyEvent[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('calendar_events')
        .select(`
      id,
      date,
      start_time,
      end_time,
      status,
      event_type,
      class_templates (
        name
      ),
      attendance_logs!inner (
        status
      )
    `)
        .eq('attendance_logs.student_id', studentId)
        .order('date', { ascending: false })
        .order('start_time', { ascending: false })
        .limit(5);

    if (error || !data) {
        console.error('Error fetching student frequency:', error);
        return [];
    }

    return data.map((event: any) => ({
        id: event.id,
        date: event.date,
        start_time: event.start_time,
        end_time: event.end_time,
        status: event.status,
        event_type: event.event_type,
        class_template: event.class_templates ? {
            name: event.class_templates.name,
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
        .select('id, amount, due_date, status, payment_date')
        .eq('student_id', studentId)
        .order('due_date', { ascending: false })
        .limit(3);

    if (error || !data) {
        console.error('Error fetching student payments:', error);
        return [];
    }

    return data;
}

/**
 * Busca treinos ativos do aluno
 */
export async function getStudentActiveWorkouts(studentId: string): Promise<ActiveWorkout[]> {
    const supabase = createClient();

    // This depends on your workout structure - adjust as needed
    const { data, error } = await supabase
        .from('workout_plans')
        .select(`
      id,
      name,
      created_at,
      schedule_type,
      next_occurrence
    `)
        .eq('student_id', studentId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error || !data) {
        console.error('Error fetching student active workouts:', error);
        return [];
    }

    return data;
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
        .update({ status })
        .eq('id', studentId);

    if (error) {
        console.error('Error updating student status:', error);
        return false;
    }

    // Optionally log the reason for inactivation
    if (status === 'INACTIVE' && reason) {
        await supabase
            .from('system_logs')
            .insert({
                entity_type: 'student',
                entity_id: studentId,
                action_type: 'DEACTIVATE',
                new_data_json: { reason },
                organization_id: '', // This should come from auth context
            });
    }

    return true;
}
