import { useState, useEffect } from "react";
import { Save, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrg } from "@/contexts/OrgContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Pacific/Honolulu",
];

interface BusinessHours {
  [key: string]: [string, string][];
}

export default function AvailabilityPage() {
  const { currentOrg, userRole } = useOrg();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [timezone, setTimezone] = useState("America/New_York");
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    mon: [["09:00", "17:00"]],
    tue: [["09:00", "17:00"]],
    wed: [["09:00", "17:00"]],
    thu: [["09:00", "17:00"]],
    fri: [["09:00", "17:00"]],
    sat: [],
    sun: [],
  });
  const [blackoutDates, setBlackoutDates] = useState<string[]>([]);
  const [zipCodes, setZipCodes] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [newZip, setNewZip] = useState("");
  const [newBlackout, setNewBlackout] = useState("");

  const { data: rules, isLoading } = useQuery({
    queryKey: ["availability-rules", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;
      const { data, error } = await supabase
        .from("availability_rules")
        .select("*")
        .eq("org_id", currentOrg.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });

  useEffect(() => {
    if (rules) {
      setTimezone(rules.timezone);
      setBusinessHours(rules.business_hours as BusinessHours);
      setBlackoutDates((rules.blackout_dates as string[]) || []);
      setZipCodes((rules.allowed_zip_codes as string[]) || []);
      setNotes(rules.notes || "");
    }
  }, [rules]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrg) throw new Error("No organization selected");

      const data = {
        org_id: currentOrg.id,
        timezone,
        business_hours: businessHours,
        blackout_dates: blackoutDates,
        allowed_zip_codes: zipCodes,
        notes,
        updated_at: new Date().toISOString(),
      };

      if (rules) {
        const { error } = await supabase
          .from("availability_rules")
          .update(data)
          .eq("id", rules.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("availability_rules").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability-rules"] });
      toast({
        title: "Availability saved",
        description: "Your availability rules have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const updateDayHours = (day: string, index: number, field: 0 | 1, value: string) => {
    setBusinessHours((prev) => {
      const newHours = { ...prev };
      newHours[day] = [...(prev[day] || [])];
      newHours[day][index] = [...newHours[day][index]] as [string, string];
      newHours[day][index][field] = value;
      return newHours;
    });
  };

  const addTimeSlot = (day: string) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), ["09:00", "17:00"]],
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setBusinessHours((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const addZipCode = () => {
    if (newZip && !zipCodes.includes(newZip)) {
      setZipCodes([...zipCodes, newZip]);
      setNewZip("");
    }
  };

  const removeZipCode = (zip: string) => {
    setZipCodes(zipCodes.filter((z) => z !== zip));
  };

  const addBlackoutDate = () => {
    if (newBlackout && !blackoutDates.includes(newBlackout)) {
      setBlackoutDates([...blackoutDates, newBlackout]);
      setNewBlackout("");
    }
  };

  const removeBlackoutDate = (date: string) => {
    setBlackoutDates(blackoutDates.filter((d) => d !== date));
  };

  const isAdmin = userRole === "admin";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Availability</h1>
          <p className="mt-1 text-muted-foreground">
            Define your business hours and service areas
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business Hours */}
        <div className="stat-card space-y-6">
          <div>
            <h2 className="section-header">Business Hours</h2>
            <p className="text-sm text-muted-foreground">
              Set your regular operating hours for each day
            </p>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone} disabled={!isAdmin}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {DAYS.map((day) => (
              <div key={day} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{DAY_LABELS[day]}</Label>
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addTimeSlot(day)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {businessHours[day]?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Closed</p>
                ) : (
                  businessHours[day]?.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={slot[0]}
                        onChange={(e) => updateDayHours(day, index, 0, e.target.value)}
                        disabled={!isAdmin}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={slot[1]}
                        onChange={(e) => updateDayHours(day, index, 1, e.target.value)}
                        disabled={!isAdmin}
                        className="w-32"
                      />
                      {isAdmin && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTimeSlot(day, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Service Areas */}
          <div className="stat-card space-y-4">
            <div>
              <h2 className="section-header">Service Areas</h2>
              <p className="text-sm text-muted-foreground">
                ZIP codes where you provide service (leave empty for no restrictions)
              </p>
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter ZIP code"
                  value={newZip}
                  onChange={(e) => setNewZip(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addZipCode()}
                />
                <Button type="button" onClick={addZipCode}>
                  Add
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {zipCodes.map((zip) => (
                <span
                  key={zip}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-sm text-primary"
                >
                  {zip}
                  {isAdmin && (
                    <button onClick={() => removeZipCode(zip)}>
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
              {zipCodes.length === 0 && (
                <p className="text-sm text-muted-foreground">All areas</p>
              )}
            </div>
          </div>

          {/* Blackout Dates */}
          <div className="stat-card space-y-4">
            <div>
              <h2 className="section-header">Blackout Dates</h2>
              <p className="text-sm text-muted-foreground">
                Dates when you're unavailable (holidays, vacation, etc.)
              </p>
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={newBlackout}
                  onChange={(e) => setNewBlackout(e.target.value)}
                />
                <Button type="button" onClick={addBlackoutDate}>
                  Add
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {blackoutDates.map((date) => (
                <span
                  key={date}
                  className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-3 py-1 text-sm text-destructive"
                >
                  {new Date(date).toLocaleDateString()}
                  {isAdmin && (
                    <button onClick={() => removeBlackoutDate(date)}>
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
              {blackoutDates.length === 0 && (
                <p className="text-sm text-muted-foreground">None</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="stat-card space-y-4">
            <div>
              <h2 className="section-header">Notes</h2>
              <p className="text-sm text-muted-foreground">
                Additional context for the AI scheduler
              </p>
            </div>

            <Textarea
              placeholder="e.g., We prioritize mornings in the summer months..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!isAdmin}
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
