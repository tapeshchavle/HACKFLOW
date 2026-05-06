import { supabase } from '@/lib/supabase';

export async function runJudgeAssignment(hackathonId: string) {
  // 1. Fetch submissions
  const { data: submissions, error: subErr } = await supabase
    .from('submissions')
    .select('id')
    .eq('hackathon_id', hackathonId);

  if (subErr) throw new Error(`Failed to fetch submissions: ${subErr.message}`);
  
  // If no submissions, return early
  if (!submissions || submissions.length === 0) return;

  // 2. Fetch judges
  const { data: judges, error: judgeErr } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('hackathon_id', hackathonId)
    .eq('role', 'JUDGE');

  if (judgeErr) throw new Error(`Failed to fetch judges: ${judgeErr.message}`);

  // 3. Validate
  if (!judges || judges.length < 2) {
    throw new Error('Require at least 2 judges to run assignment.');
  }

  // 4. Initialize load map
  const judgeLoad: Record<string, number> = {};
  for (const j of judges) {
    judgeLoad[j.user_id] = 0;
  }

  const K = 2;
  const assignmentsToInsert = [];

  // 5. Assign
  for (const sub of submissions) {
    // Sort judges by lowest load
    const sortedJudges = Object.entries(judgeLoad).sort((a, b) => a[1] - b[1]);
    
    // Pick first K judges
    const pickedJudges = sortedJudges.slice(0, K);
    
    for (const [judgeId] of pickedJudges) {
      assignmentsToInsert.push({
        submission_id: sub.id,
        judge_id: judgeId,
        status: 'PENDING',
      });
      
      // Increase their load
      judgeLoad[judgeId]++;
    }
  }

  // 6. Insert into DB
  // Using upsert with ignoreDuplicates to satisfy "Do NOT run if already assigned" rule safely,
  // assuming UNIQUE(submission_id, judge_id) constraint in the database.
  if (assignmentsToInsert.length > 0) {
    const { error: insertErr } = await supabase
      .from('judge_assignments')
      .upsert(assignmentsToInsert, { onConflict: 'submission_id,judge_id', ignoreDuplicates: true });

    if (insertErr) {
      throw new Error(`Failed to insert judge assignments: ${insertErr.message}`);
    }
  }
}
