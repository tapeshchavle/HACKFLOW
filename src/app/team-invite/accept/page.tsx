"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptTeamInvite } from "@/lib/api";

function AcceptTeamInviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function doAccept() {
      if (!token) {
        setStatus("error");
        setMessage("No invite token provided.");
        return;
      }

      try {
        const result = await acceptTeamInvite({ token });
        setStatus("success");
        setMessage(result.message);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Failed to accept team invite.");
      }
    }
    doAccept();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center animate-scale-in">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            {status === "loading" && (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            )}
            {status === "error" && (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            {status === "loading" && "Joining Team..."}
            {status === "success" && "You're In!"}
            {status === "error" && "Join Failed"}
          </h1>

          <p className="text-muted-foreground text-sm">{message}</p>
        </div>

        {status !== "loading" && (
          <Link href="/dashboard">
            <Button className="w-full gap-2">
              <Users className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function TeamInviteAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <AcceptTeamInviteContent />
    </Suspense>
  );
}
