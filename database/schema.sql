-- IGY6 Rooted Production Database Schema
-- PostgreSQL 14+
-- Generated from Lovable Cloud schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE TABLES
-- ============================================

-- Organizations table
CREATE TABLE IF NOT EXISTS orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- ============================================
-- AI AGENT TABLES
-- ============================================

-- AI Agent Content configuration
CREATE TABLE IF NOT EXISTS ai_agent_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT NOT NULL DEFAULT '',
  business_phone TEXT,
  service_area TEXT,
  business_hours_text TEXT,
  emergency_policy TEXT,
  services_summary TEXT,
  pricing_guidance TEXT,
  scheduling_lead_time TEXT,
  scheduling_blackout_dates TEXT,
  scheduling_job_duration_defaults TEXT,
  scheduling_required_fields TEXT,
  scheduling_intake_questions TEXT,
  escalation_transfer_rules TEXT,
  escalation_voicemail_behavior TEXT,
  escalation_callback_promise TEXT,
  agent_system_prompt TEXT,
  greeting_script TEXT,
  closing_script TEXT,
  intake_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_published_at TIMESTAMPTZ,
  published_version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Appointment Rules
CREATE TABLE IF NOT EXISTS ai_appointment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  default_duration_minutes INTEGER NOT NULL DEFAULT 120,
  travel_buffer_minutes INTEGER NOT NULL DEFAULT 30,
  min_lead_time_minutes INTEGER NOT NULL DEFAULT 180,
  max_days_out INTEGER NOT NULL DEFAULT 21,
  business_hours JSONB NOT NULL DEFAULT '{
    "mon": [["09:00", "17:00"]],
    "tue": [["09:00", "17:00"]],
    "wed": [["09:00", "17:00"]],
    "thu": [["09:00", "17:00"]],
    "fri": [["09:00", "17:00"]],
    "sat": [],
    "sun": []
  }'::jsonb,
  service_type_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Bookings
CREATE TABLE IF NOT EXISTS ai_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  conversation_id TEXT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_type TEXT NOT NULL,
  address TEXT NOT NULL,
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  notes TEXT,
  jobber_client_id TEXT,
  jobber_request_id TEXT,
  jobber_job_id TEXT,
  jobber_visit_id TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Activity Events
CREATE TABLE IF NOT EXISTS ai_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_source TEXT NOT NULL,
  description TEXT NOT NULL,
  outcome TEXT NOT NULL,
  conversation_id TEXT,
  booking_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Tool Call Logs
CREATE TABLE IF NOT EXISTS ai_tool_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  conversation_id TEXT,
  tool_name TEXT NOT NULL,
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- BOOKING & SCHEDULING TABLES
-- ============================================

-- Booking Requests
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'voice',
  caller_phone TEXT,
  customer_name TEXT,
  customer_email TEXT,
  service_key TEXT,
  address TEXT,
  zip TEXT,
  preferred_windows JSONB,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  jobber_client_id TEXT,
  jobber_visit_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  last_error TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Booking Events
CREATE TABLE IF NOT EXISTS booking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  booking_request_id UUID NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Followups
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  booking_request_id UUID REFERENCES booking_requests(id),
  assigned_user_id UUID,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Availability Rules
CREATE TABLE IF NOT EXISTS availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  business_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  blackout_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
  allowed_zip_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service Catalog
CREATE TABLE IF NOT EXISTS service_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  service_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  default_duration_minutes INTEGER NOT NULL DEFAULT 60,
  buffer_before_minutes INTEGER NOT NULL DEFAULT 0,
  buffer_after_minutes INTEGER NOT NULL DEFAULT 0,
  jobber_service_type_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, service_key)
);

-- ============================================
-- INTEGRATION TABLES
-- ============================================

-- Jobber Connections
CREATE TABLE IF NOT EXISTS jobber_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
  jobber_account_id TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  connected_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Integration Jobber Accounts (OAuth tokens)
CREATE TABLE IF NOT EXISTS integration_jobber_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE UNIQUE,
  jobber_account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  status TEXT NOT NULL DEFAULT 'disconnected',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Integration Ad Accounts (Google/Meta Ads)
CREATE TABLE IF NOT EXISTS integration_ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  account_id TEXT,
  account_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  status TEXT NOT NULL DEFAULT 'disconnected',
  connected_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, provider)
);

-- ============================================
-- MARKETING TABLES
-- ============================================

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'awareness',
  external_id TEXT,
  budget NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketing Leads
CREATE TABLE IF NOT EXISTS marketing_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  campaign_id UUID REFERENCES marketing_campaigns(id),
  channel TEXT NOT NULL,
  source TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  zip_code TEXT,
  lead_score INTEGER,
  status TEXT NOT NULL DEFAULT 'new',
  conversion_value NUMERIC,
  converted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketing Metrics
CREATE TABLE IF NOT EXISTS marketing_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  campaign_id UUID REFERENCES marketing_campaigns(id),
  channel TEXT NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  leads INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  spend NUMERIC NOT NULL DEFAULT 0,
  revenue NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GTM Market Zones
CREATE TABLE IF NOT EXISTS gtm_market_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  zip_codes TEXT[] NOT NULL DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 1,
  lead_score_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  target_monthly_leads INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meta Ad Campaigns (checklist)
CREATE TABLE IF NOT EXISTS meta_ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ad_type TEXT NOT NULL,
  checked_items JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FAQ Knowledge Base
CREATE TABLE IF NOT EXISTS faq_kb (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Competitor Analyses
CREATE TABLE IF NOT EXISTS competitor_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  competitor_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  scraped_content TEXT,
  extracted_services JSONB,
  extracted_pricing TEXT,
  extracted_unique_selling_points JSONB,
  last_scraped_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_team_members_org_id ON team_members(org_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_bookings_org_id ON ai_bookings(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_bookings_status ON ai_bookings(status);
CREATE INDEX IF NOT EXISTS idx_ai_activity_events_org_id ON ai_activity_events(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_activity_events_created_at ON ai_activity_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_tool_call_logs_org_id ON ai_tool_call_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_org_id ON booking_requests(org_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_events_booking_id ON booking_events(booking_request_id);
CREATE INDEX IF NOT EXISTS idx_followups_org_id ON followups(org_id);
CREATE INDEX IF NOT EXISTS idx_followups_status ON followups(status);
CREATE INDEX IF NOT EXISTS idx_marketing_metrics_org_date ON marketing_metrics(org_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_integration_ad_accounts_org_provider ON integration_ad_accounts(org_id, provider);
