import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Insert hackathon
    const { data: hackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .insert({
        name,
        description,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (hackathonError || !hackathon) {
      return NextResponse.json({ error: 'Failed to create hackathon' }, { status: 500 });
    }

    // Assign ADMIN role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        hackathon_id: hackathon.id,
        role: 'ADMIN',
      });

    if (roleError) {
      return NextResponse.json({ error: 'Hackathon created, but failed to assign ADMIN role' }, { status: 500 });
    }

    return NextResponse.json({ hackathon }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all hackathons where this user has a role
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('hackathon_id, role')
      .eq('user_id', user.id);

    if (rolesError) {
      return NextResponse.json({ error: 'Failed to fetch user roles' }, { status: 500 });
    }

    if (!roles || roles.length === 0) {
      return NextResponse.json({ hackathons: [] });
    }

    const hackathonIds = roles.map((r) => r.hackathon_id);

    const { data: hackathons, error: hackathonsError } = await supabase
      .from('hackathons')
      .select('*')
      .in('id', hackathonIds)
      .order('created_at', { ascending: false });

    if (hackathonsError) {
      return NextResponse.json({ error: 'Failed to fetch hackathons' }, { status: 500 });
    }

    // Merge role info
    const hackathonsWithRoles = (hackathons || []).map((h) => {
      const roleEntry = roles.find((r) => r.hackathon_id === h.id);
      return { ...h, role: roleEntry?.role || 'PARTICIPANT' };
    });

    return NextResponse.json({ hackathons: hackathonsWithRoles });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
