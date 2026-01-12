-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create integration_jobber_accounts table for OAuth token storage
CREATE TABLE public.integration_jobber_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  jobber_account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  status TEXT NOT NULL DEFAULT 'connected',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ai_appointment_rules table
CREATE TABLE public.ai_appointment_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  default_duration_minutes INTEGER NOT NULL DEFAULT 120,
  travel_buffer_minutes INTEGER NOT NULL DEFAULT 30,
  min_lead_time_minutes INTEGER NOT NULL DEFAULT 180,
  max_days_out INTEGER NOT NULL DEFAULT 21,
  business_hours JSONB NOT NULL DEFAULT '{"mon": [["09:00", "17:00"]], "tue": [["09:00", "17:00"]], "wed": [["09:00", "17:00"]], "thu": [["09:00", "17:00"]], "fri": [["09:00", "17:00"]], "sat": [], "sun": []}'::jsonb,
  service_type_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id)
);

-- Create ai_tool_call_logs table
CREATE TABLE public.ai_tool_call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  conversation_id TEXT,
  tool_name TEXT NOT NULL,
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ai_bookings table
CREATE TABLE public.ai_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  conversation_id TEXT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_type TEXT NOT NULL,
  address TEXT NOT NULL,
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  jobber_client_id TEXT,
  jobber_request_id TEXT,
  jobber_job_id TEXT,
  jobber_visit_id TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_integration_jobber_accounts_org_id ON public.integration_jobber_accounts(org_id);
CREATE INDEX idx_integration_jobber_accounts_jobber_account_id ON public.integration_jobber_accounts(jobber_account_id);
CREATE INDEX idx_ai_appointment_rules_org_id ON public.ai_appointment_rules(org_id);
CREATE INDEX idx_ai_tool_call_logs_org_id ON public.ai_tool_call_logs(org_id);
CREATE INDEX idx_ai_tool_call_logs_conversation_id ON public.ai_tool_call_logs(conversation_id);
CREATE INDEX idx_ai_bookings_org_id ON public.ai_bookings(org_id);
CREATE INDEX idx_ai_bookings_conversation_id ON public.ai_bookings(conversation_id);

-- Enable RLS on all tables
ALTER TABLE public.integration_jobber_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_appointment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tool_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_bookings ENABLE ROW LEVEL SECURITY;

-- RLS for integration_jobber_accounts
CREATE POLICY "jobber_accounts_read" ON public.integration_jobber_accounts
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "jobber_accounts_insert" ON public.integration_jobber_accounts
  FOR INSERT WITH CHECK (is_org_admin(org_id));

CREATE POLICY "jobber_accounts_update" ON public.integration_jobber_accounts
  FOR UPDATE USING (is_org_admin(org_id));

CREATE POLICY "jobber_accounts_delete" ON public.integration_jobber_accounts
  FOR DELETE USING (is_org_admin(org_id));

-- RLS for ai_appointment_rules
CREATE POLICY "appointment_rules_read" ON public.ai_appointment_rules
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "appointment_rules_insert" ON public.ai_appointment_rules
  FOR INSERT WITH CHECK (is_org_admin(org_id));

CREATE POLICY "appointment_rules_update" ON public.ai_appointment_rules
  FOR UPDATE USING (is_org_admin(org_id));

CREATE POLICY "appointment_rules_delete" ON public.ai_appointment_rules
  FOR DELETE USING (is_org_admin(org_id));

-- RLS for ai_tool_call_logs
CREATE POLICY "tool_call_logs_read" ON public.ai_tool_call_logs
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "tool_call_logs_insert" ON public.ai_tool_call_logs
  FOR INSERT WITH CHECK (is_org_admin(org_id));

-- RLS for ai_bookings
CREATE POLICY "ai_bookings_read" ON public.ai_bookings
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "ai_bookings_insert" ON public.ai_bookings
  FOR INSERT WITH CHECK (is_org_admin(org_id));

CREATE POLICY "ai_bookings_update" ON public.ai_bookings
  FOR UPDATE USING (is_org_admin(org_id));

CREATE POLICY "ai_bookings_delete" ON public.ai_bookings
  FOR DELETE USING (is_org_admin(org_id));

-- Create updated_at triggers
CREATE TRIGGER update_integration_jobber_accounts_updated_at
  BEFORE UPDATE ON public.integration_jobber_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_appointment_rules_updated_at
  BEFORE UPDATE ON public.ai_appointment_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_bookings_updated_at
  BEFORE UPDATE ON public.ai_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();