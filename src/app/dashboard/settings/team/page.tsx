
import { createClient } from '@/lib/supabase/server';
import { TeamList } from '@/components/settings/team/team-list';
import { redirect } from 'next/navigation';

export default async function TeamPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get current user's organization
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    if (!userData?.organization_id) {
        // Handle case where user has no organization (e.g., redirect or show error)
        return <div>Usuário sem organização vinculada.</div>;
    }

    // Fetch team members
    const { data: teamMembers } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', userData.organization_id)
        .order('name');

    return (
        <TeamList
            initialUsers={teamMembers || []}
            currentOrgId={userData.organization_id}
        />
    );
}
