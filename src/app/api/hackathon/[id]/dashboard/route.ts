import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { isInAnyTeam } from '@/lib/rbac';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: hackathonId } = await params;

    // Execute all independent queries in parallel
    const [
      hackathonResult,
      roleResult,
      teamCountResult,
      submissionCountResult,
      judgeCountResult,
      participantCountResult,
      hasTeam
    ] = await Promise.all([
      supabase.from('hackathons').select('*').eq('id', hackathonId).single(),
      supabase.from('user_roles').select('role').eq('user_id', user.id).eq('hackathon_id', hackathonId).single(),
      supabase.from('teams').select('id', { count: 'exact', head: true }).eq('hackathon_id', hackathonId),
      supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('hackathon_id', hackathonId),
      supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('hackathon_id', hackathonId).eq('role', 'JUDGE'),
      supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('hackathon_id', hackathonId).eq('role', 'PARTICIPANT'),
      isInAnyTeam(user.id, hackathonId)
    ]);

    const { data: hackathon, error: hackathonError } = hackathonResult;

    if (hackathonError || !hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    const roleData = roleResult.data;
    const teamCount = teamCountResult.count;
    const submissionCount = submissionCountResult.count;
    const judgeCount = judgeCountResult.count;
    const participantCount = participantCountResult.count;

    return NextResponse.json({
      hackathon,
      role: roleData?.role || null,
      teamCount: teamCount || 0,
      submissionCount: submissionCount || 0,
      judgeCount: judgeCount || 0,
      participantCount: participantCount || 0,
      hasTeam,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
