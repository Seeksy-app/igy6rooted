import { useState, useEffect } from "react";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  ExternalLink,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ArrowRight,
  Loader2
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface Booking {
  id: string;
  customer_name: string;
  phone: string;
  service_type: string;
  address: string;
  slot_start: string;
  slot_end: string;
  status: string;
  jobber_job_id: string | null;
  created_at: string;
}

export default function AIBookingAssistantPage() {
  const { currentOrg } = useOrg();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (currentOrg) {
      fetchBookings();
    }
  }, [currentOrg]);

  const fetchBookings = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_bookings")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics from bookings
  const metrics = {
    total: bookings.length,
    successful: bookings.filter(b => b.status === "booked" || b.status === "confirmed").length,
    pending: bookings.filter(b => b.status === "pending" || b.status === "needs_followup").length,
    failed: bookings.filter(b => b.status === "failed" || b.status === "cancelled").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "booked":
      case "confirmed":
        return <Badge className="bg-success/15 text-success border-success/30">Booked via Jobber</Badge>;
      case "pending":
        return <Badge className="bg-warning/15 text-warning border-warning/30">Pending</Badge>;
      case "needs_followup":
        return <Badge className="bg-warning/15 text-warning border-warning/30">Needs Follow-up</Badge>;
      case "failed":
      case "cancelled":
        return <Badge className="bg-destructive/15 text-destructive border-destructive/30">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredBookings = bookings.filter(b =>
    b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.phone.includes(searchTerm) ||
    b.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-success/15">
              <Calendar className="h-6 w-6 text-success" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Booking Assistant</h1>
          </div>
          <p className="text-muted-foreground">
            AI-assisted appointments • Availability fetched & bookings executed via Jobber API
          </p>
        </div>
        <Button onClick={fetchBookings} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Important Notice */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/15">
              <ExternalLink className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Jobber is the Source of Truth</h3>
              <p className="text-sm text-muted-foreground">
                This assistant fetches availability from Jobber and executes bookings via the Jobber API. 
                All appointments, jobs, and schedules are managed in Jobber. This view shows AI-assisted booking activity only.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Booking Intents"
          value={metrics.total}
          subtitle="AI-assisted"
          icon={Calendar}
        />
        <StatCard
          title="Successfully Booked"
          value={metrics.successful}
          subtitle="via Jobber API"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Pending / Follow-up"
          value={metrics.pending}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Failed"
          value={metrics.failed}
          icon={XCircle}
          variant="destructive"
        />
      </div>

      {/* Booking Activity Table */}
      <Card className="stat-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="section-header">AI Booking Activity</CardTitle>
            <CardDescription>Appointments assisted by AI • Synced via Jobber API</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No AI-assisted bookings yet</p>
              <p className="text-sm">Bookings will appear here when AI assists customers</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Appointment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Jobber</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{booking.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.service_type}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{format(new Date(booking.slot_start), "MMM d, yyyy")}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(booking.slot_start), "h:mm a")} - {format(new Date(booking.slot_end), "h:mm a")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        {booking.jobber_job_id ? (
                          <a 
                            href={`https://app.getjobber.com/jobs/${booking.jobber_job_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 text-sm"
                          >
                            View in Jobber
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {format(new Date(booking.created_at), "MMM d, h:mm a")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Follow-ups */}
      {metrics.pending > 0 && (
        <Card className="stat-card border-warning/30">
          <CardHeader>
            <CardTitle className="section-header flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Pending Follow-ups
            </CardTitle>
            <CardDescription>Bookings that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link to="/followups">
                View All Follow-ups
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
