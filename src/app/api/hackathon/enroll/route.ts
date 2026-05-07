import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hackathonId, teamName } = await req.json();
    if (!hackathonId || !teamName) {
      return NextResponse.json({ error: 'Hackathon ID and Team Name are required' }, { status: 400 });
    }

    // Ensure team name is unique for this hackathon
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('hackathon_id', hackathonId)
      .ilike('name', teamName)
      .single();

    if (existingTeam) {
      return NextResponse.json({ error: 'A team with this name already exists in this hackathon. Please try another name.' }, { status: 400 });
    }

    // Role assignment
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        hackathon_id: hackathonId,
        role: 'PARTICIPANT',
      })
      .select('*')
      .single();

    if (roleError) {
      // It might fail if already enrolled (UNIQUE constraint user_id + hackathon_id)
      if (roleError.code === '23505') {
        return NextResponse.json({ error: 'Already enrolled in this hackathon' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to enroll in hackathon' }, { status: 500 });
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        hackathon_id: hackathonId,
        name: teamName,
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

    return NextResponse.json({ message: 'Successfully enrolled and created team', role: roleData, team }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
