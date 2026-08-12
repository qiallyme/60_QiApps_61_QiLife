-- QiLife 2.0 Core Database Schema: QiBits, Entity Links & Open Loops

CREATE TABLE IF NOT EXISTS qilife.bits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT,
  qi_decimal TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  memory_state TEXT NOT NULL DEFAULT 'transient',
  source TEXT NOT NULL DEFAULT 'qilife',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_qilife_bits_type ON qilife.bits (type);
CREATE INDEX IF NOT EXISTS idx_qilife_bits_qi_decimal ON qilife.bits (qi_decimal);
CREATE INDEX IF NOT EXISTS idx_qilife_bits_memory_state ON qilife.bits (memory_state);
CREATE INDEX IF NOT EXISTS idx_qilife_bits_owner_id ON qilife.bits (owner_id);
CREATE INDEX IF NOT EXISTS idx_qilife_bits_metadata_gin ON qilife.bits USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_qilife_bits_provenance_gin ON qilife.bits USING gin (provenance);

CREATE TRIGGER trg_qilife_bits_updated_at
BEFORE UPDATE ON qilife.bits
FOR EACH ROW
EXECUTE FUNCTION qilife.set_updated_at();

-- Bi-directional entity link table for universal cross-app relationships
CREATE TABLE IF NOT EXISTS qilife.entity_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT,
  source_entity_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  target_entity_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_qilife_entity_link UNIQUE(source_entity_type, source_id, target_entity_type, target_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_qilife_entity_links_source ON qilife.entity_links (source_entity_type, source_id);
CREATE INDEX IF NOT EXISTS idx_qilife_entity_links_target ON qilife.entity_links (target_entity_type, target_id);

-- Operational Open Loops derived from captures and events
CREATE TABLE IF NOT EXISTS qilife.open_loops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT,
  bit_id UUID REFERENCES qilife.bits(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  loop_type TEXT NOT NULL DEFAULT 'action',
  status TEXT NOT NULL DEFAULT 'open',
  confidence NUMERIC(3,2) DEFAULT 1.0,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qilife_open_loops_status ON qilife.open_loops (status);
CREATE INDEX IF NOT EXISTS idx_qilife_open_loops_loop_type ON qilife.open_loops (loop_type);
