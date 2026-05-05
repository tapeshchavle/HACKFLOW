import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { hasRole } from '@/lib/rbac';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hackathon_id, email, role } = await req.json();

    if (!hackathon_id || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['ADMIN', 'JUDGE'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role for this endpoint' }, { status: 400 });
    }

    // Must be admin to invite
    const isAdmin = await hasRole(user.id, hackathon_id, ['ADMIN']);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7); // 7 days

    const { data: invite, error } = await supabase
      .from('invites')
      .insert({
        hackathon_id,
        email,
        role,
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
    return NextResponse.json({ invite_link: `/invite/accept?token=${token}` }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
