"use client";

import { useEffect, useState } from "react";
import { Compass, CheckCircle } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Hackathon } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const { getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch("/api/hackathon/explore", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        setHackathons(data.hackathons || []);
      } catch (error) {
        console.error("Failed to load available hackathons:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  const handleEnroll = async (hackathonId: string) => {
    try {
      setEnrolling(hackathonId);
      const token = await getToken();
      const res = await fetch("/api/hackathon/enroll", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ hackathonId })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to enroll");
      }

      toast.success("Successfully enrolled!");
      router.push("/dashboard");
    } catch (error: any) {
        toast.error(error.message);
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Explore
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and join open hackathons.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : hackathons.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No open hackathons found"
          description="There are currently no active hackathons available to join. Please check back later."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {hackathons.map((h) => (
            <div key={h.id} className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg">{h.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{h.description || "No description provided."}</p>
              </div>
              <button 
                onClick={() => handleEnroll(h.id)}
                disabled={enrolling === h.id}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
               >
                 {enrolling === h.id ? "Enrolling..." : (
                     <>
                        <CheckCircle className="h-4 w-4"/>
                        Join Hackathon
                     </>
                 )}
               </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
