import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrg } from "@/contexts/OrgContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  MapPin, Navigation, Loader2, List, ChevronRight,
  CheckCircle2, XCircle, HelpCircle, Clock, Star, Phone,
  Map, StickyNote, Search, Save,
} from "lucide-react";

const STATUSES = [
  { value: "unvisited", label: "Unvisited", icon: Clock, color: "bg-muted text-muted-foreground" },
  { value: "knocked", label: "Knocked", icon: CheckCircle2, color: "bg-amber-100 text-amber-800" },
  { value: "no_answer", label: "No Answer", icon: HelpCircle, color: "bg-orange-100 text-orange-800" },
  { value: "interested", label: "Interested", icon: Star, color: "bg-emerald-100 text-emerald-800" },
  { value: "quote_given", label: "Quote Given", icon: Phone, color: "bg-blue-100 text-blue-800" },
  { value: "converted", label: "Converted", icon: CheckCircle2, color: "bg-green-200 text-green-900" },
  { value: "not_interested", label: "Not Interested", icon: XCircle, color: "bg-red-100 text-red-800" },
];

interface ParsedAddress {
  address: string;
  city: string;
  state: string;
  zip: string;
}

function parseMapboxFeature(feature: any): ParsedAddress {
  const context = feature.context || [];
  return {
    address: feature.place_name?.split(",")[0] || feature.text || "",
    city: context.find((c: any) => c.id.startsWith("place"))?.text || "",
    state: context.find((c: any) => c.id.startsWith("region"))?.short_code?.replace("US-", "") || "",
    zip: context.find((c: any) => c.id.startsWith("postcode"))?.text || "",
  };
}

type KnockView = "detect" | "detail";

export default function KnockPage() {
  const { user } = useAuth();
  const { currentOrg } = useOrg();
  const queryClient = useQueryClient();
  const [view, setView] = useState<KnockView>("detect");
  const [activeTab, setActiveTab] = useState("leads");
  const [detecting, setDetecting] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<ParsedAddress | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [notes, setNotes] = useState("");

  // Address search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch mapbox token once
  useEffect(() => {
    supabase.functions.invoke("mapbox-token").then(({ data }) => {
      if (data?.token) setMapboxToken(data.token);
    });
  }, []);

  // Debounced address search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3 || !mapboxToken) {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const resp = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?types=address&country=US&limit=5&access_token=${mapboxToken}`
        );
        const geo = await resp.json();
        setSearchResults(geo.features || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery, mapboxToken]);

  // Fetch assigned leads
  const { data: assignedLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ["knock-assigned", currentOrg?.id, user?.id],
    queryFn: async () => {
      if (!currentOrg || !user) return [];
      const { data, error } = await supabase
        .from("canvassing_leads")
        .select("*")
        .eq("org_id", currentOrg.id)
        .eq("assigned_to", user.id)
        .order("address", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrg && !!user,
  });

  const { data: allLeads } = useQuery({
    queryKey: ["knock-all", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("canvassing_leads")
        .select("*")
        .eq("org_id", currentOrg.id)
        .in("status", ["unvisited"])
        .is("assigned_to", null)
        .order("address", { ascending: true })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrg,
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("canvassing_leads").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knock-assigned"] });
      queryClient.invalidateQueries({ queryKey: ["knock-all"] });
      toast.success("Lead updated!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const createLeadMutation = useMutation({
    mutationFn: async (lead: ParsedAddress & { status: string; notes: string }) => {
      if (!currentOrg || !user) throw new Error("Not authenticated");
      const { error } = await supabase.from("canvassing_leads").insert({
        org_id: currentOrg.id,
        address: lead.address,
        city: lead.city,
        state: lead.state,
        zip: lead.zip,
        status: lead.status,
        notes: lead.notes,
        assigned_to: user.id,
        assigned_to_name: user.user_metadata?.display_name || user.email,
        knocked_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knock-assigned"] });
      toast.success("Lead saved!");
      setDetectedAddress(null);
      setNotes("");
      setSearchQuery("");
      setSearchResults([]);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const detectAddress = useCallback(async () => {
    setDetecting(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, timeout: 10000, maximumAge: 0,
        });
      });
      const { latitude, longitude } = position.coords;
      const token = mapboxToken || (await supabase.functions.invoke("mapbox-token")).data?.token;
      if (!token) throw new Error("Could not load map service");
      if (!mapboxToken) setMapboxToken(token);

      const resp = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=address&access_token=${token}`
      );
      const geo = await resp.json();

      if (geo.features?.length > 0) {
        setDetectedAddress(parseMapboxFeature(geo.features[0]));
        setSearchQuery("");
        setSearchResults([]);
      } else {
        toast.error("Couldn't detect address. Try searching instead.");
      }
    } catch (err: any) {
      if (err.code === 1) {
        toast.error("Location access denied. Enable GPS or search manually.");
      } else {
        toast.error(err.message || "GPS detection failed");
      }
    } finally {
      setDetecting(false);
    }
  }, [mapboxToken]);

  const selectSearchResult = (feature: any) => {
    setDetectedAddress(parseMapboxFeature(feature));
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleStatusTap = (status: string) => {
    if (selectedLead) {
      const updates: Record<string, any> = { status };
      if (status === "knocked" && !selectedLead.knocked_at) updates.knocked_at = new Date().toISOString();
      if (["interested", "quote_given", "converted", "not_interested"].includes(status)) updates.outcome_at = new Date().toISOString();
      if (notes && notes !== (selectedLead.notes || "")) updates.notes = notes;
      updateLeadMutation.mutate({ id: selectedLead.id, updates });
      setSelectedLead(null);
      setNotes("");
      setView("detect");
      setActiveTab("leads");
    } else if (detectedAddress) {
      createLeadMutation.mutate({ ...detectedAddress, status, notes });
    }
  };

  const handleSaveAsLead = () => {
    if (!detectedAddress) return;
    createLeadMutation.mutate({ ...detectedAddress, status: "unvisited", notes });
  };

  // Detail view for a specific lead
  if (view === "detail" && selectedLead) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedLead(null); setView("detect"); setActiveTab("leads"); }}>
            ← Back
          </Button>
          <span className="text-sm font-semibold truncate">{selectedLead.address}</span>
        </header>

        <div className="flex-1 p-4 space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{selectedLead.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {[selectedLead.city, selectedLead.state, selectedLead.zip].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
              {selectedLead.sendjim_code && (
                <p className="text-xs text-muted-foreground">Mailing: {selectedLead.sendjim_code}</p>
              )}
              {selectedLead.mailing_name && (
                <p className="text-xs text-muted-foreground">Campaign: {selectedLead.mailing_name}</p>
              )}
            </CardContent>
          </Card>

          <Textarea
            placeholder="Notes (optional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />

          <p className="text-sm font-semibold text-center text-muted-foreground">What happened?</p>
          <div className="grid grid-cols-2 gap-3">
            {STATUSES.filter(s => s.value !== "unvisited").map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.value}
                  onClick={() => handleStatusTap(s.value)}
                  disabled={updateLeadMutation.isPending}
                  className={`${s.color} rounded-xl p-4 flex flex-col items-center gap-2 text-sm font-medium transition-all active:scale-95`}
                >
                  <Icon className="h-6 w-6" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const myLeads = assignedLeads || [];
  const unassignedLeads = allLeads || [];
  const leadsWithNotes = [...myLeads, ...unassignedLeads].filter((l: any) => l.notes);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">🚪 IGY6 Sales</h1>
          <Button variant="outline" size="sm" onClick={detectAddress} disabled={detecting} className="gap-1">
            {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            {detecting ? "Detecting..." : "Detect GPS"}
          </Button>
        </div>

        {/* Address Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mx-4 rounded-b-lg border border-t-0 border-border bg-background shadow-lg max-h-60 overflow-auto">
            {searchResults.map((feature: any) => {
              const parsed = parseMapboxFeature(feature);
              return (
                <button
                  key={feature.id}
                  onClick={() => selectSearchResult(feature)}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-muted/50 active:bg-muted transition-colors border-b border-border last:border-0"
                >
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{parsed.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {[parsed.city, parsed.state, parsed.zip].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Selected address banner */}
      {detectedAddress && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">{detectedAddress.address}</p>
              <p className="text-xs text-muted-foreground">
                {[detectedAddress.city, detectedAddress.state, detectedAddress.zip].filter(Boolean).join(", ")}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setDetectedAddress(null); setNotes(""); }} className="text-xs shrink-0">
              ✕
            </Button>
          </div>
          <Textarea
            placeholder="Notes (optional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[50px] text-sm"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSaveAsLead}
              disabled={createLeadMutation.isPending}
              className="flex-1 gap-1.5"
              size="sm"
            >
              {createLeadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save as Lead
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground text-center font-medium">Or set a status:</p>
          <div className="grid grid-cols-3 gap-2">
            {STATUSES.filter(s => s.value !== "unvisited").slice(0, 6).map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.value}
                  onClick={() => handleStatusTap(s.value)}
                  disabled={createLeadMutation.isPending}
                  className={`${s.color} rounded-lg p-2 flex flex-col items-center gap-1 text-[11px] font-medium transition-all active:scale-95`}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-border bg-background h-11 px-2">
          <TabsTrigger value="leads" className="flex-1 gap-1.5 text-xs data-[state=active]:shadow-none">
            <List className="h-4 w-4" /> Leads
          </TabsTrigger>
          <TabsTrigger value="map" className="flex-1 gap-1.5 text-xs data-[state=active]:shadow-none">
            <Map className="h-4 w-4" /> Map
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex-1 gap-1.5 text-xs data-[state=active]:shadow-none">
            <StickyNote className="h-4 w-4" /> Notes
          </TabsTrigger>
        </TabsList>

        {/* Leads Tab */}
        <TabsContent value="leads" className="flex-1 m-0 overflow-auto">
          {leadsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {myLeads.length > 0 && (
                <>
                  <p className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 uppercase tracking-wider">
                    My Leads ({myLeads.length})
                  </p>
                  {myLeads.map((lead: any) => (
                    <LeadRow key={lead.id} lead={lead} onTap={() => { setSelectedLead(lead); setNotes(lead.notes || ""); setView("detail"); }} />
                  ))}
                </>
              )}
              {unassignedLeads.length > 0 && (
                <>
                  <p className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 uppercase tracking-wider">
                    Unassigned ({unassignedLeads.length})
                  </p>
                  {unassignedLeads.map((lead: any) => (
                    <LeadRow key={lead.id} lead={lead} onTap={() => { setSelectedLead(lead); setNotes(lead.notes || ""); setView("detail"); }} />
                  ))}
                </>
              )}
              {myLeads.length === 0 && unassignedLeads.length === 0 && (
                <div className="py-16 text-center">
                  <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No leads yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Use GPS or search to add addresses</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map" className="flex-1 m-0">
          <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
            <Map className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-foreground mb-1">Route Map</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Map view coming soon — see all your assigned addresses plotted on a map with optimized routing.
            </p>
            {myLeads.length > 0 && (
              <div className="mt-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{myLeads.length} addresses to visit</p>
                <p className="text-xs text-muted-foreground">
                  {myLeads.filter((l: any) => l.status === "unvisited").length} unvisited
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="flex-1 m-0 overflow-auto">
          {leadsWithNotes.length === 0 ? (
            <div className="py-16 text-center">
              <StickyNote className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No notes yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Notes will appear here when you add them to leads</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {leadsWithNotes.map((lead: any) => (
                <div key={lead.id} className="px-4 py-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <p className="text-sm font-medium truncate">{lead.address}</p>
                    <Badge className={`${(STATUSES.find(s => s.value === lead.status) || STATUSES[0]).color} text-[9px] border-0 shrink-0 ml-auto`}>
                      {(STATUSES.find(s => s.value === lead.status) || STATUSES[0]).label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground pl-5">{lead.notes}</p>
                  {lead.knocked_at && (
                    <p className="text-[10px] text-muted-foreground/60 pl-5">
                      Knocked {new Date(lead.knocked_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LeadRow({ lead, onTap }: { lead: any; onTap: () => void }) {
  const status = STATUSES.find(s => s.value === lead.status) || STATUSES[0];
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 active:bg-muted/50 transition-colors"
    >
      <MapPin className="h-4 w-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{lead.address}</p>
        <p className="text-xs text-muted-foreground">
          {[lead.city, lead.state, lead.zip].filter(Boolean).join(", ")}
        </p>
      </div>
      <Badge className={`${status.color} text-[10px] border-0 shrink-0`}>{status.label}</Badge>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}
