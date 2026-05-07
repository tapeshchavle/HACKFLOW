// ─── Database Entities ────────────────────────────────────────────

export interface User {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface Hackathon {
  id: string;
  name: string;
  description: string | null;
  status: HackathonStatus;
  created_by: string;
  created_at: string;
}

export type HackathonStatus =
  | "DRAFT"
  | "ACTIVE"
  | "SUBMISSION_CLOSED"
  | "JUDGING_COMPLETE";

export interface UserRole {
  id: string;
  user_id: string;
  hackathon_id: string;
  role: Role;
  created_at: string;
}

export type Role = "ADMIN" | "JUDGE" | "PARTICIPANT";

export interface Team {
  id: string;
  hackathon_id: string;
  name: string;
  leader_id: string;
  created_at: string;
  member_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: "LEADER" | "MEMBER";
  joined_at: string;
  user?: User;
}

export interface Invite {
  id: string;
  hackathon_id: string;
  team_id: string | null;
  email: string;
  role: "ADMIN" | "JUDGE" | "TEAM_MEMBER";
  token: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  expires_at: string;
  created_by: string;
  created_at: string;
}

export interface Submission {
  id: string;
  team_id: string;
  hackathon_id: string;
  repo_url: string;
  demo_url: string | null;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  team?: Team;
}

export interface JudgeAssignment {
  id: string;
  submission_id: string;
  judge_id: string;
  status: "PENDING" | "DONE";
  created_at: string;
}

// ─── API Response Wrappers ────────────────────────────────────────

export interface HackathonWithRole extends Hackathon {
  role: Role;
}

export interface HackathonDashboard {
  hackathon: Hackathon;
  role: Role;
  teamCount: number;
  submissionCount: number;
  judgeCount: number;
  participantCount: number;
  hasTeam: boolean;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
  leader?: User;
}

// ─── API Request Types ────────────────────────────────────────────

export interface CreateHackathonRequest {
  name: string;
  description?: string;
}

export interface UpdateHackathonStatusRequest {
  status: HackathonStatus;
}

export interface CreateTeamRequest {
  hackathon_id: string;
  name: string;
}

export interface SendInviteRequest {
  hackathon_id: string;
  email: string;
  role: "ADMIN" | "JUDGE";
}

export interface SendTeamInviteRequest {
  team_id: string;
  email: string;
}

export interface AcceptInviteRequest {
  token: string;
}

export interface CreateSubmissionRequest {
  hackathonId: string;
  repoUrl: string;
  demoUrl?: string;
  description?: string;
}

export interface UpdateSubmissionRequest {
  hackathonId: string;
  repoUrl?: string;
  demoUrl?: string;
  description?: string;
}
