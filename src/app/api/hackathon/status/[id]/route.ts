import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runJudgeAssignment } from '@/lib/judgeAssignment';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: hackathonId } = await params;
    const { status: newStatus } = await req.json();

    if (!newStatus) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Usually you'd check auth + admin roles here...

    const { data: hackathon, error: updateErr } = await supabase
      .from('hackathons')
      .update({ status: newStatus })
      .eq('id', hackathonId)
      .select('*')
      .single();

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update hackathon status' }, { status: 500 });
    }

    // Run judge assignment when submission closes
    if (newStatus === "SUBMISSION_CLOSED") {
      try {
        await runJudgeAssignment(hackathonId);
      } catch (err: any) {
        console.error("Judge assignment error:", err);
        return NextResponse.json({ 
          hackathon, 
          warning: 'Status updated to SUBMISSION_CLOSED but judge assignment failed.',
          details: err.message
        }, { status: 200 });
      }
    }

    return NextResponse.json({ hackathon }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
