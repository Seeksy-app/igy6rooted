import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/contexts/OrgContext";

export interface JobberClient {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  phones: { number: string; description: string }[];
  emails: { address: string; description: string }[];
  billingAddress: {
    street1: string;
    street2: string;
    city: string;
    province: string;
    postalCode: string;
  } | null;
  companyName: string | null;
  createdAt: string;
  updatedAt: string;
  isLead: boolean;
  isArchived: boolean;
  tags: { nodes: { label: string }[] };
}

export interface JobberRequest {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  client: { id: string; name: string } | null;
}

export interface JobberJob {
  id: string;
  title: string;
  jobNumber: number;
  jobStatus: string;
  total: string;
  createdAt: string;
  startAt: string | null;
  endAt: string | null;
  client: { id: string; name: string } | null;
  visits: { nodes: { id: string; title: string; startAt: string; endAt: string; status: string }[] };
}

export interface JobberLeadsSummary {
  totalClients: number;
  activeLeads: number;
  totalRequests: number;
  openRequests: number;
  totalJobs: number;
  activeJobs: number;
  totalRevenue: number;
}

export interface JobberLeadsData {
  clients: JobberClient[];
  requests: JobberRequest[];
  jobs: JobberJob[];
  summary: JobberLeadsSummary;
}

export function useJobberLeads(limit = 50) {
  const { currentOrg } = useOrg();

  return useQuery<JobberLeadsData | null>({
    queryKey: ["jobber-leads", currentOrg?.id, limit],
    queryFn: async () => {
      if (!currentOrg) return null;

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) return null;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/jobber-api/leads?org_id=${currentOrg.id}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (response.status === 503) return null; // Jobber not connected
        throw new Error(err.error || "Failed to fetch leads");
      }

      return response.json();
    },
    enabled: !!currentOrg,
    staleTime: 5 * 60 * 1000, // 5 min cache
    retry: 1,
  });
}
