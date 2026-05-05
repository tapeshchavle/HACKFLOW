import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { isInAnyTeam } from '@/lib/rbac';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Validate invite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .eq('status', 'PENDING')
      .single();

    if (inviteError || !invite || invite.role !== 'TEAM_MEMBER') {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 });
    }

    if (new Date(invite.expires_at) < new Date()) {
      await supabase.from('invites').update({ status: 'EXPIRED' }).eq('id', invite.id);
      return NextResponse.json({ error: 'Invite expired' }, { status: 400 });
    }

    if (invite.email !== user.email) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 });
    }

    // Check if user is already in any team for this hackathon
    const alreadyInTeam = await isInAnyTeam(user.id, invite.hackathon_id);
    if (alreadyInTeam) {
      return NextResponse.json({ error: 'User is already in a team for this hackathon' }, { status: 400 });
    }

    // Ensure PARTICIPANT role at hackathon level
    const { data: existingRole, error: existingRoleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('hackathon_id', invite.hackathon_id)
      .single();

    if (!existingRole) {
      await supabase
        .from('user_roles')
        .insert({ user_id: user.id, hackathon_id: invite.hackathon_id, role: 'PARTICIPANT' });
    } else if (existingRole.role !== 'PARTICIPANT') {
      return NextResponse.json({ error: 'Admins or Judges cannot join teams.' }, { status: 403 });
    }

    // Add user to team_members
    const { error: joinError } = await supabase
      .from('team_members')
      .insert({
        team_id: invite.team_id,
        user_id: user.id,
        role: 'MEMBER'
      });

    if (joinError) {
      return NextResponse.json({ error: 'Failed to join team' }, { status: 500 });
    }

    // Mark as accepted
    await supabase.from('invites').update({ status: 'ACCEPTED' }).eq('id', invite.id);

    return NextResponse.json({ message: 'Successfully joined team' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
