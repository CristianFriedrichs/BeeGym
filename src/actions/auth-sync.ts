'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function syncAuthMetadata() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Usuário não autenticado' }
    }

    // 1. Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, status')
        .eq('id', user.id)
        .single()

    if (!profile?.organization_id) {
        return { error: 'Perfil incompleto' }
    }

    // 2. Update Auth Metadata
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
            app_metadata: {
                organization_id: profile.organization_id,
                status: profile.status || 'ACTIVE'
            }
        }
    )

    if (metadataError) {
        console.error('Error syncing metadata:', metadataError)
        return { error: 'Falha ao sincronizar metadados' }
    }

    // Force session refresh
    await supabase.auth.refreshSession()

    revalidatePath('/')
    return { success: true }
}
