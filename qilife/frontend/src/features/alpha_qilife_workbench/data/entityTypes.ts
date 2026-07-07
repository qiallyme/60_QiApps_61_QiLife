export type EntityType = 
  | "qibit" 
  | "thread" 
  | "action" 
  | "person" 
  | "company" 
  | "deal" 
  | "activity" 
  | "daily_summary" 
  | "document";

export interface WorkbenchEntity {
  id: string;
  type: EntityType;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  source: string;
  tags_json: string[];
  metadata_json: Record<string, any>;
  markdown_path?: string | null;
  frontmatter_json?: Record<string, any> | null;
  body_markdown?: string | null;
  archived_at?: string | null;
  deleted_at?: string | null;
}

export interface WorkbenchRelationship {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type: string;
  metadata_json: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Resolved elements for the view
  source_entity?: WorkbenchEntity;
  target_entity?: WorkbenchEntity;
}
