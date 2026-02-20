import { useState } from "react";
import { useOrg } from "@/contexts/OrgContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2, Download, MapPin, User, Clock,
  ChevronDown, ChevronUp, MessageSquare,
  Smartphone, Share, MoreVertical, Copy, ExternalLink,
} from "lucide-react";

const STATUSES = [
  { value: "unvisited", label: "Unvisited", color: "bg-muted text-muted-foreground" },
  { value: "knocked", label: "Knocked", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  { value: "no_answer", label: "No Answer", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  { value: "interested", label: "Interested", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { value: "quote_given", label: "Quote Given", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "converted", label: "Converted", color: "bg-primary/20 text-primary" },
  { value: "not_interested", label: "Not Interested", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
];

function getStatusBadge(status: string) {
  const s = STATUSES.find((st) => st.value === status) || STATUSES[0];
  return <Badge className={`${s.color} text-[10px] border-0`}>{s.label}</Badge>;
}

export default function CanvassingPage() {
  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: leads, isLoading } = useQuery({
    queryKey: ["canvassing-leads", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("canvassing_leads")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrg,
  });

  const { data: teamMembers } = useQuery({
    queryKey: ["team-members", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data } = await supabase
        .from("team_members")
        .select("user_id, role")
        .eq("org_id", currentOrg.id);
      if (!data?.length) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", data.map((m) => m.user_id));
      return data.map((m) => ({
        ...m,
        display_name: profiles?.find((p) => p.user_id === m.user_id)?.display_name || "Team Member",
      }));
    },
    enabled: !!currentOrg,
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/canvassing-import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ org_id: currentOrg!.id }),
        }
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Import failed" }));
        throw new Error(err.error || "Import failed");
      }
      return resp.json();
    },
    onSuccess: (data) => {
      toast.success(`Imported ${data.imported} leads (${data.skipped} duplicates skipped)`);
      queryClient.invalidateQueries({ queryKey: ["canvassing-leads"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase
        .from("canvassing_leads")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canvassing-leads"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (leads || []).filter((l: any) => {
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (filterAssignee !== "all" && l.assigned_to !== filterAssignee) return false;
    return true;
  });

  // Stats
  const statusCounts = STATUSES.map((s) => ({
    ...s,
    count: (leads || []).filter((l: any) => l.status === s.value).length,
  }));

  const installUrl = `${window.location.origin}/install`;

  const copyInstallLink = () => {
    navigator.clipboard.writeText(installUrl);
    toast.success("Install link copied to clipboard!");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Canvassing Board</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Door-to-door leads from SendJim postcards — assign & track your team
          </p>
        </div>
        <Button
          onClick={() => importMutation.mutate()}
          disabled={importMutation.isPending}
          className="gap-2"
        >
          {importMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Import from SendJim
        </Button>
      </div>

      {/* PWA Door Knocker App Section */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-primary" />
            IGY6 Door Knocker App
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Install the mobile app on your agents' phones to log door knocks with GPS address detection in real-time.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Share install link */}
          <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            <code className="flex-1 text-sm text-foreground truncate">{installUrl}</code>
            <Button variant="outline" size="sm" onClick={copyInstallLink} className="gap-1.5 shrink-0">
              <Copy className="h-3.5 w-3.5" /> Copy Link
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Send this link to your sales agents — they'll open it on their phone browser and follow the steps to install.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* iOS Instructions */}
            <div className="rounded-lg border bg-background p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍎</span>
                <h3 className="font-semibold text-sm">Install on iPhone / iPad</h3>
              </div>
              <ol className="space-y-2.5">
                <li className="flex items-start gap-2.5 text-sm">
                  <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <span>Open the install link in <strong>Safari</strong> (required for iOS)</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <span>Tap the <Share className="h-4 w-4 inline align-text-bottom" /> <strong>Share</strong> button at the bottom of Safari</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                  <span>Tap <strong>"Add"</strong> — the app icon appears on your home screen</span>
                </li>
              </ol>
            </div>

            {/* Android Instructions */}
            <div className="rounded-lg border bg-background p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <h3 className="font-semibold text-sm">Install on Android</h3>
              </div>
              <ol className="space-y-2.5">
                <li className="flex items-start gap-2.5 text-sm">
                  <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <span>Open the install link in <strong>Chrome</strong></span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <span>Tap the <MoreVertical className="h-4 w-4 inline align-text-bottom" /> <strong>menu</strong> (three dots) in Chrome</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                  <span>Confirm — the app will appear on your home screen</span>
                </li>
              </ol>
            </div>
          </div>

          {/* What agents see */}
          <div className="rounded-lg border bg-background p-4">
            <h3 className="font-semibold text-sm mb-2">What agents can do in the app:</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">✅ Auto-detect address via GPS</li>
              <li className="flex items-center gap-2">✅ Log door knock with one tap</li>
              <li className="flex items-center gap-2">✅ Set status (Knocked, Interested, etc.)</li>
              <li className="flex items-center gap-2">✅ Browse their assigned route</li>
              <li className="flex items-center gap-2">✅ Add notes per address</li>
              <li className="flex items-center gap-2">✅ Works offline-ready on mobile</li>
            </ul>
          </div>

          <Button variant="outline" size="sm" asChild>
            <a href="/install" target="_blank" rel="noopener noreferrer" className="gap-2">
              <ExternalLink className="h-4 w-4" /> Preview Install Page
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Status Summary Strip */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
        {statusCounts.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(filterStatus === s.value ? "all" : s.value)}
            className={`rounded-lg border p-2 text-center transition-all ${
              filterStatus === s.value ? "border-primary ring-1 ring-primary" : "border-border"
            }`}
          >
            <p className="text-lg font-bold text-foreground">{s.count}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {teamMembers?.map((m: any) => (
              <SelectItem key={m.user_id} value={m.user_id}>{m.display_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} of {leads?.length || 0} leads
        </span>
      </div>

      {/* Lead List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {leads?.length === 0 ? "No canvassing leads yet" : "No leads match filters"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {leads?.length === 0 ? "Click 'Import from SendJim' to pull in postcard addresses" : "Try adjusting your filters"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead: any) => {
            const isExpanded = expandedId === lead.id;
            return (
              <Card key={lead.id} className="overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{lead.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {[lead.city, lead.state, lead.zip].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lead.assigned_to_name && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {lead.assigned_to_name}
                      </span>
                    )}
                    {getStatusBadge(lead.status)}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border px-4 py-3 bg-muted/10 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Mailing Code</span>
                        <p className="font-medium text-foreground">{lead.sendjim_code || "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mailed On</span>
                        <p className="font-medium text-foreground">
                          {lead.sendjim_mailing_date ? new Date(lead.sendjim_mailing_date).toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Knocked</span>
                        <p className="font-medium text-foreground">
                          {lead.knocked_at ? new Date(lead.knocked_at).toLocaleString() : "Not yet"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Property Type</span>
                        <p className="font-medium text-foreground">{lead.property_type || "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select
                        value={lead.status}
                        onValueChange={(val) => {
                          const updates: Record<string, any> = { status: val };
                          if (val === "knocked" && !lead.knocked_at) updates.knocked_at = new Date().toISOString();
                          if (["interested", "quote_given", "converted", "not_interested"].includes(val)) updates.outcome_at = new Date().toISOString();
                          updateLeadMutation.mutate({ id: lead.id, updates });
                        }}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={lead.assigned_to || "unassigned"}
                        onValueChange={(val) => {
                          const member = teamMembers?.find((m: any) => m.user_id === val);
                          updateLeadMutation.mutate({
                            id: lead.id,
                            updates: {
                              assigned_to: val === "unassigned" ? null : val,
                              assigned_to_name: member?.display_name || null,
                            },
                          });
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Assign to..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {teamMembers?.map((m: any) => (
                            <SelectItem key={m.user_id} value={m.user_id}>{m.display_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Textarea
                        placeholder="Add notes..."
                        defaultValue={lead.notes || ""}
                        onBlur={(e) => {
                          if (e.target.value !== (lead.notes || "")) {
                            updateLeadMutation.mutate({ id: lead.id, updates: { notes: e.target.value } });
                          }
                        }}
                        className="text-xs min-h-[60px]"
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
