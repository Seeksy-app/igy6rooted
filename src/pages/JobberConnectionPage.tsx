import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Link2, RefreshCw, ExternalLink, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useOrg } from "@/contexts/OrgContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function JobberConnectionPage() {
  const { currentOrg, userRole } = useOrg();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle OAuth callback results
  useEffect(() => {
    const jobberConnected = searchParams.get('jobber_connected');
    const jobberError = searchParams.get('jobber_error');

    if (jobberConnected === 'true') {
      toast({
        title: "Jobber Connected!",
        description: "Your Jobber account has been successfully connected.",
      });
      queryClient.invalidateQueries({ queryKey: ["jobber-connection"] });
      // Clear the query params
      setSearchParams({});
    } else if (jobberError) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: jobberError,
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, toast, queryClient]);

  const { data: connection, isLoading } = useQuery({
    queryKey: ["jobber-connection", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;
      const { data, error } = await supabase
        .from("jobber_connections")
        .select("*")
        .eq("org_id", currentOrg.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });

  const createConnectionMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrg) throw new Error("No organization selected");
      const { error } = await supabase
        .from("jobber_connections")
        .insert({
          org_id: currentOrg.id,
          status: "pending",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobber-connection"] });
    },
  });

  const handleConnect = async () => {
    if (!currentOrg) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No organization selected",
      });
      return;
    }

    // Build the OAuth start URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const redirectUri = encodeURIComponent(window.location.origin + '/jobber-connection');
    const oauthUrl = `${supabaseUrl}/functions/v1/jobber-oauth-start?org_id=${currentOrg.id}&redirect_uri=${redirectUri}`;

    // Redirect to start OAuth flow
    window.location.href = oauthUrl;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // In production, this would call the Integration Service health/status endpoints
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await queryClient.invalidateQueries({ queryKey: ["jobber-connection"] });
    setIsRefreshing(false);
    toast({
      title: "Status refreshed",
      description: "Connection status has been updated.",
    });
  };

  const isAdmin = userRole === "admin";
  const status = connection?.status || "disconnected";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jobber Connection</h1>
        <p className="mt-1 text-muted-foreground">
          Connect your Jobber account for real-time scheduling
        </p>
      </div>

      {/* Connection Status Card */}
      <div className="stat-card">
        <div className="flex items-start gap-6">
          <div
            className={`rounded-xl p-4 ${
              status === "connected"
                ? "bg-success/15 text-success"
                : status === "pending"
                ? "bg-warning/15 text-warning"
                : status === "error"
                ? "bg-destructive/15 text-destructive"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {status === "connected" ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : status === "error" ? (
              <AlertCircle className="h-8 w-8" />
            ) : (
              <Link2 className="h-8 w-8" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Jobber Integration</h2>
              <StatusBadge status={status} />
            </div>

            {status === "connected" && connection?.jobber_account_id && (
              <p className="mt-1 text-muted-foreground">
                Connected to account: {connection.jobber_account_id}
              </p>
            )}

            {status === "pending" && (
              <p className="mt-1 text-muted-foreground">
                Waiting for authorization. Complete the OAuth flow in the opened window.
              </p>
            )}

            {status === "error" && connection?.last_error && (
              <p className="mt-1 text-destructive">{connection.last_error}</p>
            )}

            {status === "disconnected" && (
              <p className="mt-1 text-muted-foreground">
                Connect your Jobber account to enable real-time availability and booking.
              </p>
            )}

            {connection?.connected_at && (
              <p className="mt-2 text-sm text-muted-foreground">
                Connected on {new Date(connection.connected_at).toLocaleDateString()}
              </p>
            )}
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>

              {status !== "connected" && (
                <Button onClick={handleConnect}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect Jobber
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Integration Info */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="stat-card">
          <h3 className="mb-4 font-semibold">What gets synced</h3>
          <ul className="space-y-3">
            {[
              "Client information and contact details",
              "Service types and pricing",
              "Team member schedules and availability",
              "Visit and job scheduling",
              "Real-time calendar updates",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="stat-card">
          <h3 className="mb-4 font-semibold">Security & Privacy</h3>
          <ul className="space-y-3">
            {[
              "OAuth 2.0 secure authentication",
              "Tokens stored in encrypted vault (not in Lovable)",
              "Read/write access only for scheduling",
              "You can revoke access anytime from Jobber",
              "All API calls are logged and auditable",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
