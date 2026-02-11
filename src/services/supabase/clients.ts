
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
            status,
            organization_id
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
    return {
        id: student.id,
        name: student.full_name,
        email: '',
        objetivo: 'Não informado',
        plan: 'Sem Plano',
        status: student.status === 'ACTIVE' ? 'active' : student.status === 'INACTIVE' ? 'inactive' : 'overdue',
        avatar: null,
        primaryUnitId: ''
    };
}
