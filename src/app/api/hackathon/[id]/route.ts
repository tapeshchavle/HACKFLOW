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

    // Get user's role in this hackathon
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('hackathon_id', hackathonId)
      .single();

    const role = roleData?.role || null;

    return NextResponse.json({ hackathon, role });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
