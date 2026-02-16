import { useState } from "react";
import { Users, Loader2, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { useOrg } from "@/contexts/OrgContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TeamMemberRow {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  email?: string;
}

export function TeamSection() {
  const { currentOrg, userRole } = useOrg();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("sales");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const isAdmin = userRole === "admin";

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["team-members", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("org_id", currentOrg.id);
      if (error) throw error;

      // Fetch profiles for all team members
      const userIds = data.map((m: any) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
      );

      return data.map((m: any) => ({
        ...m,
        profile: profileMap.get(m.user_id) || null,
      })) as TeamMemberRow[];
    },
    enabled: !!currentOrg,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const { error } = await supabase
        .from("team_members")
        .update({ role })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Role updated", description: "Team member role has been changed." });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Member removed", description: "Team member has been removed." });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      setAddingMember(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/team-add-member`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ org_id: currentOrg?.id, email, role }),
        }
      );

      const result = await resp.json();
      if (!resp.ok) {
        throw new Error(result.message || result.error || "Failed to add member");
      }
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Member added", description: `${data.email} has been added as ${data.role}.` });
      setInviteOpen(false);
      setInviteEmail("");
      setAddingMember(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setAddingMember(false);
    },
  });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin": return "bg-primary/15 text-primary";
      case "sales": return "bg-orange-500/15 text-orange-600";
      case "agent": return "bg-accent/15 text-accent";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="stat-card">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="section-header">Team Members</h2>
        </div>
        {isAdmin && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    placeholder="member@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    <strong>Admin</strong> — Full access to all settings and data.{" "}
                    <strong>Sales</strong> — Field reps for canvassing and door-knocking.{" "}
                    <strong>Agent</strong> — Can view data and manage assigned tasks.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={() => addMemberMutation.mutate({ email: inviteEmail, role: inviteRole })}
                  disabled={!inviteEmail || addingMember}
                >
                  {addingMember ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Member"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {isAdmin && <TableHead className="w-40">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers?.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-medium">
                      {member.profile?.display_name?.[0]?.toUpperCase() || member.user_id.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {member.profile?.display_name || "Unnamed"}
                        {member.user_id === user?.id && (
                          <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-xs text-primary">You</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {member.user_id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getRoleBadgeClass(member.role)}`}>
                    {member.role}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(member.created_at).toLocaleDateString()}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {member.user_id !== user?.id && (
                        <>
                          <Select
                            value={member.role}
                            onValueChange={(role) =>
                              updateRoleMutation.mutate({ memberId: member.id, role })
                            }
                          >
                            <SelectTrigger className="h-8 w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="sales">Sales</SelectItem>
                              <SelectItem value="agent">Agent</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeMemberMutation.mutate(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
