import { useOrg } from "@/contexts/OrgContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useJobberLeads } from "@/hooks/useJobberLeads";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot, Phone, Calendar, BarChart3, Search, Eye, Users, TrendingUp,
  ArrowRight, Loader2, UserPlus, Megaphone, CheckCircle2,
  MessageSquare, Zap, Globe, BookOpen, Link2, MapPinned,
  DollarSign, ClipboardList, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const quickActions = [
  { to: "/ai-chat", icon: MessageSquare, label: "Chat with AI" },
  { to: "/ai-calls", icon: Phone, label: "View AI Calls" },
  { to: "/ai-booking", icon: Calendar, label: "Manage Bookings" },
  { to: "/marketing", icon: BarChart3, label: "Marketing Analytics" },
  { to: "/seo-onboarding", icon: UserPlus, label: "Onboard Client" },
  { to: "/llm-presence", icon: Eye, label: "LLM Brand Scan" },
  { to: "/integrations", icon: Link2, label: "Integrations" },
];

const featureCards: { to: string; icon: React.ElementType; title: string; desc: string; accent: string }[] = [
  { to: "/ai-control", icon: Bot, title: "AI Control Center", desc: "Manage your AI voice agent, scripts, and booking rules in one place.", accent: "bg-[hsl(142,40%,30%)]" },
  { to: "/gtm", icon: MapPinned, title: "GTM Command Center", desc: "Market zones, lead scoring, and go-to-market strategy powered by AI.", accent: "bg-accent" },
  { to: "/seo", icon: Search, title: "SEO Dashboard", desc: "Technical SEO overview, keyword tracking, and site health monitoring.", accent: "bg-warning" },
  { to: "/ai-productivity", icon: TrendingUp, title: "AI Productivity", desc: "Track how your AI assistant is performing across calls and bookings.", accent: "bg-[hsl(142,40%,30%)]" },
];

export default function MainDashboardPage() {
  const { currentOrg } = useOrg();
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["main-dashboard", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;
      const [bookings, toolCalls, followups, profiles, scans] = await Promise.all([
        supabase.from("ai_bookings").select("status").eq("org_id", currentOrg.id),
        supabase.from("ai_tool_call_logs").select("id").eq("org_id", currentOrg.id),
        supabase.from("followups").select("status").eq("org_id", currentOrg.id),
        supabase.from("seo_client_profiles").select("id").eq("org_id", currentOrg.id) as any,
        supabase.from("llm_brand_scans").select("overall_brand_score, status").eq("org_id", currentOrg.id).order("created_at", { ascending: false }).limit(1) as any,
      ]);
      const openFollowups = followups.data?.filter((f: any) => f.status === "open" || f.status === "pending")?.length || 0;
      const booked = bookings.data?.filter((b: any) => b.status === "scheduled" || b.status === "confirmed")?.length || 0;
      return { totalBookings: bookings.data?.length || 0, booked, aiCalls: toolCalls.data?.length || 0, openFollowups, clientProfiles: profiles.data?.length || 0, latestBrandScore: scans.data?.[0]?.overall_brand_score ?? null };
    },
    enabled: !!currentOrg,
  });

  const { data: jobberLeads, isLoading: leadsLoading } = useJobberLeads(20);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const s = stats || { totalBookings: 0, booked: 0, aiCalls: 0, openFollowups: 0, clientProfiles: 0, latestBrandScore: null };
  const firstName = user?.email?.split("@")[0] || "there";
  const jSummary = jobberLeads?.summary;

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 animate-fade-in">
      {/* Central Welcome */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          What would you like to do today?
        </p>
      </div>

      {/* Quick-action chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-foreground shadow-sm transition-all hover:border-[hsl(142,40%,30%)]/40 hover:shadow-md"
          >
            <a.icon className="h-3.5 w-3.5 text-[hsl(142,40%,30%)]" />
            {a.label}
          </Link>
        ))}
      </div>

      {/* KPI strip — platform + Jobber */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiPill icon={Phone} label="AI Calls" value={s.aiCalls} />
        <KpiPill icon={Calendar} label="Bookings" value={s.totalBookings} />
        <KpiPill icon={CheckCircle2} label="Confirmed" value={s.booked} />
        <KpiPill icon={Users} label="Clients" value={s.clientProfiles} />
      </div>

      {/* Jobber Leads Strip */}
      {jSummary && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Jobber Pipeline</h2>
            <Badge variant="outline" className="text-[11px] border-[hsl(142,40%,30%)]/30 text-[hsl(142,40%,30%)]">Live</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiPill icon={Users} label="Total Clients" value={jSummary.totalClients} />
            <KpiPill icon={ClipboardList} label="Open Requests" value={jSummary.openRequests} />
            <KpiPill icon={Briefcase} label="Active Jobs" value={jSummary.activeJobs} />
            <KpiPill icon={DollarSign} label="Revenue" value={jSummary.totalRevenue} isCurrency />
          </div>
        </div>
      )}

      {/* Recent Jobber Leads Table */}
      {jobberLeads && jobberLeads.clients.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Recent Leads from Jobber</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Phone</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobberLeads.clients.slice(0, 8).map((client) => (
                      <tr key={client.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-foreground">{client.name}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{client.phones?.[0]?.number || "—"}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant={client.isLead ? "default" : "secondary"} className="text-[11px]">
                            {client.isLead ? "Lead" : "Client"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">
                          {new Date(client.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feature cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Popular features</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {featureCards.map((f) => (
            <Link key={f.to} to={f.to} className="group">
              <Card className="h-full transition-shadow hover:shadow-md border-border">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={cn("mt-0.5 rounded-md p-1.5", f.accent)}>
                    <f.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-[hsl(142,40%,30%)] transition-colors">{f.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 mt-1 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Setup checklist */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Getting started</h2>
        <Card>
          <CardContent className="p-3 space-y-0.5">
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

function KpiPill({ icon: Icon, label, value, isCurrency }: { icon: any; label: string; value: number; isCurrency?: boolean }) {
  const display = isCurrency
    ? `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : value.toLocaleString();

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
      <Icon className="h-4 w-4 text-[hsl(142,40%,30%)]" />
      <div>
        <p className="text-lg font-bold text-foreground leading-none">{display}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function SetupItem({ done, label, to }: { done: boolean; label: string; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/50 transition-colors">
      <div className={cn("h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center", done ? "border-[hsl(142,40%,30%)] bg-[hsl(142,40%,30%)]" : "border-border")}>
        {done && <CheckCircle2 className="h-3 w-3 text-white" />}
      </div>
      <span className={cn("text-sm", done ? "text-muted-foreground line-through" : "text-foreground")}>{label}</span>
    </Link>
  );
}
