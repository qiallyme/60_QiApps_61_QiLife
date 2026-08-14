-- QiLife 2.0 Event Log Schema (ADR 0006)

CREATE TABLE IF NOT EXISTS qilife.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT,
  event_type TEXT NOT NULL,
  bit_id UUID REFERENCES qilife.bits(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qilife_events_event_type ON qilife.events (event_type);
CREATE INDEX IF NOT EXISTS idx_qilife_events_bit_id ON qilife.events (bit_id);
CREATE INDEX IF NOT EXISTS idx_qilife_events_created_at ON qilife.events (created_at);
