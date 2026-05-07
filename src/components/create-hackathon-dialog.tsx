"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { createHackathon } from "@/lib/api";

export function CreateHackathonDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      const result = await createHackathon({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Hackathon created successfully!");
      setOpen(false);
      setName("");
      setDescription("");
      router.push(`/hackathon/${result.hackathon.id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create hackathon");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Hackathon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Hackathon</DialogTitle>
            <DialogDescription>
              Set up a new hackathon event. You&apos;ll be assigned as the admin.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="hackathon-name">Name *</Label>
              <Input
                id="hackathon-name"
                placeholder="e.g., AI Innovation Challenge 2025"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hackathon-desc">Description</Label>
              <Textarea
                id="hackathon-desc"
                placeholder="Describe your hackathon, its themes, and goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Hackathon
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
