import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/contexts/OrgContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Map,
  Target,
  Plus,
  Trash2,
  Edit,
  Loader2,
  MapPin,
  TrendingUp,
  Star,
  X,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MarketZone {
  id: string;
  org_id: string;
  name: string;
  zip_codes: string[];
  priority: number;
  lead_score_multiplier: number;
  target_monthly_leads: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const priorityColors: Record<string, string> = {
  high: "text-green-600 bg-green-100",
  medium: "text-yellow-600 bg-yellow-100",
  low: "text-red-600 bg-red-100",
};

function getPriorityLabel(priority: number): { label: string; color: string } {
  if (priority >= 70) return { label: "High", color: priorityColors.high };
  if (priority >= 40) return { label: "Medium", color: priorityColors.medium };
  return { label: "Low", color: priorityColors.low };
}

export default function GTMPage() {
  const { currentOrg, userRole } = useOrg();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = userRole === "admin";

  const [activeTab, setActiveTab] = useState("map");
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<MarketZone | null>(null);

  // Form state
  const [zoneName, setZoneName] = useState("");
  const [zoneZips, setZoneZips] = useState<string[]>([]);
  const [newZip, setNewZip] = useState("");
  const [zonePriority, setZonePriority] = useState(50);
  const [zoneMultiplier, setZoneMultiplier] = useState(1);
  const [zoneTargetLeads, setZoneTargetLeads] = useState<string>("");
  const [zoneNotes, setZoneNotes] = useState("");
  const [zoneActive, setZoneActive] = useState(true);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("mapbox-token");
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (error) {
        console.error("Failed to fetch Mapbox token:", error);
      }
    };
    fetchToken();
  }, []);

  // Fetch market zones
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["gtm-zones", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("gtm_market_zones")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("priority", { ascending: false });
      if (error) throw error;
      return data as MarketZone[];
    },
    enabled: !!currentOrg,
  });

  // Create/Update zone mutation
  const saveZoneMutation = useMutation({
    mutationFn: async (zone: Partial<MarketZone>) => {
      if (!currentOrg) throw new Error("No organization");
      
      const payload = {
        org_id: currentOrg.id,
        name: zone.name,
        zip_codes: zone.zip_codes,
        priority: zone.priority,
        lead_score_multiplier: zone.lead_score_multiplier,
        target_monthly_leads: zone.target_monthly_leads || null,
        notes: zone.notes || null,
        is_active: zone.is_active,
      };

      if (editingZone) {
        const { error } = await supabase
          .from("gtm_market_zones")
          .update(payload)
          .eq("id", editingZone.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("gtm_market_zones")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gtm-zones"] });
      toast({
        title: editingZone ? "Zone updated" : "Zone created",
        description: `Market zone "${zoneName}" has been saved.`,
      });
      resetForm();
      setIsZoneDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  // Delete zone mutation
  const deleteZoneMutation = useMutation({
    mutationFn: async (zoneId: string) => {
      const { error } = await supabase
        .from("gtm_market_zones")
        .delete()
        .eq("id", zoneId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gtm-zones"] });
      toast({ title: "Zone deleted" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setZoneName("");
    setZoneZips([]);
    setNewZip("");
    setZonePriority(50);
    setZoneMultiplier(1);
    setZoneTargetLeads("");
    setZoneNotes("");
    setZoneActive(true);
    setEditingZone(null);
  };

  const openEditDialog = (zone: MarketZone) => {
    setEditingZone(zone);
    setZoneName(zone.name);
    setZoneZips(zone.zip_codes);
    setZonePriority(zone.priority);
    setZoneMultiplier(zone.lead_score_multiplier);
    setZoneTargetLeads(zone.target_monthly_leads?.toString() || "");
    setZoneNotes(zone.notes || "");
    setZoneActive(zone.is_active);
    setIsZoneDialogOpen(true);
  };

  const addZipToZone = () => {
    if (newZip && !zoneZips.includes(newZip)) {
      setZoneZips([...zoneZips, newZip]);
      setNewZip("");
    }
  };

  const removeZipFromZone = (zip: string) => {
    setZoneZips(zoneZips.filter((z) => z !== zip));
  };

  const handleSaveZone = () => {
    if (!zoneName || zoneZips.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Please provide a zone name and at least one ZIP code.",
      });
      return;
    }

    saveZoneMutation.mutate({
      name: zoneName,
      zip_codes: zoneZips,
      priority: zonePriority,
      lead_score_multiplier: zoneMultiplier,
      target_monthly_leads: zoneTargetLeads ? parseInt(zoneTargetLeads) : null,
      notes: zoneNotes,
      is_active: zoneActive,
    });
  };

  // Get all ZIP codes from all zones for the map
  const allZipCodes = zones.flatMap((z) => z.zip_codes);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Go-To-Market</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your service coverage and market prioritization
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Coverage Map
          </TabsTrigger>
          <TabsTrigger value="priority" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Market Prioritization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-6">
          <CoverageMapView 
            mapboxToken={mapboxToken} 
            zones={zones}
          />
        </TabsContent>

        <TabsContent value="priority" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Market Zones</h2>
              {isAdmin && (
                <Dialog open={isZoneDialogOpen} onOpenChange={(open) => {
                  setIsZoneDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Zone
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingZone ? "Edit Market Zone" : "Create Market Zone"}
                      </DialogTitle>
                      <DialogDescription>
                        Define a geographic zone with priority and lead scoring rules.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="zone-name">Zone Name</Label>
                        <Input
                          id="zone-name"
                          placeholder="e.g., Downtown Core"
                          value={zoneName}
                          onChange={(e) => setZoneName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>ZIP Codes</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter ZIP code"
                            value={newZip}
                            onChange={(e) => setNewZip(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addZipToZone())}
                          />
                          <Button type="button" onClick={addZipToZone}>
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {zoneZips.map((zip) => (
                            <span
                              key={zip}
                              className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-sm text-primary"
                            >
                              {zip}
                              <button onClick={() => removeZipFromZone(zip)}>
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Priority Level</Label>
                          <span className={`text-sm px-2 py-0.5 rounded ${getPriorityLabel(zonePriority).color}`}>
                            {getPriorityLabel(zonePriority).label} ({zonePriority})
                          </span>
                        </div>
                        <Slider
                          value={[zonePriority]}
                          onValueChange={([val]) => setZonePriority(val)}
                          max={100}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Lead Score Multiplier</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[zoneMultiplier * 100]}
                            onValueChange={([val]) => setZoneMultiplier(val / 100)}
                            min={50}
                            max={200}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-16 text-right">
                            {zoneMultiplier.toFixed(2)}x
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="target-leads">Target Monthly Leads</Label>
                        <Input
                          id="target-leads"
                          type="number"
                          placeholder="Optional"
                          value={zoneTargetLeads}
                          onChange={(e) => setZoneTargetLeads(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zone-notes">Notes</Label>
                        <Textarea
                          id="zone-notes"
                          placeholder="Additional context about this zone..."
                          value={zoneNotes}
                          onChange={(e) => setZoneNotes(e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="zone-active">Active</Label>
                        <Switch
                          id="zone-active"
                          checked={zoneActive}
                          onCheckedChange={setZoneActive}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsZoneDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveZone}
                        disabled={saveZoneMutation.isPending}
                      >
                        {saveZoneMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {editingZone ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : zones.length === 0 ? (
              <div className="stat-card text-center py-12">
                <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No market zones yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first market zone to start prioritizing leads by geography.
                </p>
              </div>
            ) : (
              <div className="stat-card overflow-hidden p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone</TableHead>
                      <TableHead>ZIP Codes</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Multiplier</TableHead>
                      <TableHead>Target Leads</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="w-20"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zones.map((zone) => {
                      const priority = getPriorityLabel(zone.priority);
                      return (
                        <TableRow key={zone.id}>
                          <TableCell className="font-medium">
                            {zone.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {zone.zip_codes.slice(0, 3).map((zip) => (
                                <span
                                  key={zip}
                                  className="inline-block rounded bg-muted px-2 py-0.5 text-xs"
                                >
                                  {zip}
                                </span>
                              ))}
                              {zone.zip_codes.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{zone.zip_codes.length - 3} more
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priority.color}`}>
                              {priority.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-muted-foreground" />
                              {zone.lead_score_multiplier.toFixed(2)}x
                            </div>
                          </TableCell>
                          <TableCell>
                            {zone.target_monthly_leads ?? "—"}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 text-xs ${zone.is_active ? "text-green-600" : "text-muted-foreground"}`}>
                              <span className={`h-2 w-2 rounded-full ${zone.is_active ? "bg-green-500" : "bg-muted"}`} />
                              {zone.is_active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(zone)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    if (confirm("Delete this zone?")) {
                                      deleteZoneMutation.mutate(zone.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Coverage Map Component
function CoverageMapView({ 
  mapboxToken, 
  zones 
}: { 
  mapboxToken: string | null;
  zones: MarketZone[];
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-98.5795, 39.8283], // Center of US
      zoom: 4,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Add markers for zones
  useEffect(() => {
    if (!map.current || !mapLoaded || zones.length === 0) return;

    // Remove existing markers
    const markers = document.querySelectorAll(".mapboxgl-marker");
    markers.forEach((m) => m.remove());

    // This is a simplified approach - in production you'd use a geocoding service
    // For now, we'll show a summary card
    zones.forEach((zone, index) => {
      if (zone.is_active && zone.zip_codes.length > 0) {
        // Create a marker at a pseudo-random but consistent position
        // In production, you'd geocode the ZIP codes
        const hash = zone.zip_codes[0].split("").reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        
        const lng = -120 + (Math.abs(hash) % 50);
        const lat = 30 + (Math.abs(hash >> 8) % 15);

        const priority = getPriorityLabel(zone.priority);
        
        const el = document.createElement("div");
        el.className = "flex items-center justify-center w-8 h-8 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110";
        el.style.backgroundColor = zone.priority >= 70 ? "#22c55e" : zone.priority >= 40 ? "#eab308" : "#ef4444";
        el.innerHTML = `<span class="text-white text-xs font-bold">${zone.zip_codes.length}</span>`;
        el.title = `${zone.name}: ${zone.zip_codes.length} ZIP codes`;

        new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${zone.name}</h3>
                <p class="text-sm text-gray-600">${zone.zip_codes.length} ZIP codes</p>
                <p class="text-sm">Priority: <span class="font-medium">${priority.label}</span></p>
                <p class="text-sm">Multiplier: ${zone.lead_score_multiplier}x</p>
              </div>
            `)
          )
          .addTo(map.current!);
      }
    });
  }, [zones, mapLoaded]);

  if (!mapboxToken) {
    return (
      <div className="stat-card flex items-center justify-center h-[500px]">
        <div className="text-center">
          <Map className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Map Loading...</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Fetching map configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="stat-card p-0 overflow-hidden">
        <div ref={mapContainer} className="h-[500px] w-full" />
      </div>

      {/* Zone Legend */}
      <div className="grid gap-4 md:grid-cols-3">
        {zones.filter(z => z.is_active).map((zone) => {
          const priority = getPriorityLabel(zone.priority);
          return (
            <div key={zone.id} className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{zone.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {zone.zip_codes.length} ZIP codes
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${priority.color}`}>
                  {priority.label}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-muted-foreground" />
                  <span>{zone.lead_score_multiplier}x</span>
                </div>
                {zone.target_monthly_leads && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span>{zone.target_monthly_leads} leads/mo</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
