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

    const { id: hackathonId } = await params;

    // Fetch hackathon
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', hackathonId)
      .single();

    if (hackathonError || !hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }

    // User's role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('hackathon_id', hackathonId)
      .single();

    // Team count
    const { count: teamCount } = await supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })
      .eq('hackathon_id', hackathonId);

    // Submission count
    const { count: submissionCount } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('hackathon_id', hackathonId);

    // Judge count
    const { count: judgeCount } = await supabase
      .from('user_roles')
      .select('id', { count: 'exact', head: true })
      .eq('hackathon_id', hackathonId)
      .eq('role', 'JUDGE');

    // Participant count
    const { count: participantCount } = await supabase
      .from('user_roles')
      .select('id', { count: 'exact', head: true })
      .eq('hackathon_id', hackathonId)
      .eq('role', 'PARTICIPANT');

    return NextResponse.json({
      hackathon,
      role: roleData?.role || null,
      teamCount: teamCount || 0,
      submissionCount: submissionCount || 0,
      judgeCount: judgeCount || 0,
      participantCount: participantCount || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
