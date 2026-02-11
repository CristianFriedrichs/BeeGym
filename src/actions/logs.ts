'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface LogFilters {
    dateFrom?: string;
    dateTo?: string;
    userId?: string;
    action?: string;
    resource?: string;
}

export async function getSystemLogsAction(filters: LogFilters = {}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
    }

    // Get organization_id from profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, role')
        .eq('id', user.id)
        .single();

    if (!profile?.organization_id) {
        return { success: false, error: 'Organização não encontrada' };
    }

    // Check if user is admin/owner/manager
    if (!['ADMIN', 'OWNER', 'MANAGER'].includes(profile.role)) {
        return { success: false, error: 'Acesso negado. Apenas administradores podem ver logs.' };
    }

    // Build query with filters
    let query = supabase
        .from('system_logs')
        .select(`
            id,
            action,
            resource,
            details,
            metadata,
            created_at,
            user:user_id (
                id,
                full_name,
                avatar_url
            )
        `)
        .eq('organization_id', profile.organization_id);

    if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
    }

    if (filters.userId) {
        query = query.eq('user_id', filters.userId);
    }

    if (filters.action) {
        query = query.eq('action', filters.action);
    }

    if (filters.resource) {
        query = query.eq('resource', filters.resource);
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) {
        console.error('Error fetching system logs:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

export async function createTestLogAction() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!profile?.organization_id) {
        return { success: false, error: 'Organização não encontrada' };
    }

    const { error } = await supabase
        .from('system_logs')
        .insert({
            organization_id: profile.organization_id,
            user_id: user.id,
            action: 'CREATE',
            resource: 'test',
            details: 'Log de teste gerado pela interface',
            metadata: {
                timestamp: new Date().toISOString(),
                test: true,
            },
        });

    if (error) {
        console.error('Error creating test log:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/settings/logs');
    return { success: true };
}

// Fetch team members for the user filter
export async function getTeamMembersAction() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!profile?.organization_id) {
        return { success: false, error: 'Organização não encontrada' };
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('organization_id', profile.organization_id)
        .order('full_name');

    if (error) {
        console.error('Error fetching team members:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}
