import { useState } from "react";
import { Phone, Users, CheckCircle2, PhoneCall, Calendar, ChevronDown, ChevronUp, ExternalLink, FileText, Link2, Clock, Zap, RefreshCw, Loader2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrg } from "@/contexts/OrgContext";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from "@/assets/logo.png";

interface LeadEntry {
  id: string;
  date: string;
  phone: string;
  customer_name: string;
  status: string;
  service_type: string;
  address: string;
  notes: string | null;
  ai_summary: string | null;
  intent_score: number;
  claimed_by: string | null;
  follow_up: string | null;
}

export default function DashboardPage() {
  const { currentOrg } = useOrg();
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  // Fetch real stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["dashboard-stats", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;
      
      // Get AI calls count
      const { data: toolCalls } = await supabase
        .from("ai_tool_call_logs")
        .select("id")
        .eq("org_id", currentOrg.id);
      
      // Get bookings
      const { data: bookings } = await supabase
        .from("ai_bookings")
        .select("status")
        .eq("org_id", currentOrg.id);
      
      // Get followups
      const { data: followups } = await supabase
        .from("followups")
        .select("status")
        .eq("org_id", currentOrg.id);
      
      const openFollowups = followups?.filter(f => f.status === "open" || f.status === "pending")?.length || 0;
      const claimedFollowups = followups?.filter(f => f.status === "claimed" || f.status === "in_progress")?.length || 0;
      
      return {
        open: openFollowups,
        claimed: claimedFollowups,
        leads: bookings?.length || 0,
        aiCalls: toolCalls?.length || 0,
        booked: bookings?.filter(b => b.status === "scheduled" || b.status === "confirmed")?.length || 0,
      };
    },
    enabled: !!currentOrg
  });

  // Fetch leads/bookings
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["dashboard-leads", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      
      const { data, error } = await supabase
        .from("ai_bookings")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      return (data || []).map(booking => ({
        id: booking.id,
        date: booking.created_at,
        phone: booking.phone,
        customer_name: booking.customer_name,
        status: booking.status,
        service_type: booking.service_type,
        address: booking.address,
        notes: booking.notes,
        ai_summary: `Customer requested ${booking.service_type} service at ${booking.address}. ${booking.notes || ''}`,
        intent_score: booking.status === 'scheduled' ? 85 : booking.status === 'pending' ? 50 : 20,
        claimed_by: null,
        follow_up: null,
      })) as LeadEntry[];
    },
    enabled: !!currentOrg
  });

  const displayStats = stats || {
    open: 0,
    claimed: 0,
    leads: 0,
    aiCalls: 0,
    booked: 0,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Booked</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'claimed':
        return <Badge className="bg-accent text-accent-foreground">Claimed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} alt="IGY6 Rooted" className="h-12 w-auto" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Call Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {currentOrg?.name || "Your Organization"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchStats()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Calls
          </Button>
        </div>
      </div>

      {/* Stats Grid - Similar to reference */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{statsLoading ? "—" : displayStats.open}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Open</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <Inbox className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-accent text-accent-foreground p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{statsLoading ? "—" : displayStats.claimed}</p>
              <p className="text-xs uppercase tracking-wide opacity-90">Claimed</p>
            </div>
            <div className="rounded-lg bg-white/20 p-2">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{statsLoading ? "—" : displayStats.leads}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Leads</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{statsLoading ? "—" : displayStats.aiCalls}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">AI Calls</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <Phone className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{statsLoading ? "—" : displayStats.booked}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Booked</p>
            </div>
            <div className="rounded-lg bg-muted p-2">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Recent Leads ({leads.length})</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/booking-logs">View All</Link>
            </Button>
          </div>
        </div>

        {leadsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-medium">No leads yet</p>
            <p className="text-sm text-muted-foreground">AI-assisted calls will appear here</p>
          </div>
        ) : (
          <div className="divide-y">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-2">Service</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Follow-up</div>
              <div className="col-span-1">Intent</div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* Table Rows */}
            {leads.map((lead) => (
              <Collapsible
                key={lead.id}
                open={expandedLead === lead.id}
                onOpenChange={(open) => setExpandedLead(open ? lead.id : null)}
              >
                <div className={cn(
                  "grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors",
                  expandedLead === lead.id && "bg-muted/30"
                )}>
                  <div className="col-span-2 text-sm">
                    {formatDate(lead.date)}
                  </div>
                  <div className="col-span-2 text-sm font-mono">
                    {lead.phone}
                  </div>
                  <div className="col-span-2 text-sm">
                    {lead.service_type || "—"}
                  </div>
                  <div className="col-span-1">
                    {getStatusBadge(lead.status)}
                  </div>
                  <div className="col-span-2">
                    <Select defaultValue={lead.follow_up || "not_set"}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Not Set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_set">Not Set</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="this_week">This Week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm">{lead.intent_score}%</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {expandedLead === lead.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

                <CollapsibleContent>
                  <div className="px-4 py-4 bg-muted/20 border-t space-y-4">
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-accent hover:bg-accent/90">
                        <Zap className="mr-2 h-4 w-4" />
                        Resolve Lead
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Add Notes
                      </Button>
                      <Button variant="outline" size="sm">
                        <Link2 className="mr-2 h-4 w-4" />
                        Attach Job
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View Transcript
                      </Button>
                    </div>

                    {/* Lead Details */}
                    <div>
                      <h4 className="font-semibold mb-2">Lead Details</h4>
                      {getStatusBadge(lead.status)}
                      
                      {/* AI Call Intelligence */}
                      <div className="mt-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Zap className="h-4 w-4" />
                          <span className="uppercase tracking-wide text-xs font-medium">AI Call Intelligence</span>
                        </div>
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                          <p className="text-sm text-amber-800">
                            {lead.ai_summary || "No AI summary available for this call."}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-5 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
                          <p className="font-mono">{lead.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Service</p>
                          <p>{lead.service_type || "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Address</p>
                          <p>{lead.address || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Intent Score</p>
                          <p>{lead.intent_score}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Created</p>
                          <p>{formatDate(lead.date)}</p>
                        </div>
                      </div>

                      {/* Notes */}
                      {lead.notes && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                          <p className="text-sm">{lead.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Link to="/jobber" className="rounded-lg border bg-card p-4 hover:border-accent/50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-muted p-3">
              <Link2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Connect Jobber</h3>
              <p className="text-sm text-muted-foreground">Link your account</p>
            </div>
          </div>
        </Link>

        <Link to="/ai-voice-content" className="rounded-lg border bg-card p-4 hover:border-accent/50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-muted p-3">
              <PhoneCall className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Configure AI Voice</h3>
              <p className="text-sm text-muted-foreground">Set up your agent</p>
            </div>
          </div>
        </Link>

        <Link to="/availability" className="rounded-lg border bg-card p-4 hover:border-accent/50 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-muted p-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Set Availability</h3>
              <p className="text-sm text-muted-foreground">Business hours</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
