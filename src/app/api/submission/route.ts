import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

async function checkPrerequisites(userId: string, hackathonId: string) {
  // 1. Get user's team in this hackathon
  const { data: teamData, error: teamError } = await supabase
    .from('team_members')
    .select('team_id, teams!inner(*)')
    .eq('user_id', userId)
    .eq('teams.hackathon_id', hackathonId)
    .single();

  if (teamError || !teamData) {
    return { error: 'User is not in a team for this hackathon', status: 403 };
  }

  const team = teamData.teams as any;

  // 2. Check if user is LEADER
  if (team.leader_id !== userId) {
    return { error: 'Only team leader can submit/update', status: 403 };
  }

  // 3. Check hackathon status = ACTIVE
  const { data: hackathon, error: hackathonError } = await supabase
    .from('hackathons')
    .select('status')
    .eq('id', hackathonId)
    .single();

  if (hackathonError || !hackathon) {
    return { error: 'Hackathon not found', status: 404 };
  }

  if (hackathon.status !== 'ACTIVE') {
    return { error: 'Hackathon is not ACTIVE', status: 400 };
  }

  return { teamId: team.id };
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { hackathonId, repoUrl, demoUrl, description } = body;

    if (!hackathonId || !repoUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const check = await checkPrerequisites(user.id, hackathonId);
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    // Insert submission
    const { data: submission, error } = await supabase
      .from('submissions')
      .insert({
        team_id: check.teamId,
        hackathon_id: hackathonId,
        repo_url: repoUrl,
        demo_url: demoUrl,
        description: description,
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return NextResponse.json({ error: 'Submission already exists for this team' }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { hackathonId, repoUrl, demoUrl, description } = body;

    if (!hackathonId) {
      return NextResponse.json({ error: 'Missing hackathonId' }, { status: 400 });
    }

    const check = await checkPrerequisites(user.id, hackathonId);
    if (check.error) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    // Update submission
    const { data: submission, error } = await supabase
      .from('submissions')
      .update({
        repo_url: repoUrl,
        demo_url: demoUrl,
        description: description,
        updated_at: new Date().toISOString(),
      })
      .eq('team_id', check.teamId)
      .eq('hackathon_id', hackathonId)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ submission });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
