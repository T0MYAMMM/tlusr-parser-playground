/**
 * Mirrors the Pydantic schemas from `tlusr_parser`. Keep these in sync with
 * `tlusr_parser/schemas/article.py` — when a field is added there, add it here.
 */

export type FieldTier = 'metadata' | 'heuristic' | 'semantic' | 'llm' | 'none';

export interface ImageReference {
  url: string;
  caption?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface Reference {
  url: string;
  anchor_text?: string | null;
}

export interface Article {
  url: string;
  canonical_url?: string | null;
  source_domain?: string | null;
  title?: string | null;
  subtitle?: string | null;
  summary?: string | null;
  content?: string | null;
  content_markdown?: string | null;
  author?: string | null;
  authors: string[];
  publish_date?: string | null; // ISO-8601 UTC
  updated_date?: string | null;
  language?: string | null;
  categories: string[];
  tags: string[];
  images: ImageReference[];
  references: Reference[];
  entities: Record<string, unknown>[];
  sentiment?: Record<string, unknown> | null;
  crawl_timestamp: string;
  parsed_at: string;
}

export interface FieldDiagnostic {
  tier: FieldTier;
  confidence: number;
  strategy: string;
  fallback_reasons: string[];
}

export interface ExtractionDiagnostics {
  timings_ms: Record<string, number>;
  fields: Record<string, FieldDiagnostic>;
  semantic_density: number | null;
  aggregate_confidence: number;
  llm_calls: number;
  llm_tokens: number;
  distiller_used: string | null;
  notes: string[];
}

export interface ParseResponse {
  article: Article;
  diagnostics: ExtractionDiagnostics;
  dom_node_count?: number;
}

export interface ParseRequest {
  url: string;
  html: string;
  rendered_html?: string;
  crawl_timestamp?: string;
}

/** The 8 canonical stages of `DefaultPipeline`. */
export type PipelineStageId =
  | 'raw_input'
  | 'dom_parse'
  | 'metadata_harvest'
  | 'distillation'
  | 'markdown_bridge'
  | 'extraction_cascade'
  | 'llm_escalation'
  | 'finalize';
