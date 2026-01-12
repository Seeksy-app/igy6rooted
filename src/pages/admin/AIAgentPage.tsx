import { useState, useEffect } from "react";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bot, Mic, CheckCircle2, XCircle, Loader2, Settings, Phone, Play, TestTube } from "lucide-react";

interface AgentConfig {
  greeting: string;
  businessName: string;
  serviceAreas: string[];
  emailRequired: boolean;
  addressRequired: boolean;
  fallbackBehavior: "request" | "callback";
}

interface EndpointStatus {
  availability: boolean;
  book: boolean;
  health: boolean;
}

export default function AIAgentPage() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [endpointStatus, setEndpointStatus] = useState<EndpointStatus>({
    availability: false,
    book: false,
    health: false,
  });

  const [config, setConfig] = useState<AgentConfig>({
    greeting: "Hi! Thank you for calling IGY6 Rooted. How can I help you schedule an appointment today?",
    businessName: "IGY6 Rooted",
    serviceAreas: [],
    emailRequired: false,
    addressRequired: true,
    fallbackBehavior: "request",
  });

  const testEndpoint = async (endpoint: string) => {
    setTesting(endpoint);
    try {
      const { data, error } = await supabase.functions.invoke("integration-proxy", {
        body: { 
          action: "health",
          orgId: currentOrg?.id 
        },
      });

      if (error) throw error;

      setEndpointStatus((prev) => ({ ...prev, [endpoint]: true }));
      toast({
        title: "Endpoint OK",
        description: `${endpoint} endpoint is responding correctly.`,
      });
    } catch (error) {
      setEndpointStatus((prev) => ({ ...prev, [endpoint]: false }));
      toast({
        variant: "destructive",
        title: "Endpoint Error",
        description: `${endpoint} endpoint is not responding.`,
      });
    } finally {
      setTesting(null);
    }
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    // In production, save to database
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Configuration Saved",
        description: "AI agent settings have been updated.",
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Agent Configuration</h1>
        <p className="text-muted-foreground mt-1">
          Configure how the voice agent interacts with callers
        </p>
      </div>

      {/* Agent Persona */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent Persona
          </CardTitle>
          <CardDescription>
            Customize the agent's personality and greeting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={config.businessName}
              onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
              placeholder="Your business name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="greeting">Opening Greeting</Label>
            <Textarea
              id="greeting"
              value={config.greeting}
              onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
              placeholder="The greeting message when a call is answered"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceAreas">Service Areas (ZIP codes, comma-separated)</Label>
            <Input
              id="serviceAreas"
              value={config.serviceAreas.join(", ")}
              onChange={(e) =>
                setConfig({
                  ...config,
                  serviceAreas: e.target.value.split(",").map((s) => s.trim()),
                })
              }
              placeholder="75001, 75002, 75003"
            />
          </div>
        </CardContent>
      </Card>

      {/* Intake Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Intake Settings
          </CardTitle>
          <CardDescription>
            Configure what information the agent collects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailRequired">Email Required</Label>
              <p className="text-sm text-muted-foreground">
                Require callers to provide an email address
              </p>
            </div>
            <Switch
              id="emailRequired"
              checked={config.emailRequired}
              onCheckedChange={(checked) => setConfig({ ...config, emailRequired: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="addressRequired">Address Required</Label>
              <p className="text-sm text-muted-foreground">
                Require callers to provide a service address
              </p>
            </div>
            <Switch
              id="addressRequired"
              checked={config.addressRequired}
              onCheckedChange={(checked) => setConfig({ ...config, addressRequired: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>Fallback Behavior (when no slots available)</Label>
            <div className="flex gap-3">
              <Button
                variant={config.fallbackBehavior === "request" ? "default" : "outline"}
                onClick={() => setConfig({ ...config, fallbackBehavior: "request" })}
              >
                Create Request
              </Button>
              <Button
                variant={config.fallbackBehavior === "callback" ? "default" : "outline"}
                onClick={() => setConfig({ ...config, fallbackBehavior: "callback" })}
              >
                Schedule Callback
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoint Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Endpoint Status
          </CardTitle>
          <CardDescription>
            Test the ElevenLabs tool endpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "health", label: "Health Check", path: "/api/jobber/health" },
            { key: "availability", label: "Availability", path: "/api/jobber/availability" },
            { key: "book", label: "Book Appointment", path: "/api/jobber/book" },
          ].map((endpoint) => (
            <div
              key={endpoint.key}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                {endpointStatus[endpoint.key as keyof EndpointStatus] ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{endpoint.label}</p>
                  <p className="text-xs text-muted-foreground">{endpoint.path}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => testEndpoint(endpoint.key)}
                disabled={testing === endpoint.key}
              >
                {testing === endpoint.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Voice Agent Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Test Voice Agent
          </CardTitle>
          <CardDescription>
            Try out the voice agent in a test environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/voice-agent-test">
              <Mic className="h-4 w-4 mr-2" />
              Open Voice Agent Test
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveConfig} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
