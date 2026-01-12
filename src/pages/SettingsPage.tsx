import { useState } from "react";
import { Save, Loader2, Users, Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrg } from "@/contexts/OrgContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TeamMember {
  id: string;
  user_id: string;
  role: "admin" | "staff" | "viewer";
  created_at: string;
}

export default function SettingsPage() {
  const { currentOrg, userRole, refreshOrgs } = useOrg();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [orgName, setOrgName] = useState(currentOrg?.name || "");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "staff" | "viewer">("staff");

  const { data: teamMembers, isLoading: isLoadingTeam } = useQuery({
    queryKey: ["team-members", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("org_id", currentOrg.id);
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!currentOrg,
  });

  const updateOrgMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!currentOrg) throw new Error("No organization selected");
      const { error } = await supabase
        .from("orgs")
        .update({ name })
        .eq("id", currentOrg.id);
      if (error) throw error;
    },
    onSuccess: () => {
      refreshOrgs();
      toast({
        title: "Organization updated",
        description: "Your organization name has been changed.",
      });
    },
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
      toast({
        title: "Role updated",
        description: "Team member role has been changed.",
      });
    },
  });

  const isAdmin = userRole === "admin";

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your organization and team
        </p>
      </div>

      {/* Organization Settings */}
      <div className="stat-card">
        <div className="mb-6 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="section-header">Organization</h2>
        </div>

        <div className="max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              disabled={!isAdmin}
            />
          </div>

          {isAdmin && (
            <Button
              onClick={() => updateOrgMutation.mutate(orgName)}
              disabled={updateOrgMutation.isPending || orgName === currentOrg?.name}
            >
              {updateOrgMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Team Members */}
      <div className="stat-card">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="section-header">Team Members</h2>
          </div>
        </div>

        {isLoadingTeam ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {isAdmin && <TableHead className="w-32">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-mono text-sm">
                    {member.user_id.slice(0, 8)}...
                    {member.user_id === user?.id && (
                      <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-xs text-primary">
                        You
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        member.role === "admin"
                          ? "bg-primary/15 text-primary"
                          : member.role === "staff"
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {member.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {member.user_id !== user?.id && (
                        <Select
                          value={member.role}
                          onValueChange={(role) =>
                            updateRoleMutation.mutate({
                              memberId: member.id,
                              role,
                            })
                          }
                        >
                          <SelectTrigger className="h-8 w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Invite (placeholder - would need email invites) */}
        {isAdmin && (
          <div className="mt-6 rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <Shield className="mr-2 inline-block h-4 w-4" />
              Team invitations coming soon. Currently, users must sign up and be manually added.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
