'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

interface CompleteOnboardingData {
    organizationName: string
    businessType: 'STARTER' | 'PLUS' | 'STUDIO' | 'PRO' | 'ENTERPRISE'
    phone: string
    email: string
    studentRange: '0-30' | '31-100' | '101-500' | '501+'
    addressLine1?: string
    addressZip?: string
    planId: string
    hasPhysicalLocation: boolean
}

export async function completeOnboardingAction(data: CompleteOnboardingData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Usuário não autenticado' }
    }

    // 1. Create Organization
    const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
            id: crypto.randomUUID(), // Assuming we generate ID here or let DB handle it? DB schema usually has default. But types say id is string.
            // Wait, schema says id is string. Let's use crypto or let DB default if it was uuid default.
            // The types insert definition requires id.
            name: data.organizationName,
            business_type: data.businessType,
            contact_email: data.email,
            student_range: data.studentRange,
            address_line1: data.hasPhysicalLocation ? data.addressLine1 : null,
            address_zip: data.hasPhysicalLocation ? data.addressZip : null,
            has_physical_location: data.hasPhysicalLocation,
            plan_id: data.planId,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single()

    if (orgError) {
        console.error('Error creating organization:', orgError)
        return { error: 'Erro ao criar organização' }
    }

    // 2. Update User Profile (Upsert to ensure creation if missing from trigger)
    const { error: userError } = await supabase
        .from('users')
        .upsert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata.full_name || '',
            organization_id: orgData.id,
            active: true, // Mark user as ACTIVE
            role: 'OWNER', // First user is owner
        })

    if (userError) {
        console.error('Error updating user:', userError)
        return { error: 'Erro ao atualizar perfil do usuário' }
    }

    // 3. Revalidate and Redirect
    revalidatePath('/')
    redirect('/dashboard')
}
