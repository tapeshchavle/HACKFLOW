"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMySubmission,
  createSubmission,
  updateSubmission,
} from "@/lib/api";
import type { Submission } from "@/types";

export default function SubmitPage() {
  const params = useParams();
  const router = useRouter();
  const hackathonId = params.hackathonId as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [description, setDescription] = useState("");

  const isEditing = !!submission;

  useEffect(() => {
    async function load() {
      try {
        const data = await getMySubmission(hackathonId);
        if (data.submission) {
          setSubmission(data.submission);
          setRepoUrl(data.submission.repo_url || "");
          setDemoUrl(data.submission.demo_url || "");
          setDescription(data.submission.description || "");
        }
      } catch {
        // No submission yet, that's fine
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hackathonId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!repoUrl.trim()) {
      toast.error("Repository URL is required");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await updateSubmission({
          hackathonId,
          repoUrl: repoUrl.trim(),
          demoUrl: demoUrl.trim() || undefined,
          description: description.trim() || undefined,
        });
        toast.success("Submission updated!");
      } else {
        await createSubmission({
          hackathonId,
          repoUrl: repoUrl.trim(),
          demoUrl: demoUrl.trim() || undefined,
          description: description.trim() || undefined,
        });
        toast.success("Submission created!");
      }
      router.push(`/hackathon/${hackathonId}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto animate-fade-in">
      <Link
        href={`/hackathon/${hackathonId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Hackathon
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEditing ? "Edit Submission" : "Submit Your Project"}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {isEditing
            ? "Update your project details below."
            : "Submit your project to the hackathon. Only team leaders can submit."}
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-6"
      >
        <div className="grid gap-2">
          <Label htmlFor="repo-url">Repository URL *</Label>
          <Input
            id="repo-url"
            type="url"
            placeholder="https://github.com/your-team/project"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="demo-url">Demo URL</Label>
          <Input
            id="demo-url"
            type="url"
            placeholder="https://your-project-demo.vercel.app"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="desc">Project Description</Label>
          <Textarea
            id="desc"
            placeholder="Describe what your project does, the technologies used, and how it works..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            rows={5}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? "Update Submission" : "Submit Project"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
