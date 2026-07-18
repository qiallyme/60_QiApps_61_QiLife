-- Seed minimal fake data for QiLife Alpha Workbench
-- All UUIDs are static for stable testing and mapping.

-- 1. Insert Buckets (if not already existing)
INSERT INTO public.qilife_buckets (code, name, slug, folder_path, sort_order, description, is_system)
VALUES 
  ('LIFE', 'Personal Life', 'personal-life', '01_life', 1, 'Bucket for personal life administration', TRUE),
  ('WORK', 'Professional Work', 'professional-work', '02_work', 2, 'Bucket for career, business and professional stuff', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Core Entities (using stable UUIDs)
-- Let's define the variables/static values:
-- person UUID: 'a0000000-0000-0000-0000-000000000001'
-- company UUID: 'c0000000-0000-0000-0000-000000000001'
-- project (thread) UUID: 'd0000000-0000-0000-0000-000000000001'
-- matter (thread) UUID: 'd0000000-0000-0000-0000-000000000002'
-- care_item (qibit) UUID: 'e0000000-0000-0000-0000-000000000001'
-- interaction (activity) UUID: 'f0000000-0000-0000-0000-000000000001'
-- task (action) UUID: 'b0000000-0000-0000-0000-000000000001'
-- reminder (action) UUID: 'b0000000-0000-0000-0000-000000000002'
-- file_record (document) UUID: '90000000-0000-0000-0000-000000000001'

INSERT INTO public.qilife_entities (id, type, title, status, created_at, updated_at, source, tags_json, metadata_json, markdown_path, frontmatter_json, body_markdown)
VALUES
  -- 2.1 Person
  ('a0000000-0000-0000-0000-000000000001', 'person', 'Dr. Alice Vance', 'active', now(), now(), 'user:manual', '["medical", "doctor"]'::jsonb, 
   '{"relationship": "professional", "person_type": "individual", "email": "alice.vance@clinic.example.com", "phone": "+1-555-0199", "address": "123 Health Ave, suite 100", "notes": "Primary family doctor"}'::jsonb,
   'reference/contacts/alice_vance.md', '{}'::jsonb, '# Dr. Alice Vance\n\nFamily doctor since 2024.'),

  -- 2.2 Company (Organization)
  ('c0000000-0000-0000-0000-000000000001', 'company', 'Apex Innovators Inc', 'active', now(), now(), 'user:manual', '["client", "tech"]'::jsonb, 
   '{"legal_name": "Apex Innovators Incorporated", "industry": "Software", "email": "info@apex.example.com"}'::jsonb,
   'reference/companies/apex_innovators.md', '{}'::jsonb, '# Apex Innovators Inc\n\nSoftware consulting client.'),

  -- 2.3 Project (Thread)
  ('d0000000-0000-0000-0000-000000000001', 'thread', 'Workbench Design System Upgrade', 'active', now(), now(), 'user:manual', '["design", "frontend"]'::jsonb, 
   '{"bucket_code": "WORK", "priority": "high", "description": "Upgrading the QiLife workbench visuals to OKLCH custom color scales", "next_action": "Port oklch variables"}'::jsonb,
   'reference/projects/design_system_upgrade.md', '{}'::jsonb, '# Workbench Design System Upgrade\n\nUpgrades stylesheets.'),

  -- 2.4 Matter (Thread)
  ('d0000000-0000-0000-0000-000000000002', 'thread', 'Vance Clinic Annual Wellness Checkup', 'open', now(), now(), 'user:manual', '["health", "wellness"]'::jsonb, 
   '{"bucket_code": "LIFE", "priority": "medium", "description": "Coordinating annual medical checkup with Vance Clinic", "due_date": "2026-07-31"}'::jsonb,
   'reference/matters/annual_wellness_checkup.md', '{}'::jsonb, '# Vance Clinic Annual Wellness Checkup\n\nAnnual physical exam planning.'),

  -- 2.5 Care Item (QiBit)
  ('e0000000-0000-0000-0000-000000000001', 'qibit', 'Blood Pressure Check Requirement', 'active', now(), now(), 'user:capture', '["health", "cardio"]'::jsonb, 
   '{"qibit_type": "care", "bucket_code": "LIFE", "priority": "medium", "raw_capture": "Need to check blood pressure twice weekly after meals."}'::jsonb,
   'reference/qibits/bp_check_req.md', '{}'::jsonb, '# Blood Pressure Check Requirement\n\nCheck twice weekly.'),

  -- 2.6 Interaction (Activity)
  ('f0000000-0000-0000-0000-000000000001', 'activity', 'Phone call with Dr. Vance', 'done', now(), now(), 'user:manual', '["call", "medical"]'::jsonb, 
   '{"date": "2026-06-16", "duration_minutes": 15, "notes": "Discussed checkup timing and blood pressure guidelines"}'::jsonb,
   'reference/activities/call_dr_vance.md', '{}'::jsonb, '# Phone call with Dr. Vance\n\nConfirmed checkup schedule.'),

  -- 2.7 Task (Action)
  ('b0000000-0000-0000-0000-000000000001', 'action', 'Port oklch color custom properties', 'open', now(), now(), 'user:manual', '["css", "refactor"]'::jsonb, 
   '{"priority": "high", "due_hint": "by Friday", "due_date": "2026-06-19"}'::jsonb,
   'reference/actions/port_oklch.md', '{}'::jsonb, '# Port oklch color custom properties\n\nAdd them to src/styles.css.'),

  -- 2.8 Reminder (Action)
  ('b0000000-0000-0000-0000-000000000002', 'action', 'Confirm checkup appointment date', 'open', now(), now(), 'user:manual', '["follow_up"]'::jsonb, 
   '{"priority": "medium", "due_date": "2026-06-25"}'::jsonb,
   'reference/actions/confirm_checkup.md', '{}'::jsonb, '# Confirm checkup appointment date\n\nCall the office receptionist.'),

  -- 2.9 File Record (Document)
  ('90000000-0000-0000-0000-000000000001', 'document', 'Apex Consulting Service Agreement', 'active', now(), now(), 'import:csv', '["legal", "contract"]'::jsonb, 
   '{"mime_type": "application/pdf", "size_bytes": 1048576, "file_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'::jsonb,
   'reference/documents/apex_agreement.md', '{}'::jsonb, '# Apex Consulting Service Agreement\n\nExecuted copy.');

-- 3. Insert Entity Relationships (inspired by Cadence cross-links & references)
INSERT INTO public.qilife_entity_relationships (source_id, target_id, relationship_type, metadata_json, created_at, updated_at)
VALUES
  -- Link Vance Clinic Checkup (thread) to Dr. Alice Vance (person)
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'related_contact', '{"role": "Primary Care Physician"}'::jsonb, now(), now()),
  
  -- Link Vance Clinic Checkup (thread) to Reminder (action)
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'parent_thread', '{}'::jsonb, now(), now()),
  
  -- Link Workbench Design System Upgrade (thread) to Task (action)
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'parent_thread', '{}'::jsonb, now(), now())
ON CONFLICT (source_id, target_id, relationship_type) DO NOTHING;
