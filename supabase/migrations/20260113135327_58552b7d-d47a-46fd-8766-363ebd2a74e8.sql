-- Create ai_agent_content table for owner-editable voice agent content
CREATE TABLE public.ai_agent_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  
  -- Business Info
  business_name TEXT NOT NULL DEFAULT '',
  business_phone TEXT DEFAULT '',
  service_area TEXT DEFAULT '',
  business_hours_text TEXT DEFAULT '',
  emergency_policy TEXT DEFAULT '',
  
  -- Services
  services_summary TEXT DEFAULT '',
  
  -- Pricing
  pricing_guidance TEXT DEFAULT '',
  
  -- Scheduling Rules
  scheduling_lead_time TEXT DEFAULT '',
  scheduling_blackout_dates TEXT DEFAULT '',
  scheduling_job_duration_defaults TEXT DEFAULT '',
  scheduling_required_fields TEXT DEFAULT '',
  scheduling_intake_questions TEXT DEFAULT '',
  
  -- Escalation Rules
  escalation_transfer_rules TEXT DEFAULT '',
  escalation_voicemail_behavior TEXT DEFAULT '',
  escalation_callback_promise TEXT DEFAULT '',
  
  -- Agent Scripts
  agent_system_prompt TEXT DEFAULT '',
  greeting_script TEXT DEFAULT '',
  closing_script TEXT DEFAULT '',
  
  -- Required Intake Questions (JSON array)
  intake_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Publish status
  last_published_at TIMESTAMP WITH TIME ZONE,
  published_version INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(org_id)
);

-- Create ai_activity_events table for real-time event logging
CREATE TABLE public.ai_activity_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL, -- 'call', 'chat', 'booking', 'escalation', 'qualification'
  event_source TEXT NOT NULL, -- 'voice_ai', 'chat_ai', 'booking_assistant'
  description TEXT NOT NULL,
  outcome TEXT NOT NULL, -- 'success', 'qualified', 'resolved', 'escalated', 'failed'
  
  -- Optional references
  conversation_id TEXT,
  booking_id UUID,
  
  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_ai_activity_events_org_created ON public.ai_activity_events(org_id, created_at DESC);
CREATE INDEX idx_ai_activity_events_type ON public.ai_activity_events(event_type);

-- Enable RLS
ALTER TABLE public.ai_agent_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_activity_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_agent_content
CREATE POLICY "ai_agent_content_read" 
ON public.ai_agent_content 
FOR SELECT 
USING (is_org_member(org_id));

CREATE POLICY "ai_agent_content_insert" 
ON public.ai_agent_content 
FOR INSERT 
WITH CHECK (is_org_admin(org_id));

CREATE POLICY "ai_agent_content_update" 
ON public.ai_agent_content 
FOR UPDATE 
USING (is_org_admin(org_id));

CREATE POLICY "ai_agent_content_delete" 
ON public.ai_agent_content 
FOR DELETE 
USING (is_org_admin(org_id));

-- RLS policies for ai_activity_events
CREATE POLICY "ai_activity_events_read" 
ON public.ai_activity_events 
FOR SELECT 
USING (is_org_member(org_id));

CREATE POLICY "ai_activity_events_insert" 
ON public.ai_activity_events 
FOR INSERT 
WITH CHECK (is_org_member(org_id));

-- Add trigger for updated_at
CREATE TRIGGER update_ai_agent_content_updated_at
BEFORE UPDATE ON public.ai_agent_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();