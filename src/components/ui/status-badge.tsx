import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "connected" | "pending" | "error" | "disconnected" | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; class: string }> = {
    connected: { label: "Connected", class: "status-connected" },
    pending: { label: "Pending", class: "status-pending" },
    error: { label: "Error", class: "status-error" },
    disconnected: { label: "Disconnected", class: "status-disconnected" },
    // Booking statuses
    new: { label: "New", class: "bg-primary/15 text-primary border-primary/30" },
    searching: { label: "Searching", class: "status-pending" },
    offered: { label: "Offered", class: "bg-accent/15 text-accent border-accent/30" },
    selected: { label: "Selected", class: "bg-primary/15 text-primary border-primary/30" },
    booked: { label: "Booked", class: "status-connected" },
    failed: { label: "Failed", class: "status-error" },
    needs_followup: { label: "Needs Follow-up", class: "status-pending" },
    // Followup statuses
    open: { label: "Open", class: "status-pending" },
    in_progress: { label: "In Progress", class: "bg-primary/15 text-primary border-primary/30" },
    done: { label: "Done", class: "status-connected" },
  };

  const config = statusConfig[status] || { label: status, class: "status-disconnected" };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.class,
        className
      )}
    >
      {config.label}
    </span>
  );
}
