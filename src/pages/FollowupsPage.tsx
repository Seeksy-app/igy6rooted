import { useState } from "react";
import { Plus, User, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { format } from "date-fns";

interface Followup {
  id: string;
  booking_request_id: string | null;
  priority: "low" | "normal" | "high";
  status: "open" | "in_progress" | "done";
  assigned_user_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const PRIORITY_COLORS = {
  low: "badge-priority-low",
  normal: "badge-priority-normal",
  high: "badge-priority-high",
};

export default function FollowupsPage() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNotes, setNewNotes] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "normal" | "high">("normal");

  const { data: followups, isLoading } = useQuery({
    queryKey: ["followups", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("followups")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Followup[];
    },
    enabled: !!currentOrg,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrg) throw new Error("No organization selected");
      const { error } = await supabase.from("followups").insert({
        org_id: currentOrg.id,
        priority: newPriority,
        notes: newNotes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      setIsDialogOpen(false);
      setNewNotes("");
      setNewPriority("normal");
      toast({
        title: "Follow-up created",
        description: "The follow-up has been added to the queue.",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "open" | "in_progress" | "done";
    }) => {
      const { error } = await supabase
        .from("followups")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
    },
  });

  const openFollowups = followups?.filter((f) => f.status === "open") || [];
  const inProgressFollowups = followups?.filter((f) => f.status === "in_progress") || [];
  const doneFollowups = followups?.filter((f) => f.status === "done") || [];

  const KanbanColumn = ({
    title,
    status,
    items,
    color,
  }: {
    title: string;
    status: "open" | "in_progress" | "done";
    items: Followup[];
    color: string;
  }) => (
    <div className="kanban-column">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${color}`} />
          <h3 className="font-semibold">{title}</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {items.length}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {items.map((followup) => (
          <div
            key={followup.id}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  PRIORITY_COLORS[followup.priority]
                }`}
              >
                {followup.priority}
              </span>
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="text-sm line-clamp-3">
              {followup.notes || "No notes"}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {format(new Date(followup.created_at), "MMM d")}
              </span>

              <Select
                value={followup.status}
                onValueChange={(value: "open" | "in_progress" | "done") =>
                  updateStatusMutation.mutate({ id: followup.id, status: value })
                }
              >
                <SelectTrigger className="h-7 w-auto text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No items
          </p>
        )}
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
          <p className="mt-1 text-muted-foreground">
            Manage manual follow-ups for failed or incomplete bookings
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Follow-up</DialogTitle>
              <DialogDescription>
                Add a new follow-up task for manual handling.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newPriority} onValueChange={(v: any) => setNewPriority(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Describe what needs to be done..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-6 lg:grid-cols-3">
        <KanbanColumn
          title="Open"
          status="open"
          items={openFollowups}
          color="bg-warning"
        />
        <KanbanColumn
          title="In Progress"
          status="in_progress"
          items={inProgressFollowups}
          color="bg-primary"
        />
        <KanbanColumn
          title="Done"
          status="done"
          items={doneFollowups}
          color="bg-success"
        />
      </div>
    </div>
  );
}
