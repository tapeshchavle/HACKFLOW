"use client";

import { cn } from "@/lib/utils";
import type { HackathonStatus } from "@/types";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  SUBMISSION_CLOSED: {
    label: "Submissions Closed",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  JUDGING_COMPLETE: {
    label: "Judging Complete",
    className: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  },
  SUBMITTED: {
    label: "Submitted",
    className: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function RoleBadge({
  role,
  className,
}: {
  role: string;
  className?: string;
}) {
  const roleConfig: Record<string, { className: string }> = {
    ADMIN: { className: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
    JUDGE: { className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
    PARTICIPANT: { className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    LEADER: { className: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
    MEMBER: { className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
  };

  const config = roleConfig[role] || roleConfig.MEMBER;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors",
        config.className,
        className
      )}
    >
      {role}
    </span>
  );
}
