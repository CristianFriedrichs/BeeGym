'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

interface CompleteOnboardingData {
    organizationName: string
    businessType: 'STARTER' | 'PLUS' | 'STUDIO' | 'PRO' | 'ENTERPRISE'
    phone: string
    email: string
    studentRange: '0-20' | '21-40' | '41-60' | '61-300' | '301-500' | '500+'
    addressLine1?: string
    addressNumber?: string
    addressNeighborhood?: string
    addressCity?: string
    addressState?: string
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
            id: crypto.randomUUID(),
            name: data.organizationName,
            business_type: data.businessType,
            contact_email: data.email,
            student_range: data.studentRange,
            address_line1: data.hasPhysicalLocation ? data.addressLine1 : null,
            address_number: data.hasPhysicalLocation ? data.addressNumber : null,
            address_neighborhood: data.hasPhysicalLocation ? data.addressNeighborhood : null,
            address_city: data.hasPhysicalLocation ? data.addressCity : null,
            address_state: data.hasPhysicalLocation ? data.addressState : null,
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
        return { error: `Erro ao criar organização: ${orgError.message}` }
    }

    // 2. Update User Profile (Upsert to ensure creation if missing from trigger)
    const { error: userError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata.full_name || user.user_metadata.name || '',
            avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture || null,
            organization_id: orgData.id,
            status: 'ACTIVE', // Mark user as ACTIVE
            role: 'OWNER', // First user is owner
        })

    if (userError) {
        console.error('Error updating user:', userError)
        return { error: `Erro ao atualizar perfil do usuário: ${userError.message}` }
    }

    // 3. Revalidate and Return
    revalidatePath('/')
    return { success: true }
}
