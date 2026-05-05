import { supabase } from './supabase';

export async function hasRole(userId: string, hackathonId: string, allowedRoles: string[]): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('hackathon_id', hackathonId)
    .single();

  if (error || !data) return false;
  
  return allowedRoles.includes(data.role);
}

export async function getUserRole(userId: string, hackathonId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('hackathon_id', hackathonId)
    .single();

  if (error || !data) return null;
  return data.role;
}

export async function isTeamLeader(userId: string, teamId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('teams')
    .select('leader_id')
    .eq('id', teamId)
    .single();
    
  if (error || !data) return false;
  
  return data.leader_id === userId;
}

export async function isInAnyTeam(userId: string, hackathonId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('team_members')
    .select('team_id, teams!inner(hackathon_id)')
    .eq('user_id', userId)
    .eq('teams.hackathon_id', hackathonId)
    .limit(1);

  return !!data && data.length > 0;
}
