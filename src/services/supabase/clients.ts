
import { createClient } from "@/lib/supabase/client";
import { QueryData } from '@supabase/supabase-js';

export type Client = {
    id: string; // Changed to string to match UUID
    name: string;
    email: string;
    objetivo: string | null; // Nullable in DB
    plan: string; // Derived or joined
    status: string; // Mapped from StudentStatus
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
            unit_id,
            student_plan_assignments (
                plan_name,
                status
            ),
            workouts (
                goal
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
    // Note: 'student' is strictly typed as ClientsResponse[number] in usage, 
    // but explicit typing here requires exporting the type or using return type inference.
    // We use 'any' here for simplicity in helper but it is safe because it is called with typed data.
    // Ideally we would infer the type from the query.

    // student_plan_assignments is an array due to 1:N relation
    const assignments = student.student_plan_assignments;
    const activePlan = Array.isArray(assignments)
        ? assignments.find((p: any) => p.status === 'ACTIVE')
        : null;

    // workouts is an array
    const workouts = student.workouts;
    const goal = Array.isArray(workouts) && workouts.length > 0
        ? workouts[0].goal || 'Não informado'
        : 'Não informado';

    return {
        id: student.id,
        name: student.full_name,
        email: student.email || '',
        objetivo: goal,
        plan: activePlan ? activePlan.plan_name : 'Sem Plano',
        status: student.status === 'ACTIVE' ? 'Ativo' : student.status === 'INACTIVE' ? 'Inativo' : 'Cancelado',
        avatar: student.avatar_url,
        primaryUnitId: student.unit_id
    };
}
