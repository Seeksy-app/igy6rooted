import { useState } from "react";
import { 
  Link2, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Settings, Plus, Loader2, Shield, Clock, TestTube
} from "lucide-react";
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

  const startOAuth = (provider: string, path: string) => {
    if (!currentOrg) {
      toast({ variant: "destructive", title: "Error", description: "No organization selected." });
      return;
    }
    const redirectUri = `${window.location.origin}/integrations/${provider}/callback`;
    window.location.href = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${path}?org_id=${currentOrg.id}&redirect_uri=${encodeURIComponent(redirectUri)}`;
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
