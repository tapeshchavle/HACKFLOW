"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Send,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleBadge } from "@/components/status-badge";
import { InviteDialog } from "@/components/invite-dialog";
import { EmptyState } from "@/components/empty-state";
import { getTeam, getMySubmission } from "@/lib/api";
import type { TeamWithMembers, Submission } from "@/types";

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTeam(teamId);
        setTeam(data.team);

        // Try to get submission for this team's hackathon
        try {
          const subData = await getMySubmission(data.team.hackathon_id);
          setSubmission(subData.submission);
        } catch {
          // Not in this team or no submission
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [teamId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in p-6 lg:p-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6 lg:p-10">
        <EmptyState
          icon={Users}
          title="Team not found"
          description="This team doesn't exist."
          action={
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 animate-fade-in">
      {/* Header */}
      <Link
        href={`/hackathon/${team.hackathon_id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Hackathon
      </Link>

      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {team.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {team.member_count} member{team.member_count !== 1 ? "s" : ""}
          </p>
        </div>
        <InviteDialog
          teamId={teamId}
          mode="team"
          trigger={
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              Invite Member
            </Button>
          }
        />
      </div>

      {/* Members */}
      <div className="rounded-xl border border-border bg-card overflow-hidden mb-8">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Members</h3>
        </div>
        <div className="divide-y divide-border">
          {team.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {(member.user?.name || member.user?.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {member.user?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.user?.email || ""}
                  </p>
                </div>
              </div>
              <RoleBadge role={member.role} />
            </div>
          ))}
        </div>
      </div>

      {/* Submission status */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Submission
        </h3>
        {submission ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Repository</p>
              <a
                href={submission.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {submission.repo_url}
              </a>
            </div>
            {submission.demo_url && (
              <div>
                <p className="text-xs text-muted-foreground">Demo</p>
                <a
                  href={submission.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {submission.demo_url}
                </a>
              </div>
            )}
            {submission.description && (
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm text-foreground">
                  {submission.description}
                </p>
              </div>
            )}
            <Link href={`/submit/${team.hackathon_id}`}>
              <Button variant="outline" size="sm" className="mt-2">
                Edit Submission
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              No submission yet
            </p>
            <Link href={`/submit/${team.hackathon_id}`}>
              <Button size="sm">Submit Project</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
