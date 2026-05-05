import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { isTeamLeader } from '@/lib/rbac';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id, email } = await req.json();

    if (!team_id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Only TEAM LEADER can invite
    const isLeader = await isTeamLeader(user.id, team_id);
    if (!isLeader) {
      return NextResponse.json({ error: 'Forbidden. Only team leaders can invite members.' }, { status: 403 });
    }

    // Get team details to find hackathon
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('hackathon_id')
      .eq('id', team_id)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);

    // Create invite (role = TEAM_MEMBER)
    const { data: invite, error } = await supabase
      .from('invites')
      .insert({
        hackathon_id: team.hackathon_id,
        team_id,
        email,
        role: 'TEAM_MEMBER',
        token,
        expires_at: expires_at.toISOString(),
        created_by: user.id
      })
      .select('*')
      .single();

    if (error || !invite) {
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
    }

    // In a real app, send an email here.
    return NextResponse.json({ invite_link: `/team/invite/accept?token=${token}` }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
