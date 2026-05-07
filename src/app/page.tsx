import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Zap, Users, Trophy, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.25_0.08_264)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,oklch(0.2_0.06_195)_0%,transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-chart-2/5 blur-3xl" />
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <div className="text-center space-y-8 max-w-3xl animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Hackathon Management Reimagined
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter">
            <span className="gradient-text">HackFlow</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            The all-in-one platform for managing hackathons, assembling teams,
            handling submissions, and powering smart judging — all in one
            seamless flow.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <SignInButton mode="modal">
              <Button size="lg" className="gap-2 px-8 text-base glow-indigo">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </SignInButton>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full animate-slide-up">
          {[
            {
              icon: Zap,
              title: "Create Events",
              desc: "Launch hackathons in seconds with full admin control.",
            },
            {
              icon: Users,
              title: "Team Formation",
              desc: "Invite-based team building with role management.",
            },
            {
              icon: Trophy,
              title: "Submissions",
              desc: "Seamless project submission and tracking system.",
            },
            {
              icon: Shield,
              title: "Smart Judging",
              desc: "Automated, load-balanced judge assignment algorithm.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group glass rounded-xl p-6 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
