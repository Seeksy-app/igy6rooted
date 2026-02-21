import { useOrg } from "@/contexts/OrgContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useJobberLeads } from "@/hooks/useJobberLeads";
import { Link, Navigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bot, BarChart3, Search, Users,
  Loader2, Zap, Link2, MapPinned,
  DollarSign, ClipboardList, Briefcase, Send,
  Sun, Mail, TrendingUp,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
  const isMobile = useIsMobile();

  // Check ALL memberships to detect sales role across orgs
  const { data: salesMembership, isLoading: roleLoading } = useQuery({
    queryKey: ["user-all-roles", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("team_members")
        .select("role, org_id")
        .eq("user_id", user.id);
      // Find any membership with "sales" role
      const salesEntry = data?.find((m: any) => m.role === "sales");
      return salesEntry || null;
    },
    enabled: !!user,
  });


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

  // Marketing metrics for chart
  const { data: metricsData } = useQuery({
    queryKey: ["dashboard-metrics", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data } = await supabase
        .from("marketing_metrics")
        .select("channel, leads, spend, conversions, metric_date")
        .eq("org_id", currentOrg.id)
        .order("metric_date", { ascending: false })
        .limit(90);
      return data || [];
    },
    enabled: !!currentOrg,
  });

  // Leads by channel for pie chart
  const { data: leadsData } = useQuery({
    queryKey: ["dashboard-leads-channel", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data } = await supabase
        .from("marketing_leads")
        .select("channel")
        .eq("org_id", currentOrg.id);
      return data || [];
    },
    enabled: !!currentOrg,
  });

  const channelChartData = useMemo(() => {
    if (!metricsData?.length) return [];
    const byChannel: Record<string, { leads: number; spend: number; conversions: number }> = {};
    metricsData.forEach((m: any) => {
      if (!byChannel[m.channel]) byChannel[m.channel] = { leads: 0, spend: 0, conversions: 0 };
      byChannel[m.channel].leads += m.leads;
      byChannel[m.channel].spend += Number(m.spend);
      byChannel[m.channel].conversions += m.conversions;
    });
    return Object.entries(byChannel).map(([channel, vals]) => ({ channel, ...vals }));
  }, [metricsData]);

  const COLORS = ["hsl(142,30%,35%)", "hsl(200,60%,50%)", "hsl(35,80%,55%)", "hsl(280,50%,55%)", "hsl(0,60%,55%)"];

  const leadsPieData = useMemo(() => {
    if (!leadsData?.length) return [];
    const counts: Record<string, number> = {};
    leadsData.forEach((l: any) => {
      counts[l.channel] = (counts[l.channel] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leadsData]);

  // Wait for role check to complete before rendering
  if (isLoading || (!!user && roleLoading)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Sales role detected on any org → redirect to Sales PWA
  if (salesMembership) {
    return <Navigate to="/knock" replace />;
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Leads by Channel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {channelChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={channelChartData}>
                  <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="leads" fill="hsl(142,30%,35%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground py-8 text-center">No marketing metrics data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leadsPieData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={leadsPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                      {leadsPieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {leadsPieData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-semibold text-foreground ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-8 text-center">No lead data yet.</p>
            )}
          </CardContent>
        </Card>
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
