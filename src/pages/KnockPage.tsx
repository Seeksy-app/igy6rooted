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
  Search, ArrowLeft, Plus, Home, User, List,
  LocateFixed, ChevronDown,
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

type Tab = "leads" | "new" | "profile";

export default function KnockPage() {
  const { user } = useAuth();
  const { currentOrg } = useOrg();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("leads");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // New prospect state
  const [newAddress, setNewAddress] = useState<ParsedAddress | null>(null);
  const [addressSearchQuery, setAddressSearchQuery] = useState("");
  const [addressSearchResults, setAddressSearchResults] = useState<any[]>([]);
  const [addressSearching, setAddressSearching] = useState(false);
  const [newNotes, setNewNotes] = useState("");
  const [newPropertyType, setNewPropertyType] = useState("residential");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.functions.invoke("mapbox-token").then(({ data }) => {
      if (data?.token) setMapboxToken(data.token);
    });
  }, []);

  // Debounced address search
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
        .order("created_at", { ascending: false });
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
    mutationFn: async (lead: ParsedAddress & { status: string; notes: string; property_type: string }) => {
      if (!currentOrg || !user) throw new Error("Not authenticated");
      const { error } = await supabase.from("canvassing_leads").insert({
        org_id: currentOrg.id,
        address: lead.address,
        city: lead.city,
        state: lead.state,
        zip: lead.zip,
        status: lead.status,
        notes: lead.notes,
        property_type: lead.property_type,
        assigned_to: user.id,
        assigned_to_name: user.user_metadata?.display_name || user.email,
        knocked_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knock-all-leads"] });
      toast.success("Prospect created!");
      setNewAddress(null);
      setNewNotes("");
      setAddressSearchQuery("");
      setAddressSearchResults([]);
      setActiveTab("leads");
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
        const parsed = parseMapboxFeature(geo.features[0]);
        if (activeTab === "new") {
          setNewAddress(parsed);
          setAddressSearchQuery("");
          setAddressSearchResults([]);
        }
      } else {
        toast.error("Couldn't detect address. Try searching instead.");
      }
    } catch (err: any) {
      if (err.code === 1) toast.error("Location access denied. Enable GPS or search manually.");
      else toast.error(err.message || "GPS detection failed");
    } finally {
      setDetecting(false);
    }
  }, [mapboxToken, activeTab]);

  const handleStatusTap = (status: string) => {
    if (selectedLead) {
      const updates: Record<string, any> = { status };
      if (status === "knocked" && !selectedLead.knocked_at) updates.knocked_at = new Date().toISOString();
      if (["interested", "quote_given", "converted", "not_interested"].includes(status)) updates.outcome_at = new Date().toISOString();
      if (notes && notes !== (selectedLead.notes || "")) updates.notes = notes;
      updateLeadMutation.mutate({ id: selectedLead.id, updates });
      setSelectedLead(null);
      setNotes("");
    }
  };

  const handleCreateProspect = (status: string) => {
    if (!newAddress) return;
    createLeadMutation.mutate({
      ...newAddress,
      status,
      notes: newNotes,
      property_type: newPropertyType,
    });
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

  // ─── LEAD DETAIL VIEW ───
  if (selectedLead) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 safe-area-top">
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => { setSelectedLead(null); setNotes(""); }}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <span className="text-sm font-semibold truncate">{selectedLead.address}</span>
        </header>

        <div className="flex-1 p-4 space-y-4 pb-24">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{selectedLead.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {[selectedLead.city, selectedLead.state, selectedLead.zip].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
              {selectedLead.property_type && (
                <p className="text-xs text-muted-foreground">Property: {selectedLead.property_type}</p>
              )}
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
            placeholder="Add notes about this prospect..."
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
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">
            {activeTab === "leads" && "🏠 Prospects"}
            {activeTab === "new" && "➕ New Prospect"}
            {activeTab === "profile" && "👤 My Stats"}
          </h1>
          <div className="flex items-center gap-2 text-xs text-primary-foreground/70">
            <span>{allLeads.length} total</span>
          </div>
        </div>
      </header>

      {/* ─── TAB CONTENT ─── */}
      <div className="flex-1 overflow-auto pb-20">
        {activeTab === "leads" && (
          <LeadsTab
            allLeads={allLeads}
            filtered={filtered}
            isLoading={isLoading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            statusCounts={statusCounts}
            onSelectLead={(lead: any) => { setSelectedLead(lead); setNotes(lead.notes || ""); }}
          />
        )}

        {activeTab === "new" && (
          <NewProspectTab
            newAddress={newAddress}
            setNewAddress={setNewAddress}
            addressSearchQuery={addressSearchQuery}
            setAddressSearchQuery={setAddressSearchQuery}
            addressSearchResults={addressSearchResults}
            addressSearching={addressSearching}
            newNotes={newNotes}
            setNewNotes={setNewNotes}
            newPropertyType={newPropertyType}
            setNewPropertyType={setNewPropertyType}
            detecting={detecting}
            detectAddress={detectAddress}
            onCreateProspect={handleCreateProspect}
            isPending={createLeadMutation.isPending}
          />
        )}

        {activeTab === "profile" && (
          <ProfileTab user={user} allLeads={allLeads} />
        )}
      </div>

      {/* ─── BOTTOM TAB BAR ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          <TabButton icon={List} label="Prospects" active={activeTab === "leads"} onClick={() => setActiveTab("leads")} />
          <TabButton icon={Plus} label="New" active={activeTab === "new"} onClick={() => setActiveTab("new")} isPrimary />
          <TabButton icon={User} label="My Stats" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
        </div>
      </nav>
    </div>
  );
}

// ─── TAB BUTTON COMPONENT ───
function TabButton({ icon: Icon, label, active, onClick, isPrimary }: {
  icon: React.ElementType; label: string; active: boolean; onClick: () => void; isPrimary?: boolean;
}) {
  if (isPrimary) {
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-0.5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
          active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
        }`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
      </button>
    );
  }
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 min-w-[64px]">
      <Icon className={`h-5 w-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
      <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
    </button>
  );
}

// ─── LEADS TAB ───
function LeadsTab({ allLeads, filtered, isLoading, searchQuery, setSearchQuery, filterStatus, setFilterStatus, statusCounts, onSelectLead }: any) {
  return (
    <>
      {/* Search bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search addresses, city, zip..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Status filter chips */}
      <div className="px-3 py-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setFilterStatus("all")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filterStatus === "all" ? "bg-primary text-primary-foreground" : "bg-muted border border-border text-foreground"
          }`}
        >
          All ({allLeads.length})
        </button>
        {statusCounts.map((s: any) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(filterStatus === s.value ? "all" : s.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filterStatus === s.value ? "bg-primary text-primary-foreground" : "bg-muted border border-border text-foreground"
            }`}
          >
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {/* Leads list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">
            {allLeads.length === 0 ? "No prospects yet" : "No matches found"}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {allLeads.length === 0 ? "Tap + to add your first prospect" : "Try different search or filter"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          <p className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30">
            {filtered.length} prospect{filtered.length !== 1 ? "s" : ""}
          </p>
          {filtered.map((lead: any) => {
            const status = STATUSES.find(s => s.value === lead.status) || STATUSES[0];
            return (
              <button
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/30 active:bg-muted/50 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
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
    </>
  );
}

// ─── NEW PROSPECT TAB ───
function NewProspectTab({
  newAddress, setNewAddress, addressSearchQuery, setAddressSearchQuery,
  addressSearchResults, addressSearching, newNotes, setNewNotes,
  newPropertyType, setNewPropertyType, detecting, detectAddress,
  onCreateProspect, isPending,
}: any) {
  return (
    <div className="p-4 space-y-4">
      {/* Step 1: Find Address */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
          Find Address
        </h2>

        {/* GPS Button */}
        <Button
          onClick={detectAddress}
          disabled={detecting}
          variant="outline"
          className="w-full h-12 gap-2 text-sm"
        >
          {detecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
          {detecting ? "Detecting location..." : "Use My Current Location"}
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or search</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Address Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Type an address..."
            value={addressSearchQuery}
            onChange={(e) => setAddressSearchQuery(e.target.value)}
            className="pl-9 h-11"
          />
          {addressSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search Results */}
        {addressSearchResults.length > 0 && (
          <div className="rounded-lg border border-border overflow-hidden">
            {addressSearchResults.map((feature: any, i: number) => (
              <button
                key={i}
                onClick={() => {
                  setNewAddress(parseMapboxFeature(feature));
                  setAddressSearchQuery("");
                }}
                className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-muted/50 active:bg-muted border-b last:border-0 border-border transition-colors"
              >
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm truncate">{feature.place_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Address Card */}
      {newAddress && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">{newAddress.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {[newAddress.city, newAddress.state, newAddress.zip].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setNewAddress(null)} className="text-xs h-7 px-2">✕</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Property Details */}
      {newAddress && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
            Property Details
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Property Type</label>
            <div className="grid grid-cols-3 gap-2">
              {["residential", "commercial", "vacant lot"].map((type) => (
                <button
                  key={type}
                  onClick={() => setNewPropertyType(type)}
                  className={`rounded-lg border px-3 py-2.5 text-xs font-medium capitalize transition-colors ${
                    newPropertyType === type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            placeholder="Notes about this property (trees, yard condition, etc.)..."
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      )}

      {/* Step 3: Set Status & Save */}
      {newAddress && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
            Set Initial Status
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {STATUSES.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.value}
                  onClick={() => onCreateProspect(s.value)}
                  disabled={isPending}
                  className={`${s.color} rounded-xl p-4 flex flex-col items-center gap-2 text-sm font-medium transition-all active:scale-95`}
                >
                  <Icon className="h-6 w-6" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROFILE / STATS TAB ───
function ProfileTab({ user, allLeads }: { user: any; allLeads: any[] }) {
  const myLeads = allLeads.filter((l: any) => l.assigned_to === user?.id);
  const todayStr = new Date().toISOString().split("T")[0];
  const todayKnocks = myLeads.filter((l: any) => l.knocked_at?.startsWith(todayStr)).length;

  const statusBreakdown = STATUSES.map((s) => ({
    ...s,
    count: myLeads.filter((l: any) => l.status === s.value).length,
  })).filter(s => s.count > 0);

  return (
    <div className="p-4 space-y-4">
      {/* User card */}
      <Card>
        <CardContent className="pt-5 pb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
            {(user?.user_metadata?.display_name || user?.email || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-foreground">{user?.user_metadata?.display_name || user?.email}</p>
            <p className="text-xs text-muted-foreground">Sales Rep</p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{todayKnocks}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{myLeads.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">My Prospects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {myLeads.filter((l: any) => l.status === "converted").length}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Converted</p>
          </CardContent>
        </Card>
      </div>

      {/* Status breakdown */}
      {statusBreakdown.length > 0 && (
        <Card>
          <CardContent className="pt-4 pb-2">
            <p className="text-sm font-semibold text-foreground mb-3">My Status Breakdown</p>
            <div className="space-y-2">
              {statusBreakdown.map((s) => (
                <div key={s.value} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <Badge className={`${s.color} text-[10px] border-0`}>{s.label}</Badge>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
