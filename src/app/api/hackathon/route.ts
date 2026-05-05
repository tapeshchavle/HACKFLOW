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
