/**
 * Client-side mock that returns a ParseResponse without needing the FastAPI
 * backend running. Used by `/api/parse` when PARSER_API_URL is unset, and by
 * tests / Storybook. The shape MUST match what the real backend returns.
 */

import type { ParseRequest, ParseResponse } from './types';

const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i;
const H1_RE = /<h1[^>]*>([\s\S]*?)<\/h1>/i;
const META_RE = (key: string) =>
  new RegExp(
    `<meta[^>]*(?:name|property)=["']${key}["'][^>]*content=["']([^"']+)["']`,
    'i',
  );

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstMatch(re: RegExp, src: string): string | undefined {
  const m = re.exec(src);
  return m?.[1]?.trim();
}

export function mockParse(req: ParseRequest): ParseResponse {
  const html = req.html ?? '';
  const title =
    firstMatch(META_RE('og:title'), html) ??
    firstMatch(TITLE_RE, html) ??
    firstMatch(H1_RE, html) ??
    'Untitled article';

  const description =
    firstMatch(META_RE('og:description'), html) ?? firstMatch(META_RE('description'), html);

  const author =
    firstMatch(META_RE('author'), html) ?? firstMatch(META_RE('article:author'), html);

  const publishedRaw =
    firstMatch(META_RE('article:published_time'), html) ??
    firstMatch(META_RE('pubdate'), html);

  const plain = stripTags(html);
  const content = plain.slice(0, 1800);
  const now = new Date().toISOString();
  const crawlTs = req.crawl_timestamp ?? now;

  return {
    article: {
      url: req.url || 'https://example.com/',
      canonical_url: null,
      source_domain: safeDomain(req.url),
      title: title ?? null,
      subtitle: null,
      summary: description ?? content.slice(0, 240),
      content,
      content_markdown: '# ' + (title ?? '') + '\n\n' + content.slice(0, 600),
      author: author ?? null,
      authors: author ? [author] : [],
      publish_date: publishedRaw ?? null,
      updated_date: null,
      language: detectLang(html),
      categories: [],
      tags: [],
      images: [],
      references: [],
      entities: [],
      sentiment: null,
      crawl_timestamp: crawlTs,
      parsed_at: now,
    },
    diagnostics: {
      timings_ms: {
        dom_parse: 1.4,
        metadata_harvest: 0.9,
        distillation: 11.7,
        markdown_bridge: 1.6,
        extraction_cascade: 22.8,
        llm_escalation: 0.0,
        finalize: 0.1,
      },
      fields: {
        title: {
          tier: firstMatch(META_RE('og:title'), html) ? 'metadata' : 'heuristic',
          confidence: firstMatch(META_RE('og:title'), html) ? 0.92 : 0.7,
          strategy: firstMatch(META_RE('og:title'), html) ? 'opengraph.title' : 'dom.first_h1',
          fallback_reasons: [],
        },
        summary: {
          tier: description ? 'metadata' : 'semantic',
          confidence: description ? 0.85 : 0.55,
          strategy: description ? 'meta.description' : 'markdown.first_paragraph',
          fallback_reasons: [],
        },
        author: author
          ? { tier: 'metadata', confidence: 0.78, strategy: 'meta.author', fallback_reasons: [] }
          : { tier: 'none', confidence: 0, strategy: 'none', fallback_reasons: ['all_strategies_returned_none'] },
        publish_date: publishedRaw
          ? { tier: 'metadata', confidence: 0.9, strategy: 'meta.published_time', fallback_reasons: [] }
          : { tier: 'none', confidence: 0, strategy: 'none', fallback_reasons: ['all_strategies_returned_none'] },
        content: { tier: 'semantic', confidence: 0.7, strategy: 'markdown.body', fallback_reasons: [] },
      },
      semantic_density: Math.min(1, content.length / Math.max(html.length, 1)),
      aggregate_confidence: 0.74,
      llm_calls: 0,
      llm_tokens: 0,
      distiller_used: 'trafilatura',
      notes: ['llm_decision:llm_disabled'],
    },
    dom_node_count: Math.max(50, Math.round(html.length / 32)),
  };
}

function safeDomain(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function detectLang(html: string): string | null {
  const m = /<html[^>]*\slang=["']([a-zA-Z-]+)["']/i.exec(html);
  return m?.[1]?.toLowerCase() ?? null;
}
