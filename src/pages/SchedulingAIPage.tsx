import { useState } from "react";
import { Bot, Activity, Play, CheckCircle2, XCircle, Loader2, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useOrg } from "@/contexts/OrgContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface HealthCheck {
  name: string;
  status: "pending" | "success" | "error";
  message?: string;
}

export default function SchedulingAIPage() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    { name: "Integration Service", status: "pending" },
    { name: "Jobber Connection", status: "pending" },
    { name: "Availability API", status: "pending" },
    { name: "Booking API", status: "pending" },
  ]);
  const [isRunningChecks, setIsRunningChecks] = useState(false);

  // Test booking form
  const [testService, setTestService] = useState("");
  const [testZip, setTestZip] = useState("");
  const [testDate, setTestDate] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Get recent bookings for stats
  const { data: recentBookings } = useQuery({
    queryKey: ["recent-bookings", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*")
        .eq("org_id", currentOrg.id)
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });

  const { data: services } = useQuery({
    queryKey: ["services", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("service_catalog")
        .select("*")
        .eq("org_id", currentOrg.id)
        .eq("active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });

  const runHealthChecks = async () => {
    setIsRunningChecks(true);

    // Simulate health checks - in production these would call the Integration Service
    const checks = [...healthChecks];

    for (let i = 0; i < checks.length; i++) {
      checks[i] = { ...checks[i], status: "pending" };
      setHealthChecks([...checks]);

      await new Promise((r) => setTimeout(r, 500));

      // Simulate results
      checks[i] = {
        ...checks[i],
        status: Math.random() > 0.2 ? "success" : "error",
        message: Math.random() > 0.2 ? "Healthy" : "Connection timeout",
      };
      setHealthChecks([...checks]);
    }

    setIsRunningChecks(false);
    toast({
      title: "Health check complete",
      description: `${checks.filter((c) => c.status === "success").length}/${checks.length} services healthy`,
    });
  };

  const runTestBooking = async () => {
    if (!testService || !testZip || !testDate) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all test parameters.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Simulate API call - in production this would call the Integration Service
    await new Promise((r) => setTimeout(r, 1500));

    const mockSlots = [
      { start: `${testDate}T09:00:00`, end: `${testDate}T10:00:00`, confidence: 0.95 },
      { start: `${testDate}T11:00:00`, end: `${testDate}T12:00:00`, confidence: 0.87 },
      { start: `${testDate}T14:00:00`, end: `${testDate}T15:00:00`, confidence: 0.72 },
    ];

    setTestResult({
      org_id: currentOrg?.id,
      service_key: testService,
      slots: mockSlots,
    });

    setIsTesting(false);
  };

  const stats = {
    todayCalls: recentBookings?.length || 0,
    booked: recentBookings?.filter((b) => b.status === "booked").length || 0,
    failed: recentBookings?.filter((b) => b.status === "failed").length || 0,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scheduling AI</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor and test your AI scheduling agent
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Today's Calls" value={stats.todayCalls} icon={Phone} />
        <StatCard title="Successfully Booked" value={stats.booked} icon={Calendar} variant="success" />
        <StatCard title="Failed" value={stats.failed} icon={XCircle} variant="destructive" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Health Checks */}
        <div className="stat-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="section-header">Service Health</h2>
            </div>
            <Button onClick={runHealthChecks} disabled={isRunningChecks}>
              {isRunningChecks ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run Checks
            </Button>
          </div>

          <div className="space-y-3">
            {healthChecks.map((check) => (
              <div
                key={check.name}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
              >
                <span className="font-medium">{check.name}</span>
                <div className="flex items-center gap-2">
                  {check.status === "pending" && (
                    <span className="text-sm text-muted-foreground">Not checked</span>
                  )}
                  {check.status === "success" && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm text-success">{check.message}</span>
                    </>
                  )}
                  {check.status === "error" && (
                    <>
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">{check.message}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Booking */}
        <div className="stat-card">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="section-header">Test Availability</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={testService} onValueChange={setTestService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services?.map((service) => (
                    <SelectItem key={service.id} value={service.service_key}>
                      {service.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>ZIP Code</Label>
                <Input
                  placeholder="12345"
                  value={testZip}
                  onChange={(e) => setTestZip(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={runTestBooking} disabled={isTesting} className="w-full">
              {isTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Check Availability
            </Button>

            {testResult && (
              <div className="mt-4 rounded-lg bg-muted/50 p-4">
                <h4 className="mb-3 font-medium">Available Slots</h4>
                <div className="space-y-2">
                  {testResult.slots.map((slot: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md bg-card px-3 py-2"
                    >
                      <span>
                        {format(new Date(slot.start), "h:mm a")} -{" "}
                        {format(new Date(slot.end), "h:mm a")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(slot.confidence * 100)}% confidence
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="stat-card">
        <h2 className="mb-4 section-header">Recent Booking Activity</h2>
        {recentBookings && recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.slice(0, 10).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{booking.customer_name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.service_key} • {booking.zip}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={booking.status} />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(booking.created_at), "h:mm a")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No booking activity today
          </p>
        )}
      </div>
    </div>
  );
}
