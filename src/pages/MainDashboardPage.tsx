import { useOrg } from "@/contexts/OrgContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useJobberLeads } from "@/hooks/useJobberLeads";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bot, BarChart3, Search, Users,
  Loader2, Zap, Link2, MapPinned,
  DollarSign, ClipboardList, Briefcase, Send,
  Sun,
} from "lucide-react";
import { useState, useEffect } from "react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function useLocalTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

function WeatherTimeWidget() {
  const now = useLocalTime();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  return (
    <div className="flex items-center gap-3 text-white/80 text-sm">
      <Sun className="h-5 w-5 text-yellow-300" />
      <div className="text-right">
        <p className="text-white font-semibold text-base leading-none">{timeStr}</p>
        <p className="text-white/60 text-xs mt-0.5">{dateStr}</p>
      </div>
    </div>
  );
}

const actionCards: { to: string; icon: React.ElementType; title: string; desc: string }[] = [
  { to: "/ai-chat", icon: BarChart3, title: "AI Analytics", desc: "Review call logs, chat sessions, and booking data." },
  { to: "/ai-control", icon: Bot, title: "AI Control Center", desc: "Configure your AI voice agent and booking rules." },
  { to: "/gtm", icon: MapPinned, title: "GTM Command Center", desc: "Market zones, lead scoring, and go-to-market strategy." },
  { to: "/marketing", icon: BarChart3, title: "Marketing Analytics", desc: "Track campaigns, spend, and ROI across channels." },
  { to: "/seo", icon: Search, title: "SEO Dashboard", desc: "Technical SEO, keyword tracking, and site health." },
  { to: "/integrations", icon: Link2, title: "Integrations", desc: "Connect Jobber, Google Ads, Meta, and more." },
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
      const booked = bookings.data?.filter((b: any) => b.status === "scheduled" || b.status === "confirmed")?.length || 0;
      return { totalBookings: bookings.data?.length || 0, booked, aiCalls: toolCalls.data?.length || 0, clientProfiles: profiles.data?.length || 0, latestBrandScore: scans.data?.[0]?.overall_brand_score ?? null };
    },
    enabled: !!currentOrg,
  });

  const { data: jobberLeads } = useJobberLeads(20);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const s = stats || { totalBookings: 0, booked: 0, aiCalls: 0, clientProfiles: 0, latestBrandScore: null };
  const firstName = user?.email?.split("@")[0] || "there";
  const jSummary = jobberLeads?.summary;

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8 animate-fade-in">
      {/* Leads & Sales Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[hsl(142,30%,25%)] to-[hsl(142,25%,35%)] text-white p-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_50%,white,transparent_70%)]" />
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-white/70">Your leads & sales at a glance</p>
          </div>
          <WeatherTimeWidget />
        </div>
      </div>

      {/* Jobber KPI Strip */}
      {jSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={Users} label="Total Clients" value={jSummary.totalClients} />
          <KpiCard icon={ClipboardList} label="Open Requests" value={jSummary.openRequests} />
          <KpiCard icon={Briefcase} label="Active Jobs" value={jSummary.activeJobs} />
          <KpiCard icon={DollarSign} label="Revenue" value={jSummary.totalRevenue} isCurrency />
        </div>
      )}

      {/* Action Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actionCards.map((card) => (
          <Link key={card.to} to={card.to} className="group">
            <Card className="h-full border-border transition-all hover:border-primary/30 hover:shadow-md">
              <CardContent className="p-5 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/30 group-hover:border-primary/30 transition-colors">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{card.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Bottom Info Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Recent Leads</h2>
              <span className="ml-auto text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">via Jobber</span>
            </div>
            {jobberLeads && jobberLeads.clients.length > 0 ? (
              <div className="space-y-2.5">
                {jobberLeads.clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.phones?.[0]?.number || "No phone"}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(client.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No recent leads. Connect Jobber to see lead activity.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Platform Stats</h2>
            </div>
            <div className="space-y-3">
              <InfoRow label="AI Interactions" value={s.aiCalls} />
              <InfoRow label="Bookings" value={s.totalBookings} />
              <InfoRow label="Confirmed" value={s.booked} />
              <InfoRow label="SEO Clients" value={s.clientProfiles} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{String(value)}</span>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, isCurrency }: { icon: any; label: string; value: number; isCurrency?: boolean }) {
  const display = isCurrency
    ? `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : value.toLocaleString();

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground leading-none">{display}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
        </div>
        <span className="ml-auto text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Jobber</span>
      </CardContent>
    </Card>
  );
}
