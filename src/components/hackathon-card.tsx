"use client";

import Link from "next/link";
import { Calendar, Users, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, RoleBadge } from "@/components/status-badge";
import type { HackathonWithRole } from "@/types";

interface HackathonCardProps {
  hackathon: HackathonWithRole;
}

export function HackathonCard({ hackathon }: HackathonCardProps) {
  return (
    <Link href={`/hackathon/${hackathon.id}`}>
      <Card className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer">
        {/* Top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-chart-2 to-primary opacity-0 transition-opacity group-hover:opacity-100" />

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {hackathon.name}
              </h3>
              {hackathon.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {hackathon.description}
                </p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 ml-4 mt-1 shrink-0" />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={hackathon.status} />
            <RoleBadge role={hackathon.role} />
            <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Calendar className="h-3 w-3" />
              {new Date(hackathon.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
