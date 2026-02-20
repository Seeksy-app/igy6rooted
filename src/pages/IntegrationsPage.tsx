import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Link2, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Settings, Plus, Loader2, Shield, Clock, TestTube, Zap,
  Copy, ExternalLink, Smartphone, Share, MoreVertical,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "connected" | "pending" | "disconnected" | "coming_soon";
  icon: string;
  configPath?: string;
  lastSync?: string;
}

export default function IntegrationsPage() {
  const { currentOrg, userRole } = useOrg();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = userRole === "admin";
  const [testing, setTesting] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle OAuth callback results
  useEffect(() => {
    const jobberConnected = searchParams.get('jobber_connected');
    const jobberError = searchParams.get('jobber_error');
    if (jobberConnected === 'true') {
      toast({ title: "Jobber Connected!", description: "Your Jobber account has been successfully connected." });
      queryClient.invalidateQueries({ queryKey: ["jobber-connection"] });
      setSearchParams({});
    } else if (jobberError) {
      toast({ variant: "destructive", title: "Connection Failed", description: jobberError });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, toast, queryClient]);

  const { data: jobberConnection, isLoading: loadingJobber } = useQuery({
    queryKey: ["jobber-connection", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;
      const { data } = await supabase
        .from("integration_jobber_accounts")
        .select("*")
        .eq("org_id", currentOrg.id)
        .maybeSingle();
      return data;
    },
    enabled: !!currentOrg
  });

  const { data: adAccounts, isLoading: loadingAdAccounts } = useQuery({
    queryKey: ["ad-accounts", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data } = await supabase
        .from("integration_ad_accounts")
        .select("*")
        .eq("org_id", currentOrg.id);
      return data || [];
    },
    enabled: !!currentOrg
  });

  const googleAdsConnection = adAccounts?.find(a => a.provider === "google_ads");
  const metaAdsConnection = adAccounts?.find(a => a.provider === "meta_ads");

  const startOAuth = async (provider: string, path: string) => {
    if (!currentOrg) {
      toast({ variant: "destructive", title: "Error", description: "No organization selected." });
      return;
    }
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast({ variant: "destructive", title: "Error", description: "Please log in first." });
        return;
      }
      const redirectUri = `${window.location.origin}/integrations`;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${path}?org_id=${currentOrg.id}&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `OAuth start failed (${response.status})`);
      }
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Fallback for functions that still do redirects
        window.location.href = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${path}?org_id=${currentOrg.id}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Connection Error", description: (error as Error).message });
    }
  };

  const testConnection = async (id: string) => {
    setTesting(id);
    try {
      if (id === "jobber" && jobberConnection?.status === "connected") {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobber-api/health?org_id=${currentOrg?.id}`,
          { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
        );
        if (!response.ok) throw new Error("Edge Function returned a non-2xx status code");
        const data = await response.json();
        if (!data.jobber_connected) throw new Error("Jobber connection is not active");
        toast({ title: "Connection OK", description: "Jobber API is responding." });
      } else if (id === "elevenlabs") {
        const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token");
        if (error || !data?.token) throw new Error("Failed to get token");
        toast({ title: "Connection OK", description: "ElevenLabs API is responding." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Connection Failed", description: (error as Error).message });
    } finally {
      setTesting(null);
    }
  };

  const getAdStatus = (conn: typeof googleAdsConnection): Integration["status"] => {
    if (!conn) return "disconnected";
    if (conn.status === "connected") return "connected";
    if (conn.status === "error" || conn.status === "expired") return "pending";
    return "disconnected";
  };

  const integrations: Integration[] = [
    { id: "jobber", name: "Jobber", description: "Scheduling, jobs & client data", category: "Core", status: jobberConnection?.status === "connected" ? "connected" : jobberConnection ? "pending" : "disconnected", icon: "📋", configPath: "/integrations/jobber", lastSync: jobberConnection?.updated_at },
    { id: "elevenlabs", name: "ElevenLabs", description: "Conversational AI voice agent", category: "AI", status: "connected", icon: "🎙️" },
    { id: "semrush", name: "Semrush", description: "SEO analytics • Per-client domain tracking", category: "SEO & Analytics", status: "connected", icon: "🔍", configPath: "/seo-onboarding" },
    { id: "google-ads", name: "Google Ads", description: "Ad performance & ROI tracking", category: "Marketing", status: getAdStatus(googleAdsConnection), icon: "🎯", lastSync: googleAdsConnection?.updated_at },
    { id: "meta-ads", name: "Meta Ads", description: "Facebook & Instagram campaigns", category: "Marketing", status: getAdStatus(metaAdsConnection), icon: "📱", lastSync: metaAdsConnection?.updated_at },
    { id: "google-analytics", name: "Google Analytics", description: "Website & conversion tracking", category: "Analytics", status: "coming_soon", icon: "📊" },
    { id: "google-business", name: "Google Business Profile", description: "Local SEO & reviews", category: "Marketing", status: "coming_soon", icon: "🏪" },
  ];

  const connectAction: Record<string, () => void> = {
    "jobber": () => startOAuth("jobber", "jobber-oauth-start"),
    "google-ads": () => startOAuth("google-ads", "google-ads-oauth-start"),
    "meta-ads": () => startOAuth("meta-ads", "meta-ads-oauth-start"),
  };

  const grouped = integrations.reduce((acc, i) => {
    (acc[i.category] ??= []).push(i);
    return acc;
  }, {} as Record<string, Integration[]>);

  if (loadingJobber || loadingAdAccounts) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-success/15">
              <Link2 className="h-6 w-6 text-success" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
          </div>
          <p className="text-sm text-muted-foreground">Connect and manage external services</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["jobber-connection", "ad-accounts"] })} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 border border-border p-3">
        <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">API keys and OAuth tokens are encrypted at rest and never exposed after saving.</p>
      </div>

      {/* Categories */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{category}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                isAdmin={isAdmin}
                testing={testing}
                onConnect={connectAction[integration.id]}
                onTest={() => testConnection(integration.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Zapier Integration */}
      <ZapierIntegrationSection orgId={currentOrg?.id} />

      {/* Sales App */}
      <SalesAppSection />
    </div>
  );
}

function StatusBadge({ status }: { status: Integration["status"] }) {
  switch (status) {
    case "connected":
      return <Badge className="bg-success/15 text-success border-success/30 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Connected</Badge>;
    case "pending":
      return <Badge className="bg-warning/15 text-warning border-warning/30 text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Action Needed</Badge>;
    case "disconnected":
      return <Badge variant="secondary" className="text-xs"><XCircle className="h-3 w-3 mr-1" />Not Connected</Badge>;
    case "coming_soon":
      return <Badge variant="secondary" className="text-xs">Coming Soon</Badge>;
  }
}

function IntegrationCard({ integration, isAdmin, testing, onConnect, onTest }: {
  integration: Integration;
  isAdmin: boolean;
  testing: string | null;
  onConnect?: () => void;
  onTest: () => void;
}) {
  const { id, name, description, status, icon, lastSync, configPath } = integration;

  return (
    <Card className={`transition-all hover:shadow-md ${status === "connected" ? "border-success/20" : ""}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{icon}</span>
            <div>
              <p className="text-sm font-semibold">{name}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        {lastSync && status === "connected" && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            Synced {new Date(lastSync).toLocaleDateString()}
          </div>
        )}

        {isAdmin && status === "connected" && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onTest} disabled={testing === id}>
              {testing === id ? <Loader2 className="h-3 w-3 animate-spin" /> : <TestTube className="h-3 w-3 mr-1" />}
              Test
            </Button>
            {configPath && (
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" asChild>
                <Link to={configPath}><Settings className="h-3 w-3 mr-1" />Configure</Link>
              </Button>
            )}
          </div>
        )}

        {isAdmin && status === "disconnected" && onConnect && (
          <Button size="sm" className="w-full h-8 text-xs bg-success hover:bg-success/90 text-success-foreground" onClick={onConnect}>
            <Plus className="h-3 w-3 mr-1" />Connect
          </Button>
        )}

        {isAdmin && status === "pending" && onConnect && (
          <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={onConnect}>
            <RefreshCw className="h-3 w-3 mr-1" />Reconnect
          </Button>
        )}

        {status === "coming_soon" && (
          <Button variant="outline" size="sm" className="w-full h-8 text-xs" disabled>Coming Soon</Button>
        )}

        {!isAdmin && status !== "coming_soon" && (
          <p className="text-[11px] text-muted-foreground text-center">Admin access required</p>
        )}
      </CardContent>
    </Card>
  );
}

function ZapierIntegrationSection({ orgId }: { orgId?: string }) {
  return (
    <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-amber-500" />
          Zapier Integration
        </CardTitle>
        <CardDescription>
          Connect SendJim to this webhook via Zapier to automatically import mailing recipients as canvassing leads.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Webhook URL</p>
          <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
            <Zap className="h-4 w-4 text-amber-500 shrink-0" />
            <code className="flex-1 text-xs text-foreground truncate">
              {`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zapier-canvassing-webhook?org_id=${orgId || "YOUR_ORG_ID"}`}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zapier-canvassing-webhook?org_id=${orgId || ""}`
                );
                sonnerToast.success("Webhook URL copied!");
              }}
              className="gap-1.5 shrink-0"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-4 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Zapier Setup Steps</h4>
          <ol className="space-y-2">
            {[
              <>In Zapier, create a new Zap with <strong>SendJim</strong> as the trigger (e.g. "New Order" or use SendJim's "Export CSV" → Google Sheets → Zapier)</>,
              <>Add a <strong>Webhooks by Zapier</strong> action → choose <strong>POST</strong></>,
              <>Paste the webhook URL above into the <strong>URL</strong> field</>,
              <>Set <strong>Payload Type</strong> to <strong>JSON</strong></>,
              <>Map SendJim fields: <code className="bg-muted px-1 rounded text-xs">address</code>, <code className="bg-muted px-1 rounded text-xs">city</code>, <code className="bg-muted px-1 rounded text-xs">state</code>, <code className="bg-muted px-1 rounded text-xs">zip</code>, <code className="bg-muted px-1 rounded text-xs">sent_date</code>, <code className="bg-muted px-1 rounded text-xs">mailing_name</code></>,
              <>Test and turn on your Zap — leads will appear here automatically!</>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="bg-amber-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-1">
          <p className="font-medium">Accepted fields in each lead:</p>
          <p><code>address</code> (required), <code>city</code>, <code>state</code>, <code>zip</code>, <code>sent_date</code>, <code>mailing_name</code>, <code>order_type</code>, <code>property_type</code>, <code>estimated_delivery_date</code></p>
          <p className="mt-1">Send a single lead or <code>{`{ "leads": [...] }`}</code> for batch import.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SalesAppSection() {
  const [showInstall, setShowInstall] = useState(false);
  const installUrl = `${window.location.origin}/install`;

  const copyInstallLink = () => {
    navigator.clipboard.writeText(installUrl);
    sonnerToast.success("Install link copied!");
  };

  return (
    <div className="space-y-3">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-primary" />
            IGY6 Sales App
          </CardTitle>
          <CardDescription>
            Your field team's mobile command center — install on any phone to start knocking doors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Live App Preview */}
            <div className="flex flex-col items-center">
              <div className="relative w-[280px] h-[560px] rounded-[2rem] border-4 border-foreground/20 bg-background shadow-xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground/20 rounded-b-xl z-10" />
                <iframe
                  src="/knock"
                  className="w-full h-full border-0"
                  title="IGY6 Sales App Preview"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">Live preview of the Sales App</p>
            </div>

            {/* Right: Install Link + Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                <code className="flex-1 text-sm text-foreground truncate">{installUrl}</code>
                <Button variant="outline" size="sm" onClick={copyInstallLink} className="gap-1.5 shrink-0">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: "📍", title: "GPS Address Detection", desc: "Auto-detect the nearest address or search manually" },
                  { icon: "🚪", title: "One-Tap Door Knock", desc: "Log a knock and set status instantly" },
                  { icon: "📝", title: "Field Notes", desc: "Add notes to any lead while on the doorstep" },
                  { icon: "🗺️", title: "Leads & Map View", desc: "Browse assigned leads and plan your route" },
                  { icon: "🔍", title: "Address Search", desc: "Type-ahead search to find any address nearby" },
                  { icon: "💾", title: "Save as Lead", desc: "Capture new addresses not in your list yet" },
                ].map((f) => (
                  <div key={f.title} className="rounded-lg border bg-background p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{f.icon}</span>
                      <h4 className="text-sm font-semibold text-foreground">{f.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installation Instructions — Collapsible */}
      <Card>
        <button
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
          onClick={() => setShowInstall(!showInstall)}
        >
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" />
            Installation Instructions (iOS & Android)
          </span>
          {showInstall ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {showInstall && (
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-background p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍎</span>
                  <h3 className="font-semibold text-sm">Install on iPhone / iPad</h3>
                </div>
                <ol className="space-y-2">
                  {[
                    <>Open the install link in <strong>Safari</strong> (required for iOS)</>,
                    <>Tap the <Share className="h-4 w-4 inline align-text-bottom" /> <strong>Share</strong> button</>,
                    <>Scroll down and tap <strong>"Add to Home Screen"</strong></>,
                    <>Tap <strong>"Add"</strong> — the app icon appears on your home screen</>,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-lg border bg-background p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <h3 className="font-semibold text-sm">Install on Android</h3>
                </div>
                <ol className="space-y-2">
                  {[
                    <>Open the install link in <strong>Chrome</strong></>,
                    <>Tap the <MoreVertical className="h-4 w-4 inline align-text-bottom" /> <strong>menu</strong> (three dots)</>,
                    <>Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></>,
                    <>Confirm — the app appears on your home screen</>,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
