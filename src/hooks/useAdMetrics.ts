import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdMetrics {
  impressions: number;
  clicks: number;
  spend?: number;
  cost?: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm?: number;
  reach?: number;
  conversion_rate: number;
}

export interface Campaign {
  id?: string;
  name: string;
  status: string;
  objective?: string;
  impressions: number;
  clicks: number;
  spend?: number;
  cost?: number;
  conversions: number;
  ctr: number;
  cpc: number;
  reach?: number;
}

export interface AdAccountData {
  connected: boolean;
  account_name?: string;
  metrics: AdMetrics;
  campaigns: Campaign[];
  date_range?: {
    start: string;
    end: string;
  };
  message?: string;
  error?: string;
}

export function useAdMetrics(orgId: string | undefined, dateRangeDays: number = 30) {
  const [googleData, setGoogleData] = useState<AdAccountData | null>(null);
  const [metaData, setMetaData] = useState<AdAccountData | null>(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  const fetchGoogleMetrics = useCallback(async () => {
    if (!orgId) return;
    
    setIsLoadingGoogle(true);
    setGoogleError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("google-ads-metrics", {
        body: { org_id: orgId, date_range: { days: dateRangeDays } },
      });

      if (error) {
        console.error("Error fetching Google metrics:", error);
        setGoogleError(error.message);
        setGoogleData({ connected: false, metrics: getEmptyMetrics(), campaigns: [] });
        return;
      }

      setGoogleData(data);
    } catch (err) {
      console.error("Failed to fetch Google metrics:", err);
      setGoogleError(err instanceof Error ? err.message : "Failed to fetch Google Ads data");
      setGoogleData({ connected: false, metrics: getEmptyMetrics(), campaigns: [] });
    } finally {
      setIsLoadingGoogle(false);
    }
  }, [orgId, dateRangeDays]);

  const fetchMetaMetrics = useCallback(async () => {
    if (!orgId) return;
    
    setIsLoadingMeta(true);
    setMetaError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("meta-ads-metrics", {
        body: { org_id: orgId, date_range: { days: dateRangeDays } },
      });

      if (error) {
        console.error("Error fetching Meta metrics:", error);
        setMetaError(error.message);
        setMetaData({ connected: false, metrics: getEmptyMetrics(), campaigns: [] });
        return;
      }

      setMetaData(data);
    } catch (err) {
      console.error("Failed to fetch Meta metrics:", err);
      setMetaError(err instanceof Error ? err.message : "Failed to fetch Meta Ads data");
      setMetaData({ connected: false, metrics: getEmptyMetrics(), campaigns: [] });
    } finally {
      setIsLoadingMeta(false);
    }
  }, [orgId, dateRangeDays]);

  const refetch = useCallback(() => {
    fetchGoogleMetrics();
    fetchMetaMetrics();
  }, [fetchGoogleMetrics, fetchMetaMetrics]);

  useEffect(() => {
    if (orgId) {
      fetchGoogleMetrics();
      fetchMetaMetrics();
    }
  }, [orgId, fetchGoogleMetrics, fetchMetaMetrics]);

  // Combined metrics
  const combinedMetrics: AdMetrics = {
    impressions: (googleData?.metrics?.impressions || 0) + (metaData?.metrics?.impressions || 0),
    clicks: (googleData?.metrics?.clicks || 0) + (metaData?.metrics?.clicks || 0),
    spend: (googleData?.metrics?.cost || googleData?.metrics?.spend || 0) + (metaData?.metrics?.spend || 0),
    conversions: (googleData?.metrics?.conversions || 0) + (metaData?.metrics?.conversions || 0),
    reach: metaData?.metrics?.reach || 0,
    ctr: 0,
    cpc: 0,
    cpm: 0,
    conversion_rate: 0,
  };

  // Calculate combined rates
  if (combinedMetrics.impressions > 0) {
    combinedMetrics.ctr = (combinedMetrics.clicks / combinedMetrics.impressions) * 100;
    combinedMetrics.cpm = ((combinedMetrics.spend || 0) / combinedMetrics.impressions) * 1000;
  }
  if (combinedMetrics.clicks > 0) {
    combinedMetrics.cpc = (combinedMetrics.spend || 0) / combinedMetrics.clicks;
    combinedMetrics.conversion_rate = (combinedMetrics.conversions / combinedMetrics.clicks) * 100;
  }

  return {
    googleData,
    metaData,
    combinedMetrics,
    isLoadingGoogle,
    isLoadingMeta,
    isLoading: isLoadingGoogle || isLoadingMeta,
    googleError,
    metaError,
    refetch,
  };
}

function getEmptyMetrics(): AdMetrics {
  return {
    impressions: 0,
    clicks: 0,
    spend: 0,
    cost: 0,
    conversions: 0,
    ctr: 0,
    cpc: 0,
    cpm: 0,
    reach: 0,
    conversion_rate: 0,
  };
}
