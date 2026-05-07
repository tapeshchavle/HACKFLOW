import useSWR from "swr";
import type {
  Hackathon,
  HackathonWithRole,
  HackathonDashboard,
  Team,
  TeamWithMembers,
  Invite,
  Submission,
  CreateHackathonRequest,
  UpdateHackathonStatusRequest,
  CreateTeamRequest,
  SendInviteRequest,
  SendTeamInviteRequest,
  AcceptInviteRequest,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
} from "@/types";

// ─── Core Fetch Wrapper ──────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`/api/${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data.error || "Something went wrong");
  }

  return data as T;
}

// ─── Hackathon APIs ──────────────────────────────────────────────

export async function createHackathon(
  body: CreateHackathonRequest,
): Promise<{ hackathon: Hackathon }> {
  return request("hackathon", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listHackathons(): Promise<{
  hackathons: HackathonWithRole[];
}> {
  return request("hackathon", { method: "GET" });
}

export async function getHackathon(
  id: string,
): Promise<HackathonDashboard> {
  return request(`hackathon/${id}`, { method: "GET" });
}

export async function updateHackathonStatus(
  id: string,
  body: UpdateHackathonStatusRequest,
): Promise<{ hackathon: Hackathon }> {
  return request(`hackathon/status/${id}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── Team APIs ───────────────────────────────────────────────────

export async function createTeam(
  body: CreateTeamRequest,
): Promise<{ team: Team }> {
  return request("team", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listTeams(
  hackathonId: string,
): Promise<{ teams: Team[] }> {
  return request(`team?hackathonId=${hackathonId}`, { method: "GET" });
}

export async function getTeam(
  id: string,
): Promise<{ team: TeamWithMembers }> {
  return request(`team/${id}`, { method: "GET" });
}

// ─── Invite APIs ─────────────────────────────────────────────────

export async function sendInvite(
  body: SendInviteRequest,
): Promise<{ invite_link: string }> {
  return request("invite", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function acceptInvite(
  body: AcceptInviteRequest,
): Promise<{ message: string; role: string }> {
  return request("invite/accept", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listInvites(
  hackathonId: string,
): Promise<{ invites: Invite[] }> {
  return request(`invite/list?hackathonId=${hackathonId}`, { method: "GET" });
}

// ─── Team Invite APIs ────────────────────────────────────────────

export async function sendTeamInvite(
  body: SendTeamInviteRequest,
): Promise<{ invite_link: string }> {
  return request("team/invite", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function acceptTeamInvite(
  body: AcceptInviteRequest,
): Promise<{ message: string }> {
  return request("team/invite/accept", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── Submission APIs ─────────────────────────────────────────────

export async function createSubmission(
  body: CreateSubmissionRequest,
): Promise<{ submission: Submission }> {
  return request("submission", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateSubmission(
  body: UpdateSubmissionRequest,
): Promise<{ submission: Submission }> {
  return request("submission", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function getMySubmission(
  hackathonId: string,
): Promise<{ submission: Submission | null }> {
  return request(`submission/my?hackathonId=${hackathonId}`, {
    method: "GET",
  });
}

// ─── Dashboard API ───────────────────────────────────────────────

export async function getHackathonDashboard(
  id: string,
): Promise<HackathonDashboard> {
  return request(`hackathon/${id}/dashboard`, { method: "GET" });
}

// ─── SWR Hooks ───────────────────────────────────────────────────

export function useHackathons() {
  return useSWR("hackathon", () => listHackathons());
}

export function useExploreHackathons() {
  return useSWR<{ hackathons: Hackathon[] }>("/api/hackathon/explore", (url: string) => 
    fetch(url).then(res => {
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    })
  );
}

export function useHackathonDashboard(id: string) {
  return useSWR(id ? `hackathon/${id}/dashboard` : null, () => getHackathonDashboard(id));
}

export function useTeams(hackathonId: string) {
  return useSWR(hackathonId ? `team?hackathonId=${hackathonId}` : null, () => listTeams(hackathonId));
}

export function useInvites(hackathonId: string) {
  return useSWR(hackathonId ? `invite/list?hackathonId=${hackathonId}` : null, () => listInvites(hackathonId));
}

export function useTeam(id: string) {
  return useSWR(id ? `team/${id}` : null, () => getTeam(id));
}


