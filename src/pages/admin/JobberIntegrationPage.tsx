import { useState, useEffect } from "react";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link2, Link2Off, CheckCircle2, XCircle, Loader2, RefreshCw, Clock, Settings2 } from "lucide-react";

interface JobberConnection {
  id: string;
  jobber_account_id: string | null;
  status: string;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AppointmentRules {
  id: string;
  timezone: string;
  default_duration_minutes: number;
  travel_buffer_minutes: number;
  min_lead_time_minutes: number;
  max_days_out: number;
  business_hours: Record<string, string[][]>;
  service_type_map: Record<string, { duration: number; tags: string[] }>;
}

const TIMEZONES = [
  "America/Chicago",
  "America/New_York",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
];

export default function JobberIntegrationPage() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connection, setConnection] = useState<JobberConnection | null>(null);
  const [rules, setRules] = useState<AppointmentRules | null>(null);

  useEffect(() => {
    if (currentOrg) {
      fetchData();
    }
  }, [currentOrg]);

  const fetchData = async () => {
    if (!currentOrg) return;
    setLoading(true);

    try {
      // Fetch Jobber connection
      const { data: connData } = await supabase
        .from("integration_jobber_accounts")
        .select("*")
        .eq("org_id", currentOrg.id)
        .maybeSingle();

      setConnection(connData);

      // Fetch appointment rules
      const { data: rulesData } = await supabase
        .from("ai_appointment_rules")
        .select("*")
        .eq("org_id", currentOrg.id)
        .maybeSingle();

      if (rulesData) {
        setRules(rulesData as unknown as AppointmentRules);
      } else {
        // Create default rules if they don't exist
        const { data: newRules } = await supabase
          .from("ai_appointment_rules")
          .insert({ org_id: currentOrg.id })
          .select()
          .single();
        setRules(newRules as unknown as AppointmentRules);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectJobber = async () => {
    toast({
      title: "OAuth Flow",
      description: "Jobber OAuth integration will redirect to Jobber for authorization.",
    });
    // In production, this would redirect to the Jobber OAuth authorization URL
  };

  const handleDisconnectJobber = async () => {
    if (!connection) return;
    
    try {
      await supabase
        .from("integration_jobber_accounts")
        .delete()
        .eq("id", connection.id);

      setConnection(null);
      toast({
        title: "Disconnected",
        description: "Jobber account has been disconnected.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to disconnect Jobber account.",
      });
    }
  };

  const handleSaveRules = async () => {
    if (!rules || !currentOrg) return;
    setSaving(true);

    try {
      await supabase
        .from("ai_appointment_rules")
        .update({
          timezone: rules.timezone,
          default_duration_minutes: rules.default_duration_minutes,
          travel_buffer_minutes: rules.travel_buffer_minutes,
          min_lead_time_minutes: rules.min_lead_time_minutes,
          max_days_out: rules.max_days_out,
        })
        .eq("id", rules.id);

      toast({
        title: "Saved",
        description: "Booking rules have been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save booking rules.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jobber Integration</h1>
        <p className="text-muted-foreground mt-1">
          Connect your Jobber account to enable AI-powered scheduling
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            Manage your Jobber account connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {connection?.status === "connected" ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {connection?.status === "connected" ? "Connected" : "Not Connected"}
                </p>
                {connection?.jobber_account_id && (
                  <p className="text-sm text-muted-foreground">
                    Account ID: {connection.jobber_account_id}
                  </p>
                )}
              </div>
            </div>
            <Badge variant={connection?.status === "connected" ? "default" : "secondary"}>
              {connection?.status || "disconnected"}
            </Badge>
          </div>

          {connection?.token_expires_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Token expires: {new Date(connection.token_expires_at).toLocaleString()}
            </div>
          )}

          <div className="flex gap-3">
            {connection?.status === "connected" ? (
              <>
                <Button variant="outline" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
                <Button variant="destructive" onClick={handleDisconnectJobber}>
                  <Link2Off className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button onClick={handleConnectJobber}>
                <Link2 className="h-4 w-4 mr-2" />
                Connect Jobber
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Booking Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Booking Rules
          </CardTitle>
          <CardDescription>
            Configure how the AI schedules appointments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={rules?.timezone || "America/Chicago"}
                onValueChange={(value) => setRules(rules ? { ...rules, timezone: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Default Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={rules?.default_duration_minutes || 120}
                onChange={(e) =>
                  setRules(rules ? { ...rules, default_duration_minutes: parseInt(e.target.value) } : null)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buffer">Travel Buffer (minutes)</Label>
              <Input
                id="buffer"
                type="number"
                value={rules?.travel_buffer_minutes || 30}
                onChange={(e) =>
                  setRules(rules ? { ...rules, travel_buffer_minutes: parseInt(e.target.value) } : null)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leadTime">Minimum Lead Time (minutes)</Label>
              <Input
                id="leadTime"
                type="number"
                value={rules?.min_lead_time_minutes || 180}
                onChange={(e) =>
                  setRules(rules ? { ...rules, min_lead_time_minutes: parseInt(e.target.value) } : null)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDays">Max Days Out</Label>
              <Input
                id="maxDays"
                type="number"
                value={rules?.max_days_out || 21}
                onChange={(e) =>
                  setRules(rules ? { ...rules, max_days_out: parseInt(e.target.value) } : null)
                }
              />
            </div>
          </div>

          <Button onClick={handleSaveRules} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Rules
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
