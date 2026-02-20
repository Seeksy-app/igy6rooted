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
  Loader2, RefreshCw, MapPin, User, Clock,
  ChevronDown, ChevronUp, MessageSquare,
  Smartphone, Share, MoreVertical, Copy, ExternalLink,
  CalendarDays, Truck, Zap,
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
  const [showInstall, setShowInstall] = useState(false);

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

  const syncMutation = useMutation({
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
        const err = await resp.json().catch(() => ({ error: "Sync failed" }));
        throw new Error(err.error || "Sync failed");
      }
      return resp.json();
    },
    onSuccess: (data) => {
      toast.success(`Synced ${data.imported} leads from SendJim API (${data.skipped} duplicates skipped)`);
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

  const statusCounts = STATUSES.map((s) => ({
    ...s,
    count: (leads || []).filter((l: any) => l.status === s.value).length,
  }));

  const installUrl = `${window.location.origin}/install`;

  const copyInstallLink = () => {
    navigator.clipboard.writeText(installUrl);
    toast.success("Install link copied!");
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
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="gap-2"
        >
          {syncMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Sync from SendJim
        </Button>
      </div>

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
              {leads?.length === 0 ? "Click 'Sync from SendJim' to pull in postcard addresses" : "Try adjusting your filters"}
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
                  <div className="flex items-center gap-3 shrink-0">
                    {lead.sendjim_mailing_date && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1" title="Sent date">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(lead.sendjim_mailing_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                    {lead.estimated_delivery_date && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1" title="Est. delivery">
                        <Truck className="h-3 w-3" />
                        {new Date(lead.estimated_delivery_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
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
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Mailing Name</span>
                        <p className="font-medium text-foreground">{lead.mailing_name || "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mailing Code</span>
                        <p className="font-medium text-foreground">{lead.sendjim_code || "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sent Date</span>
                        <p className="font-medium text-foreground">
                          {lead.sendjim_mailing_date ? new Date(lead.sendjim_mailing_date + "T00:00:00").toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Est. Arrival</span>
                        <p className="font-medium text-foreground">
                          {lead.estimated_delivery_date ? new Date(lead.estimated_delivery_date + "T00:00:00").toLocaleDateString() : "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Knocked</span>
                        <p className="font-medium text-foreground">
                          {lead.knocked_at ? new Date(lead.knocked_at).toLocaleString() : "Not yet"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
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

      {/* Zapier Webhook Integration */}
      <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-amber-500" />
            Zapier Integration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect SendJim to this webhook via Zapier to automatically import mailing recipients as canvassing leads.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Webhook URL</p>
            <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
              <Zap className="h-4 w-4 text-amber-500 shrink-0" />
              <code className="flex-1 text-xs text-foreground truncate">
                {`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zapier-canvassing-webhook?org_id=${currentOrg?.id || "YOUR_ORG_ID"}`}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zapier-canvassing-webhook?org_id=${currentOrg?.id || ""}`
                  );
                  toast.success("Webhook URL copied!");
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

      {/* Sales App — Two Column: Live Preview + Features & Install */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-primary" />
            IGY6 Sales App
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your field team's mobile command center — install on any phone to start knocking doors.
          </p>
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
              {/* Share install link */}
              <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                <code className="flex-1 text-sm text-foreground truncate">{installUrl}</code>
                <Button variant="outline" size="sm" onClick={copyInstallLink} className="gap-1.5 shrink-0">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>

              {/* Feature Grid */}
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

      {/* Installation Instructions — Collapsible at Bottom */}
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
              {/* iOS */}
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
              {/* Android */}
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
