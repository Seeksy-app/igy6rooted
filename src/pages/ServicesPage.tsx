import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrg } from "@/contexts/OrgContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Service {
  id: string;
  service_key: string;
  display_name: string;
  default_duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  active: boolean;
  jobber_service_type_id: string | null;
}

export default function ServicesPage() {
  const { currentOrg, userRole } = useOrg();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState({
    service_key: "",
    display_name: "",
    default_duration_minutes: 60,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    active: true,
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ["services", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("service_catalog")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("display_name");
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!currentOrg,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!currentOrg) throw new Error("No organization selected");

      if (editingService) {
        const { error } = await supabase
          .from("service_catalog")
          .update(data)
          .eq("id", editingService.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("service_catalog")
          .insert({ ...data, org_id: currentOrg.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingService ? "Service updated" : "Service created",
        description: `${formData.display_name} has been saved.`,
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_catalog")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Service deleted",
        description: "The service has been removed.",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      service_key: "",
      display_name: "",
      default_duration_minutes: 60,
      buffer_before_minutes: 0,
      buffer_after_minutes: 0,
      active: true,
    });
    setEditingService(null);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      service_key: service.service_key,
      display_name: service.display_name,
      default_duration_minutes: service.default_duration_minutes,
      buffer_before_minutes: service.buffer_before_minutes,
      buffer_after_minutes: service.buffer_after_minutes,
      active: service.active,
    });
    setIsDialogOpen(true);
  };

  const isAdmin = userRole === "admin";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="mt-1 text-muted-foreground">
            Configure the services your AI can schedule
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingService ? "Edit Service" : "Add Service"}</DialogTitle>
                <DialogDescription>
                  Configure a service that customers can book via the AI scheduler.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMutation.mutate(formData);
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="service_key">Service Key</Label>
                    <Input
                      id="service_key"
                      placeholder="lawn_mowing"
                      value={formData.service_key}
                      onChange={(e) =>
                        setFormData({ ...formData, service_key: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      placeholder="Lawn Mowing"
                      value={formData.display_name}
                      onChange={(e) =>
                        setFormData({ ...formData, display_name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={15}
                      step={15}
                      value={formData.default_duration_minutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          default_duration_minutes: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buffer_before">Buffer Before (min)</Label>
                    <Input
                      id="buffer_before"
                      type="number"
                      min={0}
                      step={5}
                      value={formData.buffer_before_minutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buffer_before_minutes: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buffer_after">Buffer After (min)</Label>
                    <Input
                      id="buffer_after"
                      type="number"
                      min={0}
                      step={5}
                      value={formData.buffer_after_minutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buffer_after_minutes: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, active: checked })
                    }
                  />
                  <Label htmlFor="active">Active</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingService ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="stat-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : services && services.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Buffers</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} className="table-row-hover">
                  <TableCell className="font-medium">
                    {service.display_name}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {service.service_key}
                  </TableCell>
                  <TableCell>{service.default_duration_minutes} min</TableCell>
                  <TableCell className="text-muted-foreground">
                    {service.buffer_before_minutes}m / {service.buffer_after_minutes}m
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        service.active
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {service.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(service)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(service.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No services configured yet.</p>
            {isAdmin && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add your first service
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
