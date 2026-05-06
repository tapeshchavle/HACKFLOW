import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const hackathonId = searchParams.get('hackathonId');

    if (!hackathonId) {
      return NextResponse.json({ error: 'Missing hackathonId parameter' }, { status: 400 });
    }

    // 1. Get user's team in this hackathon
    const { data: teamData, error: teamError } = await supabase
      .from('team_members')
      .select('team_id, teams!inner(*)')
      .eq('user_id', user.id)
      .eq('teams.hackathon_id', hackathonId)
      .single();

    if (teamError || !teamData) {
      return NextResponse.json({ error: 'User is not in a team for this hackathon' }, { status: 404 });
    }

    const team = teamData.teams as any;

    // 2. Return submission
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('*')
      .eq('team_id', team.id)
      .eq('hackathon_id', hackathonId)
      .single();

    if (submissionError && submissionError.code !== 'PGRST116') {
      // PGRST116 is "JSON object requested, multiple (or no) rows returned"
      // If it doesn't exist, we probably just want to return null/empty, but let's handle the error
      return NextResponse.json({ error: submissionError.message }, { status: 500 });
    }

    if (!submission) {
      return NextResponse.json({ submission: null });
    }

    return NextResponse.json({ submission });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
