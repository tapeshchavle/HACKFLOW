import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 });
    }

    // Check expiration
    if (new Date(invite.expires_at) < new Date()) {
      await supabase.from('invites').update({ status: 'EXPIRED' }).eq('id', invite.id);
      return NextResponse.json({ error: 'Invite expired' }, { status: 400 });
    }

    // Match email (optional strictness, but prompt says "Match email")
    if (invite.email !== user.email) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 });
    }

    // Ensure user doesn't already have a role in this hackathon
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('hackathon_id', invite.hackathon_id)
      .single();

    if (existingRole) {
      return NextResponse.json({ error: 'User already has a role in this hackathon' }, { status: 400 });
    }

    // Assign role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        hackathon_id: invite.hackathon_id,
        role: invite.role,
      });

    if (roleError) {
      return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 });
    }

    // If it's a team invite, logic would be different. This endpoint specifically handles ADMIN/JUDGE per prompt structure.
    // However, we can make it handle both if needed. But the prompt specifically separated them: /api/invite/accept vs /api/team/invite/accept.

    // Mark as accepted
    await supabase.from('invites').update({ status: 'ACCEPTED' }).eq('id', invite.id);

    return NextResponse.json({ message: 'Invite accepted', role: invite.role }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
