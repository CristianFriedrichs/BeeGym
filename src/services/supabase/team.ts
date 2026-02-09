import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function getTeamMembers(organizationId: string) {
    const supabase = createClientComponentClient();

    const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, avatar_url, is_active, phone')
        .eq('organization_id', organizationId)
        .order('full_name');

    if (error) throw error;
    return data;
}

export async function updateMemberRole(userId: string, role: string, hasSystemAccess: boolean) {
    const supabase = createClientComponentClient();

    // Se 'hasSystemAccess' for falso, poderíamos marcar como inativo 
    // ou apenas mudar o role para algo com zero permissões.
    const { error } = await supabase
        .from('users')
        .update({
            role,
            is_active: hasSystemAccess
        })
        .eq('id', userId);

    if (error) throw error;
}
