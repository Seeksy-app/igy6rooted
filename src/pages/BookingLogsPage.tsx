import { useState } from "react";
import { Search, Filter, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface BookingRequest {
  id: string;
  channel: string;
  caller_phone: string | null;
  customer_name: string | null;
  customer_email: string | null;
  service_key: string | null;
  address: string | null;
  zip: string | null;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  last_error: string | null;
  raw_payload: any;
  created_at: string;
}

interface BookingEvent {
  id: string;
  event_type: string;
  event_payload: any;
  created_at: string;
}

export default function BookingLogsPage() {
  const { currentOrg } = useOrg();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["booking-logs", currentOrg?.id, statusFilter],
    queryFn: async () => {
      if (!currentOrg) return [];

      let query = supabase
        .from("booking_requests")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BookingRequest[];
    },
    enabled: !!currentOrg,
  });

  const { data: events } = useQuery({
    queryKey: ["booking-events", expandedRow],
    queryFn: async () => {
      if (!expandedRow) return [];
      const { data, error } = await supabase
        .from("booking_events")
        .select("*")
        .eq("booking_request_id", expandedRow)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as BookingEvent[];
    },
    enabled: !!expandedRow,
  });

  const filteredBookings = bookings?.filter((booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.customer_name?.toLowerCase().includes(query) ||
      booking.caller_phone?.includes(query) ||
      booking.service_key?.toLowerCase().includes(query) ||
      booking.zip?.includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Logs</h1>
        <p className="mt-1 text-muted-foreground">
          View all booking attempts and their outcomes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, service, or ZIP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="searching">Searching</SelectItem>
            <SelectItem value="offered">Offered</SelectItem>
            <SelectItem value="selected">Selected</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="needs_followup">Needs Follow-up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="stat-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredBookings && filteredBookings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <>
                  <TableRow
                    key={booking.id}
                    className="table-row-hover cursor-pointer"
                    onClick={() =>
                      setExpandedRow(expandedRow === booking.id ? null : booking.id)
                    }
                  >
                    <TableCell>
                      {expandedRow === booking.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {booking.customer_name || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.caller_phone || booking.customer_email || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{booking.service_key || "-"}</TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {booking.zip || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell>
                      {booking.scheduled_start
                        ? format(new Date(booking.scheduled_start), "MMM d, h:mm a")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(booking.created_at), "MMM d, h:mm a")}
                    </TableCell>
                  </TableRow>

                  {expandedRow === booking.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30 p-0">
                        <div className="p-4 space-y-4">
                          {/* Events Timeline */}
                          <div>
                            <h4 className="font-medium mb-3">Event Timeline</h4>
                            {events && events.length > 0 ? (
                              <div className="space-y-2">
                                {events.map((event) => (
                                  <div
                                    key={event.id}
                                    className="flex items-start gap-3 text-sm"
                                  >
                                    <div className="h-2 w-2 mt-1.5 rounded-full bg-primary" />
                                    <div className="flex-1">
                                      <p className="font-medium">{event.event_type}</p>
                                      <p className="text-muted-foreground">
                                        {format(
                                          new Date(event.created_at),
                                          "MMM d, h:mm:ss a"
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No events recorded
                              </p>
                            )}
                          </div>

                          {/* Error Info */}
                          {booking.last_error && (
                            <div>
                              <h4 className="font-medium mb-2 text-destructive">
                                Last Error
                              </h4>
                              <p className="text-sm text-destructive/80">
                                {booking.last_error}
                              </p>
                            </div>
                          )}

                          {/* Raw Payload */}
                          {booking.raw_payload && (
                            <div>
                              <h4 className="font-medium mb-2">Raw Payload</h4>
                              <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
                                {JSON.stringify(booking.raw_payload, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No booking records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
