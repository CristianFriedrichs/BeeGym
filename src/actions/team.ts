'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createTeamMemberAction(formData: {
    fullName: string;
    email: string;
    password?: string;
    role: 'ADMIN' | 'INSTRUCTOR' | 'STAFF' | 'OWNER' | 'MANAGER';
    organizationId: string;
}) {
    try {
        // 1. Create Auth User
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: formData.email,
            password: formData.password || 'BeeGym123!', // Temporary default if not provided
            email_confirm: true,
            user_metadata: {
                full_name: formData.fullName,
            }
        });

        if (authError) {
            console.error('Error creating auth user:', authError);
            return { success: false, error: authError.message };
        }

        if (!authData.user) {
            return { success: false, error: 'User creation failed' };
        }

        // 2. Update/Insert in public.users
        // The trigger might already create the user, so we should check if we should UPSERT or UPDATE
        // Based on common Supabase patterns, a trigger usually handles the initial insert.
        // However, the request explicitly says "faça um Update na tabela public.users".

        const { error: dbError } = await supabaseAdmin
            .from('users')
            .update({
                name: formData.fullName,
                role: formData.role,
                organization_id: formData.organizationId,
                active: true,
            })
            .eq('id', authData.user.id);

        if (dbError) {
            console.error('Error updating public.users:', dbError);
            // We might want to delete the auth user if this fails, but for now let's just return error
            return { success: false, error: dbError.message };
        }

        revalidatePath('/dashboard/settings/team');
        return { success: true, data: authData.user };
    } catch (error: any) {
        console.error('Unexpected error in createTeamMemberAction:', error);
        return { success: false, error: error.message || 'Erro inesperado' };
    }
}
