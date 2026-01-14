-- IGY6 Rooted Database Functions
-- PostgreSQL 14+

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Update updated_at column trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create org with admin function
CREATE OR REPLACE FUNCTION create_org_with_admin(
  org_name TEXT,
  admin_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create the org
  INSERT INTO orgs (name)
  VALUES (org_name)
  RETURNING id INTO new_org_id;
  
  -- Add the user as admin
  INSERT INTO team_members (org_id, user_id, role)
  VALUES (new_org_id, admin_user_id, 'admin');
  
  RETURN new_org_id;
END;
$$ LANGUAGE plpgsql;

-- Check if user is org member
CREATE OR REPLACE FUNCTION is_org_member(
  _org_id UUID,
  _user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM team_members tm
    WHERE tm.org_id = _org_id AND tm.user_id = _user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Check if user is org admin
CREATE OR REPLACE FUNCTION is_org_admin(
  _org_id UUID,
  _user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM team_members tm
    WHERE tm.org_id = _org_id 
      AND tm.user_id = _user_id 
      AND tm.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Add updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_ai_agent_content_updated_at ON ai_agent_content;
CREATE TRIGGER update_ai_agent_content_updated_at
  BEFORE UPDATE ON ai_agent_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_appointment_rules_updated_at ON ai_appointment_rules;
CREATE TRIGGER update_ai_appointment_rules_updated_at
  BEFORE UPDATE ON ai_appointment_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_bookings_updated_at ON ai_bookings;
CREATE TRIGGER update_ai_bookings_updated_at
  BEFORE UPDATE ON ai_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_booking_requests_updated_at ON booking_requests;
CREATE TRIGGER update_booking_requests_updated_at
  BEFORE UPDATE ON booking_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_followups_updated_at ON followups;
CREATE TRIGGER update_followups_updated_at
  BEFORE UPDATE ON followups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_availability_rules_updated_at ON availability_rules;
CREATE TRIGGER update_availability_rules_updated_at
  BEFORE UPDATE ON availability_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobber_connections_updated_at ON jobber_connections;
CREATE TRIGGER update_jobber_connections_updated_at
  BEFORE UPDATE ON jobber_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integration_jobber_accounts_updated_at ON integration_jobber_accounts;
CREATE TRIGGER update_integration_jobber_accounts_updated_at
  BEFORE UPDATE ON integration_jobber_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integration_ad_accounts_updated_at ON integration_ad_accounts;
CREATE TRIGGER update_integration_ad_accounts_updated_at
  BEFORE UPDATE ON integration_ad_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketing_campaigns_updated_at ON marketing_campaigns;
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketing_leads_updated_at ON marketing_leads;
CREATE TRIGGER update_marketing_leads_updated_at
  BEFORE UPDATE ON marketing_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gtm_market_zones_updated_at ON gtm_market_zones;
CREATE TRIGGER update_gtm_market_zones_updated_at
  BEFORE UPDATE ON gtm_market_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meta_ad_campaigns_updated_at ON meta_ad_campaigns;
CREATE TRIGGER update_meta_ad_campaigns_updated_at
  BEFORE UPDATE ON meta_ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_faq_kb_updated_at ON faq_kb;
CREATE TRIGGER update_faq_kb_updated_at
  BEFORE UPDATE ON faq_kb
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_competitor_analyses_updated_at ON competitor_analyses;
CREATE TRIGGER update_competitor_analyses_updated_at
  BEFORE UPDATE ON competitor_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
