
import { createClient } from "@/lib/supabase/client";
import { QueryData } from '@supabase/supabase-js';

export type Client = {
    id: string;
    name: string;
    email: string;
    objetivo: string | null;
    plan: string;
    status: 'active' | 'overdue' | 'inactive';
    avatar: string | null;
    primaryUnitId: string;
}

export async function getClients(unitId?: string, search?: string): Promise<Client[]> {
    const supabase = createClient();

    let query = supabase
        .from('students')
        .select(`
            id,
            full_name,
            email,
            avatar_url,
            status,
            objective,
            unit_id,
            student_plan_assignments (
                plan_name,
                status
            )
        `);

    if (unitId) {
        query = query.eq('unit_id', unitId);
    }

    if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    type ClientsResponse = QueryData<typeof query>;

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching clients:', error);
        throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    if (!data) return [];

    const students: ClientsResponse = data;

    // Map to UI format using helper
    return students.map(mapStudentToClient);
}

function mapStudentToClient(student: any): Client {
    // student_plan_assignments is an array due to 1:N relation
    const assignments = student.student_plan_assignments;
    const activePlan = Array.isArray(assignments)
        ? assignments.find((p: any) => p.status === 'ACTIVE')
        : null;

    return {
        id: student.id,
        name: student.full_name,
        email: student.email || '',
        objetivo: student.objective || 'Não informado',
        plan: activePlan ? activePlan.plan_name : (student.plans?.name || 'Sem Plano'),
        status: student.status === 'ACTIVE' ? 'active' : student.status === 'INACTIVE' ? 'inactive' : 'overdue',
        avatar: student.avatar_url,
        primaryUnitId: student.unit_id
    };
}
