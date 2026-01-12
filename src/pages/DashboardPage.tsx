import { Phone, Calendar, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Link2, Wrench, Clock } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useOrg } from "@/contexts/OrgContext";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { currentOrg } = useOrg();

  // Mock data - will be replaced with real queries
  const stats = {
    callsToday: 24,
    bookingAttempts: 18,
    booked: 12,
    failed: 3,
    followupsOpen: 5,
  };

  const recentBookings = [
    { id: "1", customer: "John Smith", service: "Lawn Mowing", status: "booked", time: "10:30 AM" },
    { id: "2", customer: "Sarah Johnson", service: "Hedge Trimming", status: "needs_followup", time: "11:15 AM" },
    { id: "3", customer: "Mike Wilson", service: "Lawn Mowing", status: "booked", time: "1:00 PM" },
  ];

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
          value={stats.callsToday}
          icon={Phone}
          trend={{ value: 12, label: "vs yesterday" }}
        />
        <StatCard
          title="Booking Attempts"
          value={stats.bookingAttempts}
          icon={Calendar}
        />
        <StatCard
          title="Successfully Booked"
          value={stats.booked}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Failed"
          value={stats.failed}
          icon={XCircle}
          variant="destructive"
        />
        <StatCard
          title="Open Follow-ups"
          value={stats.followupsOpen}
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

        <div className="space-y-3">
          {recentBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
                  {booking.customer.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{booking.customer}</p>
                  <p className="text-sm text-muted-foreground">{booking.service}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={booking.status} />
                <span className="text-sm text-muted-foreground">{booking.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
