import { useOrg } from "@/contexts/OrgContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Bot, Phone, Calendar, BarChart3, Search, Eye, Users, TrendingUp,
  ArrowRight, Loader2, UserPlus, Megaphone, CheckCircle2, Clock,
  MessageSquare, Zap, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

export default function MainDashboardPage() {
  const { currentOrg } = useOrg();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["main-dashboard", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;
      const [bookings, toolCalls, followups, profiles, scans] = await Promise.all([
        supabase.from("ai_bookings").select("status").eq("org_id", currentOrg.id),
        supabase.from("ai_tool_call_logs").select("id").eq("org_id", currentOrg.id),
        supabase.from("followups").select("status").eq("org_id", currentOrg.id),
        supabase.from("seo_client_profiles").select("id, brand_name, domain, onboarding_completed").eq("org_id", currentOrg.id) as any,
        supabase.from("llm_brand_scans").select("overall_brand_score, status").eq("org_id", currentOrg.id).order("created_at", { ascending: false }).limit(1) as any,
      ]);
      const openFollowups = followups.data?.filter((f: any) => f.status === "open" || f.status === "pending")?.length || 0;
      const booked = bookings.data?.filter((b: any) => b.status === "scheduled" || b.status === "confirmed")?.length || 0;
      return {
        totalBookings: bookings.data?.length || 0,
        booked,
        aiCalls: toolCalls.data?.length || 0,
        openFollowups,
        clientProfiles: profiles.data?.length || 0,
        latestBrandScore: scans.data?.[0]?.overall_brand_score ?? null,
      };
    },
    enabled: !!currentOrg,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const s = stats || { totalBookings: 0, booked: 0, aiCalls: 0, openFollowups: 0, clientProfiles: 0, latestBrandScore: null };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <img src={logo} alt="Logo" className="h-10 w-auto" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{currentOrg?.name || "Your Organization"} — Command Center Overview</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <KpiCard icon={Phone} label="AI Calls" value={s.aiCalls} />
        <KpiCard icon={Calendar} label="Bookings" value={s.totalBookings} />
        <KpiCard icon={CheckCircle2} label="Confirmed" value={s.booked} variant="success" />
        <KpiCard icon={Clock} label="Open Follow-ups" value={s.openFollowups} variant={s.openFollowups > 0 ? "warning" : "default"} />
        <KpiCard icon={Users} label="Client Profiles" value={s.clientProfiles} />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Operations */}
        <Card className="border-l-4 border-l-success/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-5 w-5 text-success" /> AI Operations
            </CardTitle>
            <CardDescription>Your AI assistant performance at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <QuickLink to="/ai-calls" icon={Phone} label="AI Call Dashboard" desc="View leads, transcripts & call intelligence" />
            <QuickLink to="/ai-chat" icon={MessageSquare} label="AI Chat" desc="Chat with your AI assistant" />
            <QuickLink to="/ai-booking" icon={Calendar} label="Booking Assistant" desc="Manage AI-assisted bookings" />
            <QuickLink to="/ai-productivity" icon={TrendingUp} label="AI Productivity" desc="Track AI performance metrics" />
          </CardContent>
        </Card>

        {/* SEO & Presence */}
        <Card className="border-l-4 border-l-accent/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-5 w-5 text-accent" /> SEO & Brand Presence
            </CardTitle>
            <CardDescription>
              {s.latestBrandScore !== null
                ? `Latest brand health: ${Math.round(s.latestBrandScore)}/100`
                : "No LLM scans yet — onboard a client to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {s.latestBrandScore !== null && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Brand Health</span>
                  <span className="font-semibold">{Math.round(s.latestBrandScore)}/100</span>
                </div>
                <Progress value={s.latestBrandScore} className="h-2" />
              </div>
            )}
            <QuickLink to="/seo-onboarding" icon={UserPlus} label="SEO Client Onboarding" desc="Capture full marketing stack" />
            <QuickLink to="/llm-presence" icon={Eye} label="LLM Search Presence" desc="Monitor AI brand mentions" />
            <QuickLink to="/seo" icon={Search} label="SEO Dashboard" desc="Technical SEO overview" />
          </CardContent>
        </Card>

        {/* Marketing */}
        <Card className="border-l-4 border-l-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="h-5 w-5 text-warning" /> Marketing
            </CardTitle>
            <CardDescription>Ad performance & campaign analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <QuickLink to="/marketing" icon={BarChart3} label="Marketing Analytics" desc="Cross-channel performance" />
            <QuickLink to="/google-ads-guide" icon={Search} label="Google Ads" desc="Campaign setup & optimization" />
            <QuickLink to="/meta-ads-guide" icon={Megaphone} label="Meta Ads" desc="Facebook & Instagram campaigns" />
            <QuickLink to="/gtm" icon={Zap} label="Go-To-Market" desc="Market zones & lead scoring" />
          </CardContent>
        </Card>

        {/* Quick Setup */}
        <Card className="border-l-4 border-l-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-success" /> Quick Setup
            </CardTitle>
            <CardDescription>Get the most out of your platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <SetupItem done={s.aiCalls > 0} label="Configure AI Voice Agent" to="/ai-voice-content" />
            <SetupItem done={s.clientProfiles > 0} label="Onboard SEO Client" to="/seo-onboarding" />
            <SetupItem done={s.latestBrandScore !== null} label="Run LLM Brand Scan" to="/llm-presence" />
            <SetupItem done={false} label="Connect Integrations" to="/integrations" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, variant = "default" }: { icon: any; label: string; value: number; variant?: "default" | "success" | "warning" }) {
  const styles = {
    default: { card: "bg-card", text: "text-muted-foreground", iconBg: "bg-muted", iconColor: "text-muted-foreground" },
    success: { card: "bg-success/10 border-success/30", text: "text-success", iconBg: "bg-success/20", iconColor: "text-success" },
    warning: { card: "bg-warning/10 border-warning/30", text: "text-warning", iconBg: "bg-warning/20", iconColor: "text-warning" },
  };
  const s = styles[variant];

  return (
    <div className={cn("rounded-lg border p-4 transition-shadow hover:shadow-md", s.card)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <p className={cn("text-xs uppercase tracking-wide mt-1", variant === "default" ? "text-muted-foreground" : s.text)}>{label}</p>
        </div>
        <div className={cn("rounded-lg p-2", s.iconBg)}>
          <Icon className={cn("h-5 w-5", s.iconColor)} />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, desc }: { to: string; icon: any; label: string; desc: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50 group">
      <div className="rounded-md bg-muted p-2 group-hover:bg-success/10">
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-success" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function SetupItem({ done, label, to }: { done: boolean; label: string; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
      <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", done ? "border-success bg-success" : "border-border")}>
        {done && <CheckCircle2 className="h-3 w-3 text-success-foreground" />}
      </div>
      <span className={cn("text-sm", done ? "text-muted-foreground line-through" : "text-foreground")}>{label}</span>
    </Link>
  );
}
