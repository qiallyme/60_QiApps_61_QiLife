-- Create Core QiLife Alpha Schema
-- Description: Mapped tables for QiLife entities and relationships.
-- Safe: No drops of pre-existing tables. Creates if not exists.

-- 1. Buckets Table
CREATE TABLE IF NOT EXISTS public.qilife_buckets (
    code VARCHAR(4) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    folder_path TEXT,
    sort_order INTEGER DEFAULT 0,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Entities Table (Universal base table for metadata + markdown content tracking)
CREATE TABLE IF NOT EXISTS public.qilife_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- qibit, thread, action, person, company, deal, activity, daily_summary, document
    title TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    source VARCHAR(100) DEFAULT 'user:manual' NOT NULL,
    tags_json JSONB DEFAULT '[]'::jsonb NOT NULL,
    metadata_json JSONB DEFAULT '{}'::jsonb NOT NULL,
    markdown_path TEXT,
    frontmatter_json JSONB DEFAULT '{}'::jsonb NOT NULL,
    body_markdown TEXT,
    archived_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexing for entity search and querying
CREATE INDEX IF NOT EXISTS idx_qilife_entities_type ON public.qilife_entities(type);
CREATE INDEX IF NOT EXISTS idx_qilife_entities_status ON public.qilife_entities(status);
CREATE INDEX IF NOT EXISTS idx_qilife_entities_tags ON public.qilife_entities USING gin(tags_json);

-- 3. Entity Relationships Table (inspired by Cadence cross-links & references)
CREATE TABLE IF NOT EXISTS public.qilife_entity_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.qilife_entities(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.qilife_entities(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL, -- e.g., parent_thread, assigned_to, related_contact, source_qibit
    metadata_json JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uniq_source_target_rel UNIQUE (source_id, target_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_qilife_rel_source ON public.qilife_entity_relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_qilife_rel_target ON public.qilife_entity_relationships(target_id);

-- Enable RLS (or safe policies comments)
-- For alpha, we enable RLS but allow authenticated users full access
ALTER TABLE public.qilife_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qilife_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qilife_entity_relationships ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Allow auth admin access buckets'
    ) THEN
        CREATE POLICY "Allow auth admin access buckets" ON public.qilife_buckets FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Allow auth admin access entities'
    ) THEN
        CREATE POLICY "Allow auth admin access entities" ON public.qilife_entities FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Allow auth admin access relationships'
    ) THEN
        CREATE POLICY "Allow auth admin access relationships" ON public.qilife_entity_relationships FOR ALL TO authenticated USING (true);
    END IF;
END
$$;
