import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hackathonId } = await req.json();
    if (!hackathonId) {
      return NextResponse.json({ error: 'Hackathon ID is required' }, { status: 400 });
    }

    // Role assignment
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        hackathon_id: hackathonId,
        role: 'PARTICIPANT',
      })
      .select('*')
      .single();

    if (roleError) {
      // It might fail if already enrolled (UNIQUE constraint user_id + hackathon_id)
      if (roleError.code === '23505') {
        return NextResponse.json({ error: 'Already enrolled in this hackathon' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to enroll in hackathon' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Successfully enrolled', role: roleData }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
