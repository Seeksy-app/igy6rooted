import { useState, useEffect } from "react";
import { 
  Link2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  ExternalLink,
  Settings,
  Plus,
  Loader2,
  Shield,
  Clock,
  TestTube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "connected" | "pending" | "disconnected" | "coming_soon";
  icon: string;
  configPath?: string;
  lastSync?: string;
  scopes?: string[];
}

export default function IntegrationsPage() {
  const { currentOrg, userRole } = useOrg();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = userRole === "admin";
  
  const [elevenLabsDialogOpen, setElevenLabsDialogOpen] = useState(false);
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [elevenLabsAgentId, setElevenLabsAgentId] = useState("");
  const [testing, setTesting] = useState<string | null>(null);

  // Fetch Jobber connection status
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

  // Fetch ad account connections
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

  const handleConnectJobber = async () => {
    if (!currentOrg) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No organization selected.",
      });
      return;
    }

    try {
      const redirectUri = `${window.location.origin}/integrations/jobber/callback`;
      const oauthStartUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobber-oauth-start?org_id=${currentOrg.id}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = oauthStartUrl;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to start Jobber OAuth. Please try again.",
      });
    }
  };

  const handleConnectGoogleAds = async () => {
    if (!currentOrg) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No organization selected.",
      });
      return;
    }

    try {
      const redirectUri = `${window.location.origin}/integrations/google-ads/callback`;
      const oauthStartUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-ads-oauth-start?org_id=${currentOrg.id}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = oauthStartUrl;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to start Google Ads OAuth. Please try again.",
      });
    }
  };

  const handleConnectMetaAds = async () => {
    if (!currentOrg) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No organization selected.",
      });
      return;
    }

    try {
      const redirectUri = `${window.location.origin}/integrations/meta-ads/callback`;
      const oauthStartUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-ads-oauth-start?org_id=${currentOrg.id}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = oauthStartUrl;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to start Meta Ads OAuth. Please try again.",
      });
    }
  };

  const testConnection = async (integrationId: string) => {
    setTesting(integrationId);
    
    try {
      if (integrationId === "jobber" && jobberConnection?.status === "connected") {
        // Test Jobber connection via health endpoint
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobber-api/health?org_id=${currentOrg?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Edge Function returned a non-2xx status code`);
        }
        
        const data = await response.json();
        if (!data.jobber_connected) {
          throw new Error("Jobber connection is not active");
        }
        
        toast({ title: "Connection OK", description: "Jobber API is responding." });
      } else if (integrationId === "elevenlabs") {
        // Test ElevenLabs by fetching a token
        const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token");
        if (error || !data?.token) throw new Error("Failed to get token");
        toast({ title: "Connection OK", description: "ElevenLabs API is responding." });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: (error as Error).message
      });
    } finally {
      setTesting(null);
    }
  };

  const loading = loadingJobber || loadingAdAccounts;

  const getAdAccountStatus = (connection: typeof googleAdsConnection): Integration["status"] => {
    if (!connection) return "disconnected";
    if (connection.status === "connected") return "connected";
    if (connection.status === "error" || connection.status === "expired") return "pending";
    return "disconnected";
  };

  const integrations: Integration[] = [
    {
      id: "jobber",
      name: "Jobber",
      description: "Field service management • Scheduling, jobs, and client data",
      category: "Core Integration",
      status: jobberConnection?.status === "connected" ? "connected" : jobberConnection ? "pending" : "disconnected",
      icon: "📋",
      configPath: "/integrations/jobber",
      lastSync: jobberConnection?.updated_at,
      scopes: ["read_clients", "read_jobs", "write_jobs"]
    },
    {
      id: "elevenlabs",
      name: "ElevenLabs",
      description: "Conversational AI voice • Powers inbound call handling",
      category: "AI Integration",
      status: "connected", // Managed via platform secrets
      icon: "🎙️",
    },
    {
      id: "google-analytics",
      name: "Google Analytics",
      description: "Website & conversion tracking • Attribution insights",
      category: "Analytics",
      status: "coming_soon",
      icon: "📊",
    },
    {
      id: "google-ads",
      name: "Google Ads",
      description: "Ad performance & spend • ROI tracking",
      category: "Marketing",
      status: getAdAccountStatus(googleAdsConnection),
      icon: "🎯",
      lastSync: googleAdsConnection?.updated_at,
    },
    {
      id: "meta-ads",
      name: "Meta Ads",
      description: "Facebook & Instagram ads • Campaign performance",
      category: "Marketing",
      status: getAdAccountStatus(metaAdsConnection),
      icon: "📱",
      lastSync: metaAdsConnection?.updated_at,
    },
    {
      id: "google-business",
      name: "Google Business Profile",
      description: "Local SEO • Reviews & visibility",
      category: "Marketing",
      status: "coming_soon",
      icon: "🏪",
    },
  ];

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-success/15 text-success border-success/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning/15 text-warning border-warning/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Setup Required
          </Badge>
        );
      case "disconnected":
        return (
          <Badge className="bg-muted text-muted-foreground border-border">
            <XCircle className="h-3 w-3 mr-1" />
            Not Connected
          </Badge>
        );
      case "coming_soon":
        return (
          <Badge variant="secondary">
            Coming Soon
          </Badge>
        );
    }
  };

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/15">
              <Link2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          </div>
          <p className="text-muted-foreground">
            Connect and manage external services • All credentials stored securely
          </p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["jobber-connection", "ad-accounts"] })} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      {/* Security Notice */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Your credentials are secure</p>
              <p className="text-sm text-muted-foreground">
                API keys and OAuth tokens are encrypted at rest and never exposed in the UI after saving.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Categories */}
      {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold mb-4">{category}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryIntegrations.map((integration) => (
              <Card 
                key={integration.id} 
                className={`stat-card transition-all ${
                  integration.status === "connected" ? "border-success/30" : 
                  integration.status === "pending" ? "border-warning/30" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                      </div>
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                  
                  {integration.lastSync && integration.status === "connected" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last sync: {new Date(integration.lastSync).toLocaleString()}
                    </div>
                  )}
                  
                  {integration.status === "connected" && isAdmin && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => testConnection(integration.id)}
                        disabled={testing === integration.id}
                      >
                        {testing === integration.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4 mr-1" />
                        )}
                        Test
                      </Button>
                      {integration.configPath && (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link to={integration.configPath}>
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {integration.status === "disconnected" && isAdmin && (
                    <>
                      {integration.id === "jobber" && (
                        <Button className="w-full" onClick={handleConnectJobber}>
                          <Plus className="mr-2 h-4 w-4" />
                          Connect Jobber
                        </Button>
                      )}
                      {integration.id === "google-ads" && (
                        <Button className="w-full" onClick={handleConnectGoogleAds}>
                          <Plus className="mr-2 h-4 w-4" />
                          Connect Google Ads
                        </Button>
                      )}
                      {integration.id === "meta-ads" && (
                        <Button className="w-full" onClick={handleConnectMetaAds}>
                          <Plus className="mr-2 h-4 w-4" />
                          Connect Meta Ads
                        </Button>
                      )}
                    </>
                  )}
                  
                  {integration.status === "pending" && isAdmin && integration.configPath && (
                    <Button className="w-full" asChild>
                      <Link to={integration.configPath}>
                        <Settings className="mr-2 h-4 w-4" />
                        Complete Setup
                      </Link>
                    </Button>
                  )}

                  {integration.status === "pending" && isAdmin && (integration.id === "google-ads" || integration.id === "meta-ads") && (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={integration.id === "google-ads" ? handleConnectGoogleAds : handleConnectMetaAds}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reconnect
                    </Button>
                  )}
                  
                  {integration.status === "coming_soon" && (
                    <Button variant="outline" className="w-full" disabled>
                      Coming Soon
                    </Button>
                  )}
                  
                  {!isAdmin && integration.status !== "coming_soon" && (
                    <p className="text-xs text-muted-foreground text-center">
                      Admin access required to manage
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Custom Integrations */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="section-header">Custom Integrations</CardTitle>
          <CardDescription>Need a custom connector? Contact support or use our webhook framework.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              API Documentation
            </Button>
            <Button variant="outline">
              Webhook Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
