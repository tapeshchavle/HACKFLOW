import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get hackathons the user is already enrolled in
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('hackathon_id')
      .eq('user_id', user.id);

    if (rolesError) {
      return NextResponse.json({ error: 'Failed to fetch user roles' }, { status: 500 });
    }

    const enrolledHackathonIds = roles?.map((r) => r.hackathon_id) || [];

    // Fetch active hackathons
    const { data: hackathons, error: hackathonsError } = await supabase
      .from('hackathons')
      .select('*')
      .in('status', ['ACTIVE', 'OPEN'])
      .order('created_at', { ascending: false });

    if (hackathonsError) {
      return NextResponse.json({ error: 'Failed to fetch hackathons' }, { status: 500 });
    }

    // Filter out the ones the user is already a part of
    const exploreList = hackathons?.filter(h => !enrolledHackathonIds.includes(h.id)) || [];

    return NextResponse.json({ hackathons: exploreList });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
