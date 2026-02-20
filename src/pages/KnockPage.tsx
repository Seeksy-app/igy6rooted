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
import { toast } from "sonner";
import {
  MapPin, Navigation, Loader2, ChevronRight,
  CheckCircle2, XCircle, HelpCircle, Clock, Star, Phone,
  Search, Save, ArrowLeft, Filter,
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

export default function KnockPage() {
  const { user } = useAuth();
  const { currentOrg } = useOrg();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<ParsedAddress | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Address search for new leads
  const [addressSearchQuery, setAddressSearchQuery] = useState("");
  const [addressSearchResults, setAddressSearchResults] = useState<any[]>([]);
  const [addressSearching, setAddressSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.functions.invoke("mapbox-token").then(({ data }) => {
      if (data?.token) setMapboxToken(data.token);
    });
  }, []);

  // Debounced address search for new leads
  useEffect(() => {
    if (!addressSearchQuery || addressSearchQuery.length < 3 || !mapboxToken) {
      setAddressSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setAddressSearching(true);
      try {
        const resp = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressSearchQuery)}.json?types=address&country=US&limit=5&access_token=${mapboxToken}`
        );
        const geo = await resp.json();
        setAddressSearchResults(geo.features || []);
      } catch {
        setAddressSearchResults([]);
      } finally {
        setAddressSearching(false);
      }
    }, 350);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [addressSearchQuery, mapboxToken]);

  // Fetch ALL canvassing leads for this org
  const { data: allLeads = [], isLoading } = useQuery({
    queryKey: ["knock-all-leads", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("canvassing_leads")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("address", { ascending: true });
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
      queryClient.invalidateQueries({ queryKey: ["knock-all-leads"] });
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
      queryClient.invalidateQueries({ queryKey: ["knock-all-leads"] });
      toast.success("Lead saved!");
      setDetectedAddress(null);
      setNotes("");
      setAddressSearchQuery("");
      setAddressSearchResults([]);
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
        setAddressSearchQuery("");
        setAddressSearchResults([]);
      } else {
        toast.error("Couldn't detect address. Try searching instead.");
      }
    } catch (err: any) {
      if (err.code === 1) toast.error("Location access denied. Enable GPS or search manually.");
      else toast.error(err.message || "GPS detection failed");
    } finally {
      setDetecting(false);
    }
  }, [mapboxToken]);

  const handleStatusTap = (status: string) => {
    if (selectedLead) {
      const updates: Record<string, any> = { status };
      if (status === "knocked" && !selectedLead.knocked_at) updates.knocked_at = new Date().toISOString();
      if (["interested", "quote_given", "converted", "not_interested"].includes(status)) updates.outcome_at = new Date().toISOString();
      if (notes && notes !== (selectedLead.notes || "")) updates.notes = notes;
      updateLeadMutation.mutate({ id: selectedLead.id, updates });
      setSelectedLead(null);
      setNotes("");
    } else if (detectedAddress) {
      createLeadMutation.mutate({ ...detectedAddress, status, notes });
    }
  };

  // Filter leads
  const filtered = allLeads.filter((l: any) => {
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return l.address?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.zip?.includes(q);
    }
    return true;
  });

  const statusCounts = STATUSES.map((s) => ({
    ...s,
    count: allLeads.filter((l: any) => l.status === s.value).length,
  }));

  // Detail view for a specific lead
  if (selectedLead) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => { setSelectedLead(null); setNotes(""); }}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
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
              {selectedLead.mailing_name && (
                <p className="text-xs text-muted-foreground">Campaign: {selectedLead.mailing_name}</p>
              )}
              {selectedLead.estimated_delivery_date && (
                <p className="text-xs text-muted-foreground">
                  Est. Delivery: {new Date(selectedLead.estimated_delivery_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">Current:</span>
                <Badge className={`${(STATUSES.find(s => s.value === selectedLead.status) || STATUSES[0]).color} text-[10px] border-0`}>
                  {(STATUSES.find(s => s.value === selectedLead.status) || STATUSES[0]).label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Textarea
            placeholder="Notes (optional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />

          <p className="text-sm font-semibold text-center text-muted-foreground">Update Status</p>
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">🚪 Sales Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={detectAddress} disabled={detecting} className="gap-1 text-xs">
              {detecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
              GPS
            </Button>
          </div>
        </div>

        {/* Search within existing leads */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/50" />
          <Input
            placeholder="Search addresses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
          />
        </div>
      </header>

      {/* Status filter chips */}
      <div className="px-3 py-2 flex gap-2 overflow-x-auto bg-muted/30 border-b border-border">
        <button
          onClick={() => setFilterStatus("all")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filterStatus === "all" ? "bg-primary text-primary-foreground" : "bg-background border border-border text-foreground"
          }`}
        >
          All ({allLeads.length})
        </button>
        {statusCounts.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(filterStatus === s.value ? "all" : s.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filterStatus === s.value ? "bg-primary text-primary-foreground" : "bg-background border border-border text-foreground"
            }`}
          >
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {/* Detected address banner */}
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
            <Button variant="ghost" size="sm" onClick={() => { setDetectedAddress(null); setNotes(""); }} className="text-xs shrink-0">✕</Button>
          </div>
          <Textarea
            placeholder="Notes (optional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[50px] text-sm"
          />
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

      {/* Leads list */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {allLeads.length === 0 ? "No leads yet" : "No leads match your search"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {allLeads.length === 0 ? "Use GPS or sync from admin to add addresses" : "Try a different filter or search"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <p className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30">
              {filtered.length} address{filtered.length !== 1 ? "es" : ""}
            </p>
            {filtered.map((lead: any) => {
              const status = STATUSES.find(s => s.value === lead.status) || STATUSES[0];
              return (
                <button
                  key={lead.id}
                  onClick={() => { setSelectedLead(lead); setNotes(lead.notes || ""); }}
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
