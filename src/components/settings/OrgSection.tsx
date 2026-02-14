import { useState } from "react";
import { Save, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrg } from "@/contexts/OrgContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";

export function OrgSection() {
  const { currentOrg, userRole, refreshOrgs } = useOrg();
  const { toast } = useToast();
  const [orgName, setOrgName] = useState(currentOrg?.name || "");
  const isAdmin = userRole === "admin";

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
      toast({ title: "Organization updated", description: "Your organization name has been changed." });
    },
  });

  return (
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
            {updateOrgMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
}
