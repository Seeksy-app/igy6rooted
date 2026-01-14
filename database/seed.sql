-- IGY6 Rooted Seed Data
-- PostgreSQL 14+

-- ============================================
-- INITIAL ORGANIZATION SETUP
-- ============================================

-- Create the IGY6 Rooted organization
INSERT INTO orgs (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'IGY6 Rooted')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DEFAULT AI AGENT CONTENT
-- ============================================

INSERT INTO ai_agent_content (org_id, business_name, business_phone, service_area, business_hours_text)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'IGY6 Rooted',
  '',
  'Service area to be configured',
  'Monday - Friday: 9:00 AM - 5:00 PM'
)
ON CONFLICT (org_id) DO NOTHING;

-- ============================================
-- DEFAULT APPOINTMENT RULES
-- ============================================

INSERT INTO ai_appointment_rules (org_id, timezone, default_duration_minutes, travel_buffer_minutes)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'America/Chicago',
  120,
  30
)
ON CONFLICT (org_id) DO NOTHING;

-- ============================================
-- SAMPLE SERVICES
-- ============================================

INSERT INTO service_catalog (org_id, service_key, display_name, default_duration_minutes)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'lawn_mowing', 'Lawn Mowing', 60),
  ('00000000-0000-0000-0000-000000000001', 'landscaping', 'Landscaping', 120),
  ('00000000-0000-0000-0000-000000000001', 'tree_trimming', 'Tree Trimming', 180),
  ('00000000-0000-0000-0000-000000000001', 'garden_maintenance', 'Garden Maintenance', 90)
ON CONFLICT (org_id, service_key) DO NOTHING;

-- ============================================
-- SAMPLE FAQ ENTRIES
-- ============================================

INSERT INTO faq_kb (org_id, question, answer, category)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'What are your hours?', 'We are open Monday through Friday from 9 AM to 5 PM.', 'General'),
  ('00000000-0000-0000-0000-000000000001', 'What services do you offer?', 'We offer lawn mowing, landscaping, tree trimming, and garden maintenance services.', 'Services'),
  ('00000000-0000-0000-0000-000000000001', 'How do I schedule an appointment?', 'You can call us, use our online booking, or speak with our AI assistant.', 'Scheduling')
ON CONFLICT DO NOTHING;
