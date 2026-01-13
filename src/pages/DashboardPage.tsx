import { Phone, Calendar, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Link2, Wrench, Clock, Inbox, Loader2 } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useOrg } from "@/contexts/OrgContext";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function DashboardPage() {
  const { currentOrg } = useOrg();

  // Fetch real booking stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: bookings, error } = await supabase
        .from("ai_bookings")
        .select("status, created_at")
        .eq("org_id", currentOrg.id)
        .gte("created_at", today.toISOString());
      
      if (error) throw error;
      
      const { data: followups } = await supabase
        .from("followups")
        .select("id")
        .eq("org_id", currentOrg.id)
        .eq("status", "pending");
      
      const { data: events } = await supabase
        .from("ai_activity_events")
        .select("event_type")
        .eq("org_id", currentOrg.id)
        .eq("event_type", "call")
        .gte("created_at", today.toISOString());
      
      return {
        callsToday: events?.length || 0,
        bookingAttempts: bookings?.length || 0,
        booked: bookings?.filter(b => b.status === "confirmed" || b.status === "pending").length || 0,
        failed: bookings?.filter(b => b.status === "failed" || b.status === "cancelled").length || 0,
        followupsOpen: followups?.length || 0,
      };
    },
    enabled: !!currentOrg
  });

  // Fetch real recent bookings
  const { data: recentBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["recent-bookings", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      
      const { data, error } = await supabase
        .from("ai_bookings")
        .select("id, customer_name, service_type, status, created_at")
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrg
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const displayStats = stats || {
    callsToday: 0,
    bookingAttempts: 0,
    booked: 0,
    failed: 0,
    followupsOpen: 0,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back to {currentOrg?.name || "your organization"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Calls Today"
          value={statsLoading ? "—" : displayStats.callsToday}
          icon={Phone}
        />
        <StatCard
          title="Booking Attempts"
          value={statsLoading ? "—" : displayStats.bookingAttempts}
          icon={Calendar}
        />
        <StatCard
          title="Successfully Booked"
          value={statsLoading ? "—" : displayStats.booked}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Failed"
          value={statsLoading ? "—" : displayStats.failed}
          icon={XCircle}
          variant="destructive"
        />
        <StatCard
          title="Open Follow-ups"
          value={statsLoading ? "—" : displayStats.followupsOpen}
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Link to="/jobber" className="stat-card group cursor-pointer transition-all hover:border-primary/50">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/15 p-3 text-primary">
              <Link2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Connect Jobber</h3>
              <p className="text-sm text-muted-foreground">
                Link your Jobber account for real-time scheduling
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link to="/services" className="stat-card group cursor-pointer transition-all hover:border-primary/50">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/15 p-3 text-primary">
              <Wrench className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Add Services</h3>
              <p className="text-sm text-muted-foreground">
                Configure services your AI can schedule
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link to="/availability" className="stat-card group cursor-pointer transition-all hover:border-primary/50">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/15 p-3 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Set Availability</h3>
              <p className="text-sm text-muted-foreground">
                Define your business hours and blackout dates
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="stat-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-header">Recent Bookings</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/booking-logs">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {bookingsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-medium">No bookings yet</p>
            <p className="text-sm text-muted-foreground">AI-assisted bookings will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
                    {booking.customer_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{booking.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{booking.service_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={booking.status === "confirmed" ? "booked" : booking.status === "pending" ? "needs_followup" : "failed"} />
                  <span className="text-sm text-muted-foreground">{formatTime(booking.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}