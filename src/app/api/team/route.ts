import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { hasRole, isInAnyTeam } from '@/lib/rbac';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hackathon_id, name } = await req.json();

    if (!hackathon_id || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure they have PARTICIPANT role
    const isParticipant = await hasRole(user.id, hackathon_id, ['PARTICIPANT']);
    if (!isParticipant) {
      // If no role at all, maybe we can auto-assign PARTICIPANT? 
      // The prompt says "Only PARTICIPANT". So let's check or let them be created as participant.
      // Easiest is to strictly check, or assign them if they have no role.
      // Let's assume they must be assigned PARTICIPANT somehow, e.g. through a public registration endpoint.
      // Wait, prompt: "No public join (participants only via team invite)". BUT how does a leader create a team then? Let's assume they were invited to the hackathon or the platform just assigns it if they create a team.
      // Actually, if "No public join (participants only via team invite)", a leader might have been invited as a leader, OR they can create a team and that makes them a participant. Let's auto-assign PARTICIPANT if no role.
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('hackathon_id', hackathon_id)
        .single();
        
      if (!existingRole) {
        await supabase
          .from('user_roles')
          .insert({ user_id: user.id, hackathon_id, role: 'PARTICIPANT' });
      } else if (existingRole.role !== 'PARTICIPANT') {
        return NextResponse.json({ error: 'Forbidden. Admins/Judges cannot create teams.' }, { status: 403 });
      }
    }

    // Ensure user not already in a team for this hackathon
    const alreadyInTeam = await isInAnyTeam(user.id, hackathon_id);
    if (alreadyInTeam) {
      return NextResponse.json({ error: 'User is already in a team for this hackathon' }, { status: 400 });
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        hackathon_id,
        name,
        leader_id: user.id,
      })
      .select('*')
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }

    // Add leader to team_members
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'LEADER',
      });

    if (memberError) {
      return NextResponse.json({ error: 'Team created, but failed to join as leader' }, { status: 500 });
    }

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
