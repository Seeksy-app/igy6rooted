import { supabase } from "@/integrations/supabase/client";

type SemrushResponse<T = Record<string, string>[]> = {
  success: boolean;
  error?: string;
  data?: T;
};

async function callSemrush<T = Record<string, string>[]>(
  action: string,
  params: Record<string, unknown>
): Promise<SemrushResponse<T>> {
  const { data, error } = await supabase.functions.invoke("semrush-api", {
    body: { action, params },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return data as SemrushResponse<T>;
}

export const semrushApi = {
  /** Get domain ranking overview */
  domainOverview(domain: string, database = "us") {
    return callSemrush("domain_overview", { domain, database });
  },

  /** Get organic keywords for a domain */
  domainOrganic(domain: string, database = "us", limit = 20) {
    return callSemrush("domain_organic", { domain, database, limit });
  },

  /** Get keyword overview (volume, CPC, competition) */
  keywordOverview(keyword: string, database = "us") {
    return callSemrush("keyword_overview", { keyword, database });
  },

  /** Get related keywords */
  relatedKeywords(keyword: string, database = "us", limit = 20) {
    return callSemrush("related_keywords", { keyword, database, limit });
  },

  /** Get keyword difficulty score */
  keywordDifficulty(keyword: string, database = "us") {
    return callSemrush("keyword_difficulty", { keyword, database });
  },

  /** Compare domains head-to-head */
  domainVsDomain(domains: string[], database = "us", limit = 20) {
    return callSemrush("domain_vs_domain", { domains, database, limit });
  },
};
