import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Org {
  id: string;
  name: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  org_id: string;
  user_id: string;
  role: "admin" | "staff" | "viewer";
  created_at: string;
}

interface OrgContextType {
  currentOrg: Org | null;
  userRole: "admin" | "staff" | "viewer" | null;
  orgs: Org[];
  loading: boolean;
  setCurrentOrg: (org: Org) => void;
  createOrg: (name: string) => Promise<Org>;
  refreshOrgs: () => Promise<void>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentOrg, setCurrentOrg] = useState<Org | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "staff" | "viewer" | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOrgs = async () => {
    if (!user) {
      setOrgs([]);
      setCurrentOrg(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get user's team memberships
      const { data: memberships, error: memberError } = await supabase
        .from("team_members")
        .select("org_id, role")
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        setOrgs([]);
        setCurrentOrg(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      // Get org details
      const orgIds = memberships.map((m) => m.org_id);
      const { data: orgData, error: orgError } = await supabase
        .from("orgs")
        .select("*")
        .in("id", orgIds);

      if (orgError) throw orgError;

      setOrgs(orgData || []);

      // Set current org if not already set
      if (!currentOrg && orgData && orgData.length > 0) {
        setCurrentOrg(orgData[0]);
        const membership = memberships.find((m) => m.org_id === orgData[0].id);
        setUserRole(membership?.role as "admin" | "staff" | "viewer" || null);
      } else if (currentOrg) {
        const membership = memberships.find((m) => m.org_id === currentOrg.id);
        setUserRole(membership?.role as "admin" | "staff" | "viewer" || null);
      }
    } catch (error) {
      console.error("Error fetching orgs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOrgs();
  }, [user]);

  const handleSetCurrentOrg = (org: Org) => {
    setCurrentOrg(org);
    // Update role for new org
    supabase
      .from("team_members")
      .select("role")
      .eq("org_id", org.id)
      .eq("user_id", user?.id || "")
      .single()
      .then(({ data }) => {
        setUserRole(data?.role as "admin" | "staff" | "viewer" || null);
      });
  };

  const createOrg = async (name: string): Promise<Org> => {
    if (!user) throw new Error("Must be logged in to create an org");

    // Use the atomic function to create org and add admin in one transaction
    const { data: newOrgId, error: rpcError } = await supabase
      .rpc("create_org_with_admin", { org_name: name });

    if (rpcError) throw rpcError;

    // Fetch the newly created org
    const { data: org, error: fetchError } = await supabase
      .from("orgs")
      .select("*")
      .eq("id", newOrgId)
      .single();

    if (fetchError) throw fetchError;

    await refreshOrgs();
    setCurrentOrg(org);
    setUserRole("admin");

    return org;
  };

  return (
    <OrgContext.Provider
      value={{
        currentOrg,
        userRole,
        orgs,
        loading,
        setCurrentOrg: handleSetCurrentOrg,
        createOrg,
        refreshOrgs,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
}
