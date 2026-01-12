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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "connected" | "pending" | "disconnected" | "coming_soon";
  icon: string;
  configPath?: string;
}

export default function IntegrationsPage() {
  const { currentOrg } = useOrg();
  const [loading, setLoading] = useState(true);
  const [jobberStatus, setJobberStatus] = useState<"connected" | "pending" | "disconnected">("disconnected");

  useEffect(() => {
    if (currentOrg) {
      checkIntegrationStatus();
    }
  }, [currentOrg]);

  const checkIntegrationStatus = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      // Check Jobber connection
      const { data: jobberData } = await supabase
        .from("integration_jobber_accounts")
        .select("status")
        .eq("org_id", currentOrg.id)
        .single();

      if (jobberData?.status === "connected") {
        setJobberStatus("connected");
      } else if (jobberData) {
        setJobberStatus("pending");
      }
    } catch (error) {
      console.error("Error checking integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const integrations: Integration[] = [
    {
      id: "jobber",
      name: "Jobber",
      description: "Field service management • Scheduling, jobs, and client management",
      category: "Core",
      status: jobberStatus,
      icon: "📋",
      configPath: "/integrations/jobber"
    },
    {
      id: "elevenlabs",
      name: "ElevenLabs",
      description: "Conversational AI voice • Powers inbound call handling",
      category: "AI",
      status: "connected", // Assume connected if API key is set
      icon: "🎙️",
      configPath: "/settings"
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
      status: "coming_soon",
      icon: "🎯",
    },
    {
      id: "meta-ads",
      name: "Meta Ads",
      description: "Facebook & Instagram ads • Campaign performance",
      category: "Marketing",
      status: "coming_soon",
      icon: "📱",
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
            Connect external services & APIs to power your AI platform
          </p>
        </div>
        <Button onClick={checkIntegrationStatus} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

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
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>
                  {integration.status !== "coming_soon" && integration.configPath && (
                    <Button 
                      variant={integration.status === "connected" ? "outline" : "default"} 
                      className="w-full" 
                      asChild
                    >
                      <Link to={integration.configPath}>
                        {integration.status === "connected" ? (
                          <>
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Link>
                    </Button>
                  )}
                  {integration.status === "coming_soon" && (
                    <Button variant="outline" className="w-full" disabled>
                      Coming Soon
                    </Button>
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
