import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hackathonId = req.nextUrl.searchParams.get('hackathonId');
    if (!hackathonId) {
      return NextResponse.json({ error: 'Missing hackathonId parameter' }, { status: 400 });
    }

    // Fetch invites for this hackathon (admin sees all, others see their own)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('hackathon_id', hackathonId)
      .single();

    let query = supabase
      .from('invites')
      .select('*')
      .eq('hackathon_id', hackathonId)
      .order('created_at', { ascending: false });

    // Non-admins can only see invites they created
    if (roleData?.role !== 'ADMIN') {
      query = query.eq('created_by', user.id);
    }

    const { data: invites, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 });
    }

    return NextResponse.json({ invites: invites || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
