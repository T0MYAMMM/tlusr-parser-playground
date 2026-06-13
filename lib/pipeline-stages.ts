import type { PipelineStageId } from './types';

export interface StageMeta {
  id: PipelineStageId;
  label: string;
  short: string;
  tier: 'input' | 'parse' | 'distill' | 'extract' | 'ai' | 'output';
  summary: string;
  description: string;
  /** Concrete heuristics / tags / regex used at this stage. */
  techniques: { name: string; detail: string }[];
  /** Module path inside the Python package — surfaced to engineers. */
  source: string;
}

/**
 * Static metadata describing each pipeline stage. The visualizer renders these
 * as nodes; clicking a node opens a side panel showing the same content.
 *
 * Source of truth: `tlusr_parser/pipelines/default.py` (`_run_stages`).
 */
export const PIPELINE_STAGES: StageMeta[] = [
  {
    id: 'raw_input',
    label: 'Raw HTML Input',
    short: 'Input',
    tier: 'input',
    summary: 'Upstream payload from tlusr-scraping-system.',
    description:
      'A RawDocument carrying both static and rendered HTML, the source URL, and the crawl_timestamp that anchors every relative date downstream.',
    techniques: [
      { name: 'RawDocument schema', detail: 'Pydantic-validated input contract; rejects empty HTML.' },
      { name: 'effective_html', detail: 'Prefers rendered HTML when present; otherwise static.' },
    ],
    source: 'tlusr_parser/schemas/raw.py',
  },
  {
    id: 'dom_parse',
    label: 'DOM Tree Construction',
    short: 'DOM',
    tier: 'parse',
    summary: 'Build a fast, malformed-tolerant DOM tree via selectolax.',
    description:
      'selectolax (Modest engine) parses the HTML in C and exposes a CSS-selector API. We wrap it in a DomTree facade so the engine is swappable.',
    techniques: [
      { name: 'selectolax HTMLParser', detail: '10–30× faster than BeautifulSoup; tolerant of unclosed tags.' },
      { name: 'CSS selectors', detail: 'first / first_text / select for ergonomic queries.' },
      { name: 'meta tag iterator', detail: 'Unified iteration over name=, property=, itemprop=.' },
    ],
    source: 'tlusr_parser/parser/dom.py',
  },
  {
    id: 'metadata_harvest',
    label: 'Metadata Heuristics Extraction',
    short: 'Metadata',
    tier: 'parse',
    summary: 'Harvest <meta>, OpenGraph, Twitter, JSON-LD, and microdata.',
    description:
      'Gathers every metadata source non-judgmentally so field extractors can weight by provenance instead of merging blindly. JSON-LD NewsArticle is the highest-confidence signal.',
    techniques: [
      { name: 'OpenGraph + Twitter', detail: 'og:title, og:description, og:image, twitter:* keys.' },
      { name: 'JSON-LD walker', detail: 'Unwraps @graph; tolerates malformed JSON with fence-trim fallback.' },
      { name: 'Schema.org NewsArticle', detail: 'headline, datePublished, author, articleBody, articleSection, keywords.' },
    ],
    source: 'tlusr_parser/parser/metadata.py',
  },
  {
    id: 'distillation',
    label: 'Content Body Isolation',
    short: 'Distill',
    tier: 'distill',
    summary: 'Boilerplate removal via Trafilatura, with Readability + density fallbacks.',
    description:
      'Strips ads, navigation, scripts, and recommendation widgets. The primary distiller (Trafilatura) scores ~0.88 mean F1 on the SIGIR benchmark; lighter fallbacks kick in if it drops below the configured min-extracted threshold.',
    techniques: [
      { name: 'Trafilatura', detail: 'Decision trees + text-density heuristics; preserves tables/links.' },
      { name: 'Readability heuristic', detail: 'Text-density × (1 − link-density) with <p>-count bonus.' },
      { name: 'Density fallback', detail: 'Last resort: concatenate the 50 longest paragraph-like blocks.' },
    ],
    source: 'tlusr_parser/distillation/',
  },
  {
    id: 'markdown_bridge',
    label: 'Markdown Bridge',
    short: 'Markdown',
    tier: 'distill',
    summary: 'Convert cleaned HTML into semantic markdown — the LLM-ready canonical form.',
    description:
      'Raw HTML to LLM yields ~5% semantic density (95% wasted tokens). Markdown distillation raises that to ~85%, slashing both cost and the "lost in the middle" hallucination rate.',
    techniques: [
      { name: 'markdownify', detail: 'Preserves headings, lists, tables, blockquotes, links, images.' },
      { name: 'Whitespace normalization', detail: 'Collapses runs; bounds max_markdown_chars; idempotent.' },
      { name: 'Semantic density meter', detail: 'len(markdown) / len(raw_html); used for diagnostics + LLM routing.' },
    ],
    source: 'tlusr_parser/markdown/converter.py',
  },
  {
    id: 'extraction_cascade',
    label: 'Extraction Cascade (Tier 1+2)',
    short: 'Extract',
    tier: 'extract',
    summary: 'Per-field cascading extractors with deterministic confidence scoring.',
    description:
      'Each field has its own cascade: metadata → heuristic → semantic. The cascade stops the moment a strategy clears the field threshold; otherwise all candidates compete on tier-adjusted confidence.',
    techniques: [
      { name: 'JSON-LD priority', detail: 'NewsArticle.headline, datePublished, articleBody, author.' },
      { name: 'DOM proximity', detail: '<time datetime>, .byline, [rel=author], [itemprop=author].' },
      { name: 'dateparser anchored', detail: 'RELATIVE_BASE = crawl_timestamp; ISO fast-path for tz safety.' },
      { name: 'Indonesian locale', detail: '"3 jam lalu", "kemarin", "5 Januari 2024" — first-class support.' },
    ],
    source: 'tlusr_parser/strategies/cascading.py',
  },
  {
    id: 'llm_escalation',
    label: 'LLM Fallback (Tier 3)',
    short: 'LLM',
    tier: 'ai',
    summary: 'FrugalGPT-style escalation: cheap operations first, AI only on edge cases.',
    description:
      'Runs only when required fields are missing, any field is below its confidence threshold, or aggregate confidence is below the escalation gate. The prompt is XML-tagged and fed markdown — never raw HTML.',
    techniques: [
      { name: 'XML-tagged prompt', detail: '<role/> <rules/> <schema/> <crawl_timestamp/> <document/>.' },
      { name: 'Pydantic self-healing', detail: 'On schema violation, reflect errors back to the model for repair.' },
      { name: 'Provider abstraction', detail: 'OpenAI / Anthropic / Gemini / local — single Protocol.' },
    ],
    source: 'tlusr_parser/extraction/llm_extractor.py',
  },
  {
    id: 'finalize',
    label: 'Structured JSON Output',
    short: 'Output',
    tier: 'output',
    summary: 'Winner selection, normalization, sanity validation, diagnostics emission.',
    description:
      'Choose the highest tier-adjusted confidence per field, normalize whitespace + Unicode (NFC) + URLs + dates (UTC ISO-8601), and run sanity checks before returning the validated Article + ExtractionDiagnostics.',
    techniques: [
      { name: 'Tier priors', detail: 'metadata +0.10, heuristic +0.05, semantic 0, llm −0.05.' },
      { name: 'URL canonicalization', detail: 'Lowercase scheme/host, drop utm_*/fbclid/gclid, deterministic param order.' },
      { name: 'Sanity invariants', detail: 'No future publish dates; updated_date ≥ publish_date; title ≠ entire body.' },
    ],
    source: 'tlusr_parser/pipelines/default.py',
  },
];

export const STAGE_BY_ID: Record<PipelineStageId, StageMeta> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.id, s]),
) as Record<PipelineStageId, StageMeta>;
