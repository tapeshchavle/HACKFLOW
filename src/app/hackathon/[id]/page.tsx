"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  FileText,
  Send,
  Settings,
  Trophy,
  UserCheck,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { StatusBadge, RoleBadge } from "@/components/status-badge";
import { InviteDialog } from "@/components/invite-dialog";
import { EmptyState } from "@/components/empty-state";
import {
  getHackathonDashboard,
  listTeams,
  listInvites,
  updateHackathonStatus,
  createTeam,
} from "@/lib/api";
import type {
  HackathonDashboard,
  Team,
  Invite,
  HackathonStatus,
} from "@/types";

// ─── Teams Tab ───────────────────────────────────────────────────

function TeamsTab({
  hackathonId,
  role,
  hasTeam,
}: {
  hackathonId: string;
  role: string | null;
  hasTeam: boolean;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [teamName, setTeamName] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const data = await listTeams(hackathonId);
        setTeams(data.teams);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hackathonId]);

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName.trim()) return;
    setCreating(true);
    try {
      const result = await createTeam({
        hackathon_id: hackathonId,
        name: teamName.trim(),
      });
      toast.success("Team created!");
      setTeams((prev) => [{ ...result.team, member_count: 1 }, ...prev]);
      setTeamName("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create team");
    } finally {
      setCreating(false);
    }
  }

  if (loading)
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      {((role === "PARTICIPANT" || !role) && !hasTeam) && (
        <form
          onSubmit={handleCreateTeam}
          className="flex items-end gap-3 p-4 rounded-xl border border-border bg-card"
        >
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground mb-1 block">
              Create a Team
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={creating}
            />
          </div>
          <Button type="submit" disabled={creating || !teamName.trim()}>
            {creating ? "Creating..." : "Create"}
          </Button>
        </form>
      )}

      {teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="Teams will appear here once participants create them."
        />
      ) : (
        <div className="grid gap-4">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/team/${team.id}`}
              className="block p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {team.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {team.member_count || 0} member
                    {(team.member_count || 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Invites Tab ─────────────────────────────────────────────────

function InvitesTab({
  hackathonId,
  role,
}: {
  hackathonId: string;
  role: string | null;
}) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await listInvites(hackathonId);
        setInvites(data.invites);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hackathonId]);

  if (loading)
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      {role === "ADMIN" && (
        <InviteDialog
          hackathonId={hackathonId}
          mode="hackathon"
          trigger={
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              Send Invite
            </Button>
          }
        />
      )}

      {invites.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No invites sent"
          description="Send invites to judges and admins to help run your hackathon."
        />
      ) : (
        <div className="grid gap-3">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {invite.email}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sent{" "}
                  {new Date(invite.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <RoleBadge role={invite.role} />
                <StatusBadge status={invite.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Settings Tab ────────────────────────────────────────────────

function SettingsTab({
  hackathon,
  role,
  onStatusUpdate,
}: {
  hackathon: HackathonDashboard;
  role: string | null;
  onStatusUpdate: (status: HackathonStatus) => void;
}) {
  const [updating, setUpdating] = useState(false);

  const transitions: Record<string, { next: HackathonStatus; label: string }> =
    {
      DRAFT: { next: "ACTIVE", label: "Activate Hackathon" },
      ACTIVE: { next: "SUBMISSION_CLOSED", label: "Close Submissions" },
      SUBMISSION_CLOSED: {
        next: "JUDGING_COMPLETE",
        label: "Mark Judging Complete",
      },
    };

  const transition = transitions[hackathon.hackathon.status];

  async function handleTransition() {
    if (!transition) return;
    setUpdating(true);
    try {
      await updateHackathonStatus(hackathon.hackathon.id, {
        status: transition.next,
      });
      toast.success(`Status updated to ${transition.next}`);
      onStatusUpdate(transition.next);
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (role !== "ADMIN") {
    return (
      <EmptyState
        icon={Settings}
        title="Admin only"
        description="Only hackathon admins can manage settings."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Hackathon Status
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Current status:{" "}
          <StatusBadge status={hackathon.hackathon.status} />
        </p>

        {/* Status flow */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {(
            ["DRAFT", "ACTIVE", "SUBMISSION_CLOSED", "JUDGING_COMPLETE"] as const
          ).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  s === hackathon.hackathon.status
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.replace(/_/g, " ")}
              </div>
              {i < 3 && (
                <span className="text-muted-foreground text-xs">→</span>
              )}
            </div>
          ))}
        </div>

        {transition ? (
          <Button onClick={handleTransition} disabled={updating}>
            {updating ? "Updating..." : transition.label}
          </Button>
        ) : (
          <p className="text-sm text-emerald-400">
            ✓ Hackathon lifecycle complete
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────

export default function HackathonDetailPage() {
  const params = useParams();
  const hackathonId = params.id as string;
  const [data, setData] = useState<HackathonDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getHackathonDashboard(hackathonId);
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hackathonId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="Hackathon not found"
        description="This hackathon doesn't exist or you don't have access."
        action={
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        }
      />
    );
  }

  function handleStatusUpdate(newStatus: HackathonStatus) {
    if (data) {
      setData({
        ...data,
        hackathon: { ...data.hackathon, status: newStatus },
      });
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {data.hackathon.name}
              </h1>
              <StatusBadge status={data.hackathon.status} />
            </div>
            {data.hackathon.description && (
              <p className="text-muted-foreground max-w-2xl">
                {data.hackathon.description}
              </p>
            )}
            <div className="mt-2">
              <RoleBadge role={data.role} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Teams"
          value={data.teamCount}
          icon={Users}
        />
        <StatCard
          title="Submissions"
          value={data.submissionCount}
          icon={FileText}
        />
        <StatCard
          title="Judges"
          value={data.judgeCount}
          icon={Trophy}
        />
        <StatCard
          title="Participants"
          value={data.participantCount}
          icon={UserCheck}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="teams" className="gap-2">
            <Users className="h-3.5 w-3.5" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="invites" className="gap-2">
            <Send className="h-3.5 w-3.5" />
            Invites
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-3.5 w-3.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams">
          <TeamsTab hackathonId={hackathonId} role={data.role} hasTeam={data.hasTeam} />
        </TabsContent>

        <TabsContent value="invites">
          <InvitesTab hackathonId={hackathonId} role={data.role} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab
            hackathon={data}
            role={data.role}
            onStatusUpdate={handleStatusUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
