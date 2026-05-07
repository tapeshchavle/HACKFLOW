import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: teamId } = await params;

    // Fetch team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Fetch members with user info
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*, users(*)')
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true });

    if (membersError) {
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
    }

    // Format members
    const formattedMembers = (members || []).map((m: any) => ({
      id: m.id,
      team_id: m.team_id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      user: m.users || null,
    }));

    // Get leader info
    const leader = formattedMembers.find((m) => m.role === 'LEADER')?.user || null;

    return NextResponse.json({
      team: {
        ...team,
        members: formattedMembers,
        leader,
        member_count: formattedMembers.length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
