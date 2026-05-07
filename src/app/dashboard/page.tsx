"use client";

import { useEffect, useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import { listHackathons } from "@/lib/api";
import { HackathonCard } from "@/components/hackathon-card";
import { CreateHackathonDialog } from "@/components/create-hackathon-dialog";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { HackathonWithRole } from "@/types";

export default function DashboardPage() {
  const [hackathons, setHackathons] = useState<HackathonWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await listHackathons();
        setHackathons(data.hackathons);
      } catch (error) {
        console.error("Failed to load hackathons:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all your hackathons from one place.
          </p>
        </div>
        <CreateHackathonDialog />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : hackathons.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No hackathons yet"
          description="Create your first hackathon to get started. You'll be assigned as the admin automatically."
          action={<CreateHackathonDialog />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {hackathons.map((h) => (
            <HackathonCard key={h.id} hackathon={h} />
          ))}
        </div>
      )}
    </div>
  );
}
