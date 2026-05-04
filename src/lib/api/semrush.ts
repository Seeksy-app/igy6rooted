import { supabase } from "@/integrations/supabase/client";

type SemrushResponse<T = Record<string, string>[]> = {
  success: boolean;
  error?: string;
  data?: T;
};

async function callSemrush<T = Record<string, string>[]>(
  action: string,
  params: Record<string, unknown>,
  orgId: string
): Promise<SemrushResponse<T>> {
  const { data, error } = await supabase.functions.invoke("semrush-api", {
    body: { action, params, org_id: orgId },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return data as SemrushResponse<T>;
}

export const semrushApi = {
  /** Get domain ranking overview */
  domainOverview(orgId: string, domain: string, database = "us") {
    return callSemrush("domain_overview", { domain, database }, orgId);
  },

  /** Get organic keywords for a domain */
  domainOrganic(orgId: string, domain: string, database = "us", limit = 20) {
    return callSemrush("domain_organic", { domain, database, limit }, orgId);
  },

  /** Get keyword overview (volume, CPC, competition) */
  keywordOverview(orgId: string, keyword: string, database = "us") {
    return callSemrush("keyword_overview", { keyword, database }, orgId);
  },

  /** Get related keywords */
  relatedKeywords(orgId: string, keyword: string, database = "us", limit = 20) {
    return callSemrush("related_keywords", { keyword, database, limit }, orgId);
  },

  /** Get keyword difficulty score */
  keywordDifficulty(orgId: string, keyword: string, database = "us") {
    return callSemrush("keyword_difficulty", { keyword, database }, orgId);
  },

  /** Compare domains head-to-head */
  domainVsDomain(orgId: string, domains: string[], database = "us", limit = 20) {
    return callSemrush("domain_vs_domain", { domains, database, limit }, orgId);
  },
};
