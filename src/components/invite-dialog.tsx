"use client";

import { useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendInvite, sendTeamInvite } from "@/lib/api";

interface InviteDialogProps {
  hackathonId?: string;
  teamId?: string;
  mode: "hackathon" | "team";
  trigger: React.ReactNode;
}

export function InviteDialog({
  hackathonId,
  teamId,
  mode,
  trigger,
}: InviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("JUDGE");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);
    try {
      let link: string;
      if (mode === "hackathon" && hackathonId) {
        const result = await sendInvite({
          hackathon_id: hackathonId,
          email: email.trim(),
          role: role as "ADMIN" | "JUDGE",
        });
        link = result.invite_link;
      } else if (mode === "team" && teamId) {
        const result = await sendTeamInvite({
          team_id: teamId,
          email: email.trim(),
        });
        link = result.invite_link;
      } else {
        throw new Error("Missing required IDs");
      }

      const fullLink = `${window.location.origin}${link}`;
      setInviteLink(fullLink);
      toast.success("Invite created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleClose(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      setEmail("");
      setRole("JUDGE");
      setInviteLink(null);
      setCopied(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        {inviteLink ? (
          <>
            <DialogHeader>
              <DialogTitle>Invite Created!</DialogTitle>
              <DialogDescription>
                Share this link with the invitee. It expires in 7 days.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={inviteLink}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>
                {mode === "hackathon"
                  ? "Invite Admin or Judge"
                  : "Invite Team Member"}
              </DialogTitle>
              <DialogDescription>
                {mode === "hackathon"
                  ? "Invite someone as an admin or judge for this hackathon."
                  : "Invite someone to join your team."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-6">
              <div className="grid gap-2">
                <Label htmlFor="invite-email">Email *</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              {mode === "hackathon" && (
                <div className="grid gap-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JUDGE">Judge</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Invite
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
