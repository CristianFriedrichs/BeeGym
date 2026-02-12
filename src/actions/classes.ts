'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { requirePermission } from '@/lib/rbac';

export async function enrollStudent(eventId: string, studentId: string) {
    await requirePermission('classes', 'manage');
    const supabase = await createClient();

    try {
        // 1. Get Event Details (Capacity)
        const { data: event, error: eventError } = await supabase
            .from('calendar_events')
            .select('capacity_limit')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            return { error: 'Evento não encontrado.' };
        }

        const maxCapacity = event.capacity_limit || 0;

        // 2. Count current participants
        const { count, error: countError } = await supabase
            .from('event_participants')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .eq('status', 'CONFIRMED');

        if (countError) {
            return { error: 'Erro ao verificar vagas.' };
        }

        const currentEnrollments = count || 0;

        if (maxCapacity > 0 && currentEnrollments >= maxCapacity) {
            return { error: 'Turma lotada.' };
        }

        // 3. Check if already enrolled
        const { data: existing, error: existingError } = await supabase
            .from('event_participants')
            .select('id')
            .eq('event_id', eventId)
            .eq('student_id', studentId)
            .maybeSingle();

        if (existing) {
            return { error: 'Aluno já inscrito.' };
        }

        // 4. Enroll
        const { error: insertError } = await supabase
            .from('event_participants')
            .insert({
                event_id: eventId,
                student_id: studentId,
                status: 'CONFIRMED'
            });

        if (insertError) {
            console.error('Enrollment error:', insertError);
            return { error: 'Erro ao inscrever aluno.' };
        }

        revalidatePath('/calendar');
        revalidatePath('/classes'); // Assuming classes list might show counts too
        return { success: true };

    } catch (error) {
        console.error('Unexpected error:', error);
        return { error: 'Erro interno do servidor.' };
    }
}

export async function removeStudent(eventId: string, studentId: string) {
    await requirePermission('classes', 'manage');
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('event_participants')
            .delete()
            .eq('event_id', eventId)
            .eq('student_id', studentId);

        if (error) {
            console.error('Remove error:', error);
            return { error: 'Erro ao remover aluno.' };
        }

        revalidatePath('/calendar');
        return { success: true };
    } catch (error) {
        console.error('Unexpected error:', error);
        return { error: 'Erro interno do servidor.' };
    }
}
