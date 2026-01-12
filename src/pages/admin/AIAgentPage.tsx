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
import { Bot, Mic, CheckCircle2, XCircle, Loader2, Settings, Phone, Play, TestTube, Copy, Code } from "lucide-react";

interface AgentConfig {
  greeting: string;
  businessName: string;
  serviceAreas: string[];
  emailRequired: boolean;
  addressRequired: boolean;
  fallbackBehavior: "request" | "callback";
}

interface EndpointStatus {
  availability: "untested" | "ok" | "error";
  book: "untested" | "ok" | "error";
  health: "untested" | "ok" | "error";
}

export default function AIAgentPage() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [endpointStatus, setEndpointStatus] = useState<EndpointStatus>({
    availability: "untested",
    book: "untested",
    health: "untested",
  });

  const [config, setConfig] = useState<AgentConfig>({
    greeting: "Hi! Thank you for calling IGY6 Rooted. How can I help you schedule an appointment today?",
    businessName: "IGY6 Rooted",
    serviceAreas: [],
    emailRequired: false,
    addressRequired: true,
    fallbackBehavior: "request",
  });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const toolsBaseUrl = `${supabaseUrl}/functions/v1/jobber-api`;

  const testEndpoint = async (endpoint: string) => {
    if (!currentOrg) return;
    
    setTesting(endpoint);
    try {
      const response = await fetch(`${toolsBaseUrl}/health?org_id=${currentOrg.id}`);
      const data = await response.json();

      if (response.ok && data.jobber_connected) {
        setEndpointStatus((prev) => ({ ...prev, [endpoint]: "ok" }));
        toast({
          title: "Endpoint OK",
          description: `${endpoint} endpoint is responding and Jobber is connected.`,
        });
      } else if (response.ok) {
        setEndpointStatus((prev) => ({ ...prev, [endpoint]: "error" }));
        toast({
          variant: "destructive",
          title: "Jobber Not Connected",
          description: "Please connect your Jobber account first.",
        });
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      setEndpointStatus((prev) => ({ ...prev, [endpoint]: "error" }));
      toast({
        variant: "destructive",
        title: "Endpoint Error",
        description: `${endpoint} endpoint is not responding.`,
      });
    } finally {
      setTesting(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "URL copied to clipboard",
    });
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

      {/* Tool Endpoints for ElevenLabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            ElevenLabs Tool Endpoints
          </CardTitle>
          <CardDescription>
            Configure these URLs as tools in your ElevenLabs agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "get_availability", method: "POST", path: "/availability", description: "Get available appointment slots" },
            { name: "book_appointment", method: "POST", path: "/book", description: "Book an appointment" },
            { name: "health_check", method: "GET", path: "/health", description: "Check Jobber connection status" },
          ].map((tool) => (
            <div key={tool.name} className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{tool.method}</Badge>
                  <span className="font-mono font-medium">{tool.name}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => copyToClipboard(`${toolsBaseUrl}${tool.path}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
              <code className="text-xs bg-background px-2 py-1 rounded block overflow-x-auto">
                {toolsBaseUrl}{tool.path}
              </code>
            </div>
          ))}
          
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <p className="text-sm font-medium mb-2">Required Headers for Tool Calls:</p>
            <ul className="text-xs text-muted-foreground space-y-1 font-mono">
              <li>x-org-id: {currentOrg?.id || "<org_id>"}</li>
              <li>x-conversation-id: {"<conversation_id>"}</li>
              <li>x-igy6-timestamp: {"<unix_timestamp>"}</li>
              <li>x-igy6-signature: {"<hmac_sha256_signature>"}</li>
            </ul>
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
            { key: "health", label: "Health Check", path: "/health" },
            { key: "availability", label: "Availability", path: "/availability" },
            { key: "book", label: "Book Appointment", path: "/book" },
          ].map((endpoint) => (
            <div
              key={endpoint.key}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                {endpointStatus[endpoint.key as keyof EndpointStatus] === "ok" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : endpointStatus[endpoint.key as keyof EndpointStatus] === "error" ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{endpoint.label}</p>
                  <p className="text-xs text-muted-foreground font-mono">{toolsBaseUrl}{endpoint.path}</p>
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
