import { useOrg } from "@/contexts/OrgContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useJobberLeads } from "@/hooks/useJobberLeads";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bot, Phone, Calendar, BarChart3, Search, Eye, Users, TrendingUp,
  ArrowRight, Loader2, UserPlus, Megaphone,
  MessageSquare, Zap, Globe, BookOpen, Link2, MapPinned,
  DollarSign, ClipboardList, Briefcase, Mic, Clock, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const actionCards: { to: string; icon: React.ElementType; title: string; desc: string }[] = [
  { to: "/ai-control", icon: Bot, title: "AI Control Center", desc: "Manage your AI voice agent, scripts, and booking rules." },
  { to: "/ai-chat", icon: MessageSquare, title: "AI Assistant", desc: "Chat with AI or review call logs and conversations." },
  { to: "/ai-booking", icon: Calendar, title: "Booking Assistant", desc: "Manage AI-powered bookings and scheduling." },
  { to: "/ai-voice-content", icon: Mic, title: "Voice Content", desc: "Create and manage AI voice scripts and content." },
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
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 animate-fade-in">
      {/* Welcome */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground">What would you like to do today?</p>
      </div>

      {/* AI Chat Input */}
      <div className="mx-auto max-w-2xl">
        <Link to="/ai-chat" className="group flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3.5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
          <Zap className="h-5 w-5 text-primary" />
          <span className="flex-1 text-sm text-muted-foreground">Ask me anything about your business, leads, or campaigns...</span>
          <Send className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </Link>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        {/* Recent Activity / Jobber Leads */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Recent Leads</h2>
            </div>
            <div className="space-y-3">
              {jobberLeads && jobberLeads.clients.length > 0 ? (
                jobberLeads.clients.slice(0, 4).map((client) => (
                  <div key={client.id} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(client.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No recent leads. Connect Jobber to see lead activity.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jobber Pipeline */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Jobber Pipeline</h2>
            </div>
            {jSummary ? (
              <div className="space-y-3">
                <InfoRow label="Total Clients" value={jSummary.totalClients} />
                <InfoRow label="Open Requests" value={jSummary.openRequests} />
                <InfoRow label="Active Jobs" value={jSummary.activeJobs} />
                <InfoRow label="Revenue" value={`$${jSummary.totalRevenue.toLocaleString()}`} />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Connect Jobber to view your pipeline.</p>
            )}
          </CardContent>
        </Card>

        {/* Platform Stats */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Platform Stats</h2>
            </div>
            <div className="space-y-3">
              <InfoRow label="AI Interactions" value={s.aiCalls} />
              <InfoRow label="Total Bookings" value={s.totalBookings} />
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
